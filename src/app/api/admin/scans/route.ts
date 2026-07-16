import { connectDB } from '@/src/lib/mongoose';
import { getScanResults } from './../../../../repositories/result.repository';
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await connectDB();
    // Passing no userId triggers your function to return ALL history
    const scans = await getScanResults(); 
    return NextResponse.json(scans);
  } catch (error) {
    return NextResponse.json({ message: "Error fetching scans" }, { status: 500 });
  }
}