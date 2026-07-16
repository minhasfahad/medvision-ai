import { getDoctorPatientScans } from './../../../../repositories/result.repository';
import { NextResponse } from "next/server";
import { connectDB } from "@/src/lib/mongoose";
import Doctor from "@/src/models/doctor.model";
import { Appointment } from "@/src/models/appointment.model";

export async function GET(req: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ success: false, message: "Unauthorized access" }, { status: 401 });
    }

    // 1. Find the specific doctor profile linked to this user account
    const doctor = await Doctor.findOne({ userId }).lean();

    // If they haven't published their profile yet, return all zeros
    if (!doctor) {
      return NextResponse.json({
        success: true,
        metrics: { totalPatients: 0, upcomingAppointments: 0, completedAppointments: 0, totalScansReviewed: 0 }
      });
    }

    const doctorId = doctor._id.toString();

    // 2. Fetch all appointments booked with this specific doctor
    const allAppointments = await Appointment.find({ doctorId }).lean();

    // 3. Calculate the precise metrics
    
    // A. Unique Patients (Ensures 1 patient with 3 appointments is only counted as 1)
    const uniquePatientIds = new Set(allAppointments.map(app => app.userId?.toString() || app.userId));
    const totalPatients = uniquePatientIds.size;

    // B. Upcoming Appointments
    const upcomingAppointments = allAppointments.filter(
      app => app.status === "Pending" || app.status === "Confirmed" || app.status === "Scheduled"
    ).length;

    // C. Completed Appointments
    const completedAppointments = allAppointments.filter(
      app => app.status === "Completed"
    ).length;

    // D. Total Scans Reviewed (Reusing our highly secure repository function)
    const doctorScans = await getDoctorPatientScans(doctorId);
    const totalScansReviewed = doctorScans.length;

    // 4. Send the data back to the dashboard
    return NextResponse.json({
      success: true,
      metrics: {
        totalPatients,
        upcomingAppointments,
        completedAppointments,
        totalScansReviewed
      }
    });

  } catch (error: any) {
    console.error("Error fetching doctor overview:", error);
    return NextResponse.json({ success: false, message: "Internal Server Error" }, { status: 500 });
  }
}