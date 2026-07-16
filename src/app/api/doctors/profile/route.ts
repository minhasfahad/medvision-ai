import { NextResponse } from "next/server";
import { connectDB } from "@/src/lib/mongoose";
import Doctor from "@/src/models/doctor.model";

export async function GET(req: Request) {
  try {
    await connectDB();
    // Get userId from the URL query parameter
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ success: false, message: "User ID required" }, { status: 400 });
    }

    // Find the profile linked to this user
    const profile = await Doctor.findOne({ userId: userId }).lean();
    
    return NextResponse.json({ success: true, data: profile });
  } catch (error) {
    console.error("Failed to fetch profile:", error);
    return NextResponse.json({ success: false, message: "Server Error" }, { status: 500 });
  }
}