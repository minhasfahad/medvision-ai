import { NextResponse } from "next/server";
import { connectDB } from "@/src/lib/mongoose"; 
import { UserModel } from "@/src/models/user.model";
import bcrypt from "bcryptjs"; 
// --- NEW: Import Cloudinary helper ---
import { uploadToCloudinary } from "@/src/lib/cloudinary";

// 1. UPDATE PROFILE INFO (Name, Age, & Image)
export async function PUT(req: Request) {
  try {
    await connectDB();
    const body = await req.json();
    const { userId, name, age, image } = body;

    if (!userId || !name) {
      return NextResponse.json({ success: false, message: "User ID and Name are required" }, { status: 400 });
    }

    // Prepare data to update
    const updateData: any = { name, age };

    // --- NEW: Handle Cloudinary Upload ---
    if (image) {
      // If the image is a fresh Base64 string, upload it
      if (image.startsWith("data:image")) {
        const uploadedUrl = await uploadToCloudinary(image, "medvision_avatars");
        updateData.image = uploadedUrl;
      } else {
        // If it's already a URL (user didn't change their picture), just save it back
        updateData.image = image;
      }
    }

    // Find user and update
    const updatedUser = await UserModel.findByIdAndUpdate(
      userId,
      updateData,
      { new: true } // Returns the newly updated document
    );

    if (!updatedUser) {
      return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Profile updated successfully", data: updatedUser }, { status: 200 });

  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

// 2. UPDATE PASSWORD
export async function PATCH(req: Request) {
  try {
    await connectDB();
    const body = await req.json();
    const { userId, currentPassword, newPassword } = body;

    if (!userId || !currentPassword || !newPassword) {
      return NextResponse.json({ success: false, message: "All fields are required" }, { status: 400 });
    }

    const user = await UserModel.findById(userId).select("+password_hash");
    
    if (!user) {
      return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password_hash as string);
    if (!isMatch) {
      return NextResponse.json({ success: false, message: "Incorrect current password" }, { status: 401 });
    }

    const salt = await bcrypt.genSalt(10);
    user.password_hash = await bcrypt.hash(newPassword, salt);
    await user.save();

    return NextResponse.json({ success: true, message: "Password updated successfully" }, { status: 200 });

  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

// 3. DELETE ACCOUNT
export async function DELETE(req: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ success: false, message: "User ID is required" }, { status: 400 });
    }

    const deletedUser = await UserModel.findByIdAndDelete(userId);

    if (!deletedUser) {
      return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Account deleted permanently" }, { status: 200 });

  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}