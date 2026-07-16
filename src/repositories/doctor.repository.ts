import Doctor, { IDoctor } from "@/src/models/doctor.model";
import { Appointment} from "@/src/models/appointment.model";
import { connectDB } from "@/src/lib/mongoose";

// Helper function to check if doctors are booked
const checkAvailability = async (doctors: IDoctor[]) => {
  return await Promise.all(
    doctors.map(async (doc) => {
      // Look for any existing appointment for this doctor at their specific time slot
      const existingBooking = await Appointment.exists({
        doctorId: doc._id,
        appointmentDate: doc.nextSlot,
        status: { $in: ["Pending", "Confirmed"] } // If it is pending or confirmed, it's reserved
      });

      return {
        ...doc,
        isBooked: !!existingBooking // Adds a true/false flag to the doctor object
      };
    })
  );
};

export const getRecommendedDoctors = async (tumorType: string) => {
  await connectDB();
  const doctors = await Doctor.find({
    $or: [
      { expertise: tumorType },
      { specialty: { $regex: /Neuro/i } }
    ]
  }).lean() as IDoctor[];

  // Run the check before returning
  return await checkAvailability(doctors);
};

export const getAllDoctors = async () => {
  await connectDB();
  const doctors = await Doctor.find({}).lean() as IDoctor[];
  
  // Run the check before returning
  return await checkAvailability(doctors);
};