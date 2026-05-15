import { Appointment,  IAppointment } from "@/src/models/appointment.model";
import { connectDB } from "@/src/lib/mongoose";

export const saveAppointment = async (data: Partial<IAppointment>): Promise<IAppointment> => {
  await connectDB();
  const newAppointment = new Appointment(data);
  return await newAppointment.save();
};

export const getUserAppointments = async (userId: string): Promise<IAppointment[]> => {
  await connectDB();
  return await Appointment.find({ userId }).populate("doctorId").sort({ createdAt: -1 }).lean();
};

// Add this to the bottom of the file
export const getAllAppointments = async () => {
  await connectDB();
  // Fetch all appointments and sort by newest first
  return await Appointment.find({}).sort({ createdAt: -1 }).lean();
};

// Add this to the bottom of the file
export const updateAppointmentStatus = async (appointmentId: string, status: string) => {
  await connectDB();
  return await Appointment.findByIdAndUpdate(
    appointmentId,
    { status },
    { new: true }
  ).lean();
};