import { NextRequest, NextResponse } from "next/server";
import { getUserAppointments, saveAppointment } from "@/src/repositories/appointment.repository";
import { connectDB } from "@/src/lib/mongoose";

// --- GET: Fetch a patient's booked appointments ---
// --- GET: Fetch appointments ---
export async function GET(req: NextRequest) {
    try {
        await connectDB();
        
        const searchParams = req.nextUrl.searchParams;
        const userId = searchParams.get('userId');

        if (userId) {
            // Patient view: specific user
            const appointments = await getUserAppointments(userId);
            return NextResponse.json({ success: true, data: appointments });
        } else {
            // Doctor view: all appointments
            const { getAllAppointments } = await import("@/src/repositories/appointment.repository");
            const allAppointments = await getAllAppointments();
            return NextResponse.json({ success: true, data: allAppointments });
        }
    } catch (error: unknown) {
        console.error("Error fetching appointments:", error);
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
        return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
    }
}

// --- POST: Book a new appointment ---
export async function POST(req: NextRequest) {
    try {
        await connectDB();
        const body = await req.json();

        if (!body.userId || !body.doctorId || !body.appointmentDate) {
            return NextResponse.json(
                { success: false, message: "Missing required booking fields." },
                { status: 400 }
            );
        }

        const appointment = await saveAppointment(body);
        return NextResponse.json({ success: true, data: appointment });
    } catch (error: unknown) {
        console.error("Booking Error:", error);
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred while booking.";
        return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
    }
}
// --- PUT: Update appointment status ---
export async function PUT(req: NextRequest) {
    try {
        await connectDB();
        const body = await req.json();
        const { appointmentId, status } = body;

        if (!appointmentId || !status) {
            return NextResponse.json({ success: false, message: "Missing appointmentId or status." }, { status: 400 });
        }

        const { updateAppointmentStatus } = await import("@/src/repositories/appointment.repository");
        const updatedAppointment = await updateAppointmentStatus(appointmentId, status);

        return NextResponse.json({ success: true, data: updatedAppointment });
    } catch (error: unknown) {
        console.error("Update Error:", error);
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred during update.";
        return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
    }
}