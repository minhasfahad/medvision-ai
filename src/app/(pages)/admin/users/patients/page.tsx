"use client";

import { useEffect, useMemo, useState } from "react";
import api from "@/src/lib/axios";
import ProtectedRoute from "@/src/components/ProtectedRoute";
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
      <div className="flex h-64 items-center justify-center p-8 text-white">
        <span className="text-lg font-semibold animate-pulse">
          Loading patients...
        </span>
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <div className="p-4 md:p-6 w-full max-w-full">
        <h1 className="text-xl md:text-2xl font-bold mb-4 md:mb-6 text-white tracking-wide">
          Manage Patients
        </h1>
        <div className="mb-6 grid grid-cols-1 gap-3 rounded-xl border border-gray-800 bg-[#1a163a] p-4 md:grid-cols-[1fr_auto]">
          <input
            type="text"
            placeholder="Search patients by name or email..."
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            className="w-full rounded-lg border border-gray-700 bg-[#120f26] px-4 py-2.5 text-sm text-white outline-none placeholder:text-gray-500 focus:border-blue-500"
          />

          <div className="flex items-center justify-center rounded-lg border border-gray-700 bg-[#120f26] px-4 py-2.5 text-sm text-gray-400">
            {filteredPatients.length} patient
            {filteredPatients.length === 1 ? "" : "s"}
          </div>
        </div>
        {/* Desktop specific styles applied to wrapper so the background isn't lost on large screens */}
        <div className="w-full md:bg-[#1a163a] md:rounded-xl md:border md:border-gray-800 md:shadow-2xl md:overflow-hidden">
          <table className="w-full text-left border-collapse block md:table">
            {/* Desktop Header - Hidden on Mobile */}
            <thead className="hidden md:table-header-group bg-[#120f26] text-gray-400 text-sm uppercase tracking-wider">
              <tr>
                <th className="p-5 font-semibold border-b border-gray-800">
                  Name
                </th>
                <th className="p-5 font-semibold border-b border-gray-800">
                  Email
                </th>
                <th className="p-5 font-semibold text-center border-b border-gray-800">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="block md:table-row-group text-sm md:text-base">
              {filteredPatients.length === 0 ? (
                <tr className="block md:table-row">
                  <td
                    colSpan={3}
                    className="p-6 md:p-8 text-center text-gray-500 block md:table-cell"
                  >
                    {searchTerm
                      ? "No patients match your search."
                      : "No patients found in the system."}
                  </td>
                </tr>
              ) : (
                filteredPatients.map((user: any) => (
                  <tr
                    key={user._id}
                    /* Mobile: Card layout with margin. Desktop: Transparent row background */
                    className="block md:table-row bg-[#1a163a] md:bg-transparent border border-gray-800 md:border-none rounded-xl md:rounded-none mb-4 md:mb-0 text-gray-200 hover:bg-[#201c45] transition-colors duration-200 overflow-hidden shadow-lg md:shadow-none"
                  >
                    {/* Name */}
                    <td className="p-4 md:p-5 border-b border-gray-800 md:border-none flex justify-between md:table-cell items-center">
                      <span className="md:hidden text-xs uppercase text-gray-400 font-bold">
                        Name
                      </span>
                      <span className="font-medium text-right md:text-left">
                        {user.name}
                      </span>
                    </td>

                    {/* Email */}
                    <td className="p-4 md:p-5 border-b border-gray-800 md:border-none flex justify-between md:table-cell items-center">
                      <span className="md:hidden text-xs uppercase text-gray-400 font-bold">
                        Email
                      </span>
                      <span className="text-gray-400 text-right md:text-left">
                        {user.email}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="p-4 md:p-5 flex justify-between md:table-cell items-center text-center bg-[#15122e] md:bg-transparent">
                      <span className="md:hidden text-xs uppercase text-gray-400 font-bold">
                        Actions
                      </span>
                      <button
                        onClick={() => handleDelete(user._id)}
                        className="bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white px-4 py-2 rounded-lg text-sm font-bold transition-all duration-300 shadow-[0_0_10px_rgba(239,68,68,0.0)] hover:shadow-[0_0_15px_rgba(239,68,68,0.4)] cursor-pointer border-0 ml-auto md:ml-0 md:mx-auto block"
                      >
                        Delete
                      </button>
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
