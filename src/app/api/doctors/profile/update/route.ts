import { NextResponse } from "next/server";
import { connectDB } from "@/src/lib/mongoose";
import Doctor from "@/src/models/doctor.model";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

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
      availableSlots,
    } = data;

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Unauthorized. User ID is missing." },
        { status: 401 }
      );
    }

    // ✅ Build update object dynamically
    const updateData: Record<string, any> = {
      name,
      specialty,
      clinic,
      experience,
      fee,
      nextSlot,
      expertise,
      about,
      availableSlots: availableSlots ?? [],
      badge: "Verified Specialist",
    };

    // ✅ Only upload to Cloudinary if it's a NEW base64 image
    if (image && image.startsWith("data:image/")) {
      const uploadResult = await cloudinary.uploader.upload(image, {
        folder: "medvision_avatars",
        transformation: [{ width: 400, height: 400, crop: "fill" }],
      });
      updateData.image = uploadResult.secure_url;
    }
    // If image is already a Cloudinary URL or undefined — don't touch it

    const updatedProfile = await Doctor.findOneAndUpdate(
      { userId },
      updateData,
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