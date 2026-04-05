import { NextRequest, NextResponse } from "next/server";
import { SaveScanResult } from "@/src/repositories/result.repository";
import { connectDB } from "@/src/lib/mongoose";
// import { getServerSession } from "next-auth"; // If using NextAuth

export async function POST(req: NextRequest) {
  try {
    // 1. Get User ID (Crucial for the "Foreign Key")
    // Replace this with your actual Auth logic
    await connectDB();
    console.log("DB Ready! Go on");
    const formData = await req.formData();
    const userId = formData.get('userId') as string; 
    if (!userId || userId === "REPLACE_WITH_LOGGED_IN_USER_ID") {
      return NextResponse.json({ 
        success: false, 
        message: "Valid User ID is required. Are you logged in?" 
      }, { status: 400 });
    }
    const file = formData.get('mri_image') as Blob;

    const pythonFormData = new FormData();
    pythonFormData.append('file', file);

    // 2. Call Python API
    const response = await fetch("http://127.0.0.1:8000/predict", {
      method: "POST",
      body: pythonFormData,
    });

    if (!response.ok) return NextResponse.json({ success: false }, { status: 500 });

    const pythonData = await response.json();

    // 3. Save to MongoDB using Repository
    const savedData = await SaveScanResult({
      user: userId as any,
      imageData: pythonData.image, // The base64 string
      className: pythonData.class_name,
      confidence: pythonData.confidence,
      tumorDetected: pythonData.tumor_detected,
    });

    // 4. Return combined success response
    return NextResponse.json({
        ...pythonData,
        dbId: savedData._id // Return the MongoDB ID too
    });

  } catch (err) {
    console.error(err);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}