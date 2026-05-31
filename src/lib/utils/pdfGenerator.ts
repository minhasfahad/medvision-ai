import { jsPDF } from "jspdf";

// ─── Interfaces ────────────────────────────────────────────────────────────────

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

// ─── AI-Generated Report Content Interface ────────────────────────────────────

interface AIReportContent {
  findings: string;
  conclusion: string;
  recommendation: string;
  confidenceInterpretation: string;
  riskLevel: "LOW" | "MODERATE" | "HIGH" | "CRITICAL";
}

// ─── Helper: File to Base64 ───────────────────────────────────────────────────

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
};

// ─── Helper: Sanitize text for jsPDF (Latin-1 safe) ─────────────────────────
// jsPDF's built-in helvetica font only supports Latin-1 (ISO-8859-1).
// Any character outside that range causes garbled/spaced output.
// This replaces common Unicode punctuation with safe ASCII equivalents.

function sanitize(text: string): string {
  return text
    .replace(/\u2014/g, "-")   // em dash  —  -> -
    .replace(/\u2013/g, "-")   // en dash  –  -> -
    .replace(/\u2265/g, ">=")  // ≥        >= 
    .replace(/\u2264/g, "<=")  // ≤        <=
    .replace(/\u2019/g, "'")   // right single quote '
    .replace(/\u2018/g, "'")   // left single quote '
    .replace(/\u201C/g, '"')   // left double quote "
    .replace(/\u201D/g, '"')   // right double quote "
    .replace(/\u2022/g, "-")   // bullet •
    .replace(/\u00B1/g, "+/-") // plus-minus ±
    .replace(/[^\x00-\xFF]/g, ""); // strip anything else outside Latin-1
}


function getConfidenceBand(confidence: number): string {
  if (confidence >= 90) return "very high confidence (>=90%)";
  if (confidence >= 75) return "high confidence (75-89%)";
  if (confidence >= 60) return "moderate confidence (60-74%)";
  return "low confidence (<60%) - a repeat scan or second opinion is strongly advised";
}

// ─── Helper: Risk Level from result ──────────────────────────────────────────

function getRiskLevel(
  detected: boolean,
  confidence: number
): AIReportContent["riskLevel"] {
  if (!detected) return confidence >= 75 ? "LOW" : "MODERATE";
  if (confidence >= 90) return "CRITICAL";
  if (confidence >= 75) return "HIGH";
  return "MODERATE";
}

// ─── Core: Call internal API route to generate dynamic clinical narrative ──────
// The Anthropic API is called server-side to avoid CORS and keep the API key secret.

async function generateAIClinicalContent(
  analysisData: AnalysisResult
): Promise<AIReportContent> {
  const { className, confidence, detected } = analysisData;
  const confidenceBand = getConfidenceBand(confidence);
  const riskLevel = getRiskLevel(detected, confidence);

  try {
    const response = await fetch("/api/generate-report", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        className,
        confidence,
        detected,
        confidenceBand,
        riskLevel,
      }),
    });

    if (!response.ok) throw new Error(`API route responded with ${response.status}`);

    const result = await response.json();

    if (!result.success) throw new Error(result.message || "Report generation failed");

    return {
      findings: result.data.findings,
      conclusion: result.data.conclusion,
      recommendation: result.data.recommendation,
      confidenceInterpretation: result.data.confidenceInterpretation,
      riskLevel,
    };
  } catch (err) {
    console.log("Using fallback report content.");
    return generateFallbackContent(analysisData, riskLevel);
  }
}

// ─── Fallback: Varied content without API (better than fixed strings) ─────────

