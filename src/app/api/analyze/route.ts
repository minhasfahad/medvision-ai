import { NextRequest, NextResponse } from "next/server";
import { saveScanResult } from "@/src/repositories/result.repository";
import { connectDB } from "@/src/lib/mongoose";
// --- NEW: Import Cloudinary helper ---
import { uploadToCloudinary } from "@/src/lib/cloudinary";

// --- Helpers for generating the prompt metadata ---
function getConfidenceBand(confidence: number): string {
  if (confidence >= 90) return "very high confidence (>=90%)";
  if (confidence >= 75) return "high confidence (75-89%)";
  if (confidence >= 60) return "moderate confidence (60-74%)";
  return "low confidence (<60%) - a repeat scan or second opinion is strongly advised";
}

function getRiskLevel(detected: boolean, confidence: number) {
  if (!detected) return confidence >= 75 ? "LOW" : "MODERATE";
  if (confidence >= 90) return "CRITICAL";
  if (confidence >= 75) return "HIGH";
  return "MODERATE";
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const formData = await req.formData();
    const userId = formData.get('userId') as string; 
    if (!userId) {
      return NextResponse.json({ 
        success: false, 
        message: "Valid User ID is required. Are you logged in?" 
      }, { status: 400 });
    }
    const file = formData.get('mri_image') as File;

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const originalImageBase64 = `data:${file.type};base64,${buffer.toString('base64')}`;

    const pythonFormData = new FormData();
    pythonFormData.append('file', file);

    const pythonApiUrl = process.env.NEXT_PUBLIC_PYTHON_API_URL || "http://127.0.0.1:8000";

    const response = await fetch(`${pythonApiUrl}/predict`, {
      method: "POST",
      body: pythonFormData,
    });

    if (!response.ok) {
        if (response.status >= 400 && response.status < 500) {
             const errorData = await response.json();
             return NextResponse.json(errorData, { status: 200 }); 
        }
        return NextResponse.json({ success: false, message: "Python API Error" }, { status: 500 });
    }

    const pythonData = await response.json();
    
    if (pythonData.success === false) {
        return NextResponse.json(pythonData, { status: 200 });
    }

    // --- Generate AI Narrative BEFORE saving to DB ---
    const confidenceBand = getConfidenceBand(pythonData.confidence);
    const riskLevel = getRiskLevel(pythonData.tumor_detected, pythonData.confidence);

    let aiReportData = {
      findings: undefined,
      conclusion: undefined,
      recommendation: undefined,
      confidenceInterpretation: undefined,
    };

    try {
      const baseUrl = req.nextUrl.origin;
      const reportRes = await fetch(`${baseUrl}/api/generate-report`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          className: pythonData.class_name,
          confidence: pythonData.confidence,
          detected: pythonData.tumor_detected,
          confidenceBand,
          riskLevel,
        }),
      });

      if (reportRes.ok) {
        const reportJson = await reportRes.json();
        if (reportJson.success) {
          aiReportData = reportJson.data;
        }
      }
    } catch (reportErr) {
      console.error("Failed to generate Claude report during upload:", reportErr);
    }

    // --- NEW: Upload to Cloudinary ---
    // Make sure python image has data URI prefix for Cloudinary
    const predictedImageBase64 = pythonData.image.startsWith('data:') 
      ? pythonData.image 
      : `data:image/jpeg;base64,${pythonData.image}`;

    // Upload both images concurrently to save time
    const [originalImageUrl, predictedImageUrl] = await Promise.all([
      uploadToCloudinary(originalImageBase64, "medvision_original"),
      uploadToCloudinary(predictedImageBase64, "medvision_predicted")
    ]);

    // --- Save to MongoDB using Repository (Now with URLs!) ---
    const savedData = await saveScanResult({
      user: userId as any,
      originalImage: originalImageUrl, // Saving Cloudinary URL instead of Base64
      imageData: predictedImageUrl,    // Saving Cloudinary URL instead of Base64
      className: pythonData.class_name,
      confidence: pythonData.confidence,
      tumorDetected: pythonData.tumor_detected,
      reportFindings: aiReportData.findings,
      reportConclusion: aiReportData.conclusion,
      reportRecommendation: aiReportData.recommendation,
      reportConfidenceInterpretation: aiReportData.confidenceInterpretation,
    });

    // Replace the huge base64 string in the response with the fast Cloudinary URL
    pythonData.image = predictedImageUrl;

    return NextResponse.json({
        ...pythonData,
        originalImageUrl: originalImageUrl, // Pass back to frontend just in case
        dbId: savedData._id 
    });

  } catch (err) {
    console.error("API Route Error:", err);
    return NextResponse.json({ success: false, message: "Server connection failed." }, { status: 500 });
  }
}