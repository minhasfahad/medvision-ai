"use client";

import { useEffect, useMemo, useState } from "react";
import api from "@/src/lib/axios";
import ProtectedRoute from "@/src/components/ProtectedRoute";
import Reveal from "@/src/components/Reveal";
import { Search, ShieldOff, Microscope, CalendarDays } from "lucide-react";

interface RadiologistUser {
  _id: string;
  name: string;
  email: string;
  age?: number;
  role: "radiologist";
  createdAt?: string;
}

export default function ManageRadiologists() {
  const [radiologists, setRadiologists] = useState<RadiologistUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    const fetchRadiologists = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await api.get("/api/admin/users/radiologists");

        setRadiologists(
          Array.isArray(response.data)
            ? response.data
            : response.data.data || [],
        );
      } catch (err) {
        console.error("Error loading radiologists:", err);
        setError("Failed to load radiologist accounts.");
      } finally {
        setLoading(false);
      }
    };

    fetchRadiologists();
  }, [refreshTrigger]);

  const filteredRadiologists = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    if (!normalizedSearch) {
      return radiologists;
    }

    return radiologists.filter((radiologist) => {
      return (
        radiologist.name.toLowerCase().includes(normalizedSearch) ||
        radiologist.email.toLowerCase().includes(normalizedSearch)
      );
    });
  }, [radiologists, searchTerm]);

  const handleDelete = async (userId: string) => {
    const shouldDelete = window.confirm(
      "Are you sure you want to revoke this radiologist's access?",
    );

    if (!shouldDelete) return;

    const previousRadiologists = radiologists;

    setDeletingId(userId);
    setRadiologists((current) =>
      current.filter((radiologist) => radiologist._id !== userId),
    );

    try {
      const res = await api.post("/api/admin/users/delete", {
        userId,
      });
      if (res.status === 200) {
        alert(res.data.message);
      }
      setRefreshTrigger((prev) => prev + 1);
    } catch (err) {
      console.error("Radiologist deletion failed:", err);

      setRadiologists(previousRadiologists);
      alert("Failed to delete radiologist account.");
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="flex min-h-[50vh] items-center justify-center text-white p-4 sm:p-6 lg:p-8">
          <div className="text-center animate-fade-in-up">
            <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-cyan-500/30 border-t-cyan-500" />

            <p className="mt-4 text-sm text-gray-400">
              Loading radiologists...
            </p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="w-full p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <Reveal>
          <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-cyan-400">
                Medical Staff
              </p>

              <h1 className="text-2xl font-bold tracking-wide text-white sm:text-3xl bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-blue-400 to-cyan-400 animate-gradient-x">
                Manage Radiologists
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-400">
                Monitor radiologist accounts responsible for reviewing and
                validating AI-generated MRI scan results.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-[#120f26]/85 backdrop-blur-sm px-6 py-3 text-center lg:w-auto">
              <p className="text-2xl font-extrabold text-cyan-300">
                {radiologists.length}
              </p>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-500">
                Registered Radiologists
              </p>
            </div>
          </div>
        </Reveal>

        {/* Search and count */}
        <Reveal delay={80}>
          <div className="mb-6 grid grid-cols-1 gap-3 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-4 md:grid-cols-[1fr_auto]">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
              <input
                type="text"
                placeholder="Search radiologists by name or email..."
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                className="w-full rounded-lg border border-white/10 bg-[#120f26] pl-10 pr-4 py-2.5 text-sm text-white outline-none placeholder:text-gray-500 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-colors"
              />
            </div>

            <div className="flex items-center justify-center rounded-lg border border-white/10 bg-[#120f26] px-4 py-2.5 text-sm text-gray-400">
              {filteredRadiologists.length} radiologist
              {filteredRadiologists.length === 1 ? "" : "s"}
            </div>
          </div>
        </Reveal>

        {error && (
          <div className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 backdrop-blur-sm p-4 text-sm text-red-300 animate-fade-in-up">
            {error}
          </div>
        )}

        {/* Radiologist list — unified div-based data grid (replaces separate table/card breakpoints) */}
        <div className="space-y-3">
          {filteredRadiologists.length === 0 ? (
            <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-10 text-center text-sm text-gray-500 animate-fade-in-up">
              {searchTerm
                ? "No radiologists match your search."
                : "No radiologist accounts are registered."}
            </div>
          ) : (
            <>
              {/* Column headers — desktop only */}
              <div className="hidden rounded-xl border border-white/10 bg-[#120f26]/80 px-2 text-xs font-semibold uppercase tracking-wider text-gray-400 lg:grid lg:grid-cols-[1.6fr_1.4fr_0.7fr_1fr_auto]">
                <div className="p-4">Radiologist</div>
                <div className="p-4">Email</div>
                <div className="p-4">Age</div>
                <div className="p-4">Registered</div>
                <div className="p-4 text-center">Actions</div>
              </div>

              {filteredRadiologists.map((radiologist, idx) => (
                <Reveal key={radiologist._id} delay={Math.min(idx * 50, 400)}>
                  <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#120f26]/85 backdrop-blur-sm shadow-lg transition-all duration-300 hover:-translate-y-0.5 hover:border-white/20 hover:bg-white/[0.07]">
                    <div className="flex flex-col gap-4 p-4 lg:grid lg:grid-cols-[1.6fr_1.4fr_0.7fr_1fr_auto] lg:items-center lg:gap-0 lg:p-0">
                      {/* Radiologist */}
                      <div className="flex items-center gap-3 lg:p-5">
                        <div className="flex h-11 w-11 flex-none items-center justify-center rounded-full border border-cyan-500/30 bg-cyan-900/20 font-bold text-cyan-300 transition-transform duration-300 hover:scale-110">
                          {radiologist.name.charAt(0).toUpperCase()}
                        </div>

                        <div className="min-w-0">
                          <p className="truncate font-semibold text-white">
                            {radiologist.name}
                          </p>

                          <span className="mt-1 inline-flex items-center gap-1 rounded border border-cyan-500/30 bg-cyan-900/20 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-cyan-400">
                            <Microscope className="h-2.5 w-2.5" />
                            Radiologist
                          </span>
                        </div>
                      </div>

                      {/* Email */}
                      <div className="flex items-center justify-between gap-3 border-t border-white/10 pt-3 text-sm text-gray-400 lg:border-t-0 lg:p-5 lg:pt-5">
                        <span className="text-xs font-bold uppercase text-gray-500 lg:hidden">
                          Email
                        </span>
                        <span className="truncate text-right lg:text-left">
                          {radiologist.email}
                        </span>
                      </div>

                      {/* Age */}
                      <div className="flex items-center justify-between gap-3 border-t border-white/10 pt-3 text-sm text-gray-400 lg:border-t-0 lg:p-5 lg:pt-5">
                        <span className="text-xs font-bold uppercase text-gray-500 lg:hidden">
                          Age
                        </span>
                        <span>{radiologist.age ?? "Not provided"}</span>
                      </div>

                      {/* Registered */}
                      <div className="flex items-center justify-between gap-3 border-t border-white/10 pt-3 text-sm text-gray-400 lg:border-t-0 lg:p-5 lg:pt-5">
                        <span className="flex items-center gap-1.5 text-xs font-bold uppercase text-gray-500 lg:hidden">
                          <CalendarDays className="h-3 w-3" />
                          Registered
                        </span>
                        <span>
                          {radiologist.createdAt
                            ? new Date(
                                radiologist.createdAt,
                              ).toLocaleDateString("en-US", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              })
                            : "Not available"}
                        </span>
                      </div>

                      {/* Actions */}
                      <div className="border-t border-white/10 pt-3 lg:border-t-0 lg:p-5 lg:pt-5">
                        <button
                          type="button"
                          onClick={() => handleDelete(radiologist._id)}
                          disabled={deletingId === radiologist._id}
                          className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-2 text-xs font-bold text-red-400 transition-all duration-300 hover:bg-red-500 hover:text-white hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50 disabled:translate-y-0 lg:w-auto"
                        >
                          <ShieldOff className="h-3.5 w-3.5" />
                          {deletingId === radiologist._id
                            ? "Revoking..."
                            : "Revoke Access"}
                        </button>
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
