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

interface ScanResult {
  _id: string;
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

  reportFindings?: string;
  reportConclusion?: string;
  reportRecommendation?: string;
  reportConfidenceInterpretation?: string;

  createdAt: string;
}

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
  if (status === "confirmed") return "Confirmed / Approved";
  if (status === "needs_recheck") return "Needs Recheck";
  if (status === "incorrect") return "AI Prediction Incorrect";
  if (status === "unclear") return "Image Not Clear";
  return "Pending Radiologist Review";
}

export default function RadiologistMyScansPage() {
  const { user } = useAuthStore();

  const [scans, setScans] = useState<ScanResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDownloading, setIsDownloading] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchMyScans = async () => {
      if (!user?.id) {
        setLoading(false);
        return;
      }

      try {
        const res = await api.get(
          `/api/results?userId=${user.id}&role=radiologist`
        );

        if (isMounted && res.data.success) {
          setScans(res.data.data);
        }
      } catch (error) {
        console.error("Failed to fetch radiologist personal scans:", error);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchMyScans();

    return () => {
      isMounted = false;
    };
  }, [user?.id]);

  const handleDownloadReport = async (scanToDownload: any) => {
    if (!scanToDownload) return;
    try {
      setIsDownloading(scanToDownload._id);
      
      // Since these are personal scans, the patient is the logged-in user
      const patientName = user?.name || "Patient";
      
      await generateSavedScanReportPDF({
        scan: scanToDownload, 
        patientName
      });
    } catch (error) {
      console.error("Failed to generate PDF:", error);
      alert("An error occurred while downloading the report.");
    } finally {
      setIsDownloading(null);
    }
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="flex h-64 items-center justify-center text-white">
          <span className="text-lg font-medium animate-pulse">
            Loading your personal MRI scans...
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
              My Personal MRI Scans
            </h1>

            <p className="text-gray-400 mt-2 text-sm">
              These are MRI scans uploaded and analyzed from your own
              radiologist account.
            </p>
          </div>

          <div className="rounded-xl border border-blue-500/30 bg-blue-600/10 px-5 py-3 text-sm text-blue-200">
            My Scans:{" "}
            <span className="font-bold text-white">{scans.length}</span>
          </div>
        </div>

        {scans.length === 0 ? (
          <div className="rounded-2xl border border-gray-800 bg-[#1a163a] p-10 text-center shadow-xl">
            <div className="text-4xl mb-4">🧠</div>

            <h2 className="text-xl font-bold text-white">
              No personal scans found
            </h2>

            <p className="mt-2 text-sm text-gray-400">
              When you scan an MRI using your radiologist account, it will
              appear here.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 2xl:grid-cols-2 gap-6">
            {scans.map((scan) => {
              const status = scan.radiologistReviewStatus || "pending";
              const isCurrentlyDownloading = isDownloading === scan._id;

              return (
                <div
                  key={scan._id}
                  className="rounded-2xl border border-gray-800 bg-[#1a163a] shadow-xl overflow-hidden"
                >
                  {/* Header */}
                  <div className="border-b border-gray-800 p-5 flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
                    <div>
                      <h2 className="text-xl font-bold text-white">
                        Personal Scan Result
                      </h2>

                      <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-400">
                        <span>
                          Scan Date:{" "}
                          {new Date(scan.createdAt).toLocaleDateString()}
                        </span>

                        <span>
                          Scan Time:{" "}
                          {new Date(scan.createdAt).toLocaleTimeString()}
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
                          Uploaded Image
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

                  {/* AI Result Details */}
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

                  {/* Doctor Comment */}
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

                  {/* Radiologist Review */}
                  <div className="mx-5 mb-5 rounded-xl border border-purple-500/20 bg-purple-500/10 p-4">
                    <p className="text-xs uppercase tracking-wider text-purple-300">
                      Radiologist Verification
                    </p>

                    <p className="mt-2 text-sm leading-6 text-gray-200">
                      {scan.radiologistComment ||
                        "This scan is still pending radiologist verification."}
                    </p>

                    <div className="mt-4 rounded-lg border border-gray-700 bg-black/20 p-3">
                      <p className="text-xs uppercase tracking-wider text-gray-500">
                        Recommendation
                      </p>

                      <p className="mt-1 text-sm text-gray-200">
                        {scan.radiologistRecommendation ||
                          "No recommendation added yet."}
                      </p>
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