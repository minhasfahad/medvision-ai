import { NextResponse } from "next/server";
import { connectDB } from "@/src/lib/mongoose";
import { UserModel } from "@/src/models/user.model";

export async function POST(req: Request) {
  try {
    await connectDB();
    const { userId } = await req.json();

    if (!userId) {
      return NextResponse.json(
        { message: "userId is required" },
        { status: 400 },
      );
    }

    const deletedUser = await UserModel.findByIdAndDelete(userId);

    if (!deletedUser) {
      return NextResponse.json(
        { message: "User not found" },
        { status: 404 },
      );
    }

    return NextResponse.json(
      { success: true, message: "User deleted successfully" },
      { status: 200 },
    );
  } catch (error) {
    console.error("Failed to delete user:", error);
    return NextResponse.json(
      { message: "Error deleting user" },
      { status: 500 },
    );
  }
}