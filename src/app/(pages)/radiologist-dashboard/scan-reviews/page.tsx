"use client";

import { useEffect, useState } from "react";
import api from "@/src/lib/axios";
import ProtectedRoute from "@/src/components/ProtectedRoute";
import { useAuthStore } from "@/src/lib/store/useAuthStore";
import Image from "next/image";
import { generateSavedScanReportPDF } from "@/src/lib/utils/pdfGenerator";

type ReviewStatus =
  | "pending"
  | "confirmed"
  | "needs_recheck"
  | "incorrect"
  | "unclear";

interface PatientUser {
  _id: string;
  name: string;
  email: string;
  age?: number;
}

interface ScanResult {
  _id: string;
  user: PatientUser | null;
  originalImage: string;
  imageData: string;
  className: string;
  confidence: number;
  tumorDetected: boolean;
  comment?: string | null;

  radiologistReviewStatus?: ReviewStatus;
  radiologistComment?: string | null;
  radiologistRecommendation?: string | null;
  reviewedAt?: string | null;
  createdAt: string;

  reportFindings?: string;
  reportConclusion?: string;
  reportRecommendation?: string;
  reportConfidenceInterpretation?: string;
}

const statusOptions: { value: ReviewStatus; label: string }[] = [
  { value: "pending", label: "Pending Review" },
  { value: "confirmed", label: "Confirmed / Approved" },
  { value: "needs_recheck", label: "Needs Recheck" },
  { value: "incorrect", label: "AI Prediction Incorrect" },
  { value: "unclear", label: "Image Not Clear" },
];

const recommendationOptions = [
  "Consult a doctor for clinical confirmation.",
  "Upload a clearer MRI scan for better verification.",
  "AI result appears consistent, but medical consultation is advised.",
  "Prediction requires further radiologist or specialist review.",
  "No urgent abnormality is visible in the provided scan.",
];

function getStatusBadge(status?: ReviewStatus) {
  const current = status || "pending";

  if (current === "confirmed") {
    return "bg-emerald-500/15 text-emerald-300 border-emerald-500/30";
  }

  if (current === "needs_recheck") {
    return "bg-amber-500/15 text-amber-300 border-amber-500/30";
  }

  if (current === "incorrect") {
    return "bg-red-500/15 text-red-300 border-red-500/30";
  }

  if (current === "unclear") {
    return "bg-orange-500/15 text-orange-300 border-orange-500/30";
  }

  return "bg-blue-500/15 text-blue-300 border-blue-500/30";
}

function getStatusLabel(status?: ReviewStatus) {
  const found = statusOptions.find((item) => item.value === status);
  return found?.label || "Pending Review";
}

