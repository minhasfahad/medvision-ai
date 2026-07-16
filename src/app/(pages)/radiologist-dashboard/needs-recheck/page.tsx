"use client";

import { useEffect, useState } from "react";
import api from "@/src/lib/axios";
import ProtectedRoute from "@/src/components/ProtectedRoute";
import Image from "next/image";
import { AlertTriangle, CheckCircle2, Loader2 } from "lucide-react";
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

interface ReviewedBy {
  _id: string;
  name: string;
  email: string;
  role: string;
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
  reviewedBy?: ReviewedBy | null;
  createdAt: string;
}

function getStatusBadge(status?: ReviewStatus) {
  if (status === "needs_recheck") {
    return "bg-amber-500/15 text-amber-300 border-amber-500/30";
  }

  if (status === "incorrect") {
    return "bg-red-500/15 text-red-300 border-red-500/30";
  }

  if (status === "unclear") {
    return "bg-orange-500/15 text-orange-300 border-orange-500/30";
  }

  return "bg-gray-500/15 text-gray-300 border-gray-500/30";
}

function getStatusLabel(status?: ReviewStatus) {
  if (status === "needs_recheck") return "Needs Recheck";
  if (status === "incorrect") return "AI Prediction Incorrect";
  if (status === "unclear") return "Image Not Clear";
  return "Needs Attention";
}

export default function NeedsRecheckPage() {
  const [scans, setScans] = useState<ScanResult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const fetchNeedsRecheckScans = async () => {
      try {
        const res = await api.get(
          "/api/radiologist/scans?status=needs_recheck_group",
        );

        if (isMounted && res.data.success) {
          setScans(res.data.data);
        }
      } catch (error) {
        console.error("Failed to fetch needs recheck scans:", error);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchNeedsRecheckScans();

    return () => {
      isMounted = false;
    };
  }, []);

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="flex h-64 items-center justify-center text-white gap-3">
          <Loader2 className="w-5 h-5 text-blue-400 animate-spin" />
          <span className="text-lg font-medium animate-pulse">
            Loading scans that need recheck...
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
              <AlertTriangle className="w-7 h-7 text-red-400" />
              Needs Recheck
            </h1>

            <p className="text-gray-400 mt-2 text-sm">
              Scans marked as unclear, incorrect, or requiring another
              radiologist review.
            </p>
          </div>

          <div className="rounded-xl border border-red-500/30 bg-red-600/10 backdrop-blur-sm px-5 py-3 text-sm text-red-200">
            Needs Attention:{" "}
            <span className="font-bold text-white">{scans.length}</span>
          </div>
        </div>

        {scans.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-10 text-center shadow-xl animate-fade-in-up">
            <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6 text-emerald-400" />
            </div>
            <h2 className="text-xl font-bold text-white">
              No scans need recheck
            </h2>
            <p className="mt-2 text-sm text-gray-400">
              Scans marked as unclear, incorrect, or needing recheck will appear
              here.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 2xl:grid-cols-2 gap-6">
            {scans.map((scan, index) => {
              const status = scan.radiologistReviewStatus;

              return (
                <div
                  key={scan._id}
                  className="rounded-2xl border border-white/10 bg-[#12172a]/80 backdrop-blur-md shadow-xl overflow-hidden hover:border-red-500/30 transition-all duration-300 animate-fade-in-up"
                  style={{ animationDelay: `${index * 80}ms` }}
                >
                  <div className="border-b border-white/10 p-5 flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
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

                    <span
                      className={`w-fit rounded-full border px-3 py-1 text-xs font-bold ${getStatusBadge(
                        status,
                      )}`}
                    >
                      {getStatusLabel(status)}
                    </span>
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

                  <div className="mx-5 mb-5 rounded-xl border border-red-500/20 bg-red-500/10 p-4">
                    <p className="text-xs uppercase tracking-wider text-red-300">
                      Recheck Reason / Radiologist Note
                    </p>

                    <p className="mt-2 text-sm leading-6 text-gray-200">
                      {scan.radiologistComment || "No note added."}
                    </p>

                    <div className="mt-4 rounded-lg border border-white/10 bg-black/20 p-3">
                      <p className="text-xs uppercase tracking-wider text-gray-500">
                        Recommendation
                      </p>
                      <p className="mt-1 text-sm text-gray-200">
                        {scan.radiologistRecommendation ||
                          "No recommendation added."}
                      </p>
                    </div>

                    <div className="mt-4 text-xs text-gray-400">
                      Reviewed By:{" "}
                      <span className="text-white">
                        {scan.reviewedBy?.name || "Radiologist"}
                      </span>
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
