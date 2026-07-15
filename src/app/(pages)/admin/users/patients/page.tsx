"use client";

import { useEffect, useMemo, useState } from "react";
import api from "@/src/lib/axios";
import ProtectedRoute from "@/src/components/ProtectedRoute";
import Reveal from "@/src/components/Reveal";
import { Search, Trash2, User } from "lucide-react";

export default function ManagePatients() {
  const [patients, setPatients] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  // 1. Create a simple counter state to act as a trigger
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // 2. Put the fetch logic ENTIRELY inside the effect. The linter loves this.
  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const res = await api.get("/api/admin/users/patients");
        setPatients(res.data);
      } catch (error) {
        console.error("Error loading patients:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPatients();
  }, [refreshTrigger]); // 3. The effect depends on the trigger. If trigger changes, it refetches!

  const handleDelete = async (userId: string) => {
    if (!confirm("Are you sure you want to delete this patient?")) return;

    try {
      await api.post("/api/admin/users/delete", { userId });

      // 4. Instead of calling fetchPatients directly, we just increment the trigger.
      // This tells the useEffect to run again, giving us our fresh data.
      setRefreshTrigger((prev) => prev + 1);
    } catch (error) {
      console.error("Deletion failed:", error);
      alert("Failed to delete patient.");
    }
  };

  const filteredPatients = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    if (!normalizedSearch) {
      return patients;
    }

    return patients.filter((patient) => {
      return (
        patient.name?.toLowerCase().includes(normalizedSearch) ||
        patient.email?.toLowerCase().includes(normalizedSearch)
      );
    });
  }, [patients, searchTerm]);

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center p-8 text-white">
        <div className="text-center animate-fade-in-up">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-blue-500/30 border-t-blue-500" />
          <p className="mt-4 text-sm font-medium text-gray-400">
            Loading patients...
          </p>
        </div>
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <div className="p-4 sm:p-6 lg:p-8 w-full max-w-full">
        <Reveal>
          <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-blue-400">
                Registered Users
              </p>
              <h1 className="text-xl md:text-2xl font-bold text-white tracking-wide sm:text-3xl">
                Manage Patients
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-400">
                Review and manage registered patient accounts across the
                platform.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-[#120f26]/85 backdrop-blur-sm px-6 py-3 text-center lg:w-auto">
              <p className="text-2xl font-extrabold text-blue-300">
                {patients.length}
              </p>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-500">
                Registered Patients
              </p>
            </div>
          </div>
        </Reveal>

        <Reveal delay={80}>
          <div className="mb-6 grid grid-cols-1 gap-3 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-4 md:grid-cols-[1fr_auto]">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
              <input
                type="text"
                placeholder="Search patients by name or email..."
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                className="w-full rounded-lg border border-white/10 bg-[#120f26] pl-10 pr-4 py-2.5 text-sm text-white outline-none placeholder:text-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-colors"
              />
            </div>

            <div className="flex items-center justify-center rounded-lg border border-white/10 bg-[#120f26] px-4 py-2.5 text-sm text-gray-400">
              {filteredPatients.length} patient
              {filteredPatients.length === 1 ? "" : "s"}
            </div>
          </div>
        </Reveal>

        {/* Patient list — div-based data grid replacing the raw table */}
        <div className="space-y-3">
          {filteredPatients.length === 0 ? (
            <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-8 text-center text-gray-500 md:p-10 animate-fade-in-up">
              {searchTerm
                ? "No patients match your search."
                : "No patients found in the system."}
            </div>
          ) : (
            filteredPatients.map((user: any, idx: number) => (
              <Reveal key={user._id} delay={Math.min(idx * 50, 400)}>
                <div className="group flex flex-col gap-4 rounded-2xl border border-white/10 bg-[#120f26]/85 backdrop-blur-sm p-4 shadow-lg transition-all duration-300 hover:-translate-y-0.5 hover:border-white/20 hover:bg-white/[0.07] sm:flex-row sm:items-center sm:justify-between sm:p-5">
                  {/* Name */}
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-11 w-11 flex-none items-center justify-center rounded-full border border-blue-500/30 bg-blue-900/20 font-bold text-blue-300 transition-transform duration-300 group-hover:scale-110">
                      {(user.name || "?").charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="flex items-center gap-2 truncate font-semibold text-white">
                        <User className="h-3.5 w-3.5 flex-none text-blue-400" />
                        {user.name}
                      </p>
                      <span className="mt-1 inline-flex rounded border border-blue-500/30 bg-blue-900/20 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-blue-400">
                        Patient
                      </span>
                    </div>
                  </div>

                  {/* Email */}
                  <div className="min-w-0 text-sm text-gray-400 sm:flex-1 sm:text-center">
                    <span className="truncate">{user.email}</span>
                  </div>

                  {/* Actions */}
                  <button
                    onClick={() => handleDelete(user._id)}
                    className="flex flex-none items-center justify-center gap-1.5 bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white px-4 py-2 rounded-lg text-sm font-bold transition-all duration-300 shadow-[0_0_10px_rgba(239,68,68,0.0)] hover:shadow-[0_0_15px_rgba(239,68,68,0.4)] hover:-translate-y-0.5 cursor-pointer border-0"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Delete
                  </button>
                </div>
              </Reveal>
            ))
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
