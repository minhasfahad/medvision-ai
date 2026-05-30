"use client";

import { useState, useEffect } from "react";
import api from "@/src/lib/axios";
import ProtectedRoute from "@/src/components/ProtectedRoute";
export default function ManageAppointments() {
  const [appointments, setAppointments] = useState<any[]>([]);
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
    newStatus: string,
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

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "cancelled":
        return "text-red-400 bg-red-400/10";
      case "completed":
        return "text-emerald-400 bg-emerald-400/10";
      case "scheduled":
      case "pending":
      default:
        return "text-blue-400 bg-blue-400/10";
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center p-8 text-white">
        <span className="text-lg font-semibold animate-pulse">
          Loading clinic schedule...
        </span>
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <div className="p-4 md:p-6 w-full max-w-full">
        <h1 className="text-xl md:text-2xl font-bold mb-4 md:mb-6 text-white tracking-wide">
          Global Appointment Ledger
        </h1>

        <div className="w-full">
          <table className="w-full text-left border-collapse block md:table">
            {/* Desktop Header - Hidden on Mobile */}
            <thead className="hidden md:table-header-group bg-[#120f26] text-gray-400 text-sm uppercase tracking-wider rounded-t-xl">
              <tr>
                <th className="p-5 font-semibold border-b border-gray-800">
                  Patient
                </th>
                <th className="p-5 font-semibold border-b border-gray-800">
                  Doctor
                </th>
                <th className="p-5 font-semibold border-b border-gray-800">
                  Time & Location
                </th>
                <th className="p-5 font-semibold border-b border-gray-800">
                  Reason
                </th>
                <th className="p-5 font-semibold border-b border-gray-800 text-center">
                  Status
                </th>
                <th className="p-5 font-semibold text-center border-b border-gray-800">
                  Action
                </th>
              </tr>
            </thead>

            <tbody className="block md:table-row-group text-sm md:text-base">
              {appointments.length === 0 ? (
                <tr className="block md:table-row">
                  <td
                    colSpan={6}
                    className="p-6 md:p-8 text-center text-gray-500 block md:table-cell"
                  >
                    No appointments found in the system.
                  </td>
                </tr>
              ) : (
                appointments.map((app: any) => (
                  <tr
                    key={app._id}
                    // Mobile: Turns the row into a card layout with margin bottom. Desktop: standard table row.
                    className="block md:table-row bg-[#1a163a] md:bg-transparent border border-gray-800 md:border-none rounded-xl md:rounded-none mb-4 md:mb-0 text-gray-200 hover:bg-[#201c45] transition-colors duration-200 overflow-hidden shadow-lg md:shadow-none"
                  >
                    {/* Patient */}
                    <td className="p-4 md:p-5 border-b border-gray-800 md:border-none flex justify-between md:table-cell items-center">
                      <span className="md:hidden text-xs uppercase text-gray-400 font-bold">
                        Patient
                      </span>
                      <span className="font-medium text-right md:text-left">
                        {app.patientName}
                      </span>
                    </td>

                    {/* Doctor */}
                    <td className="p-4 md:p-5 border-b border-gray-800 md:border-none flex justify-between md:table-cell items-center">
                      <span className="md:hidden text-xs uppercase text-gray-400 font-bold">
                        Doctor
                      </span>
                      <span className="text-blue-400 text-right md:text-left">
                        {app.doctorName}
                      </span>
                    </td>

                    {/* Time & Location */}
                    <td className="p-4 md:p-5 border-b border-gray-800 md:border-none flex justify-between md:table-cell items-center">
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
                    <td className="p-4 md:p-5 border-b border-gray-800 md:border-none flex justify-between md:table-cell items-center">
                      <span className="md:hidden text-xs uppercase text-gray-400 font-bold">
                        Reason
                      </span>
                      <span className="text-sm text-gray-300 text-right md:text-left">
                        {app.tumorType || "Consultation"}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="p-4 md:p-5 border-b border-gray-800 md:border-none flex justify-between md:table-cell items-center text-center">
                      <span className="md:hidden text-xs uppercase text-gray-400 font-bold">
                        Status
                      </span>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold inline-block ${getStatusColor(app.status)}`}
                      >
                        {app.status || "Pending"}
                      </span>
                    </td>

                    {/* Action */}
                    <td className="p-4 md:p-5 flex justify-between md:table-cell items-center text-center bg-[#15122e] md:bg-transparent">
                      <span className="md:hidden text-xs uppercase text-gray-400 font-bold">
                        Action
                      </span>
                      <select
                        className="bg-[#120f26] border border-gray-700 text-gray-300 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-auto md:w-full min-w-[130px] p-2 cursor-pointer shadow-sm ml-auto md:ml-0"
                        value={app.status || "Scheduled"}
                        onChange={(e) =>
                          handleStatusChange(app._id, e.target.value)
                        }
                      >
                        <option value="Scheduled">Scheduled</option>
                        <option value="Completed">Completed</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
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
