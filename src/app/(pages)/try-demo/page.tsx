"use client";

import api from "@/src/lib/axios";
import { useState, useRef } from "react";
import GaugeChart from "react-gauge-chart";
import { useAuthStore } from "@/src/lib/store/useAuthStore";
import Image from 'next/image';
import { useRouter } from "next/navigation";

// --- IMPORT THE NEW PDF UTILITY ---
// (Make sure this path matches where you saved the file in Step 1)
import { generateDiagnosticPDF, AnalysisResult } from "@/src/lib/utils/pdfGenerator"; 

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
    const query = new URLSearchParams({
      tumor: analysisData.className,
      detected: String(analysisData.detected)
    }).toString();
    router.push(`/appointments?${query}`);
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

      if (!result.success) {
        throw new Error("Server response was not ok");
      }

      if (result.success) {
        setSaveStatus({
          type: "success",
          message: "Results have been securely saved to the Database for your history.",
        });
        setAnalyzedImage(result.image);
        setAnalysisData({
          className: result.class_name,
          confidence: result.confidence,
          detected: result.tumor_detected,
        });
      } else {
        alert("Analysis failed. Please check the Python server.");
      }
    } catch (error) {
      console.error("Upload failed", error);
      alert("Error connecting to server.");
    } finally {
      setLoading(false);
    }
  };

  // --- CLEANED UP PDF DOWNLOAD FUNCTION ---
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
        patientName: user?.name || "Anas Bughio"
      });

    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
      console.error("Detailed PDF Generation Error:", error);
      alert(errorMessage);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="min-h-screen text-white">
      <main className="pt-24 px-4 pb-12 flex flex-col items-center">
        <h1 className="text-3xl font-bold mb-2">MedVision AI Analysis</h1>
        <p className="text-gray-400 mb-8">
          Upload MRI scan for deep learning tumor detection
        </p>

        <div className="bg-white/5 p-8 rounded-2xl border border-white/10 w-full max-w-[60%] shadow-2xl rsults">
          <h2>🛡️ Data & Privacy Notice</h2>
          <h4>
            To track your medical history, we securely save your scans and
            results to your profile. By uploading, you acknowledge our Privacy
            Policy and Medical Disclaimer.
          </h4>
          
          {/* UPLOAD SECTION */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Select MRI Image
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setSelectedImage(e.target.files?.[0] || null)}
              className="block w-full text-sm text-gray-400
                file:mr-4 file:py-2.5 file:px-4
                file:rounded-lg file:border-0
                file:text-sm file:font-semibold
                file:bg-purple-600 file:text-white
                hover:file:bg-purple-500 transition-all"
            />
          </div>

          <button
            onClick={handleUpload}
            disabled={loading || !selectedImage}
            className="w-full border-none bg-blue-600 hover:bg-blue-500 text-white py-3.5 rounded-xl font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-900/20"
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
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
              className={`mt-4 p-4 rounded-lg flex items-center gap-3 border ${
                saveStatus.type === "success"
                  ? "bg-green-900/20 border-green-500 text-green-400"
                  : "bg-red-900/20 border-red-500 text-red-400"
              }`}
            >
              {saveStatus.type === "success" ? (
                <span className="text-xl text-green-500">✅</span>
              ) : (
                <span className="text-xl text-red-500">❌</span>
              )}
              <p className="text-sm font-medium">{saveStatus.message}</p>
            </div>
          )}

          {/* RESULTS DISPLAY */}
          {analyzedImage && analysisData && (
            <div className="mt-10 border-t border-white/10 pt-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
              
              <div ref={pdfRef} className="flex flex-col md:flex-row gap-6 p-4 rounded-xl bg-[#1e1e2f]">
                {/* Image Result */}
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-gray-400 mb-3 uppercase tracking-wider">
                    Visual Output
                  </h3>
                  <div className="rounded-xl overflow-hidden border-2 border-purple-500 shadow-xl shadow-purple-500/20">
                    <Image
                      src={analyzedImage}
                      alt="Analysis"
                      className="w-full h-auto"
                      width={800}  
                      height={800}
                    />
                  </div>
                </div>

                {/* Data Result */}
                <div className="flex-1 flex flex-col justify-center">
                  <h3 className="text-sm font-semibold text-gray-400 mb-3 uppercase tracking-wider">
                    Diagnosis Details
                  </h3>
                  <div className="space-y-4 p-5 bg-white/5 rounded-xl border border-white/10">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400 text-sm">Tumor Detected:</span>
                      <span className="font-bold text-lg">
                        {analysisData.detected ? "✅ YES" : "❌ NO"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400 text-sm">Classification:</span>
                      <span className={`font-bold ${analysisData.detected ? "text-purple-400" : "text-green-400"}`}>
                        {analysisData.className}
                      </span>
                    </div>

                    <div className="flex flex-col items-center justify-center pt-2">
                      <span className="text-gray-400 text-sm mb-2 self-start">AI Confidence:</span>
                      <div className="w-full flex justify-center h-30 relative">
                        <GaugeChart
                          id="gauge-chart1"
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
                        <div className="absolute bottom-4 flex flex-col items-center">
                          <span className="text-3xl font-bold text-white">
                            {analysisData.confidence}%
                          </span>
                          <span className="text-[10px] text-gray-400 uppercase tracking-widest">
                            Certainty
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-2">
                      <p className="text-[11px] leading-relaxed text-gray-500 italic p-5 text-center">
                        {analysisData.detected
                          ? "Note: High-confidence region identified. Consult a radiologist for clinical verification."
                          : "Note: No abnormal tumor mass detected by the current model version."}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* ACTION BUTTONS */}
              <div className="max-w-full items-center mt-6 space-y-3">
                <button
                  onClick={downloadPDF}
                  disabled={isDownloading}
                  className="w-full justify-center rounded-2xl bg-emerald-600 hover:bg-emerald-500 p-3 text-lg font-bold text-white transition-colors shadow-lg flex items-center gap-2"
                >
                  {isDownloading ? (
                    <span className="animate-pulse">⏳ Generating Document...</span>
                  ) : (
                    <span>📥 Download PDF Report</span>
                  )}
                </button>

                <div className="flex gap-4">
                  <button
                    onClick={() => {
                      setAnalyzedImage(null);
                      setAnalysisData(null);
                    }}
                    className="w-1/2 justify-center rounded-2xl bg-[#9150f3e1] hover:bg-[#8042de] p-3 text-lg font-bold text-white transition-colors"
                  >
                    Clear & Scan New
                  </button>
                  <button className="w-1/2 justify-center rounded-2xl bg-blue-600 hover:bg-blue-500 p-3 text-lg font-bold text-white transition-colors" onClick={handleBookRedirect}>
                    Book Appointment
                  </button>
                </div>
              </div>
            </div>
          )}

          <h5 className="text-center pt-10 text-[18px] text-blue-500">
            AI-generated result. Accuracy may vary. Please consult a medical
            professional for an official clinical diagnosis.{" "}
          </h5>
        </div>
      </main>
    </div>
  );
}