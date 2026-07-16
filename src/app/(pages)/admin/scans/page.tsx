"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import api from "@/src/lib/axios";
import ProtectedRoute from "@/src/components/ProtectedRoute";
import { Search, X, Eye, Trash2 } from "lucide-react";

type RadiologistReviewStatus =
  | "pending"
  | "confirmed"
  | "needs_recheck"
  | "incorrect"
  | "unclear";

interface ScanUser {
  _id: string;
  name: string;
  email?: string;
  role?: string;
}

interface ScanResult {
  _id: string;
  user: ScanUser | string;
  originalImage: string;
  imageData: string;
  className: string;
  confidence: number;
  tumorDetected: boolean;
  createdAt: string;
  updatedAt?: string;

  comment?: string | null;
  doctorCommentedBy?: ScanUser | string | null;
  doctorCommentedAt?: string | null;

  radiologistReviewStatus?: RadiologistReviewStatus;
  radiologistComment?: string | null;
  radiologistRecommendation?: string | null;
  reviewedBy?: ScanUser | string | null;
  reviewedAt?: string | null;
}

const getPersonName = (
  person?: ScanUser | string | null,
  fallback = "Not available",
) => {
  if (typeof person === "object" && person !== null) {
    return person.name;
  }

  return fallback;
};

const getPatientName = (user: ScanUser | string) => {
  if (typeof user === "object" && user !== null) {
    return user.name;
  }

  return "Unknown Patient";
};

const getRadiologistStatusLabel = (
  status?: RadiologistReviewStatus,
) => {
  if (status === "confirmed") return "Confirmed / Approved";
  if (status === "needs_recheck") return "Needs Recheck";
  if (status === "incorrect") return "AI Prediction Incorrect";
  if (status === "unclear") return "Image Unclear";
  return "Pending Review";
};

const getRadiologistStatusClasses = (
  status?: RadiologistReviewStatus,
) => {
  if (status === "confirmed") {
    return "border-emerald-500/30 bg-emerald-900/20 text-emerald-400";
  }

  if (status === "needs_recheck") {
    return "border-amber-500/30 bg-amber-900/20 text-amber-400";
  }

  if (status === "incorrect") {
    return "border-red-500/30 bg-red-900/20 text-red-400";
  }

  if (status === "unclear") {
    return "border-orange-500/30 bg-orange-900/20 text-orange-400";
  }

  return "border-purple-500/30 bg-purple-900/20 text-purple-400";
};

