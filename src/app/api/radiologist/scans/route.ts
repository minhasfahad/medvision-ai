import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/src/lib/mongoose";
import Result from "@/src/models/scanresult.model";

const allowedStatuses = [
    "pending",
    "confirmed",
    "needs_recheck",
    "incorrect",
    "unclear",
];

export async function GET(req: NextRequest) {
    try {
        await connectDB();

        const searchParams = req.nextUrl.searchParams;
        const status = searchParams.get("status") || "pending";
        const reviewedBy = searchParams.get("reviewedBy");

        let filter: any = {};

        if (status === "all") {
            filter = {};
        } else if (status === "pending") {
            filter = {
                $or: [
                    { radiologistReviewStatus: "pending" },
                    { radiologistReviewStatus: { $exists: false } },
                    { radiologistReviewStatus: null },
                ],
            };
        } else if (status === "reviewed") {
            filter = {
                radiologistReviewStatus: {
                    $in: ["confirmed", "needs_recheck", "incorrect", "unclear"],
                },
            };
        } else if (status === "needs_recheck_group") {
            filter = {
                radiologistReviewStatus: {
                    $in: ["needs_recheck", "incorrect", "unclear"],
                },
            };
        } else {
            filter = {
                radiologistReviewStatus: status,
            };
        }
        if (reviewedBy) {
            filter.reviewedBy = reviewedBy;
        }

        const scans = await Result.find(filter)
            .sort({ createdAt: -1 })
            .populate("user", "name email age")
            .populate("reviewedBy", "name email role")
            .lean();

        return NextResponse.json({
            success: true,
            data: scans,
        });
    } catch (error) {
        console.error("Radiologist scans fetch error:", error);

        const errorMessage =
            error instanceof Error ? error.message : "Unknown server error";

        return NextResponse.json(
            {
                success: false,
                message: "Failed to fetch radiologist scans",
                error: errorMessage,
            },
            { status: 500 }
        );
    }
}

export async function PUT(req: NextRequest) {
    try {
        await connectDB();

        const {
            scanId,
            radiologistReviewStatus,
            radiologistComment,
            radiologistRecommendation,
            reviewedBy,
        } = await req.json();

        if (!scanId) {
            return NextResponse.json(
                { success: false, message: "Scan ID is required" },
                { status: 400 }
            );
        }

        if (!allowedStatuses.includes(radiologistReviewStatus)) {
            return NextResponse.json(
                { success: false, message: "Invalid review status" },
                { status: 400 }
            );
        }

        const updatePayload: any = {
            radiologistReviewStatus,
            radiologistComment: radiologistComment || null,
            radiologistRecommendation: radiologistRecommendation || null,
        };

        if (radiologistReviewStatus !== "pending") {
            updatePayload.reviewedAt = new Date();
            updatePayload.reviewedBy = reviewedBy || null;
        } else {
            updatePayload.reviewedAt = null;
            updatePayload.reviewedBy = null;
        }

        const updatedScan = await Result.findByIdAndUpdate(scanId, updatePayload, {
            new: true,
        })
            .populate("user", "name email age")
            .populate("reviewedBy", "name email role");

        if (!updatedScan) {
            return NextResponse.json(
                { success: false, message: "Scan not found" },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            message: "Radiologist review updated successfully",
            data: updatedScan,
        });
    } catch (error) {
        console.error("Radiologist review update error:", error);

        const errorMessage =
            error instanceof Error ? error.message : "Unknown server error";

        return NextResponse.json(
            {
                success: false,
                message: "Failed to update radiologist review",
                error: errorMessage,
            },
            { status: 500 }
        );
    }
}