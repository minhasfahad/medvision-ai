"use client";

import { useEffect, useMemo, useState } from "react";
import api from "@/src/lib/axios";
import ProtectedRoute from "@/src/components/ProtectedRoute";
import Reveal from "@/src/components/Reveal";
import {
  Search,
  X,
  User,
  Stethoscope,
  MapPin,
  ClipboardList,
  Trash2,
} from "lucide-react";

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

const STATUS_FILTERS: Array<"All" | AppointmentStatus> = [
  "All",
  "Pending",
  "Scheduled",
  "Completed",
  "Cancelled",
];

// Small presentational helper: a single field within an appointment row.
// Shows an inline mobile label + the value; purely layout, no state of its own.
function Field({
  label,
  children,
  className = "",
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`flex items-center justify-between gap-3 p-4 lg:justify-start lg:p-5 ${className}`}
    >
      <span className="text-xs font-bold uppercase text-gray-400 lg:hidden">
        {label}
      </span>
      <div className="min-w-0 text-right text-sm lg:text-left">
        {children}
      </div>
    </div>
  );
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
        <Reveal>
          <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-orange-400">
                Scheduling
              </p>
              <h1 className="text-xl md:text-2xl font-bold text-white tracking-wide sm:text-3xl">
                Global Appointment Ledger
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-400">
                Review, reschedule, and manage every clinical appointment
                booked across the platform.
              </p>
            </div>

            {/* Quick stat chips built from the existing appointment counts */}
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:w-auto">
              {[
                { label: "Total", value: appointmentCounts.total, accent: "text-white" },
                { label: "Scheduled", value: appointmentCounts.scheduled, accent: "text-blue-400" },
                { label: "Completed", value: appointmentCounts.completed, accent: "text-emerald-400" },
                { label: "Cancelled", value: appointmentCounts.cancelled, accent: "text-red-400" },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-xl border border-white/10 bg-[#120f26]/85 backdrop-blur-sm px-4 py-2.5 text-center"
                >
                  <p className={`text-lg font-extrabold ${stat.accent}`}>
                    {stat.value}
                  </p>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-500">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </Reveal>

        {/* Search + pill-shaped status filters */}
        <Reveal delay={80}>
          <div className="mb-6 flex flex-col gap-4 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-4 sm:p-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="relative lg:max-w-sm lg:flex-1">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
              <input
                type="text"
                placeholder="Search patient, doctor, clinic, or reason..."
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                className="w-full rounded-lg border border-white/10 bg-[#120f26] pl-10 pr-9 py-2.5 text-sm text-white outline-none placeholder:text-gray-500 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-colors"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              {STATUS_FILTERS.map((status) => {
                const isActive = statusFilter === status;
                return (
                  <button
                    key={status}
                    type="button"
                    onClick={() => setStatusFilter(status)}
                    className={`rounded-full border px-4 py-2 text-xs font-bold uppercase tracking-wide transition-all duration-300 ${
                      isActive
                        ? "border-transparent bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-[0_0_15px_rgba(37,99,235,0.35)]"
                        : "border-white/10 bg-[#120f26] text-gray-400 hover:text-white hover:border-white/20"
                    }`}
                  >
                    {status}
                  </button>
                );
              })}
            </div>
          </div>
        </Reveal>

        {/* Appointment list — div-based data grid replacing the raw table */}
        <div className="space-y-3">
          {filteredAppointments.length === 0 ? (
            <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-8 text-center text-gray-500 md:p-10 animate-fade-in-up">
              No appointments found in the system.
            </div>
          ) : (
            <>
              {/* Column headers — desktop only, mirrors the field order below */}
              <div className="hidden rounded-xl border border-white/10 bg-[#120f26]/80 px-2 text-xs font-semibold uppercase tracking-wider text-gray-400 lg:grid lg:grid-cols-[1.3fr_1.1fr_1.3fr_1fr_0.9fr_auto]">
                <div className="p-4">Patient</div>
                <div className="p-4">Doctor</div>
                <div className="p-4">Time &amp; Location</div>
                <div className="p-4">Reason</div>
                <div className="p-4 text-center">Status</div>
                <div className="p-4 text-center">Action</div>
              </div>

              {filteredAppointments.map((app, idx) => (
                <Reveal key={app._id} delay={Math.min(idx * 50, 400)}>
                  <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#120f26]/85 backdrop-blur-sm shadow-lg transition-all duration-300 hover:-translate-y-0.5 hover:border-white/20 hover:bg-white/[0.07]">
                    <div className="divide-y divide-white/10 lg:grid lg:grid-cols-[1.3fr_1.1fr_1.3fr_1fr_0.9fr_auto] lg:divide-y-0 lg:divide-x">
                      {/* Patient */}
                      <Field label="Patient">
                        <span className="flex items-center justify-end gap-2 font-medium text-gray-100 lg:justify-start">
                          <User className="hidden h-4 w-4 flex-none text-gray-500 lg:inline" />
                          {app.patientName}
                        </span>
                      </Field>

                      {/* Doctor */}
                      <Field label="Doctor">
                        <span className="flex items-center justify-end gap-2 text-blue-400 lg:justify-start">
                          <Stethoscope className="hidden h-4 w-4 flex-none lg:inline" />
                          {app.doctorName}
                        </span>
                      </Field>

                      {/* Time & Location */}
                      <Field label="Time & Loc">
                        <div className="flex flex-col items-end lg:items-start">
                          <span className="text-sm font-bold text-gray-200">
                            {app.appointmentDate}
                          </span>
                          <span className="mt-1 flex items-center gap-1 text-xs text-gray-500">
                            <MapPin className="h-3 w-3 flex-none" />
                            {app.clinic}
                          </span>
                        </div>
                      </Field>

                      {/* Reason */}
                      <Field label="Reason">
                        <span className="flex items-center justify-end gap-2 text-sm text-gray-300 lg:justify-start">
                          <ClipboardList className="hidden h-4 w-4 flex-none text-gray-500 lg:inline" />
                          {app.tumorType || "Consultation"}
                        </span>
                      </Field>

                      {/* Status */}
                      <div className="flex items-center justify-between gap-3 p-4 lg:justify-center lg:p-5">
                        <span className="text-xs font-bold uppercase text-gray-400 lg:hidden">
                          Status
                        </span>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-bold inline-block ${getStatusColor(
                            app.status || "Pending",
                          )}`}
                        >
                          {app.status || "Pending"}
                        </span>
                      </div>

                      {/* Action */}
                      <div className="flex items-center justify-between gap-3 bg-white/[0.03] p-4 lg:block lg:bg-transparent lg:p-5">
                        <span className="text-xs font-bold uppercase text-gray-400 lg:hidden">
                          Action
                        </span>

                        <div className="flex w-full flex-col gap-2 lg:mx-auto lg:max-w-[150px]">
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
                              className="flex items-center justify-center gap-1.5 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs font-bold text-red-400 transition-all duration-300 shadow-[0_0_10px_rgba(239,68,68,0)] hover:bg-red-500 hover:text-white hover:shadow-[0_0_15px_rgba(239,68,68,0.4)]"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                              Delete Record
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </Reveal>
              ))}
            </>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
