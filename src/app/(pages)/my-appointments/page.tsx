"use client";

import React, { useState, useEffect } from "react";
import api from "@/src/lib/axios";
import { useAuthStore } from "@/src/lib/store/useAuthStore";
import Link from "next/link";
import ProtectedRoute from "@/src/components/ProtectedRoute";
// Interface matching your MongoDB Appointment Schema
interface Appointment {
  _id: string;
  doctorName: string;
  clinic: string;
  appointmentDate: string;
  fee: string;
  status: "Pending" | "Confirmed" | "Cancelled";
  tumorType: string;
  createdAt: string;
}

export default function MyAppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { user, isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated || !user?.id) {
      return;
    }

    const fetchAppointments = async () => {
      try {
        setIsLoading(true);
        // Call the new API route we just created
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
    // 1. Ask for confirmation before cancelling
    if (!window.confirm("Are you sure you want to cancel this appointment?"))
      return;

    try {
      // 2. Call our new PUT route
      const response = await api.put("/api/appointments", {
        appointmentId: appointmentId,
        status: "Cancelled",
      });

      if (response.data.success) {
        // 3. Instantly update the UI without refreshing the page
        setAppointments((prev) =>
          prev.map((appt) =>
            appt._id === appointmentId
              ? { ...appt, status: "Cancelled" }
              : appt,
          ),
        );
      }
    } catch (err: unknown) {
      console.error("Error cancelling appointment:", err);
      alert("Failed to cancel appointment. Please try again.");
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-transparent text-white w-full max-w-[1200px] mx-auto pt-6 sm:pt-10 px-4 sm:px-6 pb-12">
        <div className="mb-6 sm:mb-10 text-center md:text-left">
          <h1 className="text-2xl sm:text-[28px] font-bold text-gray-100 mb-1.5 sm:mb-2">
            My Appointments
          </h1>
          <p className="text-gray-400 text-xs sm:text-sm">
            Manage your upcoming and past consultations.
          </p>
        </div>

        <section>
          {isLoading && (
            <div className="text-blue-400 animate-pulse text-base sm:text-lg text-center md:text-left py-4">
              Loading your schedule...
            </div>
          )}

          {error && (
            <div className="text-red-400 bg-red-500/10 p-4 rounded-lg border border-red-500/30 text-center md:text-left text-sm sm:text-base">
              Error: {error}
            </div>
          )}

          {!isLoading && !error && appointments.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 sm:py-20 px-4 bg-[#121726] rounded-2xl border border-[#2a3655] text-center">
              <p className="text-gray-400 text-base sm:text-lg mb-4 sm:mb-6">
                You have no booked appointments.
              </p>
              <Link href="/appointments" className="w-full sm:w-auto">
                <button className="bg-[#00b85c] hover:bg-[#00a050] text-white px-6 py-2.5 rounded-lg font-semibold transition-colors shadow-lg shadow-green-900/20 w-full sm:w-auto">
                  Book a Specialist
                </button>
              </Link>
            </div>
          )}

          {!isLoading && !error && appointments.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              {appointments.map((appt) => (
                <div
                  key={appt._id}
                  className="p-4 sm:p-6 bg-[#121726] rounded-2xl border border-[#2a3655] flex flex-col h-full shadow-lg hover:border-[#3b4b75] transition-all w-full"
                >
                  <div className="flex flex-col sm:flex-row justify-between items-start gap-2 mb-4">
                    <div className="min-w-0">
                      <h3 className="text-lg sm:text-xl font-bold text-gray-100 truncate">
                        {appt.doctorName}
                      </h3>
                      <p className="text-blue-400 text-xs sm:text-sm font-medium mt-0.5 sm:mt-1 truncate">
                        {appt.tumorType} Consultation
                      </p>
                    </div>

                    {/* Status Badge */}
                    <span
                      className={`text-[10px] sm:text-[11px] px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full uppercase tracking-wider font-bold border whitespace-nowrap self-start ${
                        appt.status === "Confirmed"
                          ? "bg-green-900/30 text-green-400 border-green-500/30"
                          : appt.status === "Pending"
                            ? "bg-amber-900/30 text-amber-400 border-amber-500/30"
                            : "bg-gray-800 text-gray-400 border-gray-600"
                      }`}
                    >
                      {appt.status}
                    </span>
                  </div>

                  <div className="space-y-2.5 sm:space-y-3 mb-5 sm:mb-6 bg-[#1e2235] p-3 sm:p-4 rounded-xl border border-gray-700/50">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 sm:gap-4 text-xs sm:text-sm">
                      <span className="text-gray-400">Date & Time:</span>
                      <span className="text-gray-100 font-semibold sm:text-right break-words">
                        {appt.appointmentDate}
                      </span>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 sm:gap-4 text-xs sm:text-sm">
                      <span className="text-gray-400">Clinic:</span>
                      <span className="text-gray-100 font-semibold sm:text-right break-words">
                        {appt.clinic}
                      </span>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 sm:gap-4 text-xs sm:text-sm">
                      <span className="text-gray-400">Consultation Fee:</span>
                      <span className="text-gray-100 font-semibold sm:text-right whitespace-nowrap">
                        {appt.fee}
                      </span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="mt-auto flex gap-3 w-full">
                    <button
                      onClick={() => handleCancelAppointment(appt._id)}
                      disabled={appt.status === "Cancelled"}
                      className="w-full bg-[#4b5563] hover:bg-red-600 disabled:bg-gray-800 disabled:text-gray-500 text-white py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm font-semibold transition-colors truncate"
                    >
                      {appt.status === "Cancelled"
                        ? "Cancelled"
                        : "Cancel Appointment"}
                    </button>
                    {appt.status !== "Cancelled" && (
                      <button className="w-full bg-[#2a3655] hover:bg-[#3b4b75] text-white py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm font-semibold transition-colors truncate">
                        Reschedule
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </ProtectedRoute>
  );
}
