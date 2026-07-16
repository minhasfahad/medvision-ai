import { updateAppointmentStatus } from './../../../../../repositories/appointment.repository';
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { appointmentId, status } = await req.json();
    
    if (!appointmentId || !status) {
      return NextResponse.json({ success: false, message: "Missing data" }, { status: 400 });
    }

    await updateAppointmentStatus(appointmentId, status);
    
    return NextResponse.json({ success: true, message: "Status updated successfully" });
  } catch (error) {
    console.error("Failed to update appointment:", error);
    return NextResponse.json({ success: false, message: "Error updating status" }, { status: 500 });
  }
}