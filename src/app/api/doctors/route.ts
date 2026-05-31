import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/src/lib/mongoose";
import Doctor from "@/src/models/doctor.model";
import { Appointment } from "@/src/models/appointment.model";

/**
 * GET /api/doctors
 *
 * Query params:
 *   tumor  — optional. If provided (and not "No Tumor"), filters doctors whose
 *             `expertise` array contains a case-insensitive match.
 *             If absent or empty, returns all doctors.
 *
 * Response shape per doctor now includes:
 *   availableSlots — the full list of slots the doctor configured
 *   bookedSlots    — subset of those slots that are already taken
 *                    (derived from Appointment collection in real time)
 */
export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const searchParams = req.nextUrl.searchParams;
    const tumorType = searchParams.get("tumor");

    // ── Build query filter ────────────────────────────────────────────────────
    const query: Record<string, any> = {};

    if (tumorType && tumorType.trim() !== "" && tumorType !== "No Tumor") {
      // Case-insensitive match against the expertise array
      query.expertise = { $regex: new RegExp(`^${tumorType.trim()}$`, "i") };
    }

    // ── Fetch matching doctors ────────────────────────────────────────────────
    const doctors = await Doctor.find(query).lean();

    if (doctors.length === 0) {
      return NextResponse.json({ success: true, data: [] });
    }

    // ── Attach bookedSlots to each doctor ─────────────────────────────────────
    // We fetch all appointments that reference these doctors in one query,
    // then group them — avoids N+1 DB calls.

    const doctorIds = doctors.map((d) => d._id.toString());

    const bookedAppointments = await Appointment.find({
      doctorId: { $in: doctorIds },
      // Only count active bookings (not cancelled ones)
      status: { $in: ["Pending", "Confirmed", "Completed"] },
    })
      .select("doctorId appointmentDate")
      .lean();

    // Build a map: doctorId -> Set of booked ISO date strings
    const bookedSlotsMap: Record<string, Set<string>> = {};
    for (const appt of bookedAppointments) {
      const dId = appt.doctorId.toString();
      if (!bookedSlotsMap[dId]) bookedSlotsMap[dId] = new Set();
      // Normalize to the same format stored in availableSlots
      bookedSlotsMap[dId].add(appt.appointmentDate);
    }

    // ── Compose response ──────────────────────────────────────────────────────
    const enrichedDoctors = doctors.map((doc) => {
      const dId = doc._id.toString();
      const booked = bookedSlotsMap[dId] ?? new Set<string>();

      return {
        ...doc,
        _id: dId,
        userId: doc.userId?.toString(),
        // availableSlots already in the model; fall back to empty array
        availableSlots: doc.availableSlots ?? [],
        // Which of those slots are taken
        bookedSlots: Array.from(booked),
        // Keep nextSlot for backwards compat (first available open slot, or original value)
        nextSlot:
          (doc.availableSlots ?? []).find((s: string) => !booked.has(s)) ??
          doc.nextSlot ??
          "",
      };
    });

    return NextResponse.json({ success: true, data: enrichedDoctors });
  } catch (error: unknown) {
    console.error("Error fetching doctors:", error);
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred.";
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}