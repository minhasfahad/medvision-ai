"use client";

import React, { useState, useEffect } from "react";
import api from "@/src/lib/axios";
import { useAuthStore } from "@/src/lib/store/useAuthStore";
import Link from "next/link";
import ProtectedRoute from "@/src/components/ProtectedRoute";
import {
  CalendarClock,
  CheckCircle2,
  AlertTriangle,
  Lock,
  Clock,
  Video,
} from "lucide-react";

interface Appointment {
  _id: string;
  doctorId: string | any;
  doctorName: string;
  clinic: string;
  appointmentDate: string;
  fee: string;
  status:
    | "Pending"
    | "Confirmed"
    | "Cancelled"
    | "Completed"
    | "Patient Absent";
  tumorType: string;
  createdAt: string;
}

interface DoctorSlots {
  availableSlots: string[];
  bookedSlots: string[];
}

// ✅ Check if appointment time has passed
function isExpired(appointmentDate: string): boolean {
  return new Date(appointmentDate) < new Date();
}

// ✅ Status badge styling
function getStatusBadge(
  status: Appointment["status"],
  expired: boolean,
): string {
  if (expired && status === "Pending")
    return "bg-gray-800 text-gray-400 border-gray-600";
  if (status === "Confirmed")
    return "bg-green-900/30 text-green-400 border-green-500/30";
  if (status === "Cancelled")
    return "bg-gray-800 text-gray-400 border-gray-600";
  if (status === "Completed")
    return "bg-blue-900/30 text-blue-400 border-blue-500/30";
  if (status === "Patient Absent")
    return "bg-orange-900/30 text-orange-400 border-orange-500/30";
  return "bg-amber-900/30 text-amber-400 border-amber-500/30";
}

// ✅ Label to show on badge
function getStatusLabel(
  status: Appointment["status"],
  expired: boolean,
): string {
  if (expired && status === "Pending") return "Expired";
  return status;
}

