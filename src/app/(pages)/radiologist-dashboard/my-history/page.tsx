"use client";

import { useEffect, useState } from "react";
import api from "@/src/lib/axios";
import ProtectedRoute from "@/src/components/ProtectedRoute";
import { useAuthStore } from "@/src/lib/store/useAuthStore";
import Image from "next/image";
import { generateSavedScanReportPDF } from "@/src/lib/utils/pdfGenerator";
import { FileText, Download, Loader2, History } from "lucide-react";

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

  reportFindings?: string;
  reportConclusion?: string;
  reportRecommendation?: string;
  reportConfidenceInterpretation?: string;

  createdAt: string;
}

function getStatusBadge(status?: ReviewStatus) {
  if (status === "confirmed") {
    return "bg-emerald-500/15 text-emerald-300 border-emerald-500/30";
  }

  if (status === "needs_recheck") {
    return "bg-amber-500/15 text-amber-300 border-amber-500/30";
  }

  if (status === "incorrect") {
    return "bg-red-500/15 text-red-300 border-red-500/30";
  }

  if (status === "unclear") {
    return "bg-orange-500/15 text-orange-300 border-orange-500/30";
  }

  return "bg-blue-500/15 text-blue-300 border-blue-500/30";
}

function getStatusLabel(status?: ReviewStatus) {
  if (status === "confirmed") return "Confirmed / Approved";
  if (status === "needs_recheck") return "Needs Recheck";
  if (status === "incorrect") return "AI Prediction Incorrect";
  if (status === "unclear") return "Image Not Clear";
  return "Pending Review";
}

export default function MyReviewHistoryPage() {
  const { user } = useAuthStore();

  const [scans, setScans] = useState<ScanResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDownloading, setIsDownloading] = useState<string | null>(null); // Changed to track WHICH scan is downloading

  useEffect(() => {
    if (!user?.id) return;

    let isMounted = true;

    const fetchMyReviewHistory = async () => {
      try {
        const res = await api.get(
          `/api/radiologist/scans?status=reviewed&reviewedBy=${user.id}`,
        );

        if (isMounted && res.data.success) {
          setScans(res.data.data);
        }
      } catch (error) {
        console.error("Failed to fetch my review history:", error);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchMyReviewHistory();

    return () => {
      isMounted = false;
    };
  }, [user?.id]);

  const handleDownloadReport = async (scanToDownload: any) => {
    if (!scanToDownload) return;
    try {
      setIsDownloading(scanToDownload._id);
      
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
      setIsDownloading(null);
    }
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="flex h-64 items-center justify-center text-white gap-3">
          <Loader2 className="w-5 h-5 text-blue-400 animate-spin" />
          <span className="text-lg font-medium animate-pulse">
            Loading your review history...
          </span>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="p-4 sm:p-6">
        <div className="mb-8 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between animate-fade-in-up">
          <div>
            <h1 className="text-3xl font-bold text-white tracking-wide flex items-center gap-3">
              <History className="w-7 h-7 text-purple-400" />
              My Review History
            </h1>

            <p className="text-gray-400 mt-2 text-sm">
              Scans personally reviewed and verified from your radiologist
              account.
            </p>
          </div>

          <div className="rounded-xl border border-purple-500/30 bg-purple-600/10 backdrop-blur-sm px-5 py-3 text-sm text-purple-200">
            My Reviews:{" "}
            <span className="font-bold text-white">{scans.length}</span>
          </div>
        </div>

        {scans.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-10 text-center shadow-xl animate-fade-in-up">
            <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
              <FileText className="w-6 h-6 text-purple-400" />
            </div>

            <h2 className="text-xl font-bold text-white">
              No review history yet
            </h2>

            <p className="mt-2 text-sm text-gray-400">
              Once you verify patient AI scans, your reviewed cases will appear
              here.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 2xl:grid-cols-2 gap-6">
            {scans.map((scan, index) => {
              const status = scan.radiologistReviewStatus || "pending";
              const isCurrentlyDownloading = isDownloading === scan._id;

              return (
                <div
                  key={scan._id}
                  className="rounded-2xl border border-white/10 bg-[#12172a]/80 backdrop-blur-md shadow-xl overflow-hidden hover:border-purple-500/30 transition-all duration-300 animate-fade-in-up"
                  style={{ animationDelay: `${index * 80}ms` }}
                >
                  <div className="border-b border-white/10 p-5 flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
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
                        <span>
                          Reviewed:{" "}
                          {scan.reviewedAt
                            ? new Date(scan.reviewedAt).toLocaleDateString()
                            : "N/A"}
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
                          className="w-full sm:w-auto mt-2 rounded-lg bg-emerald-600/20 border border-emerald-500/50 px-3 py-1.5 text-xs font-bold text-emerald-400 hover:bg-emerald-600/40 hover:-translate-y-0.5 transition-all disabled:opacity-70 flex items-center justify-center gap-1.5"
                        >
                          {isCurrentlyDownloading ? (
                            <>
                              <Loader2 className="w-3.5 h-3.5 animate-spin" /> Generating...
                            </>
                          ) : (
                            <>
                              <Download className="w-3.5 h-3.5" /> Download Report
                            </>
                          )}
                        </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 p-5">
                    <div className="rounded-xl border border-white/10 bg-black/30 p-3">
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

                  <div className="mx-5 mb-5 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="rounded-xl border border-white/10 bg-black/20 p-4">
                      <p className="text-xs uppercase tracking-wider text-gray-500">
                        AI Classification
                      </p>
                      <p className="mt-2 text-lg font-bold text-purple-300">
                        {scan.className}
                      </p>
                    </div>

                    <div className="rounded-xl border border-white/10 bg-black/20 p-4">
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

                    <div className="rounded-xl border border-white/10 bg-black/20 p-4">
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

                  <div className="mx-5 mb-5 rounded-xl border border-purple-500/20 bg-purple-500/10 p-4">
                    <p className="text-xs uppercase tracking-wider text-purple-300">
                      My Radiologist Note
                    </p>

                    <p className="mt-2 text-sm leading-6 text-gray-200">
                      {scan.radiologistComment || "No note added."}
                    </p>

                    <div className="mt-4 rounded-lg border border-white/10 bg-black/20 p-3">
                      <p className="text-xs uppercase tracking-wider text-gray-500">
                        My Recommendation
                      </p>

                      <p className="mt-1 text-sm text-gray-200">
                        {scan.radiologistRecommendation ||
                          "No recommendation added."}
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