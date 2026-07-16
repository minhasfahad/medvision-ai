import { connectDB } from '@/src/lib/mongoose';
import { UserModel } from '../../../../../models/user.model';
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await connectDB();
    // Only fetch users where role is 'patient'
    const patients = await UserModel.find({ role: "patient" }).select("-password_hash");
    return NextResponse.json(patients);
  } catch (error) {
    console.log(error);
    return NextResponse.json({ message: "Error fetching patients" }, { status: 500 });
  }
}