export default function MyAppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ✅ Reschedule state
  const [reschedulingId, setReschedulingId] = useState<string | null>(null);
  const [doctorSlots, setDoctorSlots] = useState<DoctorSlots | null>(null);
  const [isFetchingSlots, setIsFetchingSlots] = useState(false);
  const [selectedNewSlot, setSelectedNewSlot] = useState<string>("");
  const [isRescheduling, setIsRescheduling] = useState(false);
  const [rescheduleError, setRescheduleError] = useState<string | null>(null);

  const { user, isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated || !user?.id) return;

    const fetchAppointments = async () => {
      try {
        setIsLoading(true);
        const response = await api.get(`/api/appointments?userId=${user.id}`);
        if (response.data.success) {
          setAppointments(response.data.data);
        } else {
          throw new Error(
            response.data.message || "Failed to fetch appointments",
          );
        }
      } catch (err: unknown) {
        const errorMessage =
          err instanceof Error ? err.message : "An unexpected error occurred";
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAppointments();
  }, [user, isAuthenticated]);

  const handleCancelAppointment = async (appointmentId: string) => {
    if (!window.confirm("Are you sure you want to cancel this appointment?"))
      return;
    try {
      const response = await api.put("/api/appointments", {
        appointmentId,
        status: "Cancelled",
      });
      if (response.data.success) {
        setAppointments((prev) =>
          prev.map((appt) =>
            appt._id === appointmentId
              ? { ...appt, status: "Cancelled" }
              : appt,
          ),
        );
      }
    } catch (err) {
      console.error("Error cancelling appointment:", err);
      alert("Failed to cancel. Please try again.");
    }
  };

  // ✅ Fetch doctor slots when patient clicks Reschedule
  const handleOpenReschedule = async (appt: Appointment) => {
    setReschedulingId(appt._id);
    setSelectedNewSlot("");
    setRescheduleError(null);
    setDoctorSlots(null);
    setIsFetchingSlots(true);

    // ✅ doctorId can be a populated object or a plain string
    const doctorId =
      typeof appt.doctorId === "object" && appt.doctorId !== null
        ? (appt.doctorId as any)._id
        : appt.doctorId;

    try {
      const response = await api.get(`/api/doctors?doctorId=${doctorId}`);
      if (response.data.success) {
        setDoctorSlots({
          availableSlots: response.data.data.availableSlots ?? [],
          bookedSlots: response.data.data.bookedSlots ?? [],
        });
      } else {
        setRescheduleError("Could not load doctor's available slots.");
      }
    } catch (err) {
      console.error("Error fetching doctor slots:", err);
      setRescheduleError("Could not load doctor's available slots.");
    } finally {
      setIsFetchingSlots(false);
    }
  };

  // ✅ Submit reschedule with selected slot
  const handleRescheduleSubmit = async (appointmentId: string) => {
    if (!selectedNewSlot) {
      setRescheduleError("Please select a new slot.");
      return;
    }

    try {
      setIsRescheduling(true);
      setRescheduleError(null);

      const response = await api.put("/api/appointments", {
        appointmentId,
        appointmentDate: selectedNewSlot,
      });

      if (response.data.success) {
        // ✅ Update UI instantly
        setAppointments((prev) =>
          prev.map((appt) =>
            appt._id === appointmentId
              ? { ...appt, appointmentDate: selectedNewSlot }
              : appt,
          ),
        );
        // Close the modal
        setReschedulingId(null);
        setSelectedNewSlot("");
        setDoctorSlots(null);
      } else {
        setRescheduleError("Failed to reschedule. Please try again.");
      }
    } catch (err) {
      console.error("Reschedule error:", err);
      setRescheduleError("An error occurred. Please try again.");
    } finally {
      setIsRescheduling(false);
    }
  };

  const handleCloseReschedule = () => {
    setReschedulingId(null);
    setSelectedNewSlot("");
    setDoctorSlots(null);
    setRescheduleError(null);
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-transparent text-white w-full max-w-[1200px] mx-auto pt-6 sm:pt-10 px-4 sm:px-6 pb-12">
        <div className="mb-6 sm:mb-10 text-center md:text-left animate-fade-in-up">
          <div className="mx-auto md:mx-0 mb-3 w-11 h-11 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center">
            <CalendarClock className="w-5 h-5 text-blue-400" />
          </div>
          <h1 className="text-2xl sm:text-[28px] font-bold mb-1.5 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-400 to-blue-400">
            My Appointments
          </h1>
          <p className="text-gray-400 text-xs sm:text-sm">
            Manage your upcoming and past consultations.
          </p>
        </div>

        <section>
          {isLoading && (
            <div className="text-blue-400 animate-pulse text-base text-center md:text-left py-4">
              Loading your schedule...
            </div>
          )}

          {error && (
            <div className="text-red-400 bg-red-500/10 p-4 rounded-lg border border-red-500/30 text-sm">
              Error: {error}
            </div>
          )}

          {!isLoading && !error && appointments.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 px-4 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 text-center animate-fade-in-up">
              <CalendarClock className="w-10 h-10 text-gray-600 mb-4" />
              <p className="text-gray-400 text-base mb-6">
                You have no booked appointments.
              </p>
              <Link href="/appointments" className="w-full sm:w-auto">
                <button className="rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2.5 font-bold hover:from-blue-500 hover:to-purple-500 transition-all duration-300 shadow-[0_0_20px_rgba(37,99,235,0.35)] hover:-translate-y-1 w-full sm:w-auto">
                  Book a Specialist
                </button>
              </Link>
            </div>
          )}

          {!isLoading && !error && appointments.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              {appointments.map((appt, i) => {
                const expired = isExpired(appt.appointmentDate);
                const isFinal =
                  appt.status === "Cancelled" ||
                  appt.status === "Completed" ||
                  appt.status === "Patient Absent";
                const canAct = !expired && !isFinal;

                return (
                  <div
                    key={appt._id}
                    style={{ animationDelay: `${i * 80}ms` }}
                    className={`p-4 sm:p-6 bg-white/5 backdrop-blur-sm rounded-2xl border flex flex-col h-full shadow-lg transition-all duration-300 w-full animate-fade-in-up ${
                      expired || isFinal
                        ? "border-white/5 opacity-75"
                        : "border-white/10 hover:border-blue-500/30 hover:-translate-y-1"
                    }`}
                  >
                    {/* Card Header */}
                    <div className="flex flex-col sm:flex-row justify-between items-start gap-2 mb-4">
                      <div className="min-w-0">
                        <h3 className="text-lg sm:text-xl font-bold text-gray-100 truncate">
                          Dr. {appt.doctorName}
                        </h3>
                        <p className="text-blue-400 text-xs sm:text-sm font-medium mt-0.5 truncate">
                          {appt.tumorType} Consultation
                        </p>
                      </div>
                      <span
                        className={`text-[10px] px-2.5 py-0.5 rounded-full uppercase tracking-wider font-bold border whitespace-nowrap self-start ${getStatusBadge(appt.status, expired)}`}
                      >
                        {getStatusLabel(appt.status, expired)}
                      </span>
                    </div>

                    {/* Details */}
                    <div className="space-y-2.5 mb-5 bg-black/20 p-3 sm:p-4 rounded-xl border border-white/10">
                      <div className="flex flex-col sm:flex-row sm:justify-between gap-1 text-xs sm:text-sm">
                        <span className="text-gray-400">Date & Time:</span>
                        <span className="text-gray-100 font-semibold sm:text-right">
                          {new Date(appt.appointmentDate).toLocaleDateString(
                            "en-US",
                            {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            },
                          )}
                          <span className="mx-2 text-gray-500">|</span>
                          {new Date(appt.appointmentDate).toLocaleTimeString(
                            "en-US",
                            {
                              hour: "numeric",
                              minute: "2-digit",
                            },
                          )}
                        </span>
                      </div>
                      <div className="flex flex-col sm:flex-row sm:justify-between gap-1 text-xs sm:text-sm">
                        <span className="text-gray-400">Clinic:</span>
                        <span className="text-gray-100 font-semibold sm:text-right">
                          {appt.clinic}
                        </span>
                      </div>
                      <div className="flex flex-col sm:flex-row sm:justify-between gap-1 text-xs sm:text-sm">
                        <span className="text-gray-400">Consultation Fee:</span>
                        <span className="text-gray-100 font-semibold sm:text-right">
                          {appt.fee}
                        </span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="mt-auto flex flex-col gap-3">
                      {/* CASE 1: Final state banner */}
                      {isFinal && (
                        <div
                          className={`w-full flex items-center justify-center gap-1.5 text-center py-2.5 rounded-lg text-xs font-bold border ${
                            appt.status === "Completed"
                              ? "bg-blue-900/20 border-blue-500/30 text-blue-400"
                              : appt.status === "Patient Absent"
                                ? "bg-orange-900/20 border-orange-500/30 text-orange-400"
                                : "bg-white/5 border-white/10 text-gray-500"
                          }`}
                        >
                          {appt.status === "Completed" && (
                            <>
                              <CheckCircle2 className="w-3.5 h-3.5" /> Consultation completed.
                            </>
                          )}
                          {appt.status === "Patient Absent" && (
                            <>
                              <AlertTriangle className="w-3.5 h-3.5" /> You were marked absent for this appointment.
                            </>
                          )}
                          {appt.status === "Cancelled" && (
                            <>
                              <Lock className="w-3.5 h-3.5" /> This appointment was cancelled.
                            </>
                          )}
                        </div>
                      )}

                      {/* CASE 2: Expired pending */}
                      {expired && appt.status === "Pending" && (
                        <div className="w-full flex items-center justify-center gap-1.5 text-center py-2.5 bg-white/5 border border-white/10 text-gray-500 text-xs font-bold rounded-lg">
                          <Clock className="w-3.5 h-3.5" /> This appointment expired without confirmation.
                        </div>
                      )}

                      {/* CASE 3: Active — cancel + reschedule */}
                      {canAct && (
                        <div className="flex gap-3">
                          <button
                            onClick={() => handleCancelAppointment(appt._id)}
                            className="flex-1 bg-white/5 border border-white/10 hover:bg-red-600/90 hover:border-red-500/50 text-white py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all duration-300"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => handleOpenReschedule(appt)}
                            className="flex-1 bg-white/5 border border-white/10 hover:bg-blue-600/80 hover:border-blue-500/50 text-white py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all duration-300"
                          >
                            Reschedule
                          </button>
                        </div>
                      )}

                      {/* ✅ RESCHEDULE SLOT PICKER */}
                      {reschedulingId === appt._id && (
                        <div className="mt-2 p-4 bg-black/20 backdrop-blur-sm rounded-xl border border-blue-500/30 flex flex-col gap-3 animate-fade-in-up">
                          <p className="text-blue-400 text-xs font-bold uppercase tracking-wider">
                            Select a New Slot
                          </p>

                          {/* Loading slots */}
                          {isFetchingSlots && (
                            <p className="text-gray-400 text-xs animate-pulse">
                              Loading available slots...
                            </p>
                          )}

                          {/* No slots available */}
                          {!isFetchingSlots &&
                            doctorSlots &&
                            doctorSlots.availableSlots.filter(
                              (s) =>
                                !doctorSlots.bookedSlots.includes(s) &&
                                !isExpired(s),
                            ).length === 0 && (
                              <p className="text-amber-400 text-xs">
                                No available slots from this doctor right now.
                              </p>
                            )}

                          {/* Slot buttons */}
                          {!isFetchingSlots && doctorSlots && (
                            <div className="flex flex-wrap gap-2">
                              {doctorSlots.availableSlots
                                .filter(
                                  (s) =>
                                    !doctorSlots.bookedSlots.includes(s) &&
                                    !isExpired(s), // ✅ only future slots
                                )
                                .map((slot) => (
                                  <button
                                    key={slot}
                                    type="button"
                                    onClick={() => setSelectedNewSlot(slot)}
                                    className={`text-[10px] sm:text-xs px-2.5 py-1.5 rounded-lg border transition-all font-medium ${
                                      selectedNewSlot === slot
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
                                ))}
                            </div>
                          )}

                          {rescheduleError && (
                            <p className="text-red-400 text-xs">
                              {rescheduleError}
                            </p>
                          )}

                          {/* Confirm / Cancel buttons */}
                          <div className="flex gap-3 mt-1">
                            <button
                              onClick={() => handleRescheduleSubmit(appt._id)}
                              disabled={isRescheduling || !selectedNewSlot}
                              className="flex-1 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 disabled:opacity-40 disabled:hover:from-blue-600 disabled:hover:to-purple-600 text-white py-2 text-sm font-bold transition-all duration-300"
                            >
                              {isRescheduling
                                ? "Saving..."
                                : "Confirm Reschedule"}
                            </button>
                            <button
                              onClick={handleCloseReschedule}
                              className="flex-1 bg-white/5 border border-white/10 hover:bg-white/10 text-white py-2 rounded-lg text-sm font-semibold transition-all duration-300"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Join Video Consultation */}
                      {appt.status === "Confirmed" && !expired && (
                        <button
                          onClick={() =>
                            window.open(`/consultation/${appt._id}`, "_blank")
                          }
                          className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-2.5 rounded-lg text-sm font-bold transition-all duration-300 hover:-translate-y-0.5 flex items-center justify-center gap-2"
                        >
                          <Video className="w-4 h-4" />
                          Join Video Consultation
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </ProtectedRoute>
  );
}
