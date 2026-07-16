"use client";

import Image from "next/image";
import React, { useState, useEffect } from "react";
import api from "@/src/lib/axios";
import { useAuthStore } from "@/src/lib/store/useAuthStore";
import Link from "next/link";
import ProtectedRoute from "@/src/components/ProtectedRoute";
import { generateSavedScanReportPDF } from "@/src/lib/utils/pdfGenerator"; // NEW IMPORT
import { History, X, Loader2, Download, ScanLine } from "lucide-react";

// 1. Interface for the Scan Data
type RadiologistReviewStatus =
  | "pending"
  | "confirmed"
  | "needs_recheck"
  | "incorrect"
  | "unclear";

interface ScanUser {
  _id: string;
  name: string;
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
  updatedAt: string;

  // AI Narrative Fields (NEW)
  reportFindings?: string;
  reportConclusion?: string;
  reportRecommendation?: string;
  reportConfidenceInterpretation?: string;

  // Doctor comment
  comment?: string | null;
  doctorCommentedBy?: ScanUser | string | null;
  doctorCommentedAt?: string | null;

  // Radiologist review
  radiologistReviewStatus?: RadiologistReviewStatus;
  radiologistComment?: string | null;
  radiologistRecommendation?: string | null;
  reviewedAt?: string | null;
  reviewedBy?: ScanUser | string | null;
}

