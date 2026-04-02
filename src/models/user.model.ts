import mongoose, { Schema, Document, Model } from 'mongoose';

// 1. Define the TypeScript Interface
export interface IUser extends Document {
  name: string;
  email: string;
  password_hash: string;
  role: string; // You can also use a String Literal type here like 'admin' | 'user'
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
      select: false // Security: Do not return password by default
    },
    role: { 
      type: String, 
      required: true, 
      default: 'patient' 
    }
  },
  {
    timestamps: true, // Automatically manages createdAt and updatedAt
    versionKey: false // Removes the __v field
  }
);

// Use existing model if it exists, otherwise create a new one
export const UserModel: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);