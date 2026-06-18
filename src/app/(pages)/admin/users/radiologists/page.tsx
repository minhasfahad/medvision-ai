"use client";

import { useEffect, useMemo, useState } from "react";
import api from "@/src/lib/axios";
import ProtectedRoute from "@/src/components/ProtectedRoute";

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

  useEffect(() => {
    let isMounted = true;

    const fetchRadiologists = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await api.get(
          "/api/admin/users/radiologists",
        );

        if (isMounted) {
          setRadiologists(
            Array.isArray(response.data)
              ? response.data
              : response.data.data || [],
          );
        }
      } catch (err) {
        console.error("Error loading radiologists:", err);

        if (isMounted) {
          setError("Failed to load radiologist accounts.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchRadiologists();

    return () => {
      isMounted = false;
    };
  }, []);

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
      await api.post("/api/admin/users/delete", {
        userId,
      });
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
        <div className="flex min-h-[50vh] items-center justify-center text-white">
          <div className="text-center">
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
        <div className="mb-6">
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-cyan-400">
            Medical Staff
          </p>

          <h1 className="text-2xl font-bold tracking-wide text-white sm:text-3xl">
            Manage Radiologists
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-400">
            Monitor radiologist accounts responsible for reviewing and
            validating AI-generated MRI scan results.
          </p>
        </div>

        {/* Search and count */}
        <div className="mb-6 grid grid-cols-1 gap-3 rounded-xl border border-gray-800 bg-[#1a163a] p-4 md:grid-cols-[1fr_auto]">
          <input
            type="text"
            placeholder="Search radiologists by name or email..."
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            className="w-full rounded-lg border border-gray-700 bg-[#120f26] px-4 py-2.5 text-sm text-white outline-none placeholder:text-gray-500 focus:border-cyan-500"
          />

          <div className="flex items-center justify-center rounded-lg border border-gray-700 bg-[#120f26] px-4 py-2.5 text-sm text-gray-400">
            {filteredRadiologists.length} radiologist
            {filteredRadiologists.length === 1 ? "" : "s"}
          </div>
        </div>

        {error && (
          <div className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
            {error}
          </div>
        )}

        {/* Desktop table */}
        <div className="hidden overflow-hidden rounded-xl border border-gray-800 bg-[#1a163a] shadow-2xl md:block">
          <table className="w-full border-collapse text-left">
            <thead className="bg-[#120f26] text-xs uppercase tracking-wider text-gray-400">
              <tr>
                <th className="p-5 font-semibold">Radiologist</th>
                <th className="p-5 font-semibold">Email</th>
                <th className="p-5 font-semibold">Age</th>
                <th className="p-5 font-semibold">Registered</th>
                <th className="p-5 text-center font-semibold">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-800">
              {filteredRadiologists.map((radiologist) => (
                <tr
                  key={radiologist._id}
                  className="text-sm text-gray-200 transition-colors hover:bg-[#201c45]"
                >
                  <td className="p-5">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 flex-none items-center justify-center rounded-full border border-cyan-500/30 bg-cyan-900/20 font-bold text-cyan-300">
                        {radiologist.name
                          .charAt(0)
                          .toUpperCase()}
                      </div>

                      <div className="min-w-0">
                        <p className="truncate font-semibold text-white">
                          {radiologist.name}
                        </p>

                        <span className="mt-1 inline-flex rounded border border-cyan-500/30 bg-cyan-900/20 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-cyan-400">
                          Radiologist
                        </span>
                      </div>
                    </div>
                  </td>

                  <td className="p-5 text-gray-400">
                    {radiologist.email}
                  </td>

                  <td className="p-5 text-gray-400">
                    {radiologist.age ?? "Not provided"}
                  </td>

                  <td className="p-5 text-gray-400">
                    {radiologist.createdAt
                      ? new Date(
                          radiologist.createdAt,
                        ).toLocaleDateString("en-US", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })
                      : "Not available"}
                  </td>

                  <td className="p-5 text-center">
                    <button
                      type="button"
                      onClick={() =>
                        handleDelete(radiologist._id)
                      }
                      disabled={deletingId === radiologist._id}
                      className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-2 text-xs font-bold text-red-400 transition-all hover:bg-red-500 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {deletingId === radiologist._id
                        ? "Revoking..."
                        : "Revoke Access"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile cards */}
        <div className="grid grid-cols-1 gap-4 md:hidden">
          {filteredRadiologists.map((radiologist) => (
            <div
              key={radiologist._id}
              className="rounded-xl border border-gray-800 bg-[#1a163a] p-4 shadow-xl"
            >
              <div className="flex items-start gap-3">
                <div className="flex h-11 w-11 flex-none items-center justify-center rounded-full border border-cyan-500/30 bg-cyan-900/20 font-bold text-cyan-300">
                  {radiologist.name.charAt(0).toUpperCase()}
                </div>

                <div className="min-w-0">
                  <p className="truncate font-bold text-white">
                    {radiologist.name}
                  </p>

                  <p className="mt-1 break-all text-xs text-gray-400">
                    {radiologist.email}
                  </p>

                  <span className="mt-2 inline-flex rounded border border-cyan-500/30 bg-cyan-900/20 px-2 py-1 text-[9px] font-bold uppercase tracking-wider text-cyan-400">
                    Radiologist
                  </span>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-2">
                <div className="rounded-lg border border-gray-800 bg-[#120f26] p-3">
                  <p className="text-[9px] font-bold uppercase text-gray-500">
                    Age
                  </p>
                  <p className="mt-1 text-xs text-gray-300">
                    {radiologist.age ?? "Not provided"}
                  </p>
                </div>

                <div className="rounded-lg border border-gray-800 bg-[#120f26] p-3">
                  <p className="text-[9px] font-bold uppercase text-gray-500">
                    Registered
                  </p>
                  <p className="mt-1 text-xs text-gray-300">
                    {radiologist.createdAt
                      ? new Date(
                          radiologist.createdAt,
                        ).toLocaleDateString("en-US", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })
                      : "Not available"}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleDelete(radiologist._id)}
                disabled={deletingId === radiologist._id}
                className="mt-4 w-full rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-2.5 text-xs font-bold text-red-400 transition-colors hover:bg-red-500 hover:text-white disabled:opacity-50"
              >
                {deletingId === radiologist._id
                  ? "Revoking..."
                  : "Revoke Access"}
              </button>
            </div>
          ))}
        </div>

        {filteredRadiologists.length === 0 && (
          <div className="rounded-xl border border-gray-800 bg-[#1a163a] p-10 text-center text-sm text-gray-500">
            {searchTerm
              ? "No radiologists match your search."
              : "No radiologist accounts are registered."}
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}