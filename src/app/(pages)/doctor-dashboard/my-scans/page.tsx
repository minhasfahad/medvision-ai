"use client";

import Image from "next/image";
import React, { useState, useEffect } from "react";
import api from "@/src/lib/axios";
import { useAuthStore } from "@/src/lib/store/useAuthStore";
import Link from "next/link";
import ProtectedRoute from "@/src/components/ProtectedRoute";
import { generateSavedScanReportPDF } from "@/src/lib/utils/pdfGenerator";
import { X, Download, Loader2, Upload as UploadIcon, ImageOff } from "lucide-react";

type RadiologistReviewStatus =
  | "pending"
  | "confirmed"
  | "needs_recheck"
  | "incorrect"
  | "unclear";

interface ScanResult {
  _id: string;
  user: string;
  originalImage: string;
  imageData: string;
  className: string;
  confidence: number;
  tumorDetected: boolean;
  createdAt: string;
  updatedAt: string;

  // Doctor comment
  comment?: string | null;

  // Radiologist review
  radiologistReviewStatus?: RadiologistReviewStatus;
  radiologistComment?: string | null;
  radiologistRecommendation?: string | null;
  reviewedAt?: string | null;

  // AI Narrative Fields
  reportFindings?: string;
  reportConclusion?: string;
  reportRecommendation?: string;
  reportConfidenceInterpretation?: string;
}

const getRadiologistStatusLabel = (status?: RadiologistReviewStatus) => {
  if (status === "confirmed") return "Confirmed / Approved";
  if (status === "needs_recheck") return "Needs Recheck";
  if (status === "incorrect") return "AI Prediction Incorrect";
  if (status === "unclear") return "Image Not Clear";
  return "Pending Review";
};

const getRadiologistShortStatusLabel = (status?: RadiologistReviewStatus) => {
  if (status === "confirmed") return "Radiology: Approved";
  if (status === "needs_recheck") return "Radiology: Recheck";
  if (status === "incorrect") return "Radiology: Incorrect";
  if (status === "unclear") return "Radiology: Unclear";
  return "Radiology: Pending";
};

const getRadiologistStatusClasses = (status?: RadiologistReviewStatus) => {
  if (status === "confirmed") {
    return "bg-emerald-900/30 text-emerald-400 border-emerald-500/30";
  }

  if (status === "needs_recheck") {
    return "bg-amber-900/30 text-amber-400 border-amber-500/30";
  }

  if (status === "incorrect") {
    return "bg-red-900/30 text-red-400 border-red-500/30";
  }

  if (status === "unclear") {
    return "bg-orange-900/30 text-orange-400 border-orange-500/30";
  }

  return "bg-purple-900/30 text-purple-400 border-purple-500/30";
};

