import { connectDB } from '@/src/lib/mongoose';
import { UserModel } from './../../../../../models/user.model';
import { NextResponse } from "next/server";


export async function GET() {
  try {
    await connectDB();
    // Only fetch users where the role is explicitly 'doctor'
    const doctors = await UserModel.find({ role: "doctor" }).select("-password_hash");
    return NextResponse.json(doctors);
  } catch (error) {
    return NextResponse.json({ message: "Error fetching doctors" }, { status: 500 });
  }
}