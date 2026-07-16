import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/src/lib/mongoose";
import { Appointment } from "@/src/models/appointment.model";

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const { appointmentId } = await req.json();

    const appointment = await Appointment.findById(appointmentId);

    if (!appointment) {
      return NextResponse.json(
        {
          success: false,
          message: "Appointment not found",
        },
        { status: 404 },
      );
    }

    if (
      appointment.status !== "Completed" &&
      appointment.status !== "Cancelled"
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Only completed or cancelled appointments can be deleted",
        },
        { status: 400 },
      );
    }

    await Appointment.findByIdAndDelete(appointmentId);

    return NextResponse.json({
      success: true,
      message: "Appointment deleted successfully",
    });
  } catch (error) {
    console.error("Appointment deletion error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to delete appointment",
      },
      { status: 500 },
    );
  }
}