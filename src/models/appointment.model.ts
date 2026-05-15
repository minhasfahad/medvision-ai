import mongoose, { Schema, Document } from 'mongoose';

export interface IAppointment extends Document {
  userId: string;
  patientName: string; // <--- ADD THIS
  doctorId: string;
  doctorName: string;
  clinic: string;
  appointmentDate: string;
  fee: string;
  status: string;
  tumorType: string;
}

const AppointmentSchema: Schema = new Schema({
  userId: { type: String, required: true },
  patientName: { type: String, required: true }, // <--- ADD THIS
  doctorId: { type: String, required: true },
  doctorName: { type: String, required: true },
  clinic: { type: String, required: true },
  appointmentDate: { type: String, required: true },
  fee: { type: String, required: true },
  status: { type: String, default: 'Pending' },
  tumorType: { type: String, required: true }
}, { timestamps: true });

export const Appointment = mongoose.models.Appointment || mongoose.model<IAppointment>('Appointment', AppointmentSchema);