export default function ManageScans() {
  const [scans, setScans] = useState<ScanResult[]>([]);
  const [selectedScan, setSelectedScan] = useState<ScanResult | null>(null);

  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | RadiologistReviewStatus
  >("all");

  useEffect(() => {
    let isMounted = true;

    const fetchScans = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await api.get("/api/admin/scans");

        if (isMounted) {
          setScans(
            Array.isArray(response.data)
              ? response.data
              : response.data.data || [],
          );
        }
      } catch (err) {
        console.error("Error loading scans:", err);

        if (isMounted) {
          setError("Failed to load system scan records.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchScans();

    return () => {
      isMounted = false;
    };
  }, []);

  const filteredScans = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return scans.filter((scan) => {
      const patientName = getPatientName(scan.user).toLowerCase();
      const doctorName = getPersonName(
        scan.doctorCommentedBy,
        "",
      ).toLowerCase();
      const radiologistName = getPersonName(
        scan.reviewedBy,
        "",
      ).toLowerCase();

      const matchesSearch =
        !normalizedSearch ||
        patientName.includes(normalizedSearch) ||
        scan.className.toLowerCase().includes(normalizedSearch) ||
        doctorName.includes(normalizedSearch) ||
        radiologistName.includes(normalizedSearch);

      const effectiveStatus =
        scan.radiologistReviewStatus || "pending";

      const matchesStatus =
        statusFilter === "all" || effectiveStatus === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [scans, searchTerm, statusFilter]);

  const handleDelete = async (scanId: string) => {
    const shouldDelete = window.confirm(
      "Are you sure you want to permanently delete this scan record?",
    );

    if (!shouldDelete) return;

    const previousScans = scans;

    setDeletingId(scanId);
    setScans((currentScans) =>
      currentScans.filter((scan) => scan._id !== scanId),
    );

    if (selectedScan?._id === scanId) {
      setSelectedScan(null);
    }

    try {
      await api.post("/api/admin/scans/delete", { scanId });
    } catch (err) {
      console.error("Deletion failed:", err);

      setScans(previousScans);
      alert("Failed to delete the scan record.");
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="flex min-h-[50vh] items-center justify-center text-white p-4 sm:p-6 lg:p-8">
          <div className="text-center animate-fade-in-up">
            <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-purple-500/30 border-t-purple-500" />

            <p className="mt-4 text-sm text-gray-400">
              Loading scan logs...
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
        <div className="mb-6 animate-fade-in-up">
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-purple-400">
            Scan Administration
          </p>

          <h1 className="text-2xl font-bold tracking-wide text-white sm:text-3xl bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-400 to-blue-400 animate-gradient-x">
            System Scan Logs
          </h1>

          <p className="mt-2 max-w-3xl text-sm leading-6 text-gray-400">
            Monitor AI scan results, physician observations, radiologist
            verification, and review accountability across the platform.
          </p>
        </div>

        {/* Controls */}
        <div
          className="mb-6 grid grid-cols-1 gap-3 rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm p-4 md:grid-cols-[1fr_230px_auto] animate-fade-in-up"
          style={{ animationDelay: "80ms" }}
        >
          <div className="relative">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              placeholder="Search patient, diagnosis, doctor, or radiologist..."
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              className="w-full rounded-lg border border-white/10 bg-[#120f26] pl-10 pr-4 py-2.5 text-sm text-white outline-none placeholder:text-gray-500 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-colors"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(
                event.target.value as
                  | "all"
                  | RadiologistReviewStatus,
              )
            }
            className="rounded-lg border border-white/10 bg-[#120f26] px-4 py-2.5 text-sm text-gray-200 outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 cursor-pointer transition-colors"
          >
            <option value="all">All review statuses</option>
            <option value="pending">Pending review</option>
            <option value="confirmed">Confirmed</option>
            <option value="needs_recheck">Needs recheck</option>
            <option value="incorrect">AI incorrect</option>
            <option value="unclear">Image unclear</option>
          </select>

          <div className="flex items-center justify-center rounded-lg border border-white/10 bg-[#120f26] px-4 py-2.5 text-sm text-gray-400">
            {filteredScans.length} record
            {filteredScans.length === 1 ? "" : "s"}
          </div>
        </div>

        {error && (
          <div className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 backdrop-blur-sm p-4 text-sm text-red-300 animate-fade-in-up">
            {error}
          </div>
        )}

        {/* Desktop table */}
        <div
          className="hidden overflow-hidden rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm shadow-xl lg:block animate-fade-in-up"
          style={{ animationDelay: "160ms" }}
        >
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead className="bg-[#120f26]/80 text-xs uppercase tracking-wider text-gray-400">
                <tr>
                  <th className="p-4 font-semibold">Scan</th>
                  <th className="p-4 font-semibold">Patient</th>
                  <th className="p-4 font-semibold">AI Result</th>
                  <th className="p-4 font-semibold">Doctor</th>
                  <th className="p-4 font-semibold">Radiology</th>
                  <th className="p-4 font-semibold">Date</th>
                  <th className="p-4 text-center font-semibold">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-white/10">
                {filteredScans.map((scan) => (
                  <tr
                    key={scan._id}
                    className="text-sm text-gray-200 transition-colors hover:bg-white/5"
                  >
                    <td className="p-4">
                      <div className="relative h-20 w-20 overflow-hidden rounded-lg border border-white/10 bg-black">
                        <Image
                          src={
                            scan.imageData ||
                            scan.originalImage ||
                            "/logo-mark.png"
                          }
                          alt={`${scan.className} MRI scan`}
                          fill
                          unoptimized
                          sizes="80px"
                          className="object-contain"
                        />
                      </div>
                    </td>

                    <td className="p-4">
                      <p className="max-w-[160px] truncate font-semibold text-blue-300">
                        {getPatientName(scan.user)}
                      </p>
                    </td>

                    <td className="p-4">
                      <p
                        className={`font-bold ${
                          scan.tumorDetected
                            ? "text-red-400"
                            : "text-emerald-400"
                        }`}
                      >
                        {scan.className}
                      </p>

                      <p className="mt-1 text-xs text-gray-500">
                        {scan.confidence.toFixed(1)}% confidence
                      </p>
                    </td>

                    <td className="p-4">
                      {scan.comment ? (
                        <>
                          <span className="inline-flex rounded border border-blue-500/30 bg-blue-900/20 px-2 py-1 text-[10px] font-bold uppercase text-blue-400">
                            Reviewed
                          </span>

                          <p className="mt-2 max-w-[150px] truncate text-xs text-gray-400">
                            Dr.{" "}
                            {getPersonName(
                              scan.doctorCommentedBy,
                              "Unknown",
                            )}
                          </p>
                        </>
                      ) : (
                        <span className="text-xs italic text-gray-500">
                          No comment
                        </span>
                      )}
                    </td>

                    <td className="p-4">
                      <span
                        className={`inline-flex rounded border px-2 py-1 text-[10px] font-bold uppercase ${getRadiologistStatusClasses(
                          scan.radiologistReviewStatus,
                        )}`}
                      >
                        {getRadiologistStatusLabel(
                          scan.radiologistReviewStatus,
                        )}
                      </span>

                      {getPersonName(scan.reviewedBy, "") && (
                        <p className="mt-2 max-w-[160px] truncate text-xs text-gray-400">
                          {getPersonName(scan.reviewedBy, "")}
                        </p>
                      )}
                    </td>

                    <td className="p-4 text-sm text-gray-400">
                      {new Date(scan.createdAt).toLocaleDateString(
                        "en-US",
                        {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        },
                      )}
                    </td>

                    <td className="p-4">
                      <div className="flex justify-center gap-2">
                        <button
                          type="button"
                          onClick={() => setSelectedScan(scan)}
                          className="flex items-center gap-1.5 rounded-lg border border-purple-500/30 bg-purple-900/20 px-3 py-2 text-xs font-bold text-purple-300 transition-all duration-300 hover:bg-purple-600 hover:text-white hover:-translate-y-0.5"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          View
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDelete(scan._id)}
                          disabled={deletingId === scan._id}
                          className="flex items-center gap-1.5 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs font-bold text-red-400 transition-all duration-300 hover:bg-red-500 hover:text-white hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50 disabled:translate-y-0"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          {deletingId === scan._id
                            ? "Deleting..."
                            : "Delete"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Mobile and tablet cards */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:hidden">
          {filteredScans.map((scan, idx) => (
            <div
              key={scan._id}
              style={{ animationDelay: `${idx * 60}ms` }}
              className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm p-4 shadow-xl transition-all duration-300 hover:-translate-y-1 hover:border-white/20 animate-fade-in-up"
            >
              <div className="flex gap-4">
                <div className="relative h-24 w-24 flex-none overflow-hidden rounded-lg border border-white/10 bg-black">
                  <Image
                    src={
                      scan.imageData ||
                      scan.originalImage ||
                      "/logo-mark.png"
                    }
                    alt={`${scan.className} MRI scan`}
                    fill
                    unoptimized
                    sizes="96px"
                    className="object-contain"
                  />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="truncate font-bold text-blue-300">
                    {getPatientName(scan.user)}
                  </p>

                  <p
                    className={`mt-2 font-bold ${
                      scan.tumorDetected
                        ? "text-red-400"
                        : "text-emerald-400"
                    }`}
                  >
                    {scan.className}
                  </p>

                  <p className="mt-1 text-xs text-gray-500">
                    {scan.confidence.toFixed(1)}% confidence
                  </p>

                  <p className="mt-2 text-xs text-gray-500">
                    {new Date(scan.createdAt).toLocaleDateString(
                      "en-US",
                      {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      },
                    )}
                  </p>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-2">
                <div className="rounded-lg border border-blue-500/20 bg-blue-900/10 p-2.5">
                  <p className="text-[9px] font-bold uppercase text-blue-400">
                    Doctor
                  </p>

                  <p className="mt-1 truncate text-xs text-gray-300">
                    {scan.comment
                      ? `Dr. ${getPersonName(
                          scan.doctorCommentedBy,
                          "Unknown",
                        )}`
                      : "Pending"}
                  </p>
                </div>

                <div className="rounded-lg border border-purple-500/20 bg-purple-900/10 p-2.5">
                  <p className="text-[9px] font-bold uppercase text-purple-400">
                    Radiology
                  </p>

                  <p className="mt-1 truncate text-xs text-gray-300">
                    {getRadiologistStatusLabel(
                      scan.radiologistReviewStatus,
                    )}
                  </p>
                </div>
              </div>

              <div className="mt-4 flex gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedScan(scan)}
                  className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 px-3 py-2.5 text-xs font-bold text-white transition-all duration-300 hover:from-blue-500 hover:to-purple-500 hover:-translate-y-0.5 shadow-[0_0_15px_rgba(37,99,235,0.3)]"
                >
                  <Eye className="h-3.5 w-3.5" />
                  View Details
                </button>

                <button
                  type="button"
                  onClick={() => handleDelete(scan._id)}
                  disabled={deletingId === scan._id}
                  className="flex items-center justify-center gap-1.5 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-2.5 text-xs font-bold text-red-400 transition-all duration-300 hover:bg-red-500 hover:text-white disabled:opacity-50"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>

        {filteredScans.length === 0 && (
          <div className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm p-10 text-center text-sm text-gray-500 animate-fade-in-up">
            No scans match the current search or review filter.
          </div>
        )}
      </div>

      {/* Full details modal */}
      {selectedScan && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 px-4 py-6 backdrop-blur-sm animate-in">
          <div className="max-h-[90vh] w-full max-w-6xl overflow-y-auto rounded-2xl border border-white/10 bg-[#121726] shadow-2xl">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-white/10 bg-[#121726]/95 px-5 py-4 backdrop-blur">
              <div>
                <h2 className="text-xl font-bold text-white">
                  Administrative Scan Review
                </h2>

                <p className="mt-1 text-xs text-gray-400">
                  Patient: {getPatientName(selectedScan.user)}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedScan(null)}
                className="rounded-lg border border-white/10 bg-white/5 p-2 text-gray-300 transition-colors hover:bg-white/10 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="p-5">
              <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
                <div className="rounded-xl border border-white/10 bg-black/30 p-3">
                  <p className="mb-3 text-sm font-bold text-blue-300">
                    Original MRI
                  </p>

                  <div className="relative h-[320px] overflow-hidden rounded-lg bg-black">
                    <Image
                      src={selectedScan.originalImage}
                      alt="Original MRI"
                      fill
                      unoptimized
                      sizes="(max-width: 1024px) 100vw, 50vw"
                      className="object-contain"
                    />
                  </div>
                </div>

                <div className="rounded-xl border border-purple-500/20 bg-black/30 p-3">
                  <p className="mb-3 text-sm font-bold text-purple-300">
                    AI Predicted MRI
                  </p>

                  <div className="relative h-[320px] overflow-hidden rounded-lg bg-black">
                    <Image
                      src={selectedScan.imageData}
                      alt="AI predicted MRI"
                      fill
                      unoptimized
                      sizes="(max-width: 1024px) 100vw, 50vw"
                      className="object-contain"
                    />
                  </div>
                </div>
              </div>

              <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-4">
                <div className="rounded-xl border border-white/10 bg-black/20 p-4">
                  <p className="text-xs uppercase text-gray-500">
                    Patient
                  </p>
                  <p className="mt-2 font-bold text-blue-300">
                    {getPatientName(selectedScan.user)}
                  </p>
                </div>

                <div className="rounded-xl border border-white/10 bg-black/20 p-4">
                  <p className="text-xs uppercase text-gray-500">
                    Classification
                  </p>
                  <p
                    className={`mt-2 font-bold ${
                      selectedScan.tumorDetected
                        ? "text-red-400"
                        : "text-emerald-400"
                    }`}
                  >
                    {selectedScan.className}
                  </p>
                </div>

                <div className="rounded-xl border border-white/10 bg-black/20 p-4">
                  <p className="text-xs uppercase text-gray-500">
                    Confidence
                  </p>
                  <p className="mt-2 font-bold text-purple-300">
                    {selectedScan.confidence.toFixed(2)}%
                  </p>
                </div>

                <div className="rounded-xl border border-white/10 bg-black/20 p-4">
                  <p className="text-xs uppercase text-gray-500">
                    Scan Date
                  </p>
                  <p className="mt-2 font-bold text-gray-300">
                    {new Date(
                      selectedScan.createdAt,
                    ).toLocaleDateString("en-US", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </p>
                </div>
              </div>

              <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-2">
                {/* Doctor review */}
                <div className="rounded-xl border border-blue-500/20 bg-blue-900/10 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-xs font-bold uppercase tracking-wider text-blue-300">
                      Doctor Clinical Review
                    </p>

                    <span className="rounded border border-blue-500/30 bg-blue-900/20 px-2 py-1 text-[10px] font-bold uppercase text-blue-400">
                      {selectedScan.comment
                        ? "Reviewed"
                        : "Pending"}
                    </span>
                  </div>

                  {selectedScan.comment ? (
                    <>
                      <p className="mt-3 text-xs text-gray-400">
                        Dr.{" "}
                        {getPersonName(
                          selectedScan.doctorCommentedBy,
                          "Unknown Doctor",
                        )}
                      </p>

                      <div className="mt-3 rounded-lg border border-blue-500/10 bg-black/20 p-3">
                        <p className="text-[10px] font-bold uppercase text-gray-500">
                          Clinical Observation
                        </p>

                        <p className="mt-2 text-sm leading-6 text-gray-200">
                          {selectedScan.comment}
                        </p>
                      </div>

                      {selectedScan.doctorCommentedAt && (
                        <p className="mt-3 text-xs text-gray-500">
                          Added on{" "}
                          {new Date(
                            selectedScan.doctorCommentedAt,
                          ).toLocaleDateString("en-US", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </p>
                      )}
                    </>
                  ) : (
                    <p className="mt-3 text-sm italic text-gray-500">
                      No physician review has been added.
                    </p>
                  )}
                </div>

                {/* Radiologist review */}
                <div className="rounded-xl border border-purple-500/20 bg-purple-900/10 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-xs font-bold uppercase tracking-wider text-purple-300">
                      Radiologist Verification
                    </p>

                    <span
                      className={`rounded border px-2 py-1 text-[10px] font-bold uppercase ${getRadiologistStatusClasses(
                        selectedScan.radiologistReviewStatus,
                      )}`}
                    >
                      {getRadiologistStatusLabel(
                        selectedScan.radiologistReviewStatus,
                      )}
                    </span>
                  </div>

                  {selectedScan.radiologistReviewStatus &&
                  selectedScan.radiologistReviewStatus !== "pending" ? (
                    <>
                      <p className="mt-3 text-xs text-gray-400">
                        Reviewed by{" "}
                        <span className="font-semibold text-purple-200">
                          Radiologist{" "}
                          {getPersonName(
                            selectedScan.reviewedBy,
                            "Unknown",
                          )}
                        </span>
                      </p>

                      <div className="mt-3">
                        <p className="text-[10px] font-bold uppercase text-gray-500">
                          Radiologist Comment
                        </p>

                        <p className="mt-2 text-sm leading-6 text-gray-200">
                          {selectedScan.radiologistComment ||
                            "No radiologist comment added."}
                        </p>
                      </div>

                      <div className="mt-4 rounded-lg border border-white/10 bg-black/20 p-3">
                        <p className="text-[10px] font-bold uppercase text-gray-500">
                          Recommendation
                        </p>

                        <p className="mt-2 text-sm leading-6 text-gray-300">
                          {selectedScan.radiologistRecommendation ||
                            "No recommendation added."}
                        </p>
                      </div>

                      {selectedScan.reviewedAt && (
                        <p className="mt-3 text-xs text-gray-500">
                          Reviewed on{" "}
                          {new Date(
                            selectedScan.reviewedAt,
                          ).toLocaleDateString("en-US", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </p>
                      )}
                    </>
                  ) : (
                    <p className="mt-3 text-sm italic text-gray-500">
                      Awaiting radiologist verification.
                    </p>
                  )}
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedScan(null)}
                  className="rounded-lg border border-white/10 bg-white/5 px-5 py-2.5 text-sm font-bold text-gray-200 transition-colors hover:bg-white/10"
                >
                  Close
                </button>

                <button
                  type="button"
                  onClick={() => handleDelete(selectedScan._id)}
                  disabled={deletingId === selectedScan._id}
                  className="flex items-center gap-1.5 rounded-lg bg-red-600 px-5 py-2.5 text-sm font-bold text-white transition-all duration-300 hover:bg-red-500 hover:-translate-y-0.5 disabled:opacity-50 disabled:translate-y-0"
                >
                  <Trash2 className="h-4 w-4" />
                  {deletingId === selectedScan._id
                    ? "Deleting..."
                    : "Delete Record"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </ProtectedRoute>
  );
}