import { NextRequest, NextResponse } from "next/server";
import { getRecommendedDoctors, getAllDoctors } from "@/src/repositories/doctor.repository";
import Doctor from "@/src/models/doctor.model";

export async function GET(req: NextRequest) {
  try {
    // Extract search parameters from the NextRequest URL
    const searchParams = req.nextUrl.searchParams;
    const tumorType = searchParams.get("tumor");

    let doctors;

    // Check if a specific tumor type was passed and is not a negative result
    if (tumorType && tumorType !== "No Tumor" && tumorType !== "undefined" && tumorType !== "null") {
      doctors = await getRecommendedDoctors(tumorType);
    } else {
      // If no specific tumor is detected, fetch the general list of doctors
      doctors = await getAllDoctors();
    }

    return NextResponse.json({ success: true, data: doctors });
  } catch (error: unknown) {
    console.error("Error fetching doctors:", error);
    
    // TypeScript-safe error handling
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred while fetching doctors.";
    
    return NextResponse.json(
      { success: false, error: errorMessage }, 
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    // Check if the body is an array of doctors, or a single doctor
    if (Array.isArray(body)) {
      const insertedDoctors = await Doctor.insertMany(body);
      return NextResponse.json({ success: true, message: "Multiple doctors added!", data: insertedDoctors });
    } else {
      const newDoctor = new Doctor(body);
      const savedDoctor = await newDoctor.save();
      return NextResponse.json({ success: true, message: "Doctor added!", data: savedDoctor });
    }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Error saving doctor";
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
  }
}