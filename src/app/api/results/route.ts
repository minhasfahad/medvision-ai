import { NextRequest, NextResponse } from "next/server";
// Notice I changed the function name to getScanResults (we will update the repo next)
import { getScanResults, updateScanComment } from "@/src/repositories/result.repository";
import { connectDB } from "@/src/lib/mongoose";

export async function GET(req: NextRequest) {
    try {
        await connectDB();
        
        // Grab the userId from the URL if it exists
        const searchParams = req.nextUrl.searchParams;
        const userId = searchParams.get('userId');

        // Pass the userId to the repository
        const scanresults = await getScanResults(userId);
        
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