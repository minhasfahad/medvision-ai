import { NextRequest, NextResponse } from "next/server";
import { getUserAppointments, saveAppointment } from "@/src/repositories/appointment.repository";
import { connectDB } from "@/src/lib/mongoose";
import Doctor from "@/src/models/doctor.model";
import { Appointment } from "@/src/models/appointment.model";
import ScanResult from "@/src/models/scanresult.model";
import mongoose from "mongoose";

// ─── Helper: safely convert a string to ObjectId ─────────────────────────────
// Returns null if the string is not a valid ObjectId format.
// This prevents Mongoose from throwing a CastError on invalid IDs.

function toObjectId(id: string): mongoose.Types.ObjectId | null {
  try {
    return new mongoose.Types.ObjectId(id);
  } catch {
    return null;
  }
}

// --- GET: Fetch a patient's booked appointments and doctor metrics ---
export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const searchParams = req.nextUrl.searchParams;
    const userId = searchParams.get("userId");
    const role = searchParams.get("role");

    if (role === "doctor" && userId) {

      // ── FIX 1: Cast userId string to ObjectId before querying ──────────────
      const userObjectId = toObjectId(userId);

      if (!userObjectId) {
        return NextResponse.json(
          { success: false, message: "Invalid userId format." },
          { status: 400 }
        );
      }

      const doctorProfile = await Doctor.findOne({ userId: userObjectId }).lean();

      if (!doctorProfile) {
        return NextResponse.json({
          success: true,
          data: [],
          metrics: {
            totalPatients: 0,
            upcomingAppointments: 0,
            completedAppointments: 0,
            totalScansReviewed: 0,
          },
        });
      }

      // ── FIX 2: Cast doctorId to ObjectId for Appointment query ─────────────
      const doctorObjectId = doctorProfile._id; // already an ObjectId from .lean()
      const doctorIdStr = doctorObjectId.toString();

      const appointments = await Appointment.find({
        doctorId: doctorIdStr,
      }).lean();

      // 1. Unique Patients count
      const uniquePatientIds = [...new Set(appointments.map((a) => a.userId))];

      // 2. Upcoming (Pending or Confirmed)
      const upcoming = appointments.filter(
        (a) => a.status === "Pending" || a.status === "Confirmed"
      );

      // 3. Completed
      const completed = appointments.filter((a) => a.status === "Completed");

      // ── FIX 3: Cast uniquePatientIds to ObjectIds for ScanResult query ──────
      // On production, userId values stored in appointments may be strings.
      // We cast each one safely, filtering out any that fail conversion.
      const patientObjectIds = uniquePatientIds
        .map((id) => toObjectId(id as string))
        .filter((id): id is mongoose.Types.ObjectId => id !== null);

      const totalScans = await ScanResult.countDocuments({
        user: { $in: patientObjectIds },
      });

      const metrics = {
        totalPatients: uniquePatientIds.length,
        upcomingAppointments: upcoming.length,
        completedAppointments: completed.length,
        totalScansReviewed: totalScans,
      };

      return NextResponse.json({ success: true, data: appointments, metrics });

    } else if (userId) {
      // PATIENT VIEW: Simple fetch by userId
      const appointments = await getUserAppointments(userId);
      return NextResponse.json({ success: true, data: appointments });
    }

    return NextResponse.json(
      { success: false, message: "Invalid request" },
      { status: 400 }
    );

  } catch (error: unknown) {
    console.error("Error fetching appointments:", error);
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred.";
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
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
    const errorMessage =
      error instanceof Error
        ? error.message
        : "An unknown error occurred while booking.";
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}

// --- PUT: Update appointment status ---
export async function PUT(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();
    const { appointmentId, status } = body;

    if (!appointmentId || !status) {
      return NextResponse.json(
        { success: false, message: "Missing appointmentId or status." },
        { status: 400 }
      );
    }

    const { updateAppointmentStatus } = await import(
      "@/src/repositories/appointment.repository"
    );
    const updatedAppointment = await updateAppointmentStatus(
      appointmentId,
      status
    );

    return NextResponse.json({ success: true, data: updatedAppointment });
  } catch (error: unknown) {
    console.error("Update Error:", error);
    const errorMessage =
      error instanceof Error
        ? error.message
        : "An unknown error occurred during update.";
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}