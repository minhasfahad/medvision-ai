import { NextRequest, NextResponse } from "next/server";
import { saveScanResult } from "@/src/repositories/result.repository";
import { connectDB } from "@/src/lib/mongoose";

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

    // --- UPDATED: Use Environment Variable or fallback to localhost for testing ---
    // Make sure NEXT_PUBLIC_PYTHON_API_URL is set in your AWS .env.production file!
    const pythonApiUrl = process.env.NEXT_PUBLIC_PYTHON_API_URL || "http://127.0.0.1:8000";

    const response = await fetch(`${pythonApiUrl}/predict`, {
      method: "POST",
      body: pythonFormData,
    });

    if (!response.ok) {
        // If Python returns a 400-level error (like our validation failure), pass it through
        if (response.status >= 400 && response.status < 500) {
             const errorData = await response.json();
             return NextResponse.json(errorData, { status: 200 }); // Return 200 so the frontend can read the custom message
        }
        return NextResponse.json({ success: false, message: "Python API Error" }, { status: 500 });
    }

    const pythonData = await response.json();
    
    // Check if the validation failed inside the Python response
    if (pythonData.success === false) {
        return NextResponse.json(pythonData, { status: 200 });
    }

    // 3. Save to MongoDB using Repository (Only if validation passed)
    const savedData = await saveScanResult({
      user: userId as any,
      originalImage: originalImageBase64,
      imageData: pythonData.image, 
      className: pythonData.class_name,
      confidence: pythonData.confidence,
      tumorDetected: pythonData.tumor_detected,
    });

    return NextResponse.json({
        ...pythonData,
        dbId: savedData._id 
    });

  } catch (err) {
    console.error("API Route Error:", err);
    return NextResponse.json({ success: false, message: "Server connection failed." }, { status: 500 });
  }
}