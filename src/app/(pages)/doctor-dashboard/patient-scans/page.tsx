"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import api from "@/src/lib/axios";
import { useAuthStore } from "@/src/lib/store/useAuthStore";
import ProtectedRoute from "@/src/components/ProtectedRoute";

interface ScanResult {
  _id: string;
  user: { _id: string; name: string } | string;
  originalImage: string;
  imageData: string;
  className: string;
  confidence: number;
  tumorDetected: boolean;
  createdAt: string;
  comment?: string;
}

export default function PatientScansPage() {
  const { user } = useAuthStore();
  const [scans, setScans] = useState<ScanResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [commentInputs, setCommentInputs] = useState<{ [key: string]: string }>({});
  const [savingComments, setSavingComments] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    const fetchScans = async () => {
      if (!user?.id) return;
      try {
        setIsLoading(true);
        // Secure backend call fetching ONLY this doctor's patients
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
      const response = await api.put("/api/results", { scanId, comment: commentText });
      if (response.data.success) {
        setScans((prev) =>
          prev.map((scan) => (scan._id === scanId ? { ...scan, comment: commentText } : scan))
        );
        setCommentInputs((prev) => ({ ...prev, [scanId]: "" }));
      }
    } catch (err) {
      console.error("Error saving comment:", err);
      alert("Failed to save clinical observation.");
    } finally {
      setSavingComments((prev) => ({ ...prev, [scanId]: false }));
    }
  };

  return (
    <ProtectedRoute>
      <div className="p-6 h-auto lg:h-[calc(100vh-80px)] overflow-y-auto custom-scrollbar">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-3xl font-bold text-white tracking-wide">
            Patient Scan Logs
          </h1>
          <p className="text-gray-400 mt-2 text-sm">
            Review diagnostic imaging for your assigned patients and append clinical observations.
          </p>
        </div>

        {isLoading && (
          <div className="text-blue-400 animate-pulse text-base">Loading diagnostic records...</div>
        )}

        {error && (
          <div className="text-red-400 bg-red-500/10 p-4 rounded-lg border border-red-500/30 text-sm">
            {error}
          </div>
        )}

        {!isLoading && !error && scans.length === 0 && (
          <div className="text-gray-500 bg-[#1a163a] p-8 rounded-xl border border-gray-800 text-center shadow-xl">
            No patient scans available. Scans will appear here automatically once a patient books an appointment with you.
          </div>
        )}

        {!isLoading && !error && scans.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 pb-12">
            {scans.map((scan) => (
              <div
                key={scan._id}
                className={`p-5 bg-[#1a163a] rounded-2xl border flex flex-col h-full shadow-xl transition-all ${
                  scan.tumorDetected
                    ? "border-red-500/50 hover:border-red-400"
                    : "border-[#2a3655] hover:border-green-500/50"
                }`}
              >
                <div className="flex justify-between items-start mb-3 text-xs text-gray-400 border-b border-gray-800 pb-2">
                  <div className="min-w-0">
                    <p className="text-[10px] text-gray-500 uppercase font-semibold">Patient</p>
                    <p className="text-gray-200 font-bold truncate">
                      {typeof scan.user === "object" && scan.user !== null ? scan.user.name : "Anonymous Record"}
                    </p>
                  </div>
                  <div className="text-right flex-none">
                    <p className="text-[10px] text-gray-500 uppercase font-semibold">Scan Date</p>
                    <p className="text-gray-300 font-medium">
                      {new Date(scan.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="w-full aspect-square bg-[#0f111a] rounded-xl mb-4 flex items-center justify-center overflow-hidden border border-gray-800 shadow-inner">
                  {scan.imageData ? (
                    <Image src={scan.imageData} alt={scan.className} className="w-full h-full object-contain" width={500} height={500} unoptimized />
                  ) : (
                    <span className="text-gray-600 text-sm font-medium">No Image Data</span>
                  )}
                </div>

                <div className="flex justify-between items-center gap-2 mt-auto mb-4">
                  <p className={`text-sm sm:text-base font-bold truncate ${scan.tumorDetected ? "text-red-400" : "text-green-400"}`}>
                    {scan.className}
                  </p>
                  <p className="text-[10px] sm:text-xs font-semibold text-gray-400 bg-gray-800 px-2 py-1 rounded-md whitespace-nowrap">
                    {scan.confidence.toFixed(1)}% Certainty
                  </p>
                </div>

                <div className="mt-auto pt-4 border-t border-gray-800">
                  {scan.comment && (
                    <div className="mb-4 p-3 bg-blue-900/20 rounded-lg border border-blue-500/30">
                      <p className="text-[10px] text-blue-400 font-semibold mb-1 uppercase tracking-wider">Physicians Note</p>
                      <p className="text-xs sm:text-sm text-gray-200 leading-normal">{scan.comment}</p>
                    </div>
                  )}
                  <div className="flex gap-2 items-center">
                    <input
                      type="text"
                      placeholder="Add clinical observation..."
                      value={commentInputs[scan._id] || ""}
                      onChange={(e) => setCommentInputs((prev) => ({ ...prev, [scan._id]: e.target.value }))}
                      className="flex-1 min-w-0 px-3 py-2 bg-[#120f26] text-white text-xs sm:text-sm rounded-lg border border-gray-700 focus:border-blue-500 outline-none placeholder:text-gray-500"
                      disabled={savingComments[scan._id]}
                    />
                    <button
                      onClick={() => handleSaveComment(scan._id)}
                      disabled={savingComments[scan._id] || !commentInputs[scan._id]?.trim()}
                      className="px-3 sm:px-4 py-2 flex-none bg-blue-600 hover:bg-blue-500 disabled:bg-gray-700 text-white text-xs sm:text-sm rounded-lg font-semibold transition-colors min-h-[36px]"
                    >
                      {savingComments[scan._id] ? "..." : "Save"}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}