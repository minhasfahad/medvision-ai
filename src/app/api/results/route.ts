import { NextRequest, NextResponse } from "next/server";
import { getAllScanResults, updateScanComment } from "@/src/repositories/result.repository";
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

export async function PUT(req: NextRequest) {
    try {
        await connectDB();
        const body = await req.json();
        const { scanId, comment } = body;

        if (!scanId || !comment) {
            return NextResponse.json({ 
                success: false, 
                message: 'scanId and comment are required' 
            }, { status: 400 });
        }

        const updatedResult = await updateScanComment(scanId, comment);
        return NextResponse.json({ 
            success: true, 
            data: updatedResult,
            message: 'Comment saved successfully'
        });
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json({ success: false, message: errorMessage }, { status: 500 });
    }
}