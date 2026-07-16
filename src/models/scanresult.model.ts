import mongoose, { Schema, Document } from "mongoose";

// 1. TypeScript Interface
export interface IResult extends Document {
    user: mongoose.Types.ObjectId;

    originalImage: string;
    imageData: string;

    className: string;
    confidence: number;
    tumorDetected: boolean;

    // AI Narrative Report Fields (Saved once during initial scan)
    reportFindings?: string;
    reportConclusion?: string;
    reportRecommendation?: string;
    reportConfidenceInterpretation?: string;

    // Existing doctor comment - keep current logic safe
    comment?: string;

    // Optional doctor comment metadata
    doctorCommentedBy?: mongoose.Types.ObjectId;
    doctorCommentedAt?: Date;

    // Radiologist review fields
    radiologistReviewStatus:
    | "pending"
    | "confirmed"
    | "needs_recheck"
    | "incorrect"
    | "unclear";

    radiologistComment?: string;
    radiologistRecommendation?: string;
    reviewedBy?: mongoose.Types.ObjectId;
    reviewedAt?: Date;

    createdAt: Date;
    updatedAt: Date;
}

// 2. Define Schema
const ResultSchema: Schema = new Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        originalImage: {
            type: String,
            required: true,
        },

        imageData: {
            type: String,
            required: true,
        },

        className: {
            type: String,
            required: true,
        },

        confidence: {
            type: Number,
            required: true,
        },

        tumorDetected: {
            type: Boolean,
            required: true,
        },

        // --- NEW: AI Narrative Fields ---
        reportFindings: {
            type: String,
            default: null,
        },
        reportConclusion: {
            type: String,
            default: null,
        },
        reportRecommendation: {
            type: String,
            default: null,
        },
        reportConfidenceInterpretation: {
            type: String,
            default: null,
        },

        // Existing doctor comment field
        // Do not rename this because your current doctor code uses it.
        comment: {
            type: String,
            default: null,
        },

        // Optional: who added doctor comment
        doctorCommentedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null,
        },

        // Optional: when doctor added comment
        doctorCommentedAt: {
            type: Date,
            default: null,
        },

        // Radiologist verification status
        radiologistReviewStatus: {
            type: String,
            enum: ["pending", "confirmed", "needs_recheck", "incorrect", "unclear"],
            default: "pending",
        },

        // Radiologist professional note
        radiologistComment: {
            type: String,
            default: null,
        },

        // Radiologist recommendation
        radiologistRecommendation: {
            type: String,
            default: null,
        },

        // Which radiologist reviewed the scan
        reviewedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null,
        },

        // Radiologist review date
        reviewedAt: {
            type: Date,
            default: null,
        },
    },
    {
        timestamps: true,
        versionKey: false,
    }
);

// 3. Export Model
const Result =
    mongoose.models.Result || mongoose.model<IResult>("Result", ResultSchema);

export default Result;