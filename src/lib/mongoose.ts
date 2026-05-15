import mongoose from 'mongoose';
export async function connectDB() {
  if (mongoose.connection.readyState >= 1) return;
  const atlasUri = "mongodb+srv://fahadminhas:fahadminhas@cluster0.fpnw4kv.mongodb.net/medvision-ai?appName=Cluster0";
  console.log("Connecting to MongoDB Atlas...");
  return mongoose.connect(atlasUri);
}