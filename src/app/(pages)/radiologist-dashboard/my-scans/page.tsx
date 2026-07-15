"use client";

import { useEffect, useState } from "react";
import api from "@/src/lib/axios";
import ProtectedRoute from "@/src/components/ProtectedRoute";
import { useAuthStore } from "@/src/lib/store/useAuthStore";
import Image from "next/image";
import { generateSavedScanReportPDF } from "@/src/lib/utils/pdfGenerator";
import { Brain, Download, Loader2, ScanLine, Calendar } from "lucide-react";
import Reveal from "@/src/components/Reveal";
import SpotlightCard from "@/src/components/SpotlightCard";

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
        <div className="flex h-64 items-center justify-center text-white gap-3">
          <Loader2 className="w-5 h-5 text-blue-400 animate-spin" />
          <span className="text-lg font-medium animate-pulse">
            Loading your personal MRI scans...
          </span>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="p-4 sm:p-6 lg:p-8 max-w-[1700px] mx-auto">
        <Reveal>
          <div className="mb-8 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white tracking-wide flex items-center gap-3">
                <span className="w-11 h-11 rounded-2xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center">
                  <ScanLine className="w-5 h-5 text-blue-400" />
                </span>
                My Scan Gallery
              </h1>

              <p className="text-gray-400 mt-2 text-sm max-w-xl">
                MRI scans uploaded and analyzed from your own radiologist
                account.
              </p>
            </div>

            <div className="rounded-xl border border-blue-500/30 bg-blue-600/10 backdrop-blur-sm px-5 py-3 text-sm text-blue-200">
              My Scans:{" "}
              <span className="font-bold text-white">{scans.length}</span>
            </div>
          </div>
        </Reveal>

        {scans.length === 0 ? (
          <Reveal>
            <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-10 text-center shadow-xl">
              <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                <Brain className="w-6 h-6 text-blue-400" />
              </div>

              <h2 className="text-xl font-bold text-white">
                No personal scans found
              </h2>

              <p className="mt-2 text-sm text-gray-400">
                When you scan an MRI using your radiologist account, it will
                appear here.
              </p>
            </div>
          </Reveal>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {scans.map((scan, index) => {
              const status = scan.radiologistReviewStatus || "pending";
              const isCurrentlyDownloading = isDownloading === scan._id;

              return (
                <Reveal key={scan._id} delay={(index % 6) * 70} variant="zoom" fill>
                  <SpotlightCard
                    color="96,165,250"
                    className="h-full rounded-2xl border border-white/10 bg-[#12172a]/80 backdrop-blur-md shadow-xl hover:border-blue-500/30 transition-all duration-300"
                  >
                    <div className="flex flex-col h-full">
                      {/* Compare viewport with overlay labels */}
                      <div className="grid grid-cols-2 gap-px bg-white/10 rounded-t-2xl overflow-hidden">
                        <div className="relative h-56 sm:h-64 bg-black">
                          <span className="absolute top-2 left-2 z-10 rounded-full bg-black/70 border border-blue-500/30 px-2.5 py-1 text-[10px] font-bold text-blue-300 uppercase tracking-wider">
                            Original
                          </span>
                          <Image
                            src={scan.originalImage}
                            alt="Original MRI"
                            fill
                            unoptimized
                            sizes="(max-width: 1024px) 50vw, 25vw"
                            className="object-contain"
                          />
                        </div>

                        <div className="relative h-56 sm:h-64 bg-black">
                          <span className="absolute top-2 left-2 z-10 rounded-full bg-black/70 border border-purple-500/30 px-2.5 py-1 text-[10px] font-bold text-purple-300 uppercase tracking-wider">
                            AI Output
                          </span>
                          <Image
                            src={scan.imageData}
                            alt="AI predicted MRI output"
                            fill
                            unoptimized
                            sizes="(max-width: 1024px) 50vw, 25vw"
                            className="object-contain"
                          />
                        </div>
                      </div>

                      <div className="p-5 flex flex-col gap-4 flex-1">
                        {/* Meta bar */}
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center gap-2 text-xs text-gray-400">
                            <Calendar className="w-3.5 h-3.5 text-gray-500" />
                            <span>
                              {new Date(scan.createdAt).toLocaleDateString()} ·{" "}
                              {new Date(scan.createdAt).toLocaleTimeString()}
                            </span>
                          </div>

                          <span
                            className={`rounded-full border px-3 py-1 text-[11px] font-bold ${getStatusBadge(
                              status,
                            )}`}
                          >
                            {getStatusLabel(status)}
                          </span>
                        </div>

                        {/* Stat chips */}
                        <div className="flex flex-wrap gap-2">
                          <div className="flex-1 min-w-[110px] rounded-xl border border-white/10 bg-black/20 px-3 py-2.5">
                            <p className="text-[10px] uppercase tracking-wider text-gray-500">
                              Classification
                            </p>
                            <p className="mt-1 text-sm font-bold text-purple-300 truncate">
                              {scan.className}
                            </p>
                          </div>

                          <div className="flex-1 min-w-[110px] rounded-xl border border-white/10 bg-black/20 px-3 py-2.5">
                            <p className="text-[10px] uppercase tracking-wider text-gray-500">
                              Confidence
                            </p>
                            <p className="mt-1 text-sm font-bold text-blue-300">
                              {scan.confidence?.toFixed
                                ? scan.confidence.toFixed(2)
                                : scan.confidence}
                              %
                            </p>
                          </div>

                          <div className="flex-1 min-w-[110px] rounded-xl border border-white/10 bg-black/20 px-3 py-2.5">
                            <p className="text-[10px] uppercase tracking-wider text-gray-500">
                              Tumor
                            </p>
                            <p
                              className={`mt-1 text-sm font-bold ${
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
                          <div className="rounded-xl border border-blue-500/20 bg-blue-500/10 p-3.5">
                            <p className="text-[10px] uppercase tracking-wider text-blue-300">
                              Doctor Comment
                            </p>
                            <p className="mt-1.5 text-sm leading-6 text-gray-200">
                              {scan.comment}
                            </p>
                          </div>
                        )}

                        {/* Radiologist Review */}
                        <div className="rounded-xl border border-purple-500/20 bg-purple-500/10 p-3.5">
                          <p className="text-[10px] uppercase tracking-wider text-purple-300">
                            Radiologist Verification
                          </p>

                          <p className="mt-1.5 text-sm leading-6 text-gray-200">
                            {scan.radiologistComment ||
                              "This scan is still pending radiologist verification."}
                          </p>

                          <div className="mt-3 rounded-lg border border-white/10 bg-black/20 p-2.5">
                            <p className="text-[10px] uppercase tracking-wider text-gray-500">
                              Recommendation
                            </p>

                            <p className="mt-1 text-sm text-gray-200">
                              {scan.radiologistRecommendation ||
                                "No recommendation added yet."}
                            </p>
                          </div>
                        </div>

                        <button
                          onClick={() => handleDownloadReport(scan)}
                          disabled={isCurrentlyDownloading}
                          className="mt-auto w-full rounded-lg bg-emerald-600/20 border border-emerald-500/50 px-3 py-2 text-xs font-bold text-emerald-400 hover:bg-emerald-600/40 hover:-translate-y-0.5 transition-all disabled:opacity-70 flex items-center justify-center gap-1.5"
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
                  </SpotlightCard>
                </Reveal>
              );
            })}
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
