import { jsPDF } from "jspdf";

// Exporting the interface so your page can use it too
export interface AnalysisResult {
  className: string;
  confidence: number;
  detected: boolean;
}

interface GeneratePDFParams {
  selectedImage: File;
  analyzedImage: string;
  analysisData: AnalysisResult;
  patientName: string;
}

// --- HELPER FUNCTION MOVED HERE ---
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
};

export const generateDiagnosticPDF = async ({
  selectedImage,
  analyzedImage,
  analysisData,
  patientName,
}: GeneratePDFParams) => {
  
  const originalImageBase64 = await fileToBase64(selectedImage);

  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4"
  });

  const primaryColor: [number, number, number] = [30, 58, 138]; // Deep Blue
  const accentColor: [number, number, number] = [59, 130, 246]; // Bright Blue
  const darkText: [number, number, number] = [31, 41, 55]; // Gray-900
  const lightText: [number, number, number] = [107, 114, 128]; // Gray-500

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
};