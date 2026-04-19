import { NextRequest, NextResponse } from "next/server";
import { getAllScanResults } from "@/src/repositories/result.repository";
import { connectDB } from "@/src/lib/mongoose";

export async function GET(req: NextRequest) {
    try {
        await connectDB();
        const scanresults = await getAllScanResults();
        return NextResponse.json({ success: true, data: scanresults });
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json({ success: false, message: errorMessage }, { status: 500 });
    }
}