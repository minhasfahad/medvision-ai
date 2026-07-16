import Result  from '@/src/models/scanresult.model';
import { connectDB } from '@/src/lib/mongoose';
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    await connectDB();
    const { scanId } = await req.json();

    await Result.findByIdAndDelete(scanId);

    return NextResponse.json({ success: true, message: "Scan deleted successfully" });
  } catch (error) {
    return NextResponse.json({ success: false, message: "Error deleting scan" }, { status: 500 });
  }
}