import mongoose, { Schema, Document, Model } from 'mongoose';

// 1. Define the TypeScript Interface
export interface IUser extends Document {
  name: string;
  email: string;
  password_hash: string;
  role: string; 
  age?: number;   // <-- NEW: Optional age attribute
  image?: string; // <-- NEW: Optional image attribute (will store URL or base64)
  createdAt: Date;
  updatedAt: Date;
}

// 2. Define the Schema
const UserSchema: Schema = new Schema(
  {
    name: { 
      type: String, 
      required: true 
    },
    email: { 
      type: String, 
      required: true, 
      unique: true, 
      trim: true,
      lowercase: true 
    },
    password_hash: { 
      type: String, 
      required: true,
      select: false 
    },
    role: { 
      type: String, 
      required: true, 
      default: 'patient' 
    },
    age: { 
      type: Number, 
      required: false // <-- NEW
    },
    image: {
      type: String,
      required: false // <-- NEW
    }
  },
  {
    timestamps: true, 
    versionKey: false 
  }
);

export const UserModel: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);