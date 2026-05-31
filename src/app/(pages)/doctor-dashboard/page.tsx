"use client";

import { useState, useEffect } from "react";
import api from "@/src/lib/axios";
import { useAuthStore } from "@/src/lib/store/useAuthStore";
import ProtectedRoute from "@/src/components/ProtectedRoute";

interface DoctorMetrics {
  totalPatients: number;
  upcomingAppointments: number;
  completedAppointments: number;
  totalScansReviewed: number;
}

export default function DoctorOverview() {
  const { user } = useAuthStore();
  const [metrics, setMetrics] = useState<DoctorMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDoctorMetrics = async () => {
      if (!user?.id) return;

      try {
        // We will build this exact API route next!
        const res = await api.get(`/api/appointments?userId=${user?.id}&role=doctor`);
        if (res.data.success) {
          setMetrics(res.data.metrics);
        }
      } catch (error) {
        console.error("Failed to load doctor statistics:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDoctorMetrics();
  }, [user?.id]);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center text-white">
        <span className="text-lg font-medium animate-pulse">
          Loading clinical overview...
        </span>
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <div className="p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white tracking-wide">
            Welcome, Dr. {user?.name.split(" ").pop() || "Physician"}
          </h1>
          <p className="text-gray-400 mt-2 text-sm">
            Your personal clinical dashboard and patient overview.
          </p>
        </div>

        {/* Analytics Grid - 4 Cards for Doctors */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
          
          {/* Metric Card 1: Unique Patients */}
          <div className="bg-[#1a163a] p-6 rounded-xl border border-gray-800 shadow-xl">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
                My Patients
              </span>
              <span className="text-blue-500 text-xl font-bold">👥</span>
            </div>
            <div className="mt-4">
              <h3 className="text-3xl font-extrabold text-white">
                {metrics?.totalPatients ?? 0}
              </h3>
              <p className="text-xs text-emerald-400 mt-2">
                Patients assigned to you
              </p>
            </div>
          </div>

          {/* Metric Card 2: Upcoming Appointments */}
          <div className="bg-[#1a163a] p-6 rounded-xl border border-gray-800 shadow-xl border-l-4 border-l-amber-500">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
                Upcoming Schedule
              </span>
              <span className="text-amber-500 text-xl font-bold">📅</span>
            </div>
            <div className="mt-4">
              <h3 className="text-3xl font-extrabold text-white">
                {metrics?.upcomingAppointments ?? 0}
              </h3>
              <p className="text-xs text-amber-400 mt-2">
                Pending & Confirmed bookings
              </p>
            </div>
          </div>

          {/* Metric Card 3: Completed Appointments */}
          <div className="bg-[#1a163a] p-6 rounded-xl border border-gray-800 shadow-xl">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
                Consultations
              </span>
              <span className="text-emerald-500 text-xl font-bold">✓</span>
            </div>
            <div className="mt-4">
              <h3 className="text-3xl font-extrabold text-white">
                {metrics?.completedAppointments ?? 0}
              </h3>
              <p className="text-xs text-emerald-400 mt-2">
                Completed sessions
              </p>
            </div>
          </div>

          {/* Metric Card 4: Scans */}
          <div className="bg-[#1a163a] p-6 rounded-xl border border-gray-800 shadow-xl">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
                Patient Scans
              </span>
              <span className="text-purple-500 text-xl font-bold">🧠</span>
            </div>
            <div className="mt-4">
              <h3 className="text-3xl font-extrabold text-white">
                {metrics?.totalScansReviewed ?? 0}
              </h3>
              <p className="text-xs text-purple-400 mt-2">
                Available for review
              </p>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}