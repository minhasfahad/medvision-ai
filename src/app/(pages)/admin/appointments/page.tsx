"use client";

import { useEffect, useMemo, useState } from "react";
import api from "@/src/lib/axios";
import ProtectedRoute from "@/src/components/ProtectedRoute";

type AppointmentStatus = "Pending" | "Scheduled" | "Completed" | "Cancelled";

interface AppointmentRecord {
  _id: string;
  patientName: string;
  doctorName: string;
  appointmentDate: string;
  clinic?: string;
  tumorType?: string;
  confidence?: number;
  status?: AppointmentStatus;
  createdAt?: string;
}

export default function ManageAppointments() {
  const [appointments, setAppointments] = useState<AppointmentRecord[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"All" | AppointmentStatus>(
    "All",
  );
  const [selectedAppointment, setSelectedAppointment] =
    useState<AppointmentRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const res = await api.get("/api/admin/appointments");
        setAppointments(res.data);
      } catch (error) {
        console.error("Error loading appointments:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, [refreshTrigger]);

  const handleStatusChange = async (
    appointmentId: string,
    newStatus: AppointmentStatus,
  ) => {
    if (
      !confirm(
        `Are you sure you want to mark this appointment as ${newStatus}?`,
      )
    )
      return;

    // 1. Optimistic UI Update: Instantly change the status on screen
    setAppointments((prev) =>
      prev.map((app) =>
        app._id === appointmentId ? { ...app, status: newStatus } : app,
      ),
    );

    try {
      // 2. Send the update to the database
      await api.post("/api/admin/appointments/update", {
        appointmentId,
        status: newStatus,
      });
    } catch (error) {
      console.error("Failed to update status:", error);
      alert("Failed to update status. Reverting...");
      // 3. Revert on failure
      setRefreshTrigger((prev) => prev + 1);
    }
  };

  const getStatusColor = (status?: AppointmentStatus) => {
    switch (status?.toLowerCase()) {
      case "cancelled":
        return "text-red-400 bg-red-400/10";

      case "completed":
        return "text-emerald-400 bg-emerald-400/10";

      case "scheduled":
        return "text-blue-400 bg-blue-400/10";

      case "pending":
      default:
        return "text-amber-400 bg-amber-400/10";
    }
  };

  const filteredAppointments = useMemo(() => {
    const search = searchTerm.trim().toLowerCase();

    return appointments.filter((appointment) => {
      const matchesSearch =
        !search ||
        appointment.patientName?.toLowerCase().includes(search) ||
        appointment.doctorName?.toLowerCase().includes(search) ||
        appointment.clinic?.toLowerCase().includes(search) ||
        appointment.tumorType?.toLowerCase().includes(search);

      const currentStatus = appointment.status || "Pending";

      const matchesStatus =
        statusFilter === "All" || currentStatus === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [appointments, searchTerm, statusFilter]);

  const appointmentCounts = useMemo(() => {
    return {
      total: appointments.length,
      scheduled: appointments.filter(
        (appointment) =>
          appointment.status === "Scheduled" ||
          appointment.status === "Pending",
      ).length,
      completed: appointments.filter(
        (appointment) => appointment.status === "Completed",
      ).length,
      cancelled: appointments.filter(
        (appointment) => appointment.status === "Cancelled",
      ).length,
    };
  }, [appointments]);

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center p-8 text-white">
        <div className="text-center animate-fade-in-up">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-blue-500/30 border-t-blue-500" />
          <p className="mt-4 text-sm font-medium text-gray-400">
            Loading clinic schedule...
          </p>
        </div>
      </div>
    );
  }
  const handleDeleteAppointment = async (
    appointmentId: string,
    status?: AppointmentStatus,
  ) => {
    if (status !== "Completed" && status !== "Cancelled") {
      alert("Only completed or cancelled appointments can be deleted.");
      return;
    }

    const shouldDelete = window.confirm(
      "This appointment will be permanently removed. Continue?",
    );

    if (!shouldDelete) return;

    const previousAppointments = appointments;

    setAppointments((current) =>
      current.filter((appointment) => appointment._id !== appointmentId),
    );

    try {
      await api.post("/api/admin/appointments/delete", {
        appointmentId,
      });
    } catch (error) {
      console.error("Failed to delete appointment:", error);
      setAppointments(previousAppointments);
      alert("Failed to delete appointment.");
    }
  };
  return (
    <ProtectedRoute>
      <div className="p-4 sm:p-6 lg:p-8 w-full max-w-full">
        <div className="mb-6 animate-fade-in-up">
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-orange-400">
            Scheduling
          </p>
          <h1 className="text-xl md:text-2xl font-bold text-white tracking-wide sm:text-3xl">
            Global Appointment Ledger
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-400">
            Review, reschedule, and manage every clinical appointment booked
            across the platform.
          </p>
        </div>

        <div
          className="w-full rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm shadow-2xl overflow-hidden animate-fade-in-up"
          style={{ animationDelay: "80ms" }}
        >
          <table className="w-full text-left border-collapse block md:table">
            {/* Desktop Header - Hidden on Mobile */}
            <thead className="hidden md:table-header-group bg-[#120f26]/80 text-gray-400 text-sm uppercase tracking-wider rounded-t-xl">
              <tr>
                <th className="p-5 font-semibold border-b border-white/10">
                  Patient
                </th>
                <th className="p-5 font-semibold border-b border-white/10">
                  Doctor
                </th>
                <th className="p-5 font-semibold border-b border-white/10">
                  Time & Location
                </th>
                <th className="p-5 font-semibold border-b border-white/10">
                  Reason
                </th>
                <th className="p-5 font-semibold border-b border-white/10 text-center">
                  Status
                </th>
                <th className="p-5 font-semibold text-center border-b border-white/10">
                  Action
                </th>
              </tr>
            </thead>

            <tbody className="block md:table-row-group text-sm md:text-base">
              {filteredAppointments.length === 0 ? (
                <tr className="block md:table-row">
                  <td
                    colSpan={6}
                    className="p-8 md:p-10 text-center text-gray-500 block md:table-cell"
                  >
                    No appointments found in the system.
                  </td>
                </tr>
              ) : (
                filteredAppointments.map((app, idx) => (
                  <tr
                    key={app._id}
                    style={{ animationDelay: `${idx * 60}ms` }}
                    // Mobile: Turns the row into a card layout with margin bottom. Desktop: standard table row.
                    className="block md:table-row bg-white/5 md:bg-transparent border border-white/10 md:border-none rounded-xl md:rounded-none mb-4 md:mb-0 text-gray-200 hover:bg-white/10 transition-colors duration-200 overflow-hidden shadow-lg md:shadow-none animate-fade-in-up"
                  >
                    {/* Patient */}
                    <td className="p-4 md:p-5 border-b border-white/10 md:border-none flex justify-between md:table-cell items-center">
                      <span className="md:hidden text-xs uppercase text-gray-400 font-bold">
                        Patient
                      </span>
                      <span className="font-medium text-right md:text-left">
                        {app.patientName}
                      </span>
                    </td>

                    {/* Doctor */}
                    <td className="p-4 md:p-5 border-b border-white/10 md:border-none flex justify-between md:table-cell items-center">
                      <span className="md:hidden text-xs uppercase text-gray-400 font-bold">
                        Doctor
                      </span>
                      <span className="text-blue-400 text-right md:text-left">
                        {app.doctorName}
                      </span>
                    </td>

                    {/* Time & Location */}
                    <td className="p-4 md:p-5 border-b border-white/10 md:border-none flex justify-between md:table-cell items-center">
                      <span className="md:hidden text-xs uppercase text-gray-400 font-bold">
                        Time & Loc
                      </span>
                      <div className="flex flex-col text-right md:text-left">
                        <span className="text-sm font-bold text-gray-200">
                          {app.appointmentDate}
                        </span>
                        <span className="text-xs text-gray-500 mt-1">
                          {app.clinic}
                        </span>
                      </div>
                    </td>

                    {/* Reason */}
                    <td className="p-4 md:p-5 border-b border-white/10 md:border-none flex justify-between md:table-cell items-center">
                      <span className="md:hidden text-xs uppercase text-gray-400 font-bold">
                        Reason
                      </span>
                      <span className="text-sm text-gray-300 text-right md:text-left">
                        {app.tumorType || "Consultation"}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="p-4 md:p-5 border-b border-white/10 md:border-none flex justify-between md:table-cell items-center text-center">
                      <span className="md:hidden text-xs uppercase text-gray-400 font-bold">
                        Status
                      </span>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold inline-block ${getStatusColor(
                          app.status || "Pending",
                        )}`}
                      >
                        {app.status || "Pending"}
                      </span>
                    </td>

                    {/* Action */}
                    <td className="p-4 md:p-5 flex justify-between md:table-cell items-center text-center bg-white/[0.03] md:bg-transparent">
                      <span className="md:hidden text-xs uppercase text-gray-400 font-bold">
                        Action
                      </span>

                      <div className="flex w-full flex-col gap-2 md:mx-auto md:max-w-[150px]">
                        <select
                          className="bg-[#120f26] border border-white/10 text-gray-300 text-sm rounded-lg outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 block w-full min-w-[130px] p-2 cursor-pointer transition-colors"
                          value={app.status || "Pending"}
                          onChange={(e) =>
                            handleStatusChange(
                              app._id,
                              e.target.value as AppointmentStatus,
                            )
                          }
                        >
                          <option value="Pending">Pending</option>
                          <option value="Scheduled">Scheduled</option>
                          <option value="Completed">Completed</option>
                          <option value="Cancelled">Cancelled</option>
                        </select>

                        {(app.status === "Completed" ||
                          app.status === "Cancelled") && (
                          <button
                            type="button"
                            onClick={() =>
                              handleDeleteAppointment(app._id, app.status)
                            }
                            className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs font-bold text-red-400 transition-all duration-300 shadow-[0_0_10px_rgba(239,68,68,0)] hover:bg-red-500 hover:text-white hover:shadow-[0_0_15px_rgba(239,68,68,0.4)]"
                          >
                            Delete Record
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </ProtectedRoute>
  );
}