export default function DoctorPersonalScansPage() {
  const [scans, setScans] = useState<ScanResult[]>([]);
  const [selectedScan, setSelectedScan] = useState<ScanResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownloadReport = async () => {
    if (!selectedScan) return;
    try {
      setIsDownloading(true);
      // Since this is the doctor's personal scan, use the logged-in doctor's name
      const patientName = user?.name || "Doctor";
      
      await generateSavedScanReportPDF({
        scan: selectedScan as any, 
        patientName
      });
    } catch (error) {
      console.error("Failed to generate PDF:", error);
      alert("An error occurred while downloading the report.");
    } finally {
      setIsDownloading(false);
    }
  };




  const { user, isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated || !user?.id) {
      return;
    }

    let isMounted = true;

    const fetchMyPersonalScans = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // This fetches only scans uploaded by this doctor's own account.
        const response = await api.get(`/api/results?userId=${user.id}`);

        if (isMounted && response.data.success) {
          setScans(response.data.data);
        } else if (isMounted) {
          throw new Error(response.data.message || "Failed to fetch scans");
        }
      } catch (err: unknown) {
        if (!isMounted) return;

        const errorMessage =
          err instanceof Error ? err.message : "An unexpected error occurred";

        setError(errorMessage);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchMyPersonalScans();

    return () => {
      isMounted = false;
    };
  }, [isAuthenticated, user?.id]);

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-transparent text-white w-full max-w-[1400px] mx-auto pt-6 sm:pt-10 px-4 sm:px-6 pb-12">
        {/* Header Section */}
        <div className="mb-6 sm:mb-10 text-center md:text-left animate-fade-in-up">
          <h1 className="text-2xl sm:text-[28px] font-bold text-gray-100 mb-1.5 sm:mb-2 leading-tight">
            My Personal Scans
          </h1>
          <p className="text-gray-400 text-xs sm:text-sm max-w-xl mx-auto md:mx-0">
            Review your own MRI scan history, AI findings, clinical notes, and
            radiologist verification.
          </p>
        </div>

        <section>
          {isLoading && (
            <div className="flex items-center justify-center gap-2 text-purple-400 text-base sm:text-lg md:justify-start py-4">
              <Loader2 className="w-5 h-5 animate-spin" />
              Retrieving your personal records...
            </div>
          )}

          {error && (
            <div className="text-red-400 bg-red-500/10 p-4 rounded-lg border border-red-500/30 text-center md:text-left text-sm sm:text-base">
              Error loading scans: {error}
            </div>
          )}

          {!isLoading && !error && scans.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 sm:py-20 px-4 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 text-center animate-fade-in-up">
              <div className="w-14 h-14 rounded-full bg-purple-900/30 border border-purple-500/20 flex items-center justify-center mb-4">
                <ImageOff className="w-6 h-6 text-purple-400" />
              </div>
              <p className="text-gray-400 text-base sm:text-lg mb-4 sm:mb-6">
                You have no personal MRI scans in your history.
              </p>
              <Link href="/try-demo" className="w-full sm:w-auto">
                <button className="flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white px-6 py-2.5 rounded-xl font-semibold transition-all duration-300 shadow-[0_0_20px_rgba(168,85,247,0.3)] hover:shadow-[0_0_30px_rgba(168,85,247,0.5)] hover:-translate-y-1 w-full sm:w-auto">
                  <UploadIcon className="w-4 h-4" />
                  Upload New Scan
                </button>
              </Link>
            </div>
          )}

          {!isLoading && !error && scans.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
              {scans.map((scan, idx) => (
                <div
                  key={scan._id}
                  style={{ animationDelay: `${idx * 80}ms` }}
                  className="p-4 sm:p-5 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 flex flex-col h-full shadow-lg hover:border-blue-500/30 hover:-translate-y-1 transition-all duration-300 w-full animate-fade-in-up"
                >
                  {/* Date + Badges */}
                  <div className="flex justify-between items-center gap-2 mb-4">
                    <span className="bg-[#1e2235] text-gray-300 text-[11px] sm:text-xs px-2.5 sm:px-3 py-1 rounded-full border border-gray-700 whitespace-nowrap">
                      {new Date(scan.createdAt).toLocaleDateString("en-US", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>

                    <div className="flex flex-wrap gap-1 justify-end">
                      {scan.comment && (
                        <span className="bg-green-900/30 text-green-400 text-[9px] sm:text-[10px] px-2 py-0.5 sm:py-1 rounded font-bold border border-green-500/30 uppercase tracking-wider whitespace-nowrap">
                          Note Added
                        </span>
                      )}

                      <span
                        className={`max-w-[150px] truncate text-[8px] sm:text-[9px] px-2 py-0.5 sm:py-1 rounded font-bold border uppercase tracking-wider whitespace-nowrap ${getRadiologistStatusClasses(
                          scan.radiologistReviewStatus,
                        )}`}
                      >
                        {getRadiologistShortStatusLabel(
                          scan.radiologistReviewStatus,
                        )}
                      </span>
                    </div>
                  </div>

                  {/* Scan Image */}
                  <div className="w-full aspect-square bg-[#0f111a] rounded-xl mb-4 flex items-center justify-center overflow-hidden border border-gray-800 shadow-inner">
                    {scan.imageData ? (
                      <Image
                        src={scan.imageData}
                        alt={scan.className}
                        className="w-full h-full object-contain"
                        width={400}
                        height={400}
                        unoptimized
                      />
                    ) : (
                      <span className="text-gray-600 text-xs sm:text-sm font-medium">
                        No Image Data
                      </span>
                    )}
                  </div>

                  {/* AI Result Details */}
                  <div className="flex justify-between items-center gap-2 mt-2 mb-4">
                    <div className="min-w-0">
                      <p className="text-[9px] sm:text-[10px] text-gray-500 uppercase tracking-wider font-semibold mb-0.5">
                        AI Detection
                      </p>
                      <p
                        className={`text-sm sm:text-base font-bold truncate ${
                          scan.tumorDetected
                            ? "text-red-400"
                            : "text-green-400"
                        }`}
                      >
                        {scan.className}
                      </p>
                    </div>

                    <div className="text-right flex-none">
                      <p className="text-[9px] sm:text-[10px] text-gray-500 uppercase tracking-wider font-semibold mb-0.5">
                        Certainty
                      </p>
                      <p className="text-xs sm:text-sm font-semibold text-gray-300">
                        {scan.confidence.toFixed(1)}%
                      </p>
                    </div>
                  </div>

                  {/* Compact Review Summary */}
                  <div className="mt-auto pt-4 border-t border-[#2a3655] space-y-3">
                    <div className="grid grid-cols-2 gap-2">
                      <div className="rounded-lg border border-blue-500/20 bg-blue-900/10 p-2">
                        <p className="text-[9px] text-blue-400 uppercase font-bold tracking-wider">
                          Your Note
                        </p>
                        <p className="mt-1 text-xs text-gray-300">
                          {scan.comment ? "Available" : "Not Added"}
                        </p>
                      </div>

                      <div className="rounded-lg border border-purple-500/20 bg-purple-900/10 p-2">
                        <p className="text-[9px] text-purple-400 uppercase font-bold tracking-wider">
                          Radiology
                        </p>
                        <p className="mt-1 text-xs text-gray-300 line-clamp-1">
                          {getRadiologistStatusLabel(
                            scan.radiologistReviewStatus,
                          )}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setSelectedScan(scan)}
                      className="w-full rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 px-4 py-2 text-xs font-bold text-white hover:from-purple-500 hover:to-blue-500 transition-all"
                    >
                      View Full Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* Full Details Modal */}
      {selectedScan && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm px-4 py-6">
          <div className="relative w-full max-w-6xl max-h-[90vh] overflow-y-auto rounded-2xl border border-white/10 bg-[#121726] shadow-2xl animate-fade-in-up">
            {/* Modal Header */}
            <div className="sticky top-0 z-10 flex items-center justify-between gap-4 border-b border-white/10 bg-[#121726]/95 px-5 py-4 backdrop-blur">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-white">
                  Personal MRI Scan Details
                </h2>
                <p className="mt-1 text-xs sm:text-sm text-gray-400">
                  Scan Date:{" "}
                  {new Date(selectedScan.createdAt).toLocaleDateString(
                    "en-US",
                    {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    },
                  )}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedScan(null)}
                className="rounded-lg border border-white/10 bg-white/5 p-2 text-gray-300 hover:bg-white/10 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5">
              {/* Images */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                <div className="rounded-xl border border-gray-800 bg-black/30 p-3">
                  <div className="mb-3 flex items-center justify-between">
                    <h3 className="text-sm font-bold text-blue-300">
                      Original MRI
                    </h3>
                    <span className="text-xs text-gray-500">
                      Doctor Upload
                    </span>
                  </div>

                  <div className="relative h-[320px] rounded-lg bg-black overflow-hidden">
                    {selectedScan.originalImage ? (
                      <Image
                        src={selectedScan.originalImage}
                        alt="Original MRI"
                        fill
                        unoptimized
                        sizes="(max-width: 1024px) 100vw, 50vw"
                        className="object-contain"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-sm text-gray-600">
                        No original image available.
                      </div>
                    )}
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

                  <div className="relative h-[320px] rounded-lg bg-black overflow-hidden">
                    {selectedScan.imageData ? (
                      <Image
                        src={selectedScan.imageData}
                        alt="AI predicted MRI output"
                        fill
                        unoptimized
                        sizes="(max-width: 1024px) 100vw, 50vw"
                        className="object-contain"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-sm text-gray-600">
                        No AI image available.
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* AI Result Details */}
              <div className="mt-5 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="rounded-xl border border-gray-800 bg-black/20 p-4">
                  <p className="text-xs uppercase tracking-wider text-gray-500">
                    AI Classification
                  </p>
                  <p
                    className={`mt-2 text-lg font-bold ${
                      selectedScan.tumorDetected
                        ? "text-red-400"
                        : "text-emerald-400"
                    }`}
                  >
                    {selectedScan.className}
                  </p>
                </div>

                <div className="rounded-xl border border-gray-800 bg-black/20 p-4">
                  <p className="text-xs uppercase tracking-wider text-gray-500">
                    AI Confidence
                  </p>
                  <p className="mt-2 text-lg font-bold text-blue-300">
                    {selectedScan.confidence.toFixed(2)}%
                  </p>
                </div>

                <div className="rounded-xl border border-gray-800 bg-black/20 p-4">
                  <p className="text-xs uppercase tracking-wider text-gray-500">
                    Tumor Detected
                  </p>
                  <p
                    className={`mt-2 text-lg font-bold ${
                      selectedScan.tumorDetected
                        ? "text-red-400"
                        : "text-emerald-400"
                    }`}
                  >
                    {selectedScan.tumorDetected ? "Yes" : "No"}
                  </p>
                </div>
              </div>

              {/* Doctor + Radiologist Notes */}
              <div className="mt-5 grid grid-cols-1 lg:grid-cols-2 gap-5">
                {/* Doctor Own Note */}
                <div className="rounded-xl border border-blue-500/20 bg-blue-900/10 p-4">
                  <p className="text-xs uppercase tracking-wider text-blue-300 font-bold">
                    Your Clinical Note
                  </p>

                  {selectedScan.comment ? (
                    <p className="mt-3 text-sm leading-6 text-gray-200">
                      {selectedScan.comment}
                    </p>
                  ) : (
                    <p className="mt-3 text-sm italic text-gray-500">
                      No clinical note has been added to this scan.
                    </p>
                  )}
                </div>

                {/* Radiologist Verification */}
                <div className="rounded-xl border border-purple-500/20 bg-purple-900/10 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-xs uppercase tracking-wider text-purple-300 font-bold">
                      Radiologist Verification
                    </p>

                    <span
                      className={`text-[10px] px-2 py-1 rounded border font-bold uppercase ${getRadiologistStatusClasses(
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
                      <div className="mt-3">
                        <p className="text-[10px] text-gray-500 uppercase tracking-wider font-bold">
                          Radiologist Comment
                        </p>
                        <p className="mt-1 text-sm leading-6 text-gray-200">
                          {selectedScan.radiologistComment ||
                            "No professional comment added."}
                        </p>
                      </div>

                      <div className="mt-4 rounded-lg border border-gray-700 bg-black/20 p-3">
                        <p className="text-[10px] text-gray-500 uppercase tracking-wider font-bold">
                          Recommendation
                        </p>
                        <p className="mt-1 text-sm text-gray-300 leading-6">
                          {selectedScan.radiologistRecommendation ||
                            "No recommendation added by radiologist."}
                        </p>
                      </div>

                      {selectedScan.reviewedAt && (
                        <p className="mt-3 text-xs text-gray-500">
                          Reviewed on{" "}
                          {new Date(selectedScan.reviewedAt).toLocaleDateString(
                            "en-US",
                            {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            },
                          )}
                        </p>
                      )}
                    </>
                  ) : (
                    <p className="mt-3 text-sm italic text-gray-500 leading-6">
                      This scan is still pending radiologist verification. The
                      professional comment and recommendation will appear here
                      after review.
                    </p>
                  )}
                </div>
              </div>

              {/* Footer actions */}
              <div className="mt-6 flex flex-col sm:flex-row gap-3 sm:justify-end">
                <Link href="/try-demo" className="w-full sm:w-auto">
                  <button className="w-full rounded-lg border border-white/10 bg-white/5 px-5 py-2.5 text-sm font-bold text-gray-200 hover:bg-white/10 transition-colors">
                    Scan New MRI
                  </button>
                </Link>
                <button
                  onClick={handleDownloadReport}
                  disabled={isDownloading}
                  className="w-full sm:w-auto rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-emerald-500 transition-colors disabled:opacity-70 flex items-center justify-center gap-2"
                >
                  {isDownloading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Generating...
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4" /> Download Report
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedScan(null)}
                  className="w-full sm:w-auto rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 px-5 py-2.5 text-sm font-bold text-white hover:from-purple-500 hover:to-blue-500 hover:-translate-y-0.5 transition-all"
                >
                  Close Details
                </button>
                {/* --- NEW DOWNLOAD BUTTON --- */}

              </div>
            </div>
          </div>
        </div>
      )}
    </ProtectedRoute>
  );
}