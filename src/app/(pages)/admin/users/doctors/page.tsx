"use client";

import { useEffect, useMemo, useState } from "react";
import api from "@/src/lib/axios";
import ProtectedRoute from "@/src/components/ProtectedRoute";
import { Search, ShieldOff, Stethoscope } from "lucide-react";

export default function ManageDoctors() {
  const [doctors, setDoctors] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const res = await api.get("/api/admin/users/doctors");
        setDoctors(res.data);
      } catch (error) {
        console.error("Error loading doctors:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDoctors();
  }, [refreshTrigger]);

  const handleDelete = async (userId: string) => {
    if (
      !confirm("Are you sure you want to remove this doctor from the system?")
    )
      return;

    try {
      const res = await api.post("/api/admin/users/delete", { userId });
      if (res.status === 200) {
        alert(res.data.message);
      }
      setRefreshTrigger((prev) => prev + 1);
    } catch (error) {
      console.error("Deletion failed:", error);
      alert("Failed to delete doctor.");
    }
  };

  const filteredDoctors = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    if (!normalizedSearch) {
      return doctors;
    }

    return doctors.filter((doctor) => {
      return (
        doctor.name?.toLowerCase().includes(normalizedSearch) ||
        doctor.email?.toLowerCase().includes(normalizedSearch)
      );
    });
  }, [doctors, searchTerm]);

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center p-8 text-white">
        <div className="text-center animate-fade-in-up">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-purple-500/30 border-t-purple-500" />
          <p className="mt-4 text-sm font-medium text-gray-400">
            Loading doctors...
          </p>
        </div>
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <div className="p-4 sm:p-6 lg:p-8 w-full max-w-full">
        <div className="mb-6 animate-fade-in-up">
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-purple-400">
            Medical Staff
          </p>
          <h1 className="text-xl md:text-2xl font-bold text-white tracking-wide sm:text-3xl">
            Manage Doctors
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-400">
            Review and manage clinical professional accounts with platform
            access.
          </p>
        </div>
        <div
          className="mb-6 grid grid-cols-1 gap-3 rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm p-4 md:grid-cols-[1fr_auto] animate-fade-in-up"
          style={{ animationDelay: "80ms" }}
        >
          <div className="relative">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              placeholder="Search doctors by name or email..."
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              className="w-full rounded-lg border border-white/10 bg-[#120f26] pl-10 pr-4 py-2.5 text-sm text-white outline-none placeholder:text-gray-500 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-colors"
            />
          </div>

          <div className="flex items-center justify-center rounded-lg border border-white/10 bg-[#120f26] px-4 py-2.5 text-sm text-gray-400">
            {filteredDoctors.length} doctor
            {filteredDoctors.length === 1 ? "" : "s"}
          </div>
        </div>
        {/* Desktop styles applied to wrapper so the background isn't lost on large screens */}
        <div
          className="w-full md:bg-white/5 md:backdrop-blur-sm md:rounded-xl md:border md:border-white/10 md:shadow-2xl md:overflow-hidden animate-fade-in-up"
          style={{ animationDelay: "160ms" }}
        >
          <table className="w-full text-left border-collapse block md:table">
            {/* Desktop Header - Hidden on Mobile */}
            <thead className="hidden md:table-header-group bg-[#120f26]/80 text-gray-400 text-sm uppercase tracking-wider">
              <tr>
                <th className="p-5 font-semibold border-b border-white/10">
                  Name
                </th>
                <th className="p-5 font-semibold border-b border-white/10">
                  Email
                </th>
                <th className="p-5 font-semibold text-center border-b border-white/10">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="block md:table-row-group text-sm md:text-base">
              {filteredDoctors.length === 0 ? (
                <tr className="block md:table-row">
                  <td
                    colSpan={3}
                    className="p-8 md:p-10 text-center text-gray-500 block md:table-cell"
                  >
                    {searchTerm
                      ? "No doctors match your search."
                      : "No doctors found in the system."}
                  </td>
                </tr>
              ) : (
                filteredDoctors.map((user: any, idx: number) => (
                  <tr
                    key={user._id}
                    style={{ animationDelay: `${idx * 60}ms` }}
                    /* Mobile: Card layout with margin. Desktop: Transparent row background to let wrapper show through */
                    className="block md:table-row bg-white/5 md:bg-transparent border border-white/10 md:border-none rounded-xl md:rounded-none mb-4 md:mb-0 text-gray-200 hover:bg-white/10 transition-colors duration-200 overflow-hidden shadow-lg md:shadow-none animate-fade-in-up"
                  >
                    {/* Name */}
                    <td className="p-4 md:p-5 border-b border-white/10 md:border-none flex justify-between md:table-cell items-center">
                      <span className="md:hidden text-xs uppercase text-gray-400 font-bold">
                        Name
                      </span>
                      <span className="flex items-center gap-2 font-medium text-right md:text-left">
                        <Stethoscope className="hidden h-4 w-4 flex-none text-purple-400 md:inline" />
                        Dr. {user.name}
                      </span>
                    </td>

                    {/* Email */}
                    <td className="p-4 md:p-5 border-b border-white/10 md:border-none flex justify-between md:table-cell items-center">
                      <span className="md:hidden text-xs uppercase text-gray-400 font-bold">
                        Email
                      </span>
                      <span className="text-gray-400 text-right md:text-left">
                        {user.email}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="p-4 md:p-5 flex justify-between md:table-cell items-center text-center bg-white/[0.03] md:bg-transparent">
                      <span className="md:hidden text-xs uppercase text-gray-400 font-bold">
                        Actions
                      </span>
                      <button
                        onClick={() => handleDelete(user._id)}
                        className="flex items-center gap-1.5 bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white px-4 py-2 rounded-lg text-sm font-bold transition-all duration-300 shadow-[0_0_10px_rgba(239,68,68,0.0)] hover:shadow-[0_0_15px_rgba(239,68,68,0.4)] hover:-translate-y-0.5 cursor-pointer border-0 ml-auto md:ml-0 md:mx-auto"
                      >
                        <ShieldOff className="h-3.5 w-3.5" />
                        Revoke Access
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
