"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import api from "@/src/lib/axios";
import { useAuthStore } from "@/src/lib/store/useAuthStore";
import ProtectedRoute from "@/src/components/ProtectedRoute";
import { generateSavedScanReportPDF } from "@/src/lib/utils/pdfGenerator";
import { X, Download, Loader2, Inbox, Send } from "lucide-react";

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

  reportFindings?: string;
  reportConclusion?: string;
  reportRecommendation?: string;
  reportConfidenceInterpretation?: string;

  comment?: string | null;
  doctorCommentedBy?: ScanUser | string | null;
  doctorCommentedAt?: string | null;

  radiologistReviewStatus?: RadiologistReviewStatus;
  radiologistComment?: string | null;
  radiologistRecommendation?: string | null;
  reviewedBy?: ScanUser | string | null;
  reviewedAt?: string | null;
}

const getPersonName = (person?: ScanUser | string | null) => {
  if (typeof person === "object" && person !== null) {
    return person.name;
  }
  return null;
};

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
  if (status === "confirmed") return "bg-emerald-900/30 text-emerald-400 border-emerald-500/30";
  if (status === "needs_recheck") return "bg-amber-900/30 text-amber-400 border-amber-500/30";
  if (status === "incorrect") return "bg-red-900/30 text-red-400 border-red-500/30";
  if (status === "unclear") return "bg-orange-900/30 text-orange-400 border-orange-500/30";
  return "bg-purple-900/30 text-purple-400 border-purple-500/30";
};

