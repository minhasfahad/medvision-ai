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
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Loader2,
  Download,
  RotateCcw,
  CalendarPlus,
  History,
  Sparkles,
  ScanLine,
  UploadCloud,
  Brain,
} from "lucide-react";
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
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-300 text-xs font-semibold mb-4 animate-fade-in-up">
            <ScanLine className="w-3.5 h-3.5" /> YOLO11s-seg Diagnostic Engine
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold mb-2 text-center leading-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-400 to-blue-400 animate-gradient-x">
            MedVision AI Analysis
          </h1>
          <p className="text-gray-400 text-xs sm:text-sm mb-6 sm:mb-8 text-center max-w-md">
            Upload MRI scan for deep learning tumor detection
          </p>

          <div className="bg-white/5 backdrop-blur-sm p-4 sm:p-6 md:p-8 rounded-2xl border border-white/10 w-full max-w-xl lg:max-w-4xl shadow-2xl animate-fade-in-up">
            <h2 className="text-base sm:text-lg font-bold mb-2 flex items-center gap-2 text-white">
              <ShieldCheck className="w-5 h-5 text-blue-400 flex-none" />
              Data & Privacy Notice
            </h2>
            <h4 className="text-xs sm:text-sm text-gray-400 font-normal leading-relaxed mb-6">
              To track your medical history, we securely save your scans and
              results to your profile. By uploading, you acknowledge our Privacy
              Policy and Medical Disclaimer.
            </h4>

            {/* UPLOAD SECTION */}
            <div className="mb-6">
              <label className="flex items-center gap-2 text-xs sm:text-sm font-medium text-gray-300 mb-2">
                <UploadCloud className="w-4 h-4 text-purple-400" />
                Select MRI Image
              </label>
              <div className="rounded-xl border border-dashed border-white/15 bg-white/5 hover:border-purple-500/40 hover:bg-white/[0.07] transition-all p-3 sm:p-4">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setSelectedImage(e.target.files?.[0] || null)}
                  className="block w-full text-xs sm:text-sm text-gray-400
              file:mr-3 sm:file:mr-4 file:py-2 file:px-3 sm:file:py-2.5 sm:file:px-4
              file:rounded-lg file:border-0
              file:text-xs sm:file:text-sm file:font-semibold
              file:bg-gradient-to-r file:from-blue-600 file:to-purple-600 file:text-white
              hover:file:from-blue-500 hover:file:to-purple-500 transition-all cursor-pointer file:cursor-pointer"
                />
              </div>
            </div>

            <button
              onClick={handleUpload}
              disabled={loading || !selectedImage}
              className="w-full border-none bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white py-3 sm:py-3.5 rounded-xl text-sm sm:text-base font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 shadow-[0_0_30px_rgba(37,99,235,0.4)] hover:shadow-[0_0_40px_rgba(168,85,247,0.5)] hover:-translate-y-1"
            >
              {loading ? (
                <span className="flex items-center justify-center text-sm sm:text-base">
                  <Loader2 className="animate-spin -ml-1 mr-3 h-4 sm:h-5 w-4 sm:w-5 text-white" />
                  Processing Scan...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <Brain className="w-4 h-4 sm:w-5 sm:h-5" />
                  Analyze MRI Scan
                </span>
              )}
            </button>

            {/* Status Alerts */}
            {saveStatus.type && (
              <div
                className={`mt-4 p-3 sm:p-4 rounded-lg flex items-center gap-2.5 sm:gap-3 border text-xs sm:text-sm animate-fade-in-up ${
                  saveStatus.type === "success"
                    ? "bg-green-900/20 border-green-500/40 text-green-400"
                    : "bg-red-900/20 border-red-500/40 text-red-400"
                }`}
              >
                {saveStatus.type === "success" ? (
                  <CheckCircle2 className="w-5 h-5 text-green-500 flex-none" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-500 flex-none" />
                )}
                <p className="font-medium break-words min-w-0">
                  {saveStatus.message}
                </p>
              </div>
            )}

            {/* RESULTS DISPLAY */}
            {analyzedImage && analysisData && (
              <div className="mt-8 sm:mt-10 border-t border-white/10 pt-6 sm:pt-8 animate-fade-in-up w-full">
                {/* Result Header */}
                <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.25em] text-purple-300 font-bold flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" />
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
                  className="rounded-3xl border border-white/10 bg-[#11162a]/90 backdrop-blur-sm p-4 sm:p-6 shadow-2xl"
                >
                  <div className="grid grid-cols-1 xl:grid-cols-[1fr_420px] gap-6">
                    {/* LEFT: MRI OUTPUT */}
                    <div className="rounded-2xl border border-purple-500/20 bg-[#0d1222] p-4 hover:border-purple-500/40 transition-colors">
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
                        <div
                          className="rounded-xl border border-gray-800 bg-black/20 p-3 hover:border-white/20 transition-colors animate-fade-in-up"
                          style={{ animationDelay: "0ms" }}
                        >
                          <p className="text-[10px] uppercase tracking-wider text-gray-500">
                            Model
                          </p>
                          <p className="mt-1 text-sm font-bold text-white">
                            YOLO11s-seg
                          </p>
                        </div>

                        <div
                          className="rounded-xl border border-gray-800 bg-black/20 p-3 hover:border-white/20 transition-colors animate-fade-in-up"
                          style={{ animationDelay: "80ms" }}
                        >
                          <p className="text-[10px] uppercase tracking-wider text-gray-500">
                            Review Status
                          </p>
                          <p className="mt-1 text-sm font-bold text-purple-300">
                            Pending
                          </p>
                        </div>

                        <div
                          className="rounded-xl border border-gray-800 bg-black/20 p-3 hover:border-white/20 transition-colors animate-fade-in-up"
                          style={{ animationDelay: "160ms" }}
                        >
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
                      <div className="rounded-2xl border border-white/10 bg-white/5 p-4 hover:border-white/20 transition-colors">
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

                      <div className="rounded-2xl border border-purple-500/20 bg-purple-900/10 p-4 hover:border-purple-500/40 transition-colors">
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

                      <div className="rounded-2xl border border-amber-500/20 bg-amber-900/10 px-4 py-3 flex items-start gap-2.5">
                        <ShieldCheck className="w-4 h-4 text-amber-300 flex-none mt-0.5" />
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
                    className="w-full rounded-2xl bg-emerald-600 hover:bg-emerald-500 px-5 py-3 text-sm sm:text-base font-bold text-white transition-all shadow-lg shadow-emerald-900/30 hover:-translate-y-1 flex items-center justify-center gap-2 disabled:opacity-70 disabled:hover:translate-y-0"
                  >
                    {isDownloading ? (
                      <>
                        <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Download className="w-4 h-4 sm:w-5 sm:h-5" />
                        Download PDF Report
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => {
                      setSelectedImage(null);
                      setAnalyzedImage(null);
                      setAnalysisData(null);
                      setSaveStatus({ type: null, message: "" });
                    }}
                    className="w-full rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 px-5 py-3 text-sm sm:text-base font-bold text-white transition-all hover:-translate-y-1 flex items-center justify-center gap-2"
                  >
                    <RotateCcw className="w-4 h-4 sm:w-5 sm:h-5" />
                    Clear & Scan New
                  </button>

                  {user?.role?.trim().toLowerCase() === "patient" ? (
                    <button
                      className="w-full rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 px-5 py-3 text-sm sm:text-base font-bold text-white transition-all shadow-[0_0_20px_rgba(37,99,235,0.35)] hover:shadow-[0_0_30px_rgba(168,85,247,0.5)] hover:-translate-y-1 flex items-center justify-center gap-2"
                      onClick={handleBookRedirect}
                    >
                      <CalendarPlus className="w-4 h-4 sm:w-5 sm:h-5" />
                      Book Appointment
                    </button>
                  ) : (
                    <Link
                      href="/patient-dashboard/my-history"
                      className="w-full"
                    >
                      <button className="w-full rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 px-5 py-3 text-sm sm:text-base font-bold text-gray-200 hover:text-white transition-all hover:-translate-y-1 flex items-center justify-center gap-2">
                        <History className="w-4 h-4 sm:w-5 sm:h-5" />
                        View Scan History
                      </button>
                    </Link>
                  )}
                </div>
              </div>
            )}

            <h5 className="text-center pt-8 sm:pt-10 text-xs sm:text-[14px] text-blue-400/80 leading-normal max-w-2xl mx-auto">
              AI-generated result. Accuracy may vary. Please consult a medical
              professional for an official clinical diagnosis.{" "}
            </h5>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
