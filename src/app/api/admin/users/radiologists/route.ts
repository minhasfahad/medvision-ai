import { NextResponse } from "next/server";
import { connectDB } from "@/src/lib/mongoose";
import { UserModel } from "@/src/models/user.model";

export async function GET() {
  try {
    await connectDB();

    const radiologists = await UserModel.find({
      role: "radiologist",
    })
      .select("_id name email age role createdAt updatedAt")
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json(radiologists);
  } catch (error) {
    console.error("Failed to fetch radiologists:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch radiologists",
      },
      { status: 500 },
    );
  }
}