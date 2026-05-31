"use client";

import ProtectedRoute from "@/src/components/ProtectedRoute";
import { useAuthStore } from "@/src/lib/store/useAuthStore";

export default function PatientDashboard() {
  const { user } = useAuthStore();

  return (
    <ProtectedRoute>
      <div className="p-6 md:p-10">
        <h1 className="text-3xl font-bold text-white mb-4">
          Welcome back, {user?.name}
        </h1>
        <p className="text-gray-400">
          Use the sidebar to manage your appointments, view your scan history, or book a new specialist.
        </p>
        
        {/* You can add summary cards here later, 
            like 'Upcoming Appointment' or 'Recent Scan Result' */}
      </div>
    </ProtectedRoute>
  );
}