export default function PendingScanReviewsPage() {
  const { user } = useAuthStore();

  const [scans, setScans] = useState<ScanResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchPendingScans = async () => {
      try {
        const res = await api.get("/api/radiologist/scans?status=pending");

        if (isMounted && res.data.success) {
          setScans(res.data.data);
        }
      } catch (error) {
        console.error("Failed to fetch pending scan reviews:", error);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchPendingScans();

    return () => {
      isMounted = false;
    };
  }, []);

  const updateLocalScan = (
    scanId: string,
    field: keyof ScanResult,
    value: any,
  ) => {
    setScans((prev) =>
      prev.map((scan) =>
        scan._id === scanId
          ? {
              ...scan,
              [field]: value,
            }
          : scan,
      ),
    );
  };

  const handleSaveReview = async (scan: ScanResult) => {
    try {
      setSavingId(scan._id);

      const res = await api.put("/api/radiologist/scans", {
        scanId: scan._id,
        radiologistReviewStatus: scan.radiologistReviewStatus || "pending",
        radiologistComment: scan.radiologistComment || "",
        radiologistRecommendation: scan.radiologistRecommendation || "",
        reviewedBy: user?.id,
      });

      if (res.data.success) {
        setScans((prev) => prev.filter((item) => item._id !== scan._id));
        alert("Radiologist review saved successfully.");
      }
    } catch (error) {
      console.error("Failed to save radiologist review:", error);
      alert("Failed to save review. Please try again.");
    } finally {
      setSavingId(null);
    }
  };

  const handleDownloadReport = async (scanToDownload: any) => {
    if (!scanToDownload) return;
    try {
      setDownloadingId(scanToDownload._id);
      
      const patientName = typeof scanToDownload.user === 'object' && scanToDownload.user !== null 
          ? scanToDownload.user.name 
          : "Patient";
      
      await generateSavedScanReportPDF({
        scan: scanToDownload, 
        patientName
      });
    } catch (error) {
      console.error("Failed to generate PDF:", error);
      alert("An error occurred while downloading the report.");
    } finally {
      setDownloadingId(null);
    }
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="flex h-64 items-center justify-center text-white">
          <span className="text-lg font-medium animate-pulse">
            Loading pending MRI reviews...
          </span>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="p-6">
        <div className="mb-8 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white tracking-wide">
              Pending MRI Scan Reviews
            </h1>

            <p className="text-gray-400 mt-2 text-sm">
              Verify AI-generated tumor detection results and add professional
              radiology notes for patients.
            </p>
          </div>

          <div className="rounded-xl border border-purple-500/30 bg-purple-600/10 px-5 py-3 text-sm text-purple-200">
            Pending Reviews:{" "}
            <span className="font-bold text-white">{scans.length}</span>
          </div>
        </div>

        {scans.length === 0 ? (
          <div className="rounded-2xl border border-gray-800 bg-[#1a163a] p-10 text-center shadow-xl">
            <div className="text-4xl mb-4">✅</div>
            <h2 className="text-xl font-bold text-white">
              No pending scans right now
            </h2>
            <p className="mt-2 text-sm text-gray-400">
              All AI scan results have been reviewed by the radiology team.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 2xl:grid-cols-2 gap-6">
            {scans.map((scan) => {
              const status = scan.radiologistReviewStatus || "pending";
              const isCurrentlyDownloading = downloadingId === scan._id;

              return (
                <div
                  key={scan._id}
                  className="rounded-2xl border border-gray-800 bg-[#1a163a] shadow-xl overflow-hidden"
                >
                  {/* Header */}
                  <div className="border-b border-gray-800 p-5 flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
                    <div>
                      <h2 className="text-xl font-bold text-white">
                        {scan.user?.name || "Unknown Patient"}
                      </h2>

                      <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-400">
                        <span>Email: {scan.user?.email || "N/A"}</span>
                        <span>Age: {scan.user?.age || "N/A"}</span>
                        <span>
                          Scan Date:{" "}
                          {new Date(scan.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-2">
                        <span
                          className={`w-fit rounded-full border px-3 py-1 text-xs font-bold ${getStatusBadge(
                            status,
                          )}`}
                        >
                          {getStatusLabel(status)}
                        </span>

                        {/* --- NEW DOWNLOAD BUTTON --- */}
                        <button
                          onClick={() => handleDownloadReport(scan)}
                          disabled={isCurrentlyDownloading}
                          className="w-full sm:w-auto mt-2 rounded-lg bg-emerald-600/20 border border-emerald-500/50 px-3 py-1.5 text-xs font-bold text-emerald-400 hover:bg-emerald-600/40 transition-colors disabled:opacity-70 flex items-center justify-center gap-1"
                        >
                          {isCurrentlyDownloading ? "⏳ Generating..." : "📥 Download Report"}
                        </button>
                    </div>
                  </div>

                  {/* Images */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 p-5">
                    <div className="rounded-xl border border-gray-800 bg-black/30 p-3">
                      <div className="mb-3 flex items-center justify-between">
                        <h3 className="text-sm font-bold text-blue-300">
                          Original MRI
                        </h3>
                        <span className="text-xs text-gray-500">
                          Patient Upload
                        </span>
                      </div>
                      <div className="relative h-72 rounded-lg bg-black overflow-hidden">
                        <Image
                          src={scan.originalImage}
                          alt="Original MRI"
                          fill
                          unoptimized
                          sizes="(max-width: 1024px) 100vw, 50vw"
                          className="object-contain"
                        />
                      </div>
                    </div>

                    <div className="rounded-xl border border-purple-500/20 bg-black/30 p-3">
                      <div className="mb-3 flex items-center justify-between">
                        <h3 className="text-sm font-bold text-purple-300">
                          AI Predicted Output
                        </h3>
                        <span className="text-xs text-gray-500">
                          YOLO11s-seg Result
                        </span>
                      </div>

                      <div className="relative h-72 rounded-lg bg-black overflow-hidden">
                        <Image
                          src={scan.imageData}
                          alt="AI predicted MRI output"
                          fill
                          unoptimized
                          sizes="(max-width: 1024px) 100vw, 50vw"
                          className="object-contain"
                        />
                      </div>
                    </div>
                  </div>

                  {/* AI Details */}
                  <div className="mx-5 mb-5 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="rounded-xl border border-gray-800 bg-black/20 p-4">
                      <p className="text-xs uppercase tracking-wider text-gray-500">
                        AI Classification
                      </p>
                      <p className="mt-2 text-lg font-bold text-purple-300">
                        {scan.className}
                      </p>
                    </div>

                    <div className="rounded-xl border border-gray-800 bg-black/20 p-4">
                      <p className="text-xs uppercase tracking-wider text-gray-500">
                        AI Confidence
                      </p>
                      <p className="mt-2 text-lg font-bold text-blue-300">
                        {scan.confidence?.toFixed
                          ? scan.confidence.toFixed(2)
                          : scan.confidence}
                        %
                      </p>
                    </div>

                    <div className="rounded-xl border border-gray-800 bg-black/20 p-4">
                      <p className="text-xs uppercase tracking-wider text-gray-500">
                        Tumor Detected
                      </p>
                      <p
                        className={`mt-2 text-lg font-bold ${
                          scan.tumorDetected
                            ? "text-red-300"
                            : "text-emerald-300"
                        }`}
                      >
                        {scan.tumorDetected ? "Yes" : "No"}
                      </p>
                    </div>
                  </div>

                  {/* Existing Doctor Comment */}
                  {scan.comment && (
                    <div className="mx-5 mb-5 rounded-xl border border-blue-500/20 bg-blue-500/10 p-4">
                      <p className="text-xs uppercase tracking-wider text-blue-300">
                        Doctor Comment
                      </p>
                      <p className="mt-2 text-sm leading-6 text-gray-200">
                        {scan.comment}
                      </p>
                    </div>
                  )}

                  {/* Radiologist Review Form */}
                  <div className="border-t border-gray-800 p-5">
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                      <div>
                        <label className="mb-2 block text-sm font-semibold text-gray-300">
                          Verification Status
                        </label>

                        <select
                          value={status}
                          onChange={(e) =>
                            updateLocalScan(
                              scan._id,
                              "radiologistReviewStatus",
                              e.target.value as ReviewStatus,
                            )
                          }
                          className="w-full rounded-xl border border-gray-700 bg-[#060b30] px-4 py-3 text-sm text-white outline-none focus:border-purple-500"
                        >
                          {statusOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="mb-2 block text-sm font-semibold text-gray-300">
                          Quick Recommendation
                        </label>

                        <select
                          value={scan.radiologistRecommendation || ""}
                          onChange={(e) =>
                            updateLocalScan(
                              scan._id,
                              "radiologistRecommendation",
                              e.target.value,
                            )
                          }
                          className="w-full rounded-xl border border-gray-700 bg-[#060b30] px-4 py-3 text-sm text-white outline-none focus:border-purple-500"
                        >
                          <option value="">Select recommendation</option>
                          {recommendationOptions.map((option) => (
                            <option key={option} value={option}>
                              {option}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="mt-4">
                      <label className="mb-2 block text-sm font-semibold text-gray-300">
                        Professional Radiologist Note
                      </label>

                      <textarea
                        value={scan.radiologistComment || ""}
                        onChange={(e) =>
                          updateLocalScan(
                            scan._id,
                            "radiologistComment",
                            e.target.value,
                          )
                        }
                        rows={4}
                        placeholder="Example: AI prediction reviewed. The highlighted region appears consistent with the abnormal area. Clinical correlation is recommended."
                        className="w-full resize-none rounded-xl border border-gray-700 bg-[#060b30] px-4 py-3 text-sm leading-6 text-white outline-none focus:border-purple-500"
                      />
                    </div>

                    <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <p className="text-xs text-gray-500">
                        This note will be visible only to the patient who
                        uploaded this MRI scan.
                      </p>

                      <button
                        onClick={() => handleSaveReview(scan)}
                        disabled={savingId === scan._id}
                        className="rounded-xl border-0 bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-3 text-sm font-bold text-white shadow-[0_0_20px_rgba(168,85,247,0.35)] transition-all hover:from-blue-500 hover:to-purple-500 disabled:opacity-60"
                      >
                        {savingId === scan._id
                          ? "Saving Review..."
                          : "Save Review"}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}