export default function PatientScansPage() {
  const { user } = useAuthStore();
  const [scans, setScans] = useState<ScanResult[]>([]);
  const [selectedScan, setSelectedScan] = useState<ScanResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  
  const [commentInputs, setCommentInputs] = useState<{ [key: string]: string }>({});
  const [savingComments, setSavingComments] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    const fetchScans = async () => {
      if (!user?.id) return;
      try {
        setIsLoading(true);
        const response = await api.get(`/api/results?userId=${user.id}&role=${user.role}`);
        if (response.data.success) {
          setScans(response.data.data);
        } else {
          throw new Error(response.data.message || "Failed to load scans");
        }
      } catch (err: any) {
        setError(err.message || "An error occurred fetching records.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchScans();
  }, [user?.id, user?.role]);

  const handleSaveComment = async (scanId: string) => {
    const commentText = commentInputs[scanId]?.trim();
    if (!commentText) return;

    setSavingComments((prev) => ({ ...prev, [scanId]: true }));
    try {
      const response = await api.put("/api/results", {
        scanId,
        comment: commentText,
        doctorId: user?.id,
      });
      if (response.data.success) {
        setScans((prev) => prev.map((scan) => (scan._id === scanId ? response.data.data : scan)));
        setCommentInputs((prev) => ({ ...prev, [scanId]: "" }));
      }
    } catch (err) {
      console.error("Error saving comment:", err);
      alert("Failed to save clinical observation.");
    } finally {
      setSavingComments((prev) => ({ ...prev, [scanId]: false }));
    }
  };

  const handleDownloadReport = async () => {
    if (!selectedScan) return;
    try {
      setIsDownloading(true);
      const patientName = typeof selectedScan.user === 'object' && selectedScan.user !== null 
          ? selectedScan.user.name 
          : "Patient";
      
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
      <div className="p-6 h-auto lg:h-[calc(100vh-80px)] overflow-y-auto custom-scrollbar">
        <div className="mb-6 sm:mb-8 animate-fade-in-up">
          <h1 className="text-3xl font-bold text-white tracking-wide">
            Patient Scan Logs
          </h1>
          <p className="text-gray-400 mt-2 text-sm">
            Review diagnostic imaging for your assigned patients and append clinical observations.
          </p>
        </div>

        {isLoading && (
          <div className="flex items-center gap-2 text-blue-400 text-base">
            <Loader2 className="w-5 h-5 animate-spin" />
            Loading diagnostic records...
          </div>
        )}

        {error && (
          <div className="text-red-400 bg-red-500/10 p-4 rounded-lg border border-red-500/30 text-sm">
            {error}
          </div>
        )}

        {!isLoading && !error && scans.length === 0 && (
          <div className="flex flex-col items-center gap-4 text-gray-400 bg-white/5 backdrop-blur-sm p-8 sm:p-10 rounded-2xl border border-white/10 text-center shadow-xl animate-fade-in-up">
            <div className="w-14 h-14 rounded-full bg-blue-900/30 border border-blue-500/20 flex items-center justify-center">
              <Inbox className="w-6 h-6 text-blue-400" />
            </div>
            No patient scans available. Scans will appear here automatically once a patient books an appointment with you.
          </div>
        )}

        {!isLoading && !error && scans.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-12">
            {scans.map((scan, idx) => (
              <div
                key={scan._id}
                style={{ animationDelay: `${idx * 80}ms` }}
                className={`p-5 bg-white/5 backdrop-blur-sm rounded-2xl border flex flex-col h-full shadow-xl transition-all duration-300 hover:-translate-y-1 animate-fade-in-up ${
                  scan.tumorDetected
                    ? "border-red-500/50 hover:border-red-400"
                    : "border-white/10 hover:border-green-500/50"
                }`}
              >
                {/* Clean Header */}
                <div className="flex-none mb-3 border-b border-gray-800 pb-3">
                  <div className="flex justify-between items-start gap-3 text-xs text-gray-400">
                    <div className="min-w-0">
                      <p className="text-[10px] text-gray-500 uppercase font-semibold">Patient</p>
                      <p className="text-gray-200 font-bold truncate">
                        {typeof scan.user === "object" && scan.user !== null
                          ? scan.user.name
                          : "Anonymous Record"}
                      </p>
                    </div>
                    <div className="text-right flex-none">
                      <p className="text-[10px] text-gray-500 uppercase font-semibold">Scan Date</p>
                      <p className="text-gray-300 font-medium">
                        {new Date(scan.createdAt).toLocaleDateString("en-US", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2">
                    <span
                      className={`max-w-[170px] truncate rounded border px-2 py-1 text-[9px] font-bold uppercase tracking-wider ${getRadiologistStatusClasses(scan.radiologistReviewStatus)}`}
                    >
                      {getRadiologistShortStatusLabel(scan.radiologistReviewStatus)}
                    </span>
                    {scan.comment && (
                      <span className="rounded border border-blue-500/30 bg-blue-900/20 px-2 py-1 text-[9px] font-bold uppercase tracking-wider text-blue-400">
                        Note Added
                      </span>
                    )}
                  </div>
                </div>

                {/* Reduced Image Size */}
                <div className="flex-none w-full h-48 bg-[#0f111a] rounded-xl mb-4 flex items-center justify-center overflow-hidden border border-gray-800 shadow-inner">
                  {scan.imageData ? (
                    <Image
                      src={scan.imageData}
                      alt={scan.className}
                      className="w-full h-full object-contain"
                      width={500}
                      height={500}
                      unoptimized
                    />
                  ) : (
                    <span className="text-gray-600 text-sm font-medium">No Image Data</span>
                  )}
                </div>

                <div className="flex-none flex justify-between items-center gap-2 mb-4">
                  <p className={`text-sm sm:text-base font-bold truncate ${scan.tumorDetected ? "text-red-400" : "text-green-400"}`}>
                    {scan.className}
                  </p>
                  <p className="text-[10px] sm:text-xs font-semibold text-gray-400 bg-gray-800 px-2 py-1 rounded-md whitespace-nowrap">
                    {scan.confidence.toFixed(1)}% Certainty
                  </p>
                </div>

                {/* Flexible Middle Section to maintain card height */}
                <div className="flex-1 overflow-hidden mb-4 min-h-[50px] pr-1">
                  {scan.comment ? (
                    <div className="p-2.5 bg-blue-900/20 rounded-lg border border-blue-500/30 h-full">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <p className="text-[10px] text-blue-400 font-semibold uppercase tracking-wider">
                          Your Note
                        </p>
                      </div>
                      <p className="mt-1 text-xs text-gray-200 leading-5 line-clamp-2">
                        {scan.comment}
                      </p>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-full border border-dashed border-gray-800 rounded-lg">
                       <p className="text-[10px] text-gray-500 italic">No clinical note added</p>
                    </div>
                  )}
                </div>

                {/* Fixed Footer with Input & Buttons */}
                <div className="flex-none pt-4 border-t border-gray-800 mt-auto">
                  <div className="flex gap-2 items-center mb-3">
                    <input
                      type="text"
                      placeholder="Add clinical observation..."
                      value={commentInputs[scan._id] || ""}
                      onChange={(e) =>
                        setCommentInputs((prev) => ({
                          ...prev,
                          [scan._id]: e.target.value,
                        }))
                      }
                      className="flex-1 min-w-0 px-3 py-2 bg-white/5 text-white text-xs sm:text-sm rounded-xl border border-white/10 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none placeholder-gray-500 transition-colors"
                      disabled={savingComments[scan._id]}
                    />
                    <button
                      onClick={() => handleSaveComment(scan._id)}
                      disabled={
                        savingComments[scan._id] ||
                        !commentInputs[scan._id]?.trim()
                      }
                      className="px-3 sm:px-4 py-2 flex-none flex items-center justify-center gap-1.5 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-700 disabled:cursor-not-allowed text-white text-xs sm:text-sm rounded-xl font-semibold transition-colors min-h-[36px]"
                    >
                      {savingComments[scan._id] ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <>
                          <Send className="w-3.5 h-3.5" />
                          Save
                        </>
                      )}
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => setSelectedScan(scan)}
                    className="w-full rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-2.5 text-xs font-bold text-white transition-all hover:from-blue-500 hover:to-purple-500 hover:-translate-y-0.5"
                  >
                    View Full Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* FULL DETAILS MODAL */}
      {selectedScan && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 px-4 py-6 backdrop-blur-sm">
          <div className="relative max-h-[90vh] w-full max-w-6xl overflow-y-auto rounded-2xl border border-white/10 bg-[#121726] shadow-2xl animate-fade-in-up">
            <div className="sticky top-0 z-10 flex items-center justify-between gap-4 border-b border-white/10 bg-[#121726]/95 px-5 py-4 backdrop-blur">
              <div>
                <h2 className="text-xl font-bold text-white sm:text-2xl">
                  Patient MRI Scan Details
                </h2>
                <p className="mt-1 text-xs text-gray-400 sm:text-sm">
                  Patient:{" "}
                  {typeof selectedScan.user === "object" && selectedScan.user !== null ? selectedScan.user.name : "Anonymous Record"}
                  {" • "}
                  {new Date(selectedScan.createdAt).toLocaleDateString("en-US", {
                    day: "numeric", month: "short", year: "numeric",
                  })}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedScan(null)}
                className="rounded-lg border border-white/10 bg-white/5 p-2 text-gray-300 transition-colors hover:bg-white/10 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5">
              <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
                <div className="rounded-xl border border-gray-800 bg-black/30 p-3">
                  <div className="mb-3 flex items-center justify-between">
                    <h3 className="text-sm font-bold text-blue-300">Original MRI</h3>
                    <span className="text-xs text-gray-500">Patient Upload</span>
                  </div>
                  <div className="relative h-[320px] overflow-hidden rounded-lg bg-black">
                    {selectedScan.originalImage ? (
                      <Image
                        src={selectedScan.originalImage}
                        alt="Original patient MRI"
                        fill
                        unoptimized
                        sizes="(max-width: 1024px) 100vw, 50vw"
                        className="object-contain"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-sm text-gray-600">No original image available.</div>
                    )}
                  </div>
                </div>

                <div className="rounded-xl border border-purple-500/20 bg-black/30 p-3">
                  <div className="mb-3 flex items-center justify-between">
                    <h3 className="text-sm font-bold text-purple-300">AI Predicted Output</h3>
                    <span className="text-xs text-gray-500">YOLO11s-seg Result</span>
                  </div>
                  <div className="relative h-[320px] overflow-hidden rounded-lg bg-black">
                    {selectedScan.imageData ? (
                      <Image
                        src={selectedScan.imageData}
                        alt="AI predicted MRI result"
                        fill
                        unoptimized
                        sizes="(max-width: 1024px) 100vw, 50vw"
                        className="object-contain"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-sm text-gray-600">No AI output available.</div>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-3">
                <div className="rounded-xl border border-gray-800 bg-black/20 p-4">
                  <p className="text-xs uppercase tracking-wider text-gray-500">AI Classification</p>
                  <p className={`mt-2 text-lg font-bold ${selectedScan.tumorDetected ? "text-red-400" : "text-emerald-400"}`}>
                    {selectedScan.className}
                  </p>
                </div>
                <div className="rounded-xl border border-gray-800 bg-black/20 p-4">
                  <p className="text-xs uppercase tracking-wider text-gray-500">AI Confidence</p>
                  <p className="mt-2 text-lg font-bold text-blue-300">{selectedScan.confidence.toFixed(2)}%</p>
                </div>
                <div className="rounded-xl border border-gray-800 bg-black/20 p-4">
                  <p className="text-xs uppercase tracking-wider text-gray-500">Tumor Detected</p>
                  <p className={`mt-2 text-lg font-bold ${selectedScan.tumorDetected ? "text-red-400" : "text-emerald-400"}`}>
                    {selectedScan.tumorDetected ? "Yes" : "No"}
                  </p>
                </div>
              </div>

              <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-2">
                {/* Doctor Note (Read Only in Modal) */}
                <div className="rounded-xl border border-blue-500/20 bg-blue-900/10 p-4">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-blue-300">Doctor Clinical Note</p>
                      {getPersonName(selectedScan.doctorCommentedBy) && (
                        <p className="mt-1 text-xs text-gray-400">
                          Added by <span className="font-semibold text-blue-200">Dr. {getPersonName(selectedScan.doctorCommentedBy)}</span>
                        </p>
                      )}
                    </div>
                    {selectedScan.comment && (
                      <span className="rounded-full border border-emerald-500/30 bg-emerald-900/20 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                        Saved
                      </span>
                    )}
                  </div>

                  {selectedScan.comment ? (
                    <>
                      <div className="mt-4 rounded-lg border border-blue-500/10 bg-black/20 p-3">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Clinical Observation</p>
                        <p className="mt-2 text-sm leading-6 text-gray-200">{selectedScan.comment}</p>
                      </div>
                      {selectedScan.doctorCommentedAt && (
                        <p className="mt-3 text-xs text-gray-500">
                          Added on {new Date(selectedScan.doctorCommentedAt).toLocaleDateString()}
                        </p>
                      )}
                    </>
                  ) : (
                    <p className="mt-3 text-sm italic text-gray-500">No clinical note has been added yet.</p>
                  )}
                </div>

                {/* Radiologist Verification */}
                <div className="rounded-xl border border-purple-500/20 bg-purple-900/10 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-xs font-bold uppercase tracking-wider text-purple-300">
                      Radiologist Verification
                    </p>
                    <span className={`rounded border px-2 py-1 text-[10px] font-bold uppercase ${getRadiologistStatusClasses(selectedScan.radiologistReviewStatus)}`}>
                      {getRadiologistStatusLabel(selectedScan.radiologistReviewStatus)}
                    </span>
                  </div>

                  {selectedScan.radiologistReviewStatus && selectedScan.radiologistReviewStatus !== "pending" ? (
                    <>
                      {getPersonName(selectedScan.reviewedBy) && (
                        <p className="mt-3 text-xs text-gray-400">
                          Reviewed by <span className="font-semibold text-purple-200">Radiologist {getPersonName(selectedScan.reviewedBy)}</span>
                        </p>
                      )}
                      <div className="mt-4">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Radiologist Comment</p>
                        <p className="mt-2 text-sm leading-6 text-gray-200">{selectedScan.radiologistComment || "No radiologist comment added."}</p>
                      </div>
                      <div className="mt-4 rounded-lg border border-gray-700 bg-black/20 p-3">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Recommendation</p>
                        <p className="mt-1 text-sm leading-6 text-gray-300">{selectedScan.radiologistRecommendation || "No recommendation added by radiologist."}</p>
                      </div>
                      {selectedScan.reviewedAt && (
                        <p className="mt-3 text-xs text-gray-500">
                          Reviewed on {new Date(selectedScan.reviewedAt).toLocaleDateString()}
                        </p>
                      )}
                    </>
                  ) : (
                    <p className="mt-3 text-sm italic leading-6 text-gray-500">
                      This scan is waiting for radiologist verification.
                    </p>
                  )}
                </div>
              </div>

              <div className="mt-6 flex flex-col sm:flex-row gap-3 sm:justify-end">
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
                  className="w-full sm:w-auto rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 px-5 py-2.5 text-sm font-bold text-white transition-all hover:from-blue-500 hover:to-purple-500 hover:-translate-y-0.5"
                >
                  Close Details
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </ProtectedRoute>
  );
}