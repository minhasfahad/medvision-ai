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
import AmbientBackground from "@/src/components/AmbientBackground";
import Reveal from "@/src/components/Reveal";
import SpotlightCard from "@/src/components/SpotlightCard";
import CountUp from "@/src/components/CountUp";
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
  Gauge,
} from "lucide-react";
import DemoNoticeDialog from "@/src/components/DemoNoticeDialog";
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
        message: DEMO_NOTICE,
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
  const hasResult = Boolean(analyzedImage && analysisData);
  const DEMO_NOTICE =
    "Brain MRI scanning is temporarily unavailable on this free-tier demo deployment. The AI analysis module will be available soon. This is not an error.";
  return (
    <ProtectedRoute>
      <div className="relative min-h-screen text-white w-full">
      <DemoNoticeDialog />
        <AmbientBackground />

        <main className="relative pt-20 sm:pt-24 px-4 pb-16 max-w-7xl mx-auto w-full">
          {/* PAGE HEADER */}
          <Reveal className="flex flex-col items-center text-center mb-8 sm:mb-10">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-300 text-xs font-semibold mb-4">
              <ScanLine className="w-3.5 h-3.5" /> YOLO11s-seg Diagnostic Engine
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-5xl font-extrabold mb-2 leading-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-400 to-blue-400 animate-gradient-x">
              MedVision AI Analysis
            </h1>
            <p className="text-gray-400 text-xs sm:text-sm max-w-md">
              Upload MRI scan for deep learning tumor detection
            </p>
          </Reveal>

          {/* WORKSPACE: two-panel layout */}
          <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,380px)_1fr] gap-6 items-start">
            {/* LEFT: UPLOAD / CONTROLS PANEL */}
            <Reveal variant="left" className="lg:sticky lg:top-24">
              <SpotlightCard className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-sm p-5 sm:p-6 shadow-2xl">
                <h2 className="text-base sm:text-lg font-bold mb-2 flex items-center gap-2 text-white">
                  <ShieldCheck className="w-5 h-5 text-blue-400 flex-none" />
                  Data & Privacy Notice
                </h2>
                <h4 className="text-xs sm:text-sm text-gray-400 font-normal leading-relaxed mb-6">
                  To track your medical history, we securely save your scans and
                  results to your profile. By uploading, you acknowledge our
                  Privacy Policy and Medical Disclaimer.
                </h4>

                {/* UPLOAD SECTION — dramatic dropzone */}
                <div className="mb-6">
                  <label className="flex items-center gap-2 text-xs sm:text-sm font-medium text-gray-300 mb-2">
                    <UploadCloud className="w-4 h-4 text-purple-400" />
                    Select MRI Image
                  </label>

                  <label className="group relative flex cursor-pointer flex-col items-center gap-3 rounded-2xl border-2 border-dashed border-white/15 bg-black/20 p-6 sm:p-8 text-center transition-all hover:border-purple-500/50 hover:bg-white/[0.05]">
                    <div className="flex h-12 w-12 flex-none items-center justify-center rounded-2xl border border-purple-500/30 bg-gradient-to-br from-blue-600/20 to-purple-600/20 transition-transform group-hover:scale-110">
                      <UploadCloud className="h-6 w-6 text-purple-300" />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-white">
                        {selectedImage
                          ? selectedImage.name
                          : "Click to select MRI image"}
                      </p>
                      <p className="mt-1 text-xs text-gray-500">
                        {selectedImage
                          ? "Ready to analyze"
                          : "PNG or JPG · deep-learning segmentation"}
                      </p>
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) =>
                        setSelectedImage(e.target.files?.[0] || null)
                      }
                      className="hidden"
                    />
                  </label>
                </div>

                <button
                  onClick={handleUpload}
                  // disabled={loading || !selectedImage}
                  disabled={true}
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
                <div className="mt-4 flex items-start gap-2.5 rounded-lg border border-amber-500/40 bg-amber-900/20 p-3 text-xs text-amber-200 sm:text-sm">
                  <ShieldCheck className="mt-0.5 h-4 w-4 flex-none text-amber-300" />
                  <p className="min-w-0 break-words">{DEMO_NOTICE}</p>
                </div>
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
              </SpotlightCard>
            </Reveal>

            {/* RIGHT: RESULTS / VISUALIZATION PANEL */}
            <Reveal variant="right" delay={100}>
              <div className="relative min-h-[480px] rounded-3xl border border-white/10 bg-[#0f1123]/60 p-5 shadow-2xl backdrop-blur-sm sm:p-8">
                {!hasResult ? (
                  /* IDLE STATE */
                  <div className="flex h-full min-h-[440px] flex-col items-center justify-center gap-4 text-center">
                    <div className="relative flex h-20 w-20 items-center justify-center overflow-hidden rounded-full border border-white/10 bg-white/5">
                      <Brain className="h-9 w-9 text-purple-300/60" />
                      <div className="absolute inset-x-0 -top-2 h-8 bg-gradient-to-b from-transparent via-blue-400/30 to-transparent animate-scan-sweep" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white">
                        Awaiting Your Scan
                      </h3>
                      <p className="mt-2 max-w-sm text-sm text-gray-500">
                        Upload an MRI on the left and run the analysis. Your AI
                        segmentation output, diagnosis, and confidence report
                        will materialize here.
                      </p>
                    </div>
                  </div>
                ) : (
                  <>
                    {/* Result Header */}
                    <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
                      <div>
                        <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.25em] text-purple-300">
                          <Sparkles className="w-3.5 h-3.5" />
                          AI Diagnostic Result
                        </p>
                        <h2 className="mt-2 text-2xl font-extrabold text-white sm:text-3xl">
                          Brain MRI Analysis Completed
                        </h2>
                        <p className="mt-2 max-w-2xl text-xs text-gray-400 sm:text-sm">
                          The scan has been processed by the YOLO11s-seg deep
                          learning model and saved to your medical history. A
                          radiologist review is now pending.
                        </p>
                      </div>

                      <div className="flex flex-col items-end gap-2">
                        <div className="flex items-baseline gap-1 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
                          <CountUp
                            value={analysisData!.confidence}
                            decimals={1}
                            suffix="%"
                            className="text-3xl font-extrabold sm:text-4xl"
                          />
                        </div>
                        <span className="w-fit rounded-full border border-purple-500/30 bg-purple-900/30 px-4 py-2 text-xs font-bold uppercase tracking-wider text-purple-300">
                          Radiology: Pending Review
                        </span>
                      </div>
                    </div>

                    <div
                      ref={pdfRef}
                      className="rounded-3xl border border-white/10 bg-[#11162a]/90 p-4 shadow-2xl backdrop-blur-sm sm:p-6"
                    >
                      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_420px]">
                        {/* LEFT: MRI OUTPUT — the star card */}
                        <div className="spin-border-wrap rounded-2xl">
                          <div className="rounded-2xl border border-purple-500/20 bg-[#0d1222] p-4">
                            <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                              <div>
                                <h3 className="text-sm font-bold uppercase tracking-wider text-purple-300">
                                  AI Segmented Inference
                                </h3>
                                <p className="mt-1 text-xs text-gray-500">
                                  AI segmentation and tumor localization result
                                </p>
                              </div>

                              <span
                                className={`w-fit rounded-full px-3 py-1 text-[10px] font-bold uppercase border ${
                                  analysisData!.detected
                                    ? "border-red-500/30 bg-red-900/20 text-red-300"
                                    : "border-emerald-500/30 bg-emerald-900/20 text-emerald-300"
                                }`}
                              >
                                {analysisData!.detected
                                  ? "Tumor Detected"
                                  : "No Tumor Detected"}
                              </span>
                            </div>

                            <div className="relative h-[340px] overflow-hidden rounded-2xl border border-purple-500/40 bg-black shadow-xl shadow-purple-500/20 sm:h-[420px]">
                              <Image
                                src={analyzedImage!}
                                alt="AI analyzed MRI output"
                                fill
                                unoptimized
                                sizes="(max-width: 1280px) 100vw, 60vw"
                                className="object-contain"
                              />
                              <div className="pointer-events-none absolute inset-x-0 -top-4 h-10 bg-gradient-to-b from-transparent via-blue-400/25 to-transparent animate-scan-sweep" />
                            </div>

                            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
                              <div
                                className="animate-fade-in-up rounded-xl border border-gray-800 bg-black/20 p-3 transition-colors hover:border-white/20"
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
                                className="animate-fade-in-up rounded-xl border border-gray-800 bg-black/20 p-3 transition-colors hover:border-white/20"
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
                                className="animate-fade-in-up rounded-xl border border-gray-800 bg-black/20 p-3 transition-colors hover:border-white/20"
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
                        </div>

                        {/* RIGHT: RESULT DETAILS */}
                        <div className="flex flex-col gap-4">
                          <div className="rounded-2xl border border-white/10 bg-white/5 p-4 transition-colors hover:border-white/20">
                            <h3 className="text-xs font-bold uppercase tracking-wider text-blue-300">
                              Diagnosis Details
                            </h3>

                            <div className="mt-4 space-y-2.5">
                              <div className="flex items-center justify-between gap-4 rounded-xl border border-gray-800 bg-black/20 px-4 py-3">
                                <span className="text-xs uppercase tracking-wider text-gray-500">
                                  Tumor Detected
                                </span>
                                <span
                                  className={`text-base font-extrabold ${
                                    analysisData!.detected
                                      ? "text-red-300"
                                      : "text-emerald-300"
                                  }`}
                                >
                                  {analysisData!.detected ? "YES" : "NO"}
                                </span>
                              </div>

                              <div className="flex items-center justify-between gap-4 rounded-xl border border-gray-800 bg-black/20 px-4 py-3">
                                <span className="text-xs uppercase tracking-wider text-gray-500">
                                  Classification
                                </span>
                                <span
                                  className={`truncate text-base font-extrabold ${
                                    analysisData!.detected
                                      ? "text-purple-300"
                                      : "text-emerald-300"
                                  }`}
                                >
                                  {analysisData!.className}
                                </span>
                              </div>

                              <div className="flex items-center justify-between gap-4 rounded-xl border border-gray-800 bg-black/20 px-4 py-3">
                                <span className="text-xs uppercase tracking-wider text-gray-500">
                                  AI Confidence
                                </span>
                                <span className="text-base font-extrabold text-blue-300">
                                  {analysisData!.confidence}%
                                </span>
                              </div>
                            </div>

                            <div className="mt-4 rounded-xl border border-gray-800 bg-black/20 p-3">
                              <p className="flex items-center justify-center gap-1.5 text-center text-[10px] uppercase tracking-wider text-gray-500">
                                <Gauge className="h-3 w-3" />
                                Confidence Meter
                              </p>

                              <div className="relative mx-auto mt-1 h-28 w-full max-w-[280px]">
                                <GaugeChart
                                  id="gauge-chart-confidence"
                                  nrOfLevels={20}
                                  percent={analysisData!.confidence / 100}
                                  colors={["#FF5F6D", "#FFC371", "#5BE12C"]}
                                  arcWidth={0.3}
                                  textColor="#ffffff"
                                  needleColor="#4c51bf"
                                  needleBaseColor="#4c51bf"
                                  hideText={true}
                                  style={{ width: "100%" }}
                                />

                                <div className="absolute bottom-1 left-1/2 flex -translate-x-1/2 flex-col items-center">
                                  <span className="text-2xl font-extrabold text-white">
                                    {analysisData!.confidence}%
                                  </span>
                                  <span className="text-[9px] uppercase tracking-widest text-gray-400">
                                    Certainty
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="rounded-2xl border border-purple-500/20 bg-purple-900/10 p-4 transition-colors hover:border-purple-500/40">
                            <div className="flex items-center justify-between gap-3">
                              <div>
                                <p className="text-[10px] font-bold uppercase tracking-wider text-purple-300">
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
                              Saved to your history. Radiologist note will
                              appear after review.
                            </p>
                          </div>

                          <div className="flex items-start gap-2.5 rounded-2xl border border-amber-500/20 bg-amber-900/10 px-4 py-3">
                            <ShieldCheck className="mt-0.5 h-4 w-4 flex-none text-amber-300" />
                            <p className="text-xs leading-5 text-amber-100/80">
                              {analysisData!.detected
                                ? "AI detected a suspicious region. Please consult a doctor or radiologist for clinical confirmation."
                                : "No tumor was detected by AI. Clinical verification is still recommended."}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* ACTION BUTTONS */}
                    <div className="mt-6 grid w-full grid-cols-1 gap-3 md:grid-cols-3">
                      <button
                        onClick={downloadPDF}
                        disabled={isDownloading}
                        className="flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-900/30 transition-all hover:-translate-y-1 hover:bg-emerald-500 disabled:hover:translate-y-0 disabled:opacity-70 sm:text-base"
                      >
                        {isDownloading ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin sm:h-5 sm:w-5" />
                            Generating...
                          </>
                        ) : (
                          <>
                            <Download className="h-4 w-4 sm:h-5 sm:w-5" />
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
                        className="flex w-full items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-bold text-white transition-all hover:-translate-y-1 hover:bg-white/10 sm:text-base"
                      >
                        <RotateCcw className="h-4 w-4 sm:h-5 sm:w-5" />
                        Clear & Scan New
                      </button>

                      {user?.role?.trim().toLowerCase() === "patient" ? (
                        <button
                          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 px-5 py-3 text-sm font-bold text-white shadow-[0_0_20px_rgba(37,99,235,0.35)] transition-all hover:-translate-y-1 hover:from-blue-500 hover:to-purple-500 hover:shadow-[0_0_30px_rgba(168,85,247,0.5)] sm:text-base"
                          onClick={handleBookRedirect}
                        >
                          <CalendarPlus className="h-4 w-4 sm:h-5 sm:w-5" />
                          Book Appointment
                        </button>
                      ) : (
                        <Link
                          href="/patient-dashboard/my-history"
                          className="w-full"
                        >
                          <button className="flex w-full items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-bold text-gray-200 transition-all hover:-translate-y-1 hover:bg-white/10 hover:text-white sm:text-base">
                            <History className="h-4 w-4 sm:h-5 sm:w-5" />
                            View Scan History
                          </button>
                        </Link>
                      )}
                    </div>
                  </>
                )}
              </div>
            </Reveal>
          </div>

          <h5 className="mx-auto max-w-2xl pt-8 text-center text-xs leading-normal text-blue-400/80 sm:pt-10 sm:text-[14px]">
            AI-generated result. Accuracy may vary. Please consult a medical
            professional for an official clinical diagnosis.{" "}
          </h5>
        </main>
      </div>
    </ProtectedRoute>
  );
}
