"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import api from "@/src/lib/axios";
import { useAuthStore } from "@/src/lib/store/useAuthStore";
import Image from "next/image";
import ProtectedRoute from "@/src/components/ProtectedRoute";
import { Lock, MapPin, Loader2, CalendarClock } from "lucide-react";

// ─── Interfaces ───────────────────────────────────────────────────────────────

interface Doctor {
  _id: string;
  name: string;
  specialty: string;
  clinic: string;
  experience: string;
  nextSlot: string;
  availableSlots: string[]; // all slots the doctor has set
  bookedSlots: string[]; // slots already taken (from appointments)
  fee: string;
  badge?: string;
  image?: string;
  expertise?: string[];
  isBooked?: boolean; // did THIS user already book this doctor
}

// ─── SVG Fallback Icon ─────────────────────────────────────────────────────────

function UserPlaceholderIcon() {
  return (
    <svg
      viewBox="0 0 96 96"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-full"
    >
      <rect width="96" height="96" fill="#1e2a40" />
      <circle cx="48" cy="36" r="16" fill="#3b4b75" />
      <ellipse cx="48" cy="78" rx="26" ry="16" fill="#3b4b75" />
    </svg>
  );
}

// ─── Helper: extract city from clinic string ───────────────────────────────────
// Clinic is stored as "Hospital Name, City" — we take everything after the last comma.

function extractCity(clinic: string): string {
  const parts = clinic.split(",");
  return parts[parts.length - 1].trim().toLowerCase();
}

function getUniqueCities(doctors: Doctor[]): string[] {
  const cities = doctors.map((d) => {
    const parts = d.clinic.split(",");
    return parts[parts.length - 1].trim();
  });
  return Array.from(new Set(cities)).sort();
}

// ─── Slot Selector Component ───────────────────────────────────────────────────

interface SlotSelectorProps {
  availableSlots: string[];
  bookedSlots: string[];
  selectedSlot: string;
  onChange: (slot: string) => void;
}

function SlotSelector({
  availableSlots,
  bookedSlots,
  selectedSlot,
  onChange,
}: SlotSelectorProps) {
  if (!availableSlots || availableSlots.length === 0) {
    return (
      <p className="text-xs text-gray-500 italic mt-1">
        No slots configured by doctor.
      </p>
    );
  }

  return (
    <div className="mt-2">
      <p className="text-xs text-gray-400 mb-1.5 font-medium">Select a Slot:</p>
      <div className="flex flex-wrap gap-2">
        {availableSlots.map((slot) => {
          const isBooked = bookedSlots.includes(slot);
          const isSelected = selectedSlot === slot;

          if (isBooked) {
            return (
              <div
                key={slot}
                title="This slot is already booked"
                className="flex items-center gap-1 bg-white/5 border border-white/10 text-gray-500 text-[10px] sm:text-xs px-2.5 py-1.5 rounded-lg cursor-not-allowed select-none"
              >
                <Lock className="w-3 h-3 flex-none" strokeWidth={2.5} />
                {new Date(slot).toLocaleString("en-US", {
                  month: "short",
                  day: "numeric",
                  hour: "numeric",
                  minute: "2-digit",
                })}
              </div>
            );
          }

          return (
            <button
              key={slot}
              type="button"
              onClick={() => onChange(slot)}
              className={`text-[10px] sm:text-xs px-2.5 py-1.5 rounded-lg border transition-all font-medium ${
                isSelected
                  ? "bg-emerald-600 border-emerald-500 text-white shadow-sm shadow-emerald-900/40"
                  : "bg-white/5 border-white/10 text-gray-300 hover:border-blue-500/40 hover:text-white"
              }`}
            >
              {new Date(slot).toLocaleString("en-US", {
                month: "short",
                day: "numeric",
                hour: "numeric",
                minute: "2-digit",
              })}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Main Content ──────────────────────────────────────────────────────────────

function AppointmentContent() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [bookingId, setBookingId] = useState<string | null>(null);

  // Location filter state
  const [selectedCity, setSelectedCity] = useState<string>("all");
  const [availableCities, setAvailableCities] = useState<string[]>([]);

  // Per-doctor selected slot: { doctorId -> selectedSlot }
  const [selectedSlots, setSelectedSlots] = useState<Record<string, string>>(
    {},
  );

  const { user } = useAuthStore();
  const searchParams = useSearchParams();
  const tumorType = searchParams.get("tumor");

  // ── Fetch doctors ────────────────────────────────────────────────────────────
  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        setIsLoading(true);
        const response = await api.get(`/api/doctors?tumor=${tumorType || ""}`);

        if (response.data.success) {
          const data: Doctor[] = response.data.data;
          setDoctors(data);
          setAvailableCities(getUniqueCities(data));

          // Pre-select the first available slot for each doctor
          const initialSlots: Record<string, string> = {};
          data.forEach((doc) => {
            const firstOpen = doc.availableSlots?.find(
              (s) => !doc.bookedSlots?.includes(s),
            );
            if (firstOpen) initialSlots[doc._id] = firstOpen;
          });
          setSelectedSlots(initialSlots);
        } else {
          setError("Failed to load recommended specialists.");
        }
      } catch (err: unknown) {
        const errorMessage =
          err instanceof Error ? err.message : "An unexpected error occurred";
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDoctors();
  }, [tumorType]);

  // ── Filtered doctors by city ─────────────────────────────────────────────────
  const filteredDoctors =
    selectedCity === "all"
      ? doctors
      : doctors.filter(
          (d) => extractCity(d.clinic) === selectedCity.toLowerCase(),
        );

  // ── Book appointment ──────────────────────────────────────────────────────────
  const handleBookAppointment = async (doctor: Doctor) => {
    if (!user || !user.id) {
      alert("Please login first to book an appointment.");
      return;
    }

    const chosenSlot = selectedSlots[doctor._id];
    if (!chosenSlot) {
      alert("Please select an available time slot before confirming.");
      return;
    }

    setBookingId(doctor._id);

    try {
      const appointmentData = {
        userId: user.id,
        doctorId: doctor._id,
        patientName: user.name,
        doctorName: doctor.name,
        clinic: doctor.clinic,
        appointmentDate: chosenSlot,
        fee: doctor.fee,
        tumorType: tumorType || "General Consultation",
      };

      const response = await api.post("/api/appointments", appointmentData);

      if (response.data.success) {
        alert(
          `✅ Appointment confirmed with ${doctor.name} on ${new Date(
            chosenSlot,
          ).toLocaleString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
            hour: "numeric",
            minute: "2-digit",
          })}.`,
        );

        // Mark only this specific slot as booked — do NOT lock the whole doctor card.
        // Other available slots on this doctor remain open for booking.
        setDoctors((prev) =>
          prev.map((doc) =>
            doc._id === doctor._id
              ? {
                  ...doc,
                  bookedSlots: [...(doc.bookedSlots || []), chosenSlot],
                }
              : doc,
          ),
        );

        // Clear the selected slot for this doctor so the patient must pick a new one
        setSelectedSlots((prev) => {
          const next = { ...prev };
          delete next[doctor._id];
          return next;
        });
      }
    } catch (err: unknown) {
      console.error("Booking Error:", err);
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Failed to book appointment. Please try again.";
      alert(errorMessage);
    } finally {
      setBookingId(null);
    }
  };

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-transparent text-white font-sans pb-10 pt-6 sm:pt-10 px-4 sm:px-6 lg:px-12 max-w-4xl mx-auto flex flex-col gap-8 sm:gap-10">
        <main className="w-full">
          {/* ── Header ── */}
          <div className="mb-6 sm:mb-8 text-center animate-fade-in-up">
            <div className="mx-auto mb-4 w-12 h-12 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center">
              <CalendarClock className="w-6 h-6 text-blue-400" />
            </div>
            <h1 className="text-2xl sm:text-[28px] font-bold mb-2 leading-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-400 to-blue-400">
              {tumorType && tumorType !== "No Tumor"
                ? `Recommended Specialists for ${tumorType}`
                : "Available Specialists"}
            </h1>
            <p className="text-gray-400 text-xs sm:text-sm max-w-md mx-auto">
              {tumorType && tumorType !== "No Tumor"
                ? `Showing doctors with expertise in ${tumorType}. Filter by city below.`
                : "Browse available specialists and book your appointment."}
            </p>
          </div>

          {/* ── Location Filter Bar ── */}
          {!isLoading && !error && availableCities.length > 0 && (
            <div className="mb-6 flex flex-wrap items-center gap-2 animate-fade-in-up">
              <span className="text-xs text-gray-400 font-medium mr-1 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5" />
                City:
              </span>

              <button
                onClick={() => setSelectedCity("all")}
                className={`text-xs px-3 py-1.5 rounded-full border transition-all font-medium ${
                  selectedCity === "all"
                    ? "bg-blue-600/20 border-blue-500/40 text-blue-300"
                    : "bg-white/5 border-white/10 text-gray-400 hover:text-white hover:border-white/20"
                }`}
              >
                All Cities
              </button>

              {availableCities.map((city) => (
                <button
                  key={city}
                  onClick={() => setSelectedCity(city)}
                  className={`text-xs px-3 py-1.5 rounded-full border transition-all font-medium ${
                    selectedCity === city
                      ? "bg-blue-600/20 border-blue-500/40 text-blue-300"
                      : "bg-white/5 border-white/10 text-gray-400 hover:text-white hover:border-white/20"
                  }`}
                >
                  {city}
                </button>
              ))}

              {selectedCity !== "all" && (
                <span className="text-xs text-gray-500 ml-auto">
                  {filteredDoctors.length} doctor
                  {filteredDoctors.length !== 1 ? "s" : ""} found
                </span>
              )}
            </div>
          )}

          {/* ── Loading / Error / Empty states ── */}
          {isLoading && (
            <div className="text-blue-400 animate-pulse text-base sm:text-lg text-center py-6">
              Loading database records...
            </div>
          )}

          {error && (
            <div className="text-red-400 p-4 bg-red-900/20 border border-red-500/30 rounded-xl text-center text-sm sm:text-base">
              {error}
            </div>
          )}

          {!isLoading && !error && doctors.length === 0 && (
            <div className="text-gray-400 text-center py-6 text-sm sm:text-base">
              No doctors currently available for this specialty.
            </div>
          )}

          {!isLoading &&
            !error &&
            doctors.length > 0 &&
            filteredDoctors.length === 0 && (
              <div className="text-gray-400 text-center py-6 text-sm sm:text-base">
                No doctors found in{" "}
                <span className="text-white font-medium">{selectedCity}</span>.{" "}
                <button
                  onClick={() => setSelectedCity("all")}
                  className="text-blue-400 underline hover:text-blue-300"
                >
                  View all cities
                </button>
              </div>
            )}

          {/* ── Doctor Cards ── */}
          {!isLoading && !error && filteredDoctors.length > 0 && (
            <div className="space-y-4 sm:space-y-5">
              {filteredDoctors.map((doc, i) => (
                <div
                  key={doc._id}
                  style={{ animationDelay: `${i * 80}ms` }}
                  className="bg-white/5 backdrop-blur-sm p-4 sm:p-5 rounded-2xl border border-white/10 flex flex-col md:flex-row items-center gap-4 sm:gap-6 shadow-lg hover:border-blue-500/30 hover:-translate-y-1 transition-all duration-300 animate-fade-in-up"
                >
                  {/* ── Doctor Image / Fallback Icon ── */}
                  <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden flex-none bg-white/5 border border-white/10 shadow-inner">
                    {doc.image ? (
                      <Image
                        src={doc.image}
                        alt={doc.name}
                        className="w-full h-full object-cover"
                        width={96}
                        height={96}
                        unoptimized
                      />
                    ) : (
                      <UserPlaceholderIcon />
                    )}
                  </div>

                  {/* ── Doctor Info ── */}
                  <div className="flex-1 min-w-0 w-full">
                    <div className="flex flex-col md:flex-row items-center md:items-start gap-2 md:gap-3 mb-1 text-center md:text-left">
                      <h3 className="text-base sm:text-lg font-bold text-gray-100">
                        Dr. {doc.name}
                      </h3>
                      {doc.badge && (
                        <span className="bg-white/10 border border-white/10 text-gray-300 text-[10px] sm:text-[11px] px-2.5 py-0.5 rounded-full font-medium whitespace-nowrap">
                          {doc.badge}
                        </span>
                      )}
                    </div>

                    <p className="text-blue-300 text-xs sm:text-sm font-medium mb-1 text-center md:text-left">
                      {doc.specialty}
                    </p>

                    {/* Expertise tags — shown when tumor filter is active */}
                    {doc.expertise && doc.expertise.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-2 justify-center md:justify-start">
                        {doc.expertise.map((tag) => (
                          <span
                            key={tag}
                            className={`text-[10px] px-2 py-0.5 rounded-full border font-medium ${
                              tumorType &&
                              tag.toLowerCase() === tumorType.toLowerCase()
                                ? "bg-green-900/30 border-green-700/50 text-green-400"
                                : "bg-white/5 border-white/10 text-gray-400"
                            }`}
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}

                    <p className="text-gray-400 text-xs sm:text-sm mb-1 text-center md:text-left">
                      {doc.clinic} · {doc.experience}
                    </p>

                    <p className="text-xs sm:text-sm text-gray-400 text-center md:text-left">
                      <strong className="text-gray-200">Fee:</strong> {doc.fee}{" "}
                      Rs.
                    </p>

                    {/* ── Slot Selector ── */}
                    <SlotSelector
                      availableSlots={doc.availableSlots || []}
                      bookedSlots={doc.bookedSlots || []}
                      selectedSlot={selectedSlots[doc._id] || ""}
                      onChange={(slot) =>
                        setSelectedSlots((prev) => ({
                          ...prev,
                          [doc._id]: slot,
                        }))
                      }
                    />
                  </div>

                  {/* ── Action Buttons ── */}
                  {/* Show "All Slots Taken" only when every configured slot is booked */}
                  <div className="flex flex-col gap-2 w-full md:w-auto md:min-w-[180px] flex-none mt-2 md:mt-0">
                    {doc.availableSlots?.length > 0 &&
                    doc.availableSlots.every((s) =>
                      doc.bookedSlots?.includes(s),
                    ) ? (
                      <button
                        disabled
                        className="bg-white/5 border border-white/10 text-gray-500 w-full py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm font-semibold cursor-not-allowed flex justify-center items-center gap-2"
                      >
                        <Lock className="w-4 h-4" /> All Slots Taken
                      </button>
                    ) : (
                      <button
                        onClick={() => handleBookAppointment(doc)}
                        disabled={
                          bookingId === doc._id || !selectedSlots[doc._id]
                        }
                        title={
                          !selectedSlots[doc._id]
                            ? "Please select a slot first"
                            : "Confirm this appointment"
                        }
                        className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-5 py-2.5 text-sm font-bold text-white hover:from-blue-500 hover:to-purple-500 transition-all duration-300 shadow-[0_0_15px_rgba(168,85,247,0.4)] hover:shadow-[0_0_25px_rgba(168,85,247,0.6)] hover:-translate-y-0.5 border-0 cursor-pointer w-full lg:w-auto min-h-[40px] whitespace-nowrap"
                      >
                        {bookingId === doc._id ? (
                          <>
                            <Loader2 className="animate-spin h-4 w-4 text-white" />
                            Booking...
                          </>
                        ) : (
                          "Confirm Appointment"
                        )}
                      </button>
                    )}

                    <button className="flex items-center justify-center gap-2 rounded-xl bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-all duration-300 px-5 py-2.5 text-xs sm:text-sm font-semibold cursor-pointer w-full lg:w-auto min-h-[40px] whitespace-nowrap">
                      Cancel
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </ProtectedRoute>
  );
}

// ─── Page Export ───────────────────────────────────────────────────────────────

export default function AppointmentPage() {
  return (
    <ProtectedRoute>
      <Suspense
        fallback={
          <div className="min-h-screen bg-transparent flex items-center justify-center text-blue-400 text-base sm:text-xl font-bold animate-pulse px-4 text-center">
            Loading MedVision AI Booking System...
          </div>
        }
      >
        <AppointmentContent />
      </Suspense>
    </ProtectedRoute>
  );
}
