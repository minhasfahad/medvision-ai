import { NextResponse } from 'next/server';
import { connectDB } from '@/src/lib/mongoose';
import { UserModel } from '@/src/models/user.model'; // Adjust path if your model is elsewhere

export async function POST(req: Request) {
  try {
    await connectDB();
    const { email, role } = await req.json();

    if (!email || !role) {
      return NextResponse.json({ error: "Email and role are required" }, { status: 400 });
    }

    // Find the user and update their role
    const updatedUser = await UserModel.findOneAndUpdate(
      { email: email },
      { role: role.toLowerCase() },
      { new: true } // Returns the updated document
    );

    if (!updatedUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ 
      message: "Role updated successfully", 
      role: updatedUser.role 
    }, { status: 200 });

  } catch (error) {
    console.error("Update role error:", error);
    return NextResponse.json({ error: "Failed to update role" }, { status: 500 });
  }
}