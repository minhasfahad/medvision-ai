import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/medvision_test'

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable');
}

export async function connectDB() {
  if (mongoose.connection.readyState >= 1) return;
  console.log("Connected with Mongo DB Successfuly!");
  return mongoose.connect(MONGODB_URI);
}