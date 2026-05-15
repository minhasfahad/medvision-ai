import mongoose, { Schema, Document, Model } from "mongoose";

export interface IDoctor extends Document {
  name: string;
  specialty: string;
  expertise: string[]; // e.g., ["Meningioma", "Glioma"]
  clinic: string;
  experience: string;
  fee: string;
  nextSlot: string;
  image?: string;
  badge?: string;
}

const DoctorSchema: Schema = new Schema({
  name: { type: String, required: true },
  specialty: { type: String, required: true },
  expertise: { type: [String], required: true },
  clinic: { type: String, required: true },
  experience: { type: String, required: true },
  fee: { type: String, required: true },
  nextSlot: { type: String, required: true },
  image: { type: String },
  badge: { type: String },
});

const Doctor: Model<IDoctor> = mongoose.models.Doctor || mongoose.model<IDoctor>("Doctor", DoctorSchema);
export default Doctor;