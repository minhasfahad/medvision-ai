import { NextResponse } from "next/server";
import { connectDB } from "@/src/lib/mongoose";
import Doctor from "@/src/models/doctor.model";

export async function POST(req: Request) {
  try {
    await connectDB();

    const data = await req.json();
    const {
      userId,
      name,
      image,
      specialty,
      clinic,
      experience,
      fee,
      nextSlot,
      expertise,
      about,
      availableSlots, // ✅ now properly destructured
    } = data;

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Unauthorized. User ID is missing." },
        { status: 401 }
      );
    }

    const updatedProfile = await Doctor.findOneAndUpdate(
      { userId },
      {
        name,
        image,
        specialty,
        clinic,
        experience,
        fee,
        nextSlot,
        expertise,
        about,
        availableSlots: availableSlots ?? [], // ✅ now saved to DB
        badge: "Verified Specialist",
      },
      { new: true, upsert: true }
    );

    return NextResponse.json({
      success: true,
      message: "Profile updated successfully",
      profile: updatedProfile,
    });
  } catch (error) {
    console.error("Failed to update doctor profile:", error);
    return NextResponse.json(
      { success: false, message: "Server Error: Could not save profile" },
      { status: 500 }
    );
  }
}