"use client";

import Image from "next/image";
import React, { useState, useEffect } from "react";
import api from "@/src/lib/axios";
import { useAuthStore } from "@/src/lib/store/useAuthStore";
import Link from "next/link";
import ProtectedRoute from "@/src/components/ProtectedRoute";
// 1. Interface for the Scan Data
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
  comment?: string; // The doctor's comment
}

export default function MyHistoryPage() {
  const [scans, setScans] = useState<ScanResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { user, isAuthenticated } = useAuthStore();

  useEffect(() => {
    // Prevent fetching if not logged in
    if (!isAuthenticated || !user?.id) {
      return;
    }

    const fetchMyHistory = async () => {
      try {
        setIsLoading(true);
        // Assuming your backend can filter results by userId.
        // If your API route is different, adjust this URL (e.g., '/api/results/history')
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

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-transparent text-white w-full max-w-[1400px] mx-auto pt-6 sm:pt-10 px-4 sm:px-6 pb-12">
        {/* Header Section */}
        <div className="mb-6 sm:mb-10 text-center md:text-left">
          <h1 className="text-2xl sm:text-[28px] font-bold text-gray-100 mb-1.5 sm:mb-2 leading-tight">
            My Medical History
          </h1>
          <p className="text-gray-400 text-xs sm:text-sm max-w-xl mx-auto md:mx-0">
            Review your past MRI scans and clinical notes from your doctor.
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
            <div className="flex flex-col items-center justify-center py-16 sm:py-20 px-4 bg-[#121726] rounded-2xl border border-[#2a3655] text-center">
              <p className="text-gray-400 text-base sm:text-lg mb-4 sm:mb-6">
                You have no MRI scans in your history.
              </p>
              <Link href="/try-demo" className="w-full sm:w-auto">
                <button className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2.5 rounded-lg font-semibold transition-colors shadow-lg shadow-blue-900/20 w-full sm:w-auto">
                  Scan New MRI
                </button>
              </Link>
            </div>
          )}

          {!isLoading && !error && scans.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
              {scans.map((scan) => (
                <div
                  key={scan._id}
                  className="p-4 sm:p-5 bg-[#121726] rounded-2xl border border-[#2a3655] flex flex-col h-full shadow-lg hover:border-[#3b4b75] transition-all w-full"
                >
                  {/* Date Badge */}
                  <div className="flex justify-between items-center gap-2 mb-4">
                    <span className="bg-[#1e2235] text-gray-300 text-[11px] sm:text-xs px-2.5 sm:px-3 py-1 rounded-full border border-gray-700 whitespace-nowrap">
                      {new Date(scan.createdAt).toLocaleDateString("en-US", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                    {scan.comment && (
                      <span className="bg-green-900/30 text-green-400 text-[9px] sm:text-[10px] px-2 py-0.5 sm:py-1 rounded font-bold border border-green-500/30 uppercase tracking-wider whitespace-nowrap">
                        Reviewed
                      </span>
                    )}
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

                  {/* Doctor's Comment Section (Patient View) */}
                  <div className="mt-auto pt-4 border-t border-[#2a3655]">
                    {scan.comment ? (
                      <div className="p-3 bg-blue-900/10 rounded-lg border border-blue-500/20">
                        <p className="text-[10px] sm:text-[11px] text-blue-400 font-bold mb-1 uppercase tracking-wider flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-500 flex-none"></span>
                          Doctor`s Clinical Note
                        </p>
                        <p className="text-xs sm:text-sm text-gray-300 leading-relaxed text-left break-words">
                          {scan.comment}
                        </p>
                      </div>
                    ) : (
                      <div className="p-3 bg-gray-800/30 rounded-lg border border-gray-800 border-dashed text-center">
                        <p className="text-xs text-gray-500 italic">
                          Awaiting doctors review.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </ProtectedRoute>
  );
}