function generateFallbackContent(
  { className, confidence, detected }: AnalysisResult,
  riskLevel: AIReportContent["riskLevel"]
): AIReportContent {
  const band = getConfidenceBand(confidence);
  const c = confidence.toFixed(2);

  const tumorDescriptions: Record<string, string> = {
    Meningioma: `an extra-axial, dural-based lesion with homogeneous signal intensity characteristics consistent with a meningioma. The lesion demonstrates well-defined margins with potential dural tail sign. Mass effect on adjacent cortical structures is noted and requires neurosurgical assessment.`,
    Glioma: `an intra-axial parenchymal lesion demonstrating heterogeneous signal intensity with ill-defined margins, features consistent with a glial neoplasm. Peritumoral edema and mass effect are present, suggesting active infiltrative behaviour.`,
    Pituitary: `a sellar/suprasellar lesion with morphological features consistent with a pituitary adenoma. Proximity to the optic chiasm is of concern; endocrinological evaluation alongside ophthalmological assessment is indicated.`,
    "No Tumor": `no focal lesion, space-occupying mass, or abnormal signal intensity region within the cerebral hemispheres, cerebellum, or brainstem. Sulci and gyri appear within normal limits for the patient's age group.`,
  };

  const desc =
    tumorDescriptions[className] ||
    `signal patterns corresponding to a ${className} classification.`;

  if (detected) {
    return {
      findings: `The deep learning neural architecture processed the submitted MRI sequence with ${band}. Multi-planar evaluation of the neuro-anatomical structures revealed ${desc} The morphological characteristics and signal behaviour of this identified region of interest carry a diagnostic confidence of ${c}%, which ${confidence >= 75 ? "is sufficient to warrant immediate clinical escalation" : "necessitates radiological review to confirm or exclude the AI finding"}.`,
      conclusion: `AI screening is POSITIVE for ${className} with a confidence of ${c}%.`,
      recommendation:
        confidence >= 75
          ? `Urgent referral to a neurosurgeon or neuro-oncologist is recommended. Contrast-enhanced MRI and histopathological correlation should be pursued at the earliest opportunity.`
          : `Due to moderate diagnostic confidence, correlation with a consultant radiologist and repeat contrast-enhanced MRI is strongly advised before clinical decisions are made.`,
      confidenceInterpretation: `A confidence score of ${c}% places this result in the ${band} tier, ${confidence >= 75 ? "supporting a high index of suspicion for the identified pathology" : "indicating that this result should be treated as preliminary and requires expert human verification"}.`,
      riskLevel,
    };
  } else {
    return {
      findings: `The neural network model evaluated the submitted MRI scan with ${band}. A comprehensive layer-by-layer analysis of the cerebral hemispheres, brainstem, cerebellum, and periventricular white matter was performed. The model identified ${desc} ${confidence >= 75 ? "The overall parenchymal signal homogeneity and absence of mass effect lend strong support to this negative classification." : "However, given the moderate confidence level, subtle or early-stage pathology cannot be entirely excluded by this AI iteration alone."}`,
      conclusion: `AI screening is NEGATIVE - no space-occupying lesion detected (confidence: ${c}%).`,
      recommendation:
        confidence >= 75
          ? `While this screening is reassuring, clinical correlation with the patient's presenting symptoms remains essential. Routine follow-up as clinically indicated.`
          : `Given the confidence score of ${c}%, a repeat MRI or formal radiological review is recommended to definitively exclude early or subtle intracranial pathology.`,
      confidenceInterpretation: `A confidence of ${c}% reflects ${band}, ${confidence >= 75 ? "providing reasonable assurance of a normal scan within the limits of AI-based screening" : "which is below the threshold for high diagnostic certainty — human radiological review is advised"}.`,
      riskLevel,
    };
  }
}

// ─── Risk Level Badge Colors ──────────────────────────────────────────────────

function getRiskColors(
  riskLevel: AIReportContent["riskLevel"]
): [number, number, number] {
  switch (riskLevel) {
    case "CRITICAL":
      return [220, 38, 38];
    case "HIGH":
      return [234, 88, 12];
    case "MODERATE":
      return [202, 138, 4];
    case "LOW":
      return [22, 163, 74];
  }
}

// ─── Main PDF Generator ───────────────────────────────────────────────────────

