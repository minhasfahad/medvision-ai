import { NextResponse } from "next/server";
import { connectDB } from "@/src/lib/mongoose";
import Result from "@/src/models/scanresult.model";

export async function GET() {
  try {
    await connectDB();

    const totalScans = await Result.countDocuments();

    const pendingReviews = await Result.countDocuments({
      $or: [
        { radiologistReviewStatus: "pending" },
        { radiologistReviewStatus: { $exists: false } },
        { radiologistReviewStatus: null },
      ],
    });

    const confirmedScans = await Result.countDocuments({
      radiologistReviewStatus: "confirmed",
    });

    const needsRecheck = await Result.countDocuments({
      radiologistReviewStatus: {
        $in: ["needs_recheck", "incorrect", "unclear"],
      },
    });

    const reviewedScans = await Result.countDocuments({
      radiologistReviewStatus: {
        $in: ["confirmed", "needs_recheck", "incorrect", "unclear"],
      },
    });

    return NextResponse.json({
      success: true,
      metrics: {
        totalScans,
        pendingReviews,
        confirmedScans,
        needsRecheck,
        reviewedScans,
      },
    });
  } catch (error) {
    console.error("Radiologist metrics error:", error);

    const errorMessage =
      error instanceof Error ? error.message : "Unknown server error";

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch radiologist metrics",
        error: errorMessage,
      },
      { status: 500 }
    );
  }
}