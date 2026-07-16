import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/src/lib/mongoose";
import Doctor from "@/src/models/doctor.model";
import { Appointment } from "@/src/models/appointment.model";

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const searchParams = req.nextUrl.searchParams;
    const tumorType = searchParams.get("tumor");
    const doctorId = searchParams.get("doctorId"); // 👈 NEW

    // ── Single doctor fetch by ID ─────────────────────────────────────────────
    if (doctorId) {
      const doctor = await Doctor.findById(doctorId).lean();

      if (!doctor) {
        return NextResponse.json(
          { success: false, message: "Doctor not found." },
          { status: 404 }
        );
      }

      const bookedAppointments = await Appointment.find({
        doctorId: doctorId,
        status: { $in: ["Pending", "Confirmed"] },
      })
        .select("appointmentDate")
        .lean();

      const bookedSlots = bookedAppointments.map((a) => a.appointmentDate);

      return NextResponse.json({
        success: true,
        data: {
          ...doctor,
          _id: doctor._id.toString(),
          availableSlots: doctor.availableSlots ?? [],
          bookedSlots,
        },
      });
    }

    // ── Build query filter ────────────────────────────────────────────────────
    const query: Record<string, any> = {};

    if (tumorType && tumorType.trim() !== "" && tumorType !== "No Tumor") {
      query.expertise = { $regex: new RegExp(`^${tumorType.trim()}$`, "i") };
    }

    // ── Fetch matching doctors ────────────────────────────────────────────────
    const doctors = await Doctor.find(query).lean();

    if (doctors.length === 0) {
      return NextResponse.json({ success: true, data: [] });
    }

    // ── Attach bookedSlots to each doctor ─────────────────────────────────────
    const doctorIds = doctors.map((d) => d._id.toString());

    const bookedAppointments = await Appointment.find({
      doctorId: { $in: doctorIds },
      status: { $in: ["Pending", "Confirmed", "Completed"] },
    })
      .select("doctorId appointmentDate")
      .lean();

    const bookedSlotsMap: Record<string, Set<string>> = {};
    for (const appt of bookedAppointments) {
      const dId = appt.doctorId.toString();
      if (!bookedSlotsMap[dId]) bookedSlotsMap[dId] = new Set();
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
        availableSlots: doc.availableSlots ?? [],
        bookedSlots: Array.from(booked),
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