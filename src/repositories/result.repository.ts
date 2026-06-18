import { NextRequest, NextResponse } from "next/server";
import Result, { IResult } from "../models/scanresult.model";
import { Appointment } from "@/src/models/appointment.model"; // Adjust path if needed
import { connectDB } from "../lib/mongoose";
import Doctor from "../models/doctor.model";

export const saveScanResult = async (data: Partial<IResult>) => {
    try {
        const newresult = new Result(data);
        return await newresult.save();
    } catch (error) {
        throw new Error("Failed to save the Results" + error)
    }
};
export async function GET(req: NextRequest) {
    try {
        await connectDB();
        const searchParams = req.nextUrl.searchParams;
        const userId = searchParams.get('userId'); // This is the Doctor's User ID
        const role = searchParams.get('role');

        if (role === 'doctor' && userId) {
            // 1. Get the actual Doctor profile ID from the User ID
            const doctorProfile = await Doctor.findOne({ userId: userId }).lean();

            if (!doctorProfile) {
                return NextResponse.json({ success: true, data: [] });
            }

            // 2. Use the new repository function that filters by patient list
            const scans = await getDoctorPatientScans(doctorProfile._id.toString());
            return NextResponse.json({ success: true, data: scans });
        } else {
            // Patient view (Standard)
            const scans = await getScanResults(userId);
            return NextResponse.json({ success: true, data: scans });
        }
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json({ success: false, message: errorMessage }, { status: 500 });
    }
}
// --- THIS IS THE UPDATED FUNCTION ---
export const getScanResults = async (userId: string | null = null) => {
    try {
        if (userId) {
            return await Result.find({ user: userId })
                .sort({ createdAt: -1 })
                .populate("user", "name")
                .populate("doctorCommentedBy", "name role")
                .populate("reviewedBy", "name role");
        }

        return await Result.find()
            .sort({ createdAt: -1 })
            .populate("user", "name")
            .populate("doctorCommentedBy", "name role")
            .populate("reviewedBy", "name role");
    } catch (error) {
        if (error instanceof Error) {
            throw new Error("Failed to get the Results: " + error.message);
        }
        throw new Error("Failed to get the Results: " + String(error));
    }
};
export const updateScanComment = async (
    scanId: string,
    comment: string,
    doctorId?: string,
) => {
    try {
        const updateData: {
            comment: string;
            doctorCommentedAt: Date;
            doctorCommentedBy?: string;
        } = {
            comment,
            doctorCommentedAt: new Date(),
        };

        if (doctorId) {
            updateData.doctorCommentedBy = doctorId;
        }

        const updatedResult = await Result.findByIdAndUpdate(scanId, updateData, {
            new: true,
        })
            .populate("user", "name")
            .populate("doctorCommentedBy", "name role")
            .populate("reviewedBy", "name role");

        return updatedResult;
    } catch (error) {
        if (error instanceof Error) {
            throw new Error("Failed to update comment: " + error.message);
        }
        throw new Error("Failed to update comment: " + String(error));
    }
};

export const getDoctorPatientScans = async (doctorId: string) => {
    const doctorAppointments = await Appointment.find({ doctorId })
        .select("userId")
        .lean();

    const patientIds = [
        ...new Set(doctorAppointments.map((app) => app.userId.toString())),
    ];

    if (patientIds.length === 0) return [];

    return await Result.find({ user: { $in: patientIds } })
        .sort({ createdAt: -1 })
        .populate("user", "name")
        .populate("doctorCommentedBy", "name role")
        .populate("reviewedBy", "name role");
};