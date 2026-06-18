"use client";
import Link from "next/link";
import api from "@/src/lib/axios";
import { useState, useRef } from "react";
import GaugeChart from "react-gauge-chart";
import { useAuthStore } from "@/src/lib/store/useAuthStore";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  generateDiagnosticPDF,
  AnalysisResult,
} from "@/src/lib/utils/pdfGenerator";
import ProtectedRoute from "@/src/components/ProtectedRoute";
export default function TryDemoPage() {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [analyzedImage, setAnalyzedImage] = useState<string | null>(null);
  const [analysisData, setAnalysisData] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [saveStatus, setSaveStatus] = useState<{
    type: "success" | "error" | null;
    message: string;
  }>({
    type: null,
    message: "",
  });
  const router = useRouter();
  const { user } = useAuthStore();
  const pdfRef = useRef<HTMLDivElement>(null);

  const handleBookRedirect = () => {
    if (!analysisData) return;

    const role = user?.role?.trim().toLowerCase();

    if (role !== "patient") {
      alert("Only patients can book appointments from this page.");
      return;
    }

    const query = new URLSearchParams({
      tumor: analysisData.className,
      detected: String(analysisData.detected),
      confidence: String(analysisData.confidence),
    }).toString();

    router.push(`/patient-dashboard/appointments?${query}`);
  };

  const handleUpload = async () => {
    if (!selectedImage) return;
    if (!user || !user.id) {
      alert("Please login first to save your scans.");
      return;
    }
    setLoading(true);
    setAnalyzedImage(null);
    setAnalysisData(null);
    setSaveStatus({ type: null, message: "" });

    const formData = new FormData();
    formData.append("mri_image", selectedImage);
    formData.append("userId", user.id);

    try {
      const response = await api.post("/api/analyze", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      const result = await response.data;

      // Handle Validation Rejection
      if (result.success === false) {
        setSaveStatus({
          type: "error",
          message: result.message || "Image rejected by validation model.",
        });
        setLoading(false);
        return;
      }

      if (result.success) {
        setSaveStatus({
          type: "success",
          message:
            "Results have been securely saved to the Database for your history.",
        });
        setAnalyzedImage(result.image);
        setAnalysisData({
          className: result.class_name,
          confidence: result.confidence,
          detected: result.tumor_detected,
        });
      }
    } catch (error) {
      console.error("Upload failed", error);
      setSaveStatus({
        type: "error",
        message: "Error connecting to server. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const downloadPDF = async () => {
    if (!analysisData || !analyzedImage || !selectedImage) {
      alert("Missing diagnostic data or images. Report cannot be generated.");
      return;
    }

    try {
      setIsDownloading(true);

      await generateDiagnosticPDF({
        selectedImage,
        analyzedImage,
        analysisData,
        patientName: user?.name || "Patient",
      });
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "An unknown error occurred";
      console.error("Detailed PDF Generation Error:", error);
      alert(errorMessage);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen text-white w-full">
        <main className="pt-20 sm:pt-24 px-4 pb-12 flex flex-col items-center w-full">
          <h1 className="text-2xl sm:text-3xl font-bold mb-2 text-center leading-tight">
            MedVision AI Analysis
          </h1>
          <p className="text-gray-400 text-xs sm:text-sm mb-6 sm:mb-8 text-center max-w-md">
            Upload MRI scan for deep learning tumor detection
          </p>

          <div className="bg-white/5 p-4 sm:p-6 md:p-8 rounded-2xl border border-white/10 w-full max-w-xl lg:max-w-4xl shadow-2xl">
            <h2 className="text-base sm:text-lg font-bold mb-2">
              🛡️ Data & Privacy Notice
            </h2>
            <h4 className="text-xs sm:text-sm text-gray-400 font-normal leading-relaxed mb-6">
              To track your medical history, we securely save your scans and
              results to your profile. By uploading, you acknowledge our Privacy
              Policy and Medical Disclaimer.
            </h4>

            {/* UPLOAD SECTION */}
            <div className="mb-6">
              <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-2">
                Select MRI Image
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setSelectedImage(e.target.files?.[0] || null)}
                className="block w-full text-xs sm:text-sm text-gray-400
              file:mr-3 sm:file:mr-4 file:py-2 file:px-3 sm:file:py-2.5 sm:file:px-4
              file:rounded-lg file:border-0
              file:text-xs sm:file:text-sm file:font-semibold
              file:bg-[#9150f3e1] file:text-white
              hover:file:bg-[#8042de] transition-all cursor-pointer file:cursor-pointer"
              />
            </div>

            <button
              onClick={handleUpload}
              disabled={loading || !selectedImage}
              className="w-full border-none bg-blue-600 hover:bg-blue-500 text-white py-3 sm:py-3.5 rounded-xl text-sm sm:text-base font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-900/20"
            >
              {loading ? (
                <span className="flex items-center justify-center text-sm sm:text-base">
                  <svg
                    className="animate-spin -ml-1 mr-3 h-4 sm:h-5 w-4 sm:w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Processing Scan...
                </span>
              ) : (
                "Analyze MRI Scan"
              )}
            </button>

            {/* Status Alerts */}
            {saveStatus.type && (
              <div
                className={`mt-4 p-3 sm:p-4 rounded-lg flex items-center gap-2.5 sm:gap-3 border text-xs sm:text-sm ${
                  saveStatus.type === "success"
                    ? "bg-green-900/20 border-green-500 text-green-400"
                    : "bg-red-900/20 border-red-500 text-red-400"
                }`}
              >
                {saveStatus.type === "success" ? (
                  <span className="text-lg sm:text-xl text-green-500 flex-none">
                    ✅
                  </span>
                ) : (
                  <span className="text-lg sm:text-xl text-red-500 flex-none">
                    ❌
                  </span>
                )}
                <p className="font-medium break-words min-w-0">
                  {saveStatus.message}
                </p>
              </div>
            )}

            {/* RESULTS DISPLAY */}
            {analyzedImage && analysisData && (
              <div className="mt-8 sm:mt-10 border-t border-white/10 pt-6 sm:pt-8 animate-in fade-in slide-in-from-bottom-4 duration-700 w-full">
                {/* Result Header */}
                <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.25em] text-purple-300 font-bold">
                      AI Diagnostic Result
                    </p>
                    <h2 className="mt-2 text-2xl sm:text-3xl font-extrabold text-white">
                      Brain MRI Analysis Completed
                    </h2>
                    <p className="mt-2 text-xs sm:text-sm text-gray-400 max-w-2xl">
                      The scan has been processed by the YOLO11s-seg deep
                      learning model and saved to your medical history. A
                      radiologist review is now pending.
                    </p>
                  </div>

                  <span className="w-fit rounded-full border border-purple-500/30 bg-purple-900/30 px-4 py-2 text-xs font-bold uppercase tracking-wider text-purple-300">
                    Radiology: Pending Review
                  </span>
                </div>

                <div
                  ref={pdfRef}
                  className="rounded-3xl border border-white/10 bg-[#11162a] p-4 sm:p-6 shadow-2xl"
                >
                  <div className="grid grid-cols-1 xl:grid-cols-[1fr_420px] gap-6">
                    {/* LEFT: MRI OUTPUT */}
                    <div className="rounded-2xl border border-purple-500/20 bg-[#0d1222] p-4">
                      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <h3 className="text-sm font-bold text-purple-300 uppercase tracking-wider">
                            Visual Output
                          </h3>
                          <p className="mt-1 text-xs text-gray-500">
                            AI segmentation and tumor localization result
                          </p>
                        </div>

                        <span
                          className={`w-fit rounded-full px-3 py-1 text-[10px] font-bold uppercase border ${
                            analysisData.detected
                              ? "border-red-500/30 bg-red-900/20 text-red-300"
                              : "border-emerald-500/30 bg-emerald-900/20 text-emerald-300"
                          }`}
                        >
                          {analysisData.detected
                            ? "Tumor Detected"
                            : "No Tumor Detected"}
                        </span>
                      </div>

                      <div className="relative h-[340px] sm:h-[420px] rounded-2xl overflow-hidden border border-purple-500/40 bg-black shadow-xl shadow-purple-500/20">
                        <Image
                          src={analyzedImage}
                          alt="AI analyzed MRI output"
                          fill
                          unoptimized
                          sizes="(max-width: 1280px) 100vw, 60vw"
                          className="object-contain"
                        />
                      </div>

                      <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="rounded-xl border border-gray-800 bg-black/20 p-3">
                          <p className="text-[10px] uppercase tracking-wider text-gray-500">
                            Model
                          </p>
                          <p className="mt-1 text-sm font-bold text-white">
                            YOLO11s-seg
                          </p>
                        </div>

                        <div className="rounded-xl border border-gray-800 bg-black/20 p-3">
                          <p className="text-[10px] uppercase tracking-wider text-gray-500">
                            Review Status
                          </p>
                          <p className="mt-1 text-sm font-bold text-purple-300">
                            Pending
                          </p>
                        </div>

                        <div className="rounded-xl border border-gray-800 bg-black/20 p-3">
                          <p className="text-[10px] uppercase tracking-wider text-gray-500">
                            Saved To
                          </p>
                          <p className="mt-1 text-sm font-bold text-blue-300">
                            Medical History
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* RIGHT: RESULT DETAILS */}
                    <div className="flex flex-col gap-4">
                      <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                        <h3 className="text-xs font-bold text-blue-300 uppercase tracking-wider">
                          Diagnosis Details
                        </h3>

                        <div className="mt-4 space-y-2.5">
                          <div className="flex items-center justify-between gap-4 rounded-xl border border-gray-800 bg-black/20 px-4 py-3">
                            <span className="text-xs uppercase tracking-wider text-gray-500">
                              Tumor Detected
                            </span>
                            <span
                              className={`text-base font-extrabold ${
                                analysisData.detected
                                  ? "text-red-300"
                                  : "text-emerald-300"
                              }`}
                            >
                              {analysisData.detected ? "YES" : "NO"}
                            </span>
                          </div>

                          <div className="flex items-center justify-between gap-4 rounded-xl border border-gray-800 bg-black/20 px-4 py-3">
                            <span className="text-xs uppercase tracking-wider text-gray-500">
                              Classification
                            </span>
                            <span
                              className={`text-base font-extrabold truncate ${
                                analysisData.detected
                                  ? "text-purple-300"
                                  : "text-emerald-300"
                              }`}
                            >
                              {analysisData.className}
                            </span>
                          </div>

                          <div className="flex items-center justify-between gap-4 rounded-xl border border-gray-800 bg-black/20 px-4 py-3">
                            <span className="text-xs uppercase tracking-wider text-gray-500">
                              AI Confidence
                            </span>
                            <span className="text-base font-extrabold text-blue-300">
                              {analysisData.confidence}%
                            </span>
                          </div>
                        </div>

                        <div className="mt-4 rounded-xl border border-gray-800 bg-black/20 p-3">
                          <p className="text-[10px] uppercase tracking-wider text-gray-500 text-center">
                            Confidence Meter
                          </p>

                          <div className="relative mx-auto mt-1 h-28 w-full max-w-[280px]">
                            <GaugeChart
                              id="gauge-chart-confidence"
                              nrOfLevels={20}
                              percent={analysisData.confidence / 100}
                              colors={["#FF5F6D", "#FFC371", "#5BE12C"]}
                              arcWidth={0.3}
                              textColor="#ffffff"
                              needleColor="#4c51bf"
                              needleBaseColor="#4c51bf"
                              hideText={true}
                              style={{ width: "100%" }}
                            />

                            <div className="absolute bottom-1 left-1/2 -translate-x-1/2 flex flex-col items-center">
                              <span className="text-2xl font-extrabold text-white">
                                {analysisData.confidence}%
                              </span>
                              <span className="text-[9px] text-gray-400 uppercase tracking-widest">
                                Certainty
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="rounded-2xl border border-purple-500/20 bg-purple-900/10 p-4">
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <p className="text-[10px] uppercase tracking-wider text-purple-300 font-bold">
                              Radiologist Verification
                            </p>
                            <h4 className="mt-1 text-sm font-bold text-white">
                              Pending Professional Review
                            </h4>
                          </div>

                          <span className="rounded-full border border-purple-500/30 bg-purple-900/30 px-3 py-1 text-[9px] font-bold uppercase text-purple-300">
                            Pending
                          </span>
                        </div>

                        <p className="mt-3 text-xs leading-5 text-gray-400">
                          Saved to your history. Radiologist note will appear
                          after review.
                        </p>
                      </div>

                      <div className="rounded-2xl border border-amber-500/20 bg-amber-900/10 px-4 py-3">
                        <p className="text-xs leading-5 text-amber-100/80">
                          {analysisData.detected
                            ? "AI detected a suspicious region. Please consult a doctor or radiologist for clinical confirmation."
                            : "No tumor was detected by AI. Clinical verification is still recommended."}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* ACTION BUTTONS */}
                <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-3 w-full">
                  <button
                    onClick={downloadPDF}
                    disabled={isDownloading}
                    className="w-full rounded-2xl bg-emerald-600 hover:bg-emerald-500 px-5 py-3 text-sm sm:text-base font-bold text-white transition-colors shadow-lg flex items-center justify-center gap-2 disabled:opacity-70"
                  >
                    {isDownloading
                      ? "⏳ Generating..."
                      : "📥 Download PDF Report"}
                  </button>

                  <button
                    onClick={() => {
                      setSelectedImage(null);
                      setAnalyzedImage(null);
                      setAnalysisData(null);
                      setSaveStatus({ type: null, message: "" });
                    }}
                    className="w-full rounded-2xl bg-[#9150f3e1] hover:bg-[#8042de] px-5 py-3 text-sm sm:text-base font-bold text-white transition-colors"
                  >
                    Clear & Scan New
                  </button>

                  {user?.role?.trim().toLowerCase() === "patient" ? (
                    <button
                      className="w-full rounded-2xl bg-blue-600 hover:bg-blue-500 px-5 py-3 text-sm sm:text-base font-bold text-white transition-colors"
                      onClick={handleBookRedirect}
                    >
                      Book Appointment
                    </button>
                  ) : (
                    <Link
                      href="/patient-dashboard/my-history"
                      className="w-full"
                    >
                      <button className="w-full rounded-2xl border border-gray-700 bg-gray-800/60 hover:bg-gray-700 px-5 py-3 text-sm sm:text-base font-bold text-gray-200 transition-colors">
                        View Scan History
                      </button>
                    </Link>
                  )}
                </div>
              </div>
            )}

            <h5 className="text-center pt-8 sm:pt-10 text-xs sm:text-[14px] text-blue-500/80 leading-normal max-w-2xl mx-auto">
              AI-generated result. Accuracy may vary. Please consult a medical
              professional for an official clinical diagnosis.{" "}
            </h5>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
