import mongoose, { Schema, Document, Model } from "mongoose";

// ─── Interface ─────────────────────────────────────────────────────────────────

export interface IDoctor extends Document {
  /** Links to the User login account */
  userId: mongoose.Types.ObjectId | string;
  name: string;
  specialty: string;
  /** Array of tumor types / areas of clinical expertise */
  expertise: string[];
  /**
   * Stored as "Hospital Name, City" — e.g. "General Hospital, Lahore".
   * The API extracts the city portion for location filtering.
   */
  clinic: string;
  experience: string;
  fee: string;
  /**
   * ISO datetime strings representing slots the doctor has configured.
   * e.g. ["2026-06-03T20:30", "2026-06-04T10:00"]
   */
  availableSlots: string[];
  /**
   * Convenience field — the next chronologically open slot.
   * Kept for backward compat; prefer availableSlots + bookedSlots logic.
   */
  nextSlot?: string;
  image?: string;
  badge?: string;
  about?: string;
}

// ─── Schema ────────────────────────────────────────────────────────────────────

const DoctorSchema: Schema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,   // one profile per login
      index: true,
    },
    name: { type: String, required: true },
    specialty: { type: String, required: true },
    expertise: { type: [String], default: [] },
    clinic: { type: String, required: true },
    experience: { type: String, required: true },
    fee: { type: String, required: true },
    /**
     * availableSlots: list of ISO strings added by the doctor via
     * the DoctorProfileSettings form.  The booking API cross-checks
     * these against the Appointment collection to determine which are taken.
     */
    availableSlots: { type: [String], default: [] },
    /** Legacy convenience field; still written on profile save. */
    nextSlot: { type: String },
    image: { type: String },
    badge: { type: String, default: "Verified Specialist" },
    about: { type: String },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// ─── Model ─────────────────────────────────────────────────────────────────────

const Doctor: Model<IDoctor> =
  mongoose.models.Doctor ||
  mongoose.model<IDoctor>("Doctor", DoctorSchema);

export default Doctor;