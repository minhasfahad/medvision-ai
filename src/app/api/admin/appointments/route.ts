import { getAllAppointments } from './../../../../repositories/appointment.repository';
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const appointments = await getAllAppointments();
    return NextResponse.json(appointments);
  } catch (error) {
    console.error("Failed to fetch all appointments:", error);
    return NextResponse.json({ message: "Error fetching appointments" }, { status: 500 });
  }
}