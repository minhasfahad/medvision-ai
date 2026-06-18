import { connectDB } from '@/src/lib/mongoose';
import { UserModel } from './../../../../models/user.model';
import { NextResponse } from "next/server";
import Result from '@/src/models/scanresult.model';
import { Appointment } from '@/src/models/appointment.model';

export async function GET() {
  try {
    await connectDB();

    // Fetch all aggregations simultaneously for lightning-fast performance
    const [patientCount, doctorCount, radiologistCount, totalScans, totalAppointments] = await Promise.all([
      UserModel.countDocuments({ role: "patient" }),
      UserModel.countDocuments({ role: "doctor" }),
      UserModel.countDocuments({ role: "radiologist" }),
      Result.countDocuments(),
      Appointment.countDocuments(), // Count all booked appointments
    ]);

    return NextResponse.json({
      success: true,
      metrics: {
        totalPatients: patientCount,
        totalDoctors: doctorCount,
        totalRadiologists: radiologistCount,
        totalScans: totalScans,
        totalAppointments: totalAppointments, // Send the new metric to the frontend
        systemStatus: "Operational"
      }
    });
  } catch (error) {
    console.error("Error fetching overview metrics:", error);
    return NextResponse.json(
      { success: false, message: "Failed to load dashboard metrics" },
      { status: 500 }
    );
  }
}