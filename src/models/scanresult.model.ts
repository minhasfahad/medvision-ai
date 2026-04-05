import mongoose, { Schema, Document } from "mongoose";

// 1. TypeScript Interface
export interface IResult extends Document {
    user: mongoose.Types.ObjectId; // Added user to interface
    originalImage: string
    imageData: string;
    className: string;
    confidence: number;
    tumorDetected: boolean;
    createdAt: Date;
}

// 2. Define Schema
const ResultSchema: Schema = new Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        originalImage: { type: String, required: true },    
        imageData: { type: String, required: true },

        className: { type: String, required: true },
        confidence: { type: Number, required: true },
        tumorDetected: { type: Boolean, required: true }
    },
    {
        timestamps: true,
        versionKey: false
    }
);

// 3. Export Model
const Result = mongoose.models.Result || mongoose.model<IResult>("Result", ResultSchema);
export default Result;