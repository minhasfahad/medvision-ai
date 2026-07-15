import { NextResponse } from "next/server";
import { connectDB } from "@/src/lib/mongoose";
import { UserModel } from "@/src/models/user.model";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    await connectDB();
    const { token, newPassword } = await req.json();

    if (!token || !newPassword) {
      return NextResponse.json({ error: "Token and new password are required" }, { status: 400 });
    }

    // 1. Find the user with this exact token AND ensure the token hasn't expired
    const user = await UserModel.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }, 
    });

    if (!user) {
      return NextResponse.json({ error: "Password reset token is invalid or has expired." }, { status: 400 });
    }

    // 2. Hash the new password
    const salt = await bcrypt.genSalt(10);
    user.password_hash = await bcrypt.hash(newPassword, salt);

    // 3. Delete the temporary token from the database
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    
    await user.save();

    return NextResponse.json({ message: "Password has been successfully reset!" }, { status: 200 });

  } catch (error: any) {
    console.error("Reset password error:", error);
    return NextResponse.json({ error: "An error occurred while resetting the password." }, { status: 500 });
  }
}