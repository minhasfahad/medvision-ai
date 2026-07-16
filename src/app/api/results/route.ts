import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/src/lib/mongoose";
import Result from "@/src/models/scanresult.model";
import Doctor from "@/src/models/doctor.model";
import { getDoctorPatientScans, updateScanComment } from "@/src/repositories/result.repository";

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const searchParams = req.nextUrl.searchParams;
    const userId = searchParams.get('userId');
    const role = searchParams.get('role');

    if (role === 'doctor' && userId) {
      const doctorProfile = await Doctor.findOne({ userId }).lean();
      if (!doctorProfile) return NextResponse.json({ success: true, data: [] });

      const scans = await getDoctorPatientScans(doctorProfile._id.toString());
      return NextResponse.json({ success: true, data: scans });
    }

    // Patient view
    const scans = await Result.find({ user: userId })
      .sort({ createdAt: -1 })
      .populate("user", "name")
      .populate("doctorCommentedBy", "name role")
      .populate("reviewedBy", "name role");
    return NextResponse.json({ success: true, data: scans });
  } catch (error) {
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    await connectDB();

    const { scanId, comment, doctorId } = await req.json();

    const updatedResult = await updateScanComment(scanId, comment, doctorId);

    return NextResponse.json({ success: true, data: updatedResult });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Update failed" },
      { status: 500 },
    );
  }
}