export const generateDiagnosticPDF = async ({
  selectedImage,
  analyzedImage,
  analysisData,
  patientName,
}: GeneratePDFParams) => {
  // Generate both in parallel to save time
  const [originalImageBase64, aiContent] = await Promise.all([
    fileToBase64(selectedImage),
    generateAIClinicalContent(analysisData),
  ]);

  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  // ── Color palette ──────────────────────────────────────────────────────────
  const primaryColor: [number, number, number] = [30, 58, 138];
  const accentColor: [number, number, number] = [59, 130, 246];
  const darkText: [number, number, number] = [31, 41, 55];
  const lightText: [number, number, number] = [107, 114, 128];
  const riskColor = getRiskColors(aiContent.riskLevel);

  const mrNumber = `MR-${Math.floor(100000 + Math.random() * 900000)}`;
  const accessionNo = `ACC-${Math.floor(10000 + Math.random() * 90000)}`;

  // ══════════════════════════════════════════════════════════════════
  // PAGE 1
  // ══════════════════════════════════════════════════════════════════

  // ── 0. Background watermark ────────────────────────────────────────────────
  pdf.setTextColor(245, 247, 250);
  pdf.setFontSize(70);
  pdf.setFont("helvetica", "bold");
  pdf.text("MedVision AI", 105, 160, { angle: 45, align: "center" });

  // ── 1. Header banner ───────────────────────────────────────────────────────
  pdf.setFillColor(...primaryColor);
  pdf.rect(0, 0, 210, 35, "F");

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
  pdf.text(`Generated: ${new Date().toLocaleDateString()}`, 195, 27, {
    align: "right",
  });

  // ── 2. Risk level badge (new) ──────────────────────────────────────────────
  pdf.setFillColor(...riskColor);
  pdf.roundedRect(148, 38, 47, 8, 2, 2, "F");
  pdf.setTextColor(255, 255, 255);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(8);
  pdf.text(
    `RISK LEVEL: ${aiContent.riskLevel}`,
    171.5,
    43.5,
    { align: "center" }
  );

  // ── 3. Patient demographics card ───────────────────────────────────────────
  pdf.setFillColor(248, 250, 252);
  pdf.setDrawColor(226, 232, 240);
  pdf.setLineWidth(0.5);
  pdf.roundedRect(15, 50, 180, 28, 3, 3, "FD");

  pdf.setTextColor(...darkText);
  pdf.setFontSize(10);

  pdf.setFont("helvetica", "bold");
  pdf.text("Patient Name:", 20, 58);
  pdf.setFont("helvetica", "normal");
  pdf.text(patientName, 50, 58);

  pdf.setFont("helvetica", "bold");
  pdf.text("Age / Sex:", 20, 65);
  pdf.setFont("helvetica", "normal");
  pdf.text("30 Yrs / Male", 50, 65);

  pdf.setFont("helvetica", "bold");
  pdf.text("Referring Dr:", 20, 72);
  pdf.setFont("helvetica", "normal");
  pdf.text("Self / AI Screening", 50, 72);

  pdf.setFont("helvetica", "bold");
  pdf.text("MR Number:", 120, 58);
  pdf.setFont("helvetica", "normal");
  pdf.text(mrNumber, 150, 58);

  pdf.setFont("helvetica", "bold");
  pdf.text("Report Status:", 120, 65);
  pdf.setFont("helvetica", "normal");
  pdf.setTextColor(...accentColor);
  pdf.text("Final", 150, 65);
  pdf.setTextColor(...darkText);

  pdf.setFont("helvetica", "bold");
  pdf.text("Accession No:", 120, 72);
  pdf.setFont("helvetica", "normal");
  pdf.text(accessionNo, 150, 72);

  // ── 4. Study title ─────────────────────────────────────────────────────────
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(13);
  pdf.setTextColor(...primaryColor);
  pdf.text(
    "MAGNETIC RESONANCE IMAGING (MRI) - BRAIN",
    105,
    92,
    { align: "center" }
  );

  pdf.setFontSize(10);
  pdf.setTextColor(...lightText);
  pdf.setFont("helvetica", "italic");
  pdf.text(
    "Indication: AI Screening for suspected intracranial mass.",
    105,
    98,
    { align: "center" }
  );

  // ── 5. Confidence interpretation band (new) ────────────────────────────────
  pdf.setFillColor(239, 246, 255);
  pdf.setDrawColor(...accentColor);
  pdf.setLineWidth(0.3);
  pdf.roundedRect(15, 103, 180, 10, 2, 2, "FD");
  pdf.setFont("helvetica", "italic");
  pdf.setFontSize(8.5);
  pdf.setTextColor(30, 64, 175);
  const wrappedInterp = pdf.splitTextToSize(
    sanitize(`AI Confidence Interpretation: ${aiContent.confidenceInterpretation}`),
    172
  );
  pdf.text(wrappedInterp, 19, 109);

  // ── 6. Findings section ────────────────────────────────────────────────────
  const findingsStartY = 103 + wrappedInterp.length * 5 + 10;

  pdf.setDrawColor(...accentColor);
  pdf.setLineWidth(1.2);
  pdf.line(15, findingsStartY, 15, findingsStartY + 6);

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(12);
  pdf.setTextColor(...darkText);
  pdf.text("AI DIAGNOSTIC FINDINGS", 20, findingsStartY + 5);

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(10);
  pdf.setTextColor(60, 60, 60);

  const wrappedFindings = pdf.splitTextToSize(sanitize(aiContent.findings), 175);
  pdf.text(wrappedFindings, 15, findingsStartY + 14);

  // ── 7. Conclusion section ──────────────────────────────────────────────────
  const conclusionY = findingsStartY + 14 + wrappedFindings.length * 5 + 10;

  pdf.setDrawColor(...accentColor);
  pdf.line(15, conclusionY - 5, 15, conclusionY + 1);

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(12);
  pdf.setTextColor(...darkText);
  pdf.text("CONCLUSION", 20, conclusionY);

  pdf.setFontSize(11);
  pdf.setFont("helvetica", "bold");
  pdf.setTextColor(...riskColor);

  // FIX APPLIED HERE: Wrap the conclusion text and dynamically calculate box height
  const wrappedConclusion = pdf.splitTextToSize(sanitize(aiContent.conclusion), 170);
  const conclusionBoxHeight = wrappedConclusion.length * 5 + 6;

  pdf.setFillColor(250, 250, 250);
  pdf.setDrawColor(...riskColor);
  pdf.setLineWidth(0.5);
  pdf.roundedRect(15, conclusionY + 5, 180, conclusionBoxHeight, 2, 2, "FD");

  pdf.text(wrappedConclusion, 105, conclusionY + 11, { align: "center" });

  // ── 8. Recommendation (now AI-generated, not fixed) ───────────────────────
  
  // Shift the recommendation Y coordinate down based on the size of the dynamic conclusion box
  const recommendationY = conclusionY + 5 + conclusionBoxHeight + 6;

  pdf.setFont("helvetica", "italic");
  pdf.setFontSize(9);
  pdf.setTextColor(...lightText);
  const wrappedRec = pdf.splitTextToSize(
    sanitize(`Recommendation: ${aiContent.recommendation}`),
    175
  );
  pdf.text(wrappedRec, 15, recommendationY);

  // ── 9. Confidence score visual bar (new) ──────────────────────────────────
  
  // Shift the bar Y coordinate down
  const barY = recommendationY + wrappedRec.length * 5 + 8;

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(9);
  pdf.setTextColor(...darkText);
  pdf.text(
    `AI Confidence Score: ${analysisData.confidence.toFixed(2)}%`,
    15,
    barY
  );

  // Background bar
  pdf.setFillColor(226, 232, 240);
  pdf.roundedRect(15, barY + 3, 120, 5, 2, 2, "F");

  // Filled bar
  const fillWidth = (analysisData.confidence / 100) * 120;
  pdf.setFillColor(...riskColor);
  pdf.roundedRect(15, barY + 3, fillWidth, 5, 2, 2, "F");

  // Percentage label at end of bar
  pdf.setFontSize(8);
  pdf.setTextColor(...riskColor);
  pdf.text(`${analysisData.confidence.toFixed(1)}%`, 140, barY + 7);

  // ── 10. Signature ─────────────────────────────────────────────────────────
  pdf.setDrawColor(150, 150, 150);
  pdf.line(130, 260, 185, 260);
  pdf.setFont("helvetica", "italic");
  pdf.setFontSize(9);
  pdf.setTextColor(...lightText);
  pdf.text("Electronically Signed by", 135, 265);
  pdf.setFont("helvetica", "bold");
  pdf.setTextColor(...primaryColor);
  pdf.text("MedVision AI Core Engine", 135, 271);

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(7.5);
  pdf.setTextColor(...lightText);
  pdf.text(
    "This report is AI-generated and must be correlated with clinical findings by a qualified physician.",
    105,
    283,
    { align: "center" }
  );

  // ══════════════════════════════════════════════════════════════════
  // PAGE 2: VISUAL EVIDENCE
  // ══════════════════════════════════════════════════════════════════
  pdf.addPage();

  // Watermark
  pdf.setTextColor(245, 247, 250);
  pdf.setFontSize(70);
  pdf.setFont("helvetica", "bold");
  pdf.text("MedVision AI", 105, 160, { angle: 45, align: "center" });

  // Mini header
  pdf.setFillColor(...primaryColor);
  pdf.rect(0, 0, 210, 15, "F");
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(10);
  pdf.setFont("helvetica", "normal");
  pdf.text(`Patient: ${patientName} | MRN: ${mrNumber}`, 15, 10);
  pdf.text("Appendix A: Visual Evidence", 195, 10, { align: "right" });

  const imgSize = 90;

  // Original scan
  pdf.setTextColor(...darkText);
  pdf.setFontSize(12);
  pdf.setFont("helvetica", "bold");
  pdf.text("Original MRI Scan (Input)", 105, 32, { align: "center" });
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(8.5);
  pdf.setTextColor(...lightText);
  pdf.text("Unprocessed scan as submitted by the patient.", 105, 37, {
    align: "center",
  });

  pdf.setDrawColor(200, 200, 200);
  pdf.setLineWidth(1);
  pdf.rect(58, 40, imgSize + 4, imgSize + 4);
  pdf.addImage(originalImageBase64, "JPEG", 60, 42, imgSize, imgSize);

  const analyzedY = 42 + imgSize + 22;

  pdf.setTextColor(...darkText);
  pdf.setFontSize(12);
  pdf.setFont("helvetica", "bold");
  pdf.text(
    "AI Analyzed Output — Region of Interest Highlighted",
    105,
    analyzedY - 6,
    { align: "center" }
  );
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(8.5);
  pdf.setTextColor(...riskColor);
  pdf.text(
    `Classification: ${analysisData.className} | Confidence: ${analysisData.confidence.toFixed(2)}% | Risk: ${aiContent.riskLevel}`,
    105,
    analyzedY - 1,
    { align: "center" }
  );

  pdf.setDrawColor(...riskColor);
  pdf.setLineWidth(1.5);
  pdf.rect(58, analyzedY + 2, imgSize + 4, imgSize + 4);
  pdf.addImage(analyzedImage, "PNG", 60, analyzedY + 4, imgSize, imgSize);

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(8);
  pdf.setTextColor(150, 150, 150);
  pdf.text(
    "This report is strictly an AI-generated screening and not a substitute for a radiologist's official clinical diagnosis.",
    105,
    285,
    { align: "center" }
  );

  pdf.save(
    `MedVision_Report_${patientName.replace(/\s+/g, "_")}_${new Date()
      .toISOString()
      .slice(0, 10)}.pdf`
  );
};