const getRadiologistStatusLabel = (status?: RadiologistReviewStatus) => {
  if (status === "confirmed") return "Confirmed / Approved";
  if (status === "needs_recheck") return "Needs Recheck";
  if (status === "incorrect") return "AI Prediction Incorrect";
  if (status === "unclear") return "Image Not Clear";
  return "Pending Review";
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

const getRadiologistShortStatusLabel = (status?: RadiologistReviewStatus) => {
  if (status === "confirmed") return "Radiology: Approved";
  if (status === "needs_recheck") return "Radiology: Recheck";
  if (status === "incorrect") return "Radiology: Incorrect";
  if (status === "unclear") return "Radiology: Unclear";
  return "Radiology: Pending";
};

const getPersonName = (person?: ScanUser | string | null) => {
  if (typeof person === "object" && person !== null) {
    return person.name;
  }

  return null;
};

export default function MyHistoryPage() {
  const [scans, setScans] = useState<ScanResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedScan, setSelectedScan] = useState<ScanResult | null>(null);
  
  // NEW STATE: Track PDF downloading
  const [isDownloading, setIsDownloading] = useState(false);

  const { user, isAuthenticated } = useAuthStore();

  useEffect(() => {
    // Prevent fetching if not logged in
    if (!isAuthenticated || !user?.id) {
      return;
    }

    const fetchMyHistory = async () => {
      try {
        setIsLoading(true);
        const response = await api.get(`/api/results?userId=${user.id}`);

        if (response.data.success) {
          setScans(response.data.data);
        } else {
          throw new Error(response.data.message || "Failed to fetch history");
        }
      } catch (err: unknown) {
        const errorMessage =
          err instanceof Error ? err.message : "An unexpected error occurred";
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMyHistory();
  }, [user, isAuthenticated]);

  // NEW FUNCTION: Handle PDF Download
  const handleDownloadReport = async () => {
    if (!selectedScan) return;
    try {
      setIsDownloading(true);
      
      const patientName = user?.name || getPersonName(selectedScan.user) || "Patient";
      
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

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-transparent text-white w-full max-w-[1400px] mx-auto pt-6 sm:pt-10 px-4 sm:px-6 pb-12">
        {/* Header Section */}
        <div className="mb-6 sm:mb-10 text-center md:text-left animate-fade-in-up">
          <div className="mx-auto md:mx-0 mb-3 w-11 h-11 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center">
            <History className="w-5 h-5 text-blue-400" />
          </div>
          <h1 className="text-2xl sm:text-[28px] font-bold mb-1.5 sm:mb-2 leading-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-400 to-blue-400">
            My Medical History
          </h1>
          <p className="text-gray-400 text-xs sm:text-sm max-w-xl mx-auto md:mx-0">
            Review your past MRI scans and clinical notes from your doctor and radiologist.
          </p>
        </div>

        <section>
          {isLoading && (
            <div className="text-blue-400 animate-pulse text-base sm:text-lg text-center md:text-left py-4">
              Retrieving your secure records...
            </div>
          )}

          {error && (
            <div className="text-red-400 bg-red-500/10 p-4 rounded-lg border border-red-500/30 text-center md:text-left text-sm sm:text-base">
              Error loading history: {error}
            </div>
          )}

          {!isLoading && !error && scans.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 sm:py-20 px-4 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 text-center animate-fade-in-up">
              <ScanLine className="w-10 h-10 text-gray-600 mb-4" />
              <p className="text-gray-400 text-base sm:text-lg mb-4 sm:mb-6">
                You have no MRI scans in your history.
              </p>
              <Link href="/try-demo" className="w-full sm:w-auto">
                <button className="rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2.5 font-bold hover:from-blue-500 hover:to-purple-500 transition-all duration-300 shadow-[0_0_20px_rgba(37,99,235,0.35)] hover:-translate-y-1 w-full sm:w-auto">
                  Scan New MRI
                </button>
              </Link>
            </div>
          )}

          {!isLoading && !error && scans.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
              {scans.map((scan, i) => (
                <div
                  key={scan._id}
                  style={{ animationDelay: `${i * 70}ms` }}
                  className="p-4 sm:p-5 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 flex flex-col h-full shadow-lg hover:border-blue-500/30 hover:-translate-y-1 transition-all duration-300 w-full animate-fade-in-up"
                >
                  {/* Date Badge */}
                  <div className="flex justify-between items-center gap-2 mb-4">
                    <span className="bg-white/10 text-gray-300 text-[11px] sm:text-xs px-2.5 sm:px-3 py-1 rounded-full border border-white/10 whitespace-nowrap">
                      {new Date(scan.createdAt).toLocaleDateString("en-US", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                    <div className="flex flex-wrap gap-1 justify-end">
                      {scan.comment && (
                        <span className="bg-green-900/30 text-green-400 text-[9px] sm:text-[10px] px-2 py-0.5 sm:py-1 rounded font-bold border border-green-500/30 uppercase tracking-wider whitespace-nowrap">
                          Doctor Reviewed
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
                  <div className="w-full aspect-square bg-[#0f111a] rounded-xl mb-4 flex items-center justify-center overflow-hidden border border-white/10 shadow-inner">
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
                        className={`text-sm sm:text-base font-bold truncate ${scan.tumorDetected ? "text-red-400" : "text-green-400"}`}
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

                  {/* Doctor + Radiologist Review Section */}
                  {/* Compact Review Summary */}
                  <div className="mt-auto pt-4 border-t border-white/10 space-y-3">
                    <div className="grid grid-cols-2 gap-2">
                      <div className="rounded-lg border border-blue-500/20 bg-blue-900/10 p-2">
                        <p className="text-[9px] text-blue-400 uppercase font-bold tracking-wider">
                          Doctor
                        </p>
                        <p className="mt-1 text-xs text-gray-300 truncate">
                          {scan.comment
                            ? getPersonName(scan.doctorCommentedBy)
                              ? `Dr. ${getPersonName(scan.doctorCommentedBy)}`
                              : "Reviewed"
                            : "Pending"}
                        </p>
                      </div>

                      <div className="rounded-lg border border-purple-500/20 bg-purple-900/10 p-2">
                        <p className="text-[9px] text-purple-400 uppercase font-bold tracking-wider">
                          Radiology
                        </p>
                        <p className="mt-1 text-xs text-gray-300">
                          {getRadiologistStatusLabel(
                            scan.radiologistReviewStatus,
                          )}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setSelectedScan(scan)}
                      className="w-full rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-2 text-xs font-bold text-white hover:from-blue-500 hover:to-purple-500 transition-all duration-300 hover:-translate-y-0.5"
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
      {selectedScan && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm px-4 py-6">
          <div className="relative w-full max-w-6xl max-h-[90vh] overflow-y-auto rounded-2xl border border-white/10 bg-[#12172a] shadow-2xl animate-fade-in-up">
            {/* Modal Header */}
            <div className="sticky top-0 z-10 flex items-center justify-between gap-4 border-b border-white/10 bg-[#12172a]/95 px-5 py-4 backdrop-blur">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-white">
                  MRI Scan Full Details
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
                <div className="rounded-xl border border-white/10 bg-black/30 p-3">
                  <div className="mb-3 flex items-center justify-between">
                    <h3 className="text-sm font-bold text-blue-300">
                      Original MRI
                    </h3>
                    <span className="text-xs text-gray-500">
                      Patient Upload
                    </span>
                  </div>

                  <div className="relative h-[320px] rounded-lg bg-black overflow-hidden">
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
                  <div className="mb-3 flex items-center justify-between">
                    <h3 className="text-sm font-bold text-purple-300">
                      AI Predicted Output
                    </h3>
                    <span className="text-xs text-gray-500">
                      YOLO11s-seg Result
                    </span>
                  </div>

                  <div className="relative h-[320px] rounded-lg bg-black overflow-hidden">
                    <Image
                      src={selectedScan.imageData}
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
              <div className="mt-5 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="rounded-xl border border-white/10 bg-black/20 p-4">
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

                <div className="rounded-xl border border-white/10 bg-black/20 p-4">
                  <p className="text-xs uppercase tracking-wider text-gray-500">
                    AI Confidence
                  </p>
                  <p className="mt-2 text-lg font-bold text-blue-300">
                    {selectedScan.confidence.toFixed(2)}%
                  </p>
                </div>

                <div className="rounded-xl border border-white/10 bg-black/20 p-4">
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
                {/* Doctor Note */}
                <div className="rounded-xl border border-blue-500/20 bg-blue-900/10 p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-xs uppercase tracking-wider text-blue-300 font-bold">
                        Doctor Clinical Note
                      </p>

                      {getPersonName(selectedScan.doctorCommentedBy) && (
                        <p className="mt-1 text-xs text-gray-400">
                          Reviewed by{" "}
                          <span className="font-semibold text-blue-200">
                            Dr. {getPersonName(selectedScan.doctorCommentedBy)}
                          </span>
                        </p>
                      )}
                    </div>

                    {selectedScan.comment && (
                      <span className="rounded-full border border-emerald-500/30 bg-emerald-900/20 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                        Doctor Reviewed
                      </span>
                    )}
                  </div>

                  {selectedScan.comment ? (
                    <>
                      <div className="mt-4 rounded-lg border border-blue-500/10 bg-black/20 p-3">
                        <p className="text-[10px] uppercase tracking-wider text-gray-500 font-bold">
                          Clinical Observation
                        </p>

                        <p className="mt-2 text-sm leading-6 text-gray-200">
                          {selectedScan.comment}
                        </p>
                      </div>

                      <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-gray-500">
                        {selectedScan.doctorCommentedAt && (
                          <span>
                            Added on{" "}
                            {new Date(
                              selectedScan.doctorCommentedAt,
                            ).toLocaleDateString("en-US", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
                          </span>
                        )}

                        {getPersonName(selectedScan.doctorCommentedBy) &&
                          selectedScan.doctorCommentedAt && (
                            <span className="text-gray-700">•</span>
                          )}

                        {getPersonName(selectedScan.doctorCommentedBy) && (
                          <span>Verified physician note</span>
                        )}
                      </div>
                    </>
                  ) : (
                    <p className="mt-3 text-sm italic text-gray-500">
                      Awaiting doctor&apos;s review.
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
                      <p className="mt-3 text-sm leading-6 text-gray-200">
                        {selectedScan.radiologistComment ||
                          "No professional note added."}
                      </p>

                      <div className="mt-4 rounded-lg border border-gray-700 bg-black/20 p-3">
                        <p className="text-[10px] text-gray-500 uppercase tracking-wider font-bold">
                          Recommendation
                        </p>
                        <p className="mt-1 text-sm text-gray-300 leading-6">
                          {selectedScan.radiologistRecommendation ||
                            "No recommendation added by radiologist."}
                        </p>
                      </div>

                      {(getPersonName(selectedScan.reviewedBy) ||
                        selectedScan.reviewedAt) && (
                        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-gray-500">
                          {getPersonName(selectedScan.reviewedBy) && (
                            <span>
                              Reviewed by{" "}
                              <span className="font-semibold text-purple-200">
                                Radiologist{" "}
                                {getPersonName(selectedScan.reviewedBy)}
                              </span>
                            </span>
                          )}

                          {getPersonName(selectedScan.reviewedBy) &&
                            selectedScan.reviewedAt && (
                              <span className="text-gray-700">•</span>
                            )}

                          {selectedScan.reviewedAt && (
                            <span>
                              {new Date(
                                selectedScan.reviewedAt,
                              ).toLocaleDateString("en-US", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              })}
                            </span>
                          )}
                        </div>
                      )}
                    </>
                  ) : (
                    <p className="mt-3 text-sm italic text-gray-500 leading-6">
                      Your scan has been submitted for radiologist verification.
                      The professional note will appear here after review.
                    </p>
                  )}
                </div>
              </div>

              {/* Footer actions */}
              <div className="mt-6 flex flex-col sm:flex-row gap-3 sm:justify-end">
                {/* --- NEW DOWNLOAD BUTTON --- */}
                <button
                  onClick={handleDownloadReport}
                  disabled={isDownloading}
                  className="w-full sm:w-auto rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-emerald-500 transition-all duration-300 hover:-translate-y-0.5 disabled:opacity-70 disabled:hover:translate-y-0 flex items-center justify-center gap-2"
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

                <Link href="/try-demo" className="w-full sm:w-auto">
                  <button className="w-full rounded-lg border border-white/10 bg-white/5 px-5 py-2.5 text-sm font-bold text-gray-200 hover:bg-white/10 transition-all duration-300">
                    Scan New MRI
                  </button>
                </Link>

                <Link
                  href="/patient-dashboard/appointments"
                  className="w-full sm:w-auto"
                >
                  <button className="w-full rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 px-5 py-2.5 text-sm font-bold text-white hover:from-blue-500 hover:to-purple-500 transition-all duration-300 hover:-translate-y-0.5">
                    Book Appointment
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </ProtectedRoute>
  );
}