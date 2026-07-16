import dns from 'dns';
import mongoose from 'mongoose';

// Node's built-in resolver can fail SRV lookups (querySrv ECONNREFUSED) against
// some local/VPN DNS servers even though the OS resolver handles them fine.
// Public DNS as a fallback avoids that for mongodb+srv:// connection strings.
dns.setServers([...dns.getServers(), '8.8.8.8', '8.8.4.4']);

export async function connectDB() {
  if (mongoose.connection.readyState >= 1) return;
  const atlasUri = process.env.MONGODB_URI;
  if (!atlasUri) {
    throw new Error('MONGODB_URI environment variable is not set');
  }
  console.log("Connecting to MongoDB Atlas...");
  return mongoose.connect(atlasUri);
}