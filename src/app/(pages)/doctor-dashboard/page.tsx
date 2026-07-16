"use client";

import { useState, useEffect } from "react";
import api from "@/src/lib/axios";
import { useAuthStore } from "@/src/lib/store/useAuthStore";
import ProtectedRoute from "@/src/components/ProtectedRoute";
import { Users, CalendarClock, CheckCircle2, Brain, Loader2 } from "lucide-react";

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
      <div className="flex h-64 items-center justify-center gap-3 text-white">
        <Loader2 className="w-5 h-5 animate-spin text-blue-400" />
        <span className="text-lg font-medium">
          Loading clinical overview...
        </span>
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <div className="p-6">
        <div className="mb-8 animate-fade-in-up">
          <h1 className="text-3xl font-bold text-white tracking-wide">
            Welcome, Dr.{" "}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-400 to-blue-400 animate-gradient-x">
              {user?.name.split(" ").pop() || "Physician"}
            </span>
          </h1>
          <p className="text-gray-400 mt-2 text-sm">
            Your personal clinical dashboard and patient overview.
          </p>
        </div>

        {/* Analytics Grid - 4 Cards for Doctors */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">

          {/* Metric Card 1: Unique Patients */}
          <div
            className="bg-white/5 backdrop-blur-sm p-6 rounded-2xl border border-white/10 shadow-xl hover:-translate-y-1 hover:border-blue-500/30 transition-all duration-300 animate-fade-in-up"
            style={{ animationDelay: "0ms" }}
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
                My Patients
              </span>
              <div className="w-10 h-10 rounded-xl bg-blue-900/40 border border-blue-500/20 flex items-center justify-center flex-none">
                <Users className="w-5 h-5 text-blue-400" />
              </div>
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
          <div
            className="bg-white/5 backdrop-blur-sm p-6 rounded-2xl border border-white/10 shadow-xl border-l-4 border-l-amber-500 hover:-translate-y-1 hover:border-amber-500/40 transition-all duration-300 animate-fade-in-up"
            style={{ animationDelay: "80ms" }}
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
                Upcoming Schedule
              </span>
              <div className="w-10 h-10 rounded-xl bg-amber-900/40 border border-amber-500/20 flex items-center justify-center flex-none">
                <CalendarClock className="w-5 h-5 text-amber-400" />
              </div>
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
          <div
            className="bg-white/5 backdrop-blur-sm p-6 rounded-2xl border border-white/10 shadow-xl hover:-translate-y-1 hover:border-emerald-500/30 transition-all duration-300 animate-fade-in-up"
            style={{ animationDelay: "160ms" }}
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
                Consultations
              </span>
              <div className="w-10 h-10 rounded-xl bg-emerald-900/40 border border-emerald-500/20 flex items-center justify-center flex-none">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              </div>
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
          <div
            className="bg-white/5 backdrop-blur-sm p-6 rounded-2xl border border-white/10 shadow-xl hover:-translate-y-1 hover:border-purple-500/30 transition-all duration-300 animate-fade-in-up"
            style={{ animationDelay: "240ms" }}
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
                Patient Scans
              </span>
              <div className="w-10 h-10 rounded-xl bg-purple-900/40 border border-purple-500/20 flex items-center justify-center flex-none">
                <Brain className="w-5 h-5 text-purple-400" />
              </div>
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