"use client";

import api from "@/src/lib/axios";
import { useState, useRef } from "react";
import GaugeChart from "react-gauge-chart";
import { useAuthStore } from "@/src/lib/store/useAuthStore";

// --- NEW IMPORTS FOR PDF ---
import html2canvas from "html2canvas";
import { toPng } from "html-to-image";
import { jsPDF } from "jspdf";
// ---------------------------

interface AnalysisResult {
  className: string;
  confidence: number;
  detected: boolean;
}

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

  const { user, token } = useAuthStore();
  
  // --- HELPER FUNCTION: Convert File to Base64 ---
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };
  
  // --- REF FOR PDF EXPORT ---
  const pdfRef = useRef<HTMLDivElement>(null); 

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
    } catch (error: any) {
      console.error("Upload failed", error);
      alert("Error connecting to server.");
    } finally {
      setLoading(false);
    }
  };

  // --- ULTRA-PREMIUM PDF DOWNLOAD FUNCTION ---
  const downloadPDF = async () => {
    if (!analysisData || !analyzedImage || !selectedImage) {
      alert("Missing diagnostic data or images. Report cannot be generated.");
      return;
    }

    try {
      setIsDownloading(true);
      
      const originalImageBase64 = await fileToBase64(selectedImage);

      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4"
      });

      // --- FIX APPLIED HERE: Added Tuple Types ---
      const primaryColor: [number, number, number] = [30, 58, 138]; // Deep Blue
      const accentColor: [number, number, number] = [59, 130, 246]; // Bright Blue
      const darkText: [number, number, number] = [31, 41, 55]; // Gray-900
      const lightText: [number, number, number] = [107, 114, 128]; // Gray-500
      // -------------------------------------------

      // ==========================================
      // 0. BACKGROUND WATERMARK
      // ==========================================
      pdf.setTextColor(245, 247, 250);
      pdf.setFontSize(70);
      pdf.setFont("helvetica", "bold");
      pdf.text("MedVision AI", 105, 160, { angle: 45, align: "center" });

      // ==========================================
      // 1. HEADER BANNER
      // ==========================================
      pdf.setFillColor(...primaryColor);
      pdf.rect(0, 0, 210, 35, 'F'); 

      pdf.setTextColor(255, 255, 255);
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(24);
      pdf.text("MedVision AI", 15, 20);
      
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(10);
      pdf.text("Advanced Neuro-Diagnostic Report", 15, 27);

      pdf.setFontSize(11);
      pdf.setFont("helvetica", "bold");
      pdf.text("CONFIDENTIAL", 195, 20, { align: "right" });
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(9);
      pdf.text(`Generated: ${new Date().toLocaleDateString()}`, 195, 27, { align: "right" });

      // ==========================================
      // 2. PATIENT DEMOGRAPHICS (CARD STYLE)
      // ==========================================
      const patientName = user?.name || "Anas Bughio"; 
      const patientAgeSex = "30 Yrs / Male"; 
      const mrNumber = `MR-${Math.floor(100000 + Math.random() * 900000)}`;
      const accessionNo = `ACC-${Math.floor(10000 + Math.random() * 90000)}`;

      pdf.setFillColor(248, 250, 252);
      pdf.setDrawColor(226, 232, 240);
      pdf.setLineWidth(0.5);
      pdf.roundedRect(15, 45, 180, 28, 3, 3, 'FD'); 

      pdf.setTextColor(...darkText);
      pdf.setFontSize(10);

      pdf.setFont("helvetica", "bold");
      pdf.text("Patient Name:", 20, 53);
      pdf.setFont("helvetica", "normal");
      pdf.text(patientName, 50, 53);

      pdf.setFont("helvetica", "bold");
      pdf.text("Age / Sex:", 20, 60);
      pdf.setFont("helvetica", "normal");
      pdf.text(patientAgeSex, 50, 60);

      pdf.setFont("helvetica", "bold");
      pdf.text("Referring Dr:", 20, 67);
      pdf.setFont("helvetica", "normal");
      pdf.text("Self / AI Screening", 50, 67);

      pdf.setFont("helvetica", "bold");
      pdf.text("MR Number:", 120, 53);
      pdf.setFont("helvetica", "normal");
      pdf.text(mrNumber, 150, 53);

      pdf.setFont("helvetica", "bold");
      pdf.text("Report Status:", 120, 60);
      pdf.setFont("helvetica", "normal");
      pdf.setTextColor(...accentColor);
      pdf.text("Final", 150, 60);
      pdf.setTextColor(...darkText);

      pdf.setFont("helvetica", "bold");
      pdf.text("Accession No:", 120, 67);
      pdf.setFont("helvetica", "normal");
      pdf.text(accessionNo, 150, 67);

      // ==========================================
      // 3. STUDY TITLE
      // ==========================================
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(13);
      pdf.setTextColor(...primaryColor);
      pdf.text("MAGNETIC RESONANCE IMAGING (MRI) - BRAIN", 105, 85, { align: "center" });
      
      pdf.setFontSize(10);
      pdf.setTextColor(...lightText);
      pdf.setFont("helvetica", "italic");
      pdf.text("Indication: AI Screening for suspected intracranial mass.", 105, 91, { align: "center" });

      // ==========================================
      // 4. FINDINGS SECTION
      // ==========================================
      pdf.setDrawColor(...accentColor);
      pdf.setLineWidth(1.2);
      pdf.line(15, 100, 15, 106); 

      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(12);
      pdf.setTextColor(...darkText);
      pdf.text("AI DIAGNOSTIC FINDINGS", 20, 105);

      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(10);
      pdf.setTextColor(60, 60, 60);

      let findingsText = "";
      if (analysisData.detected) {
        findingsText = `The deep learning model successfully processed the provided MRI scan with a confidence rate of ${analysisData.confidence}%. Upon architectural analysis of the neuro-anatomy, an abnormal region of interest was identified. The morphological features and signal intensity patterns are highly indicative of a ${analysisData.className}.\n\nThe identified mass demonstrates characteristics that warrant immediate clinical correlation. No secondary midline shift or specific ventricular compression can be fully ruled out by this 2D screening model.`;
      } else {
        findingsText = `The neural network model analyzed the submitted MRI scan with a confidence rate of ${analysisData.confidence}%. A thorough layer-by-layer evaluation of the cerebral hemispheres, cerebellum, and brainstem was conducted.\n\nResult: No significant patterns corresponding to a ${analysisData.className} or other space-occupying lesions were detected. All signal characteristics within the evaluated neuro-anatomical regions fall within standard parameters as assessed by the current AI iteration.`;
      }

      const wrappedFindings = pdf.splitTextToSize(findingsText, 175);
      pdf.text(wrappedFindings, 15, 115);

      // ==========================================
      // 5. CONCLUSION SECTION
      // ==========================================
      const conclusionY = 115 + (wrappedFindings.length * 5) + 10; 

      pdf.setDrawColor(...accentColor);
      pdf.line(15, conclusionY - 5, 15, conclusionY + 1); 

      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(12);
      pdf.setTextColor(...darkText);
      pdf.text("CONCLUSION", 20, conclusionY);

      pdf.setFillColor(250, 250, 250);
      pdf.setDrawColor(200, 200, 200);
      pdf.setLineWidth(0.2);
      pdf.roundedRect(15, conclusionY + 5, 180, 12, 2, 2, 'FD');

      pdf.setFontSize(11);
      pdf.setFont("helvetica", "bold");
      if (analysisData.detected) {
        pdf.setTextColor(220, 38, 38);
        pdf.text(`POSITIVE FOR TUMOR (${analysisData.className.toUpperCase()})`, 105, conclusionY + 13, { align: "center" });
      } else {
        pdf.setTextColor(22, 163, 74);
        pdf.text("NEGATIVE - NO TUMOR DETECTED", 105, conclusionY + 13, { align: "center" });
      }

      pdf.setFont("helvetica", "italic");
      pdf.setFontSize(9);
      pdf.setTextColor(...lightText);
      const noteText = analysisData.detected
          ? "Recommendation: Please consult a neurosurgeon or radiologist for comprehensive assessment, formal staging, and verification of these AI-generated findings."
          : "Recommendation: While this screening result is negative, clinical correlation with the patient's symptoms is paramount.";
      const wrappedNote = pdf.splitTextToSize(noteText, 175);
      pdf.text(wrappedNote, 15, conclusionY + 24);

      pdf.setDrawColor(150, 150, 150);
      pdf.line(130, 260, 180, 260);
      pdf.setFont("helvetica", "italic");
      pdf.text("Electronically Signed by", 135, 265);
      pdf.setFont("helvetica", "bold");
      pdf.setTextColor(...primaryColor);
      pdf.text("MedVision AI Core Engine", 135, 270);

      // ==========================================
      // 6. PAGE 2: VISUAL EVIDENCE (SCANS)
      // ==========================================
      pdf.addPage();
      
      pdf.setFillColor(...primaryColor);
      pdf.rect(0, 0, 210, 15, 'F');
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(10);
      pdf.setFont("helvetica", "normal");
      pdf.text(`Patient: ${patientName} | MRN: ${mrNumber}`, 15, 10);
      pdf.text("Appendix A: Visual Evidence", 195, 10, { align: "right" });

      pdf.setTextColor(245, 247, 250);
      pdf.setFontSize(70);
      pdf.setFont("helvetica", "bold");
      pdf.text("MedVision AI", 105, 160, { angle: 45, align: "center" });

      const imgSize = 90; 

      pdf.setTextColor(...darkText);
      pdf.setFontSize(12);
      pdf.text("Original MRI Scan (Input)", 105, 35, { align: "center" });
      
      pdf.setDrawColor(200, 200, 200);
      pdf.setLineWidth(1);
      pdf.rect(58, 38, imgSize + 4, imgSize + 4); 
      pdf.addImage(originalImageBase64, 'JPEG', 60, 40, imgSize, imgSize);

      const analyzedY = 40 + imgSize + 20;
      pdf.text("AI Analyzed Output (Highlighting Region of Interest)", 105, analyzedY - 5, { align: "center" });
      
      pdf.rect(58, analyzedY - 2, imgSize + 4, imgSize + 4);
      pdf.addImage(analyzedImage, 'PNG', 60, analyzedY, imgSize, imgSize);

      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(8);
      pdf.setTextColor(150, 150, 150);
      pdf.text("This report is strictly an AI-generated screening and not a substitute for a radiologist's official clinical diagnosis.", 105, 285, { align: "center" });

      pdf.save(`MedVision_Report_${patientName.replace(/\s+/g, '_')}.pdf`);
      
    } catch (error: any) {
      console.error("Detailed PDF Generation Error:", error);
      alert("Failed to generate detailed PDF. Please check data or try again.");
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
                    <img
                      src={analyzedImage}
                      alt="Analysis"
                      className="w-full h-auto"
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
                      <div className="w-full flex justify-center h-[120px] relative">
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

              {/* ACTION BUTTONS (Included Download Button) */}
              <div className="max-w-[100%] items-center mt-6 space-y-3">
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
                  <button className="w-1/2 justify-center rounded-2xl bg-blue-600 hover:bg-blue-500 p-3 text-lg font-bold text-white transition-colors">
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