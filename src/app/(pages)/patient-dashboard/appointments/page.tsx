"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import api from "@/src/lib/axios";
import { useAuthStore } from "@/src/lib/store/useAuthStore";
import Image from "next/image";
import ProtectedRoute from "@/src/components/ProtectedRoute";

// ─── Interfaces ───────────────────────────────────────────────────────────────

interface Doctor {
  _id: string;
  name: string;
  specialty: string;
  clinic: string;
  experience: string;
  nextSlot: string;
  availableSlots: string[];       // all slots the doctor has set
  bookedSlots: string[];          // slots already taken (from appointments)
  fee: string;
  badge?: string;
  image?: string;
  expertise?: string[];
  isBooked?: boolean;             // did THIS user already book this doctor
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

function SlotSelector({ availableSlots, bookedSlots, selectedSlot, onChange }: SlotSelectorProps) {
  if (!availableSlots || availableSlots.length === 0) {
    return (
      <p className="text-xs text-gray-500 italic mt-1">No slots configured by doctor.</p>
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
                className="flex items-center gap-1 bg-[#1e293b] border border-[#2a3655] text-gray-500 text-[10px] sm:text-xs px-2.5 py-1.5 rounded-lg cursor-not-allowed select-none"
              >
                <svg className="w-3 h-3 flex-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <rect x="3" y="11" width="18" height="11" rx="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
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
                  ? "bg-[#00b85c] border-[#00b85c] text-white shadow-sm shadow-green-900"
                  : "bg-[#121726] border-[#2a3655] text-gray-300 hover:border-[#4b6aad] hover:text-white"
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
  const [selectedSlots, setSelectedSlots] = useState<Record<string, string>>({});

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
              (s) => !doc.bookedSlots?.includes(s)
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
      : doctors.filter((d) => extractCity(d.clinic) === selectedCity.toLowerCase());

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
          `✅ Appointment confirmed with ${doctor.name} on ${new Date(chosenSlot).toLocaleString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
            hour: "numeric",
            minute: "2-digit",
          })}.`
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
              : doc
          )
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
          <div className="mb-6 sm:mb-8 text-center">
            <h1 className="text-2xl sm:text-[28px] font-bold text-gray-100 mb-2 leading-tight">
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
            <div className="mb-6 flex flex-wrap items-center gap-2">
              <span className="text-xs text-gray-400 font-medium mr-1 flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
                City:
              </span>

              <button
                onClick={() => setSelectedCity("all")}
                className={`text-xs px-3 py-1.5 rounded-full border transition-all font-medium ${
                  selectedCity === "all"
                    ? "bg-[#2a3655] border-[#4b6aad] text-white"
                    : "bg-transparent border-[#2a3655] text-gray-400 hover:text-white hover:border-[#3b4b75]"
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
                      ? "bg-[#2a3655] border-[#4b6aad] text-white"
                      : "bg-transparent border-[#2a3655] text-gray-400 hover:text-white hover:border-[#3b4b75]"
                  }`}
                >
                  {city}
                </button>
              ))}

              {selectedCity !== "all" && (
                <span className="text-xs text-gray-500 ml-auto">
                  {filteredDoctors.length} doctor{filteredDoctors.length !== 1 ? "s" : ""} found
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
            <div className="text-red-500 p-4 bg-red-900/20 border border-red-500 rounded-lg text-center text-sm sm:text-base">
              {error}
            </div>
          )}

          {!isLoading && !error && doctors.length === 0 && (
            <div className="text-gray-400 text-center py-6 text-sm sm:text-base">
              No doctors currently available for this specialty.
            </div>
          )}

          {!isLoading && !error && doctors.length > 0 && filteredDoctors.length === 0 && (
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
              {filteredDoctors.map((doc) => (
                <div
                  key={doc._id}
                  className="bg-[#121726] p-4 sm:p-5 rounded-2xl border border-[#2a3655] flex flex-col md:flex-row items-center gap-4 sm:gap-6 shadow-md hover:border-[#3b4b75] transition-all"
                >
                  {/* ── Doctor Image / Fallback Icon ── */}
                  <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-lg overflow-hidden flex-none bg-[#1e2a40] shadow-inner">
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
                        <span className="bg-[#2a2f42] text-gray-300 text-[10px] sm:text-[11px] px-2.5 py-0.5 rounded-full font-medium whitespace-nowrap">
                          {doc.badge}
                        </span>
                      )}
                    </div>

                    <p className="text-[#8498c7] text-xs sm:text-sm font-medium mb-1 text-center md:text-left">
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
                                : "bg-[#1e2a40] border-[#2a3655] text-gray-400"
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
                      <strong className="text-gray-200">Fee:</strong> {doc.fee} Rs.
                    </p>

                    {/* ── Slot Selector ── */}
                    <SlotSelector
                      availableSlots={doc.availableSlots || []}
                      bookedSlots={doc.bookedSlots || []}
                      selectedSlot={selectedSlots[doc._id] || ""}
                      onChange={(slot) =>
                        setSelectedSlots((prev) => ({ ...prev, [doc._id]: slot }))
                      }
                    />
                  </div>

                  {/* ── Action Buttons ── */}
                  {/* Show "All Slots Taken" only when every configured slot is booked */}
                  <div className="flex flex-col gap-2 w-full md:w-auto md:min-w-[180px] flex-none mt-2 md:mt-0">
                    {doc.availableSlots?.length > 0 &&
                    doc.availableSlots.every((s) => doc.bookedSlots?.includes(s)) ? (
                      <button
                        disabled
                        className="bg-[#1e293b] border border-[#334155] text-gray-400 w-full py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm font-semibold cursor-not-allowed flex justify-center items-center gap-2"
                      >
                        🔒 All Slots Taken
                      </button>
                    ) : (
                      <button
                        onClick={() => handleBookAppointment(doc)}
                        disabled={bookingId === doc._id || !selectedSlots[doc._id]}
                        title={
                          !selectedSlots[doc._id]
                            ? "Please select a slot first"
                            : "Confirm this appointment"
                        }
                        className="bg-[#00b85c] hover:bg-[#00a050] text-white w-full py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm font-semibold transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex justify-center items-center gap-2"
                      >
                        {bookingId === doc._id ? (
                          <>
                            <svg
                              className="animate-spin h-4 w-4 text-white"
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                            >
                              <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                              />
                              <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                              />
                            </svg>
                            Booking...
                          </>
                        ) : (
                          "Confirm Appointment"
                        )}
                      </button>
                    )}

                    <button className="bg-[#4b5563] hover:bg-[#374151] text-white w-full py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm font-semibold transition-colors">
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