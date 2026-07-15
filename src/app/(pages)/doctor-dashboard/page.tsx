"use client";

import { useState, useEffect } from "react";
import api from "@/src/lib/axios";
import { useAuthStore } from "@/src/lib/store/useAuthStore";
import ProtectedRoute from "@/src/components/ProtectedRoute";
import Reveal from "@/src/components/Reveal";
import SpotlightCard from "@/src/components/SpotlightCard";
import CountUp from "@/src/components/CountUp";
import {
  Users,
  CalendarClock,
  CheckCircle2,
  Brain,
  Loader2,
  Sparkles,
  ArrowUpRight,
} from "lucide-react";

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
        const res = await api.get(
          `/api/appointments?userId=${user?.id}&role=doctor`,
        );
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

  // Derived, presentation-only figures — computed straight from the metrics
  // already returned by the API, no extra requests involved.
  const totalPatients = metrics?.totalPatients ?? 0;
  const upcomingAppointments = metrics?.upcomingAppointments ?? 0;
  const completedAppointments = metrics?.completedAppointments ?? 0;
  const totalScansReviewed = metrics?.totalScansReviewed ?? 0;
  const workload = upcomingAppointments + completedAppointments;
  const completionRate =
    workload > 0 ? Math.round((completedAppointments / workload) * 100) : 0;

  return (
    <ProtectedRoute>
      <div className="p-6">
        {/* Header */}
        <Reveal>
          <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
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

            <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs text-gray-400 backdrop-blur-sm self-start md:self-auto">
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              <span className="text-gray-300 font-semibold">
                {completionRate}%
              </span>
              consultation completion rate
            </div>
          </div>
        </Reveal>

        {/* Asymmetric bento metric grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5 mb-8 xl:auto-rows-[168px]">
          {/* Hero tile: My Patients */}
          <Reveal
            variant="zoom"
            className="md:col-span-2 xl:col-span-2 xl:row-span-2"
            fill
          >
            <SpotlightCard
              color="96,165,250"
              className="h-full rounded-3xl border border-white/10 bg-[#12172a]/85 backdrop-blur-sm shadow-xl hover:border-blue-500/30 transition-colors duration-300 p-7 flex flex-col justify-between"
            >
              <div className="flex items-start justify-between">
                <span className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
                  My Patients
                </span>
                <div className="w-11 h-11 rounded-xl bg-blue-900/40 border border-blue-500/20 flex items-center justify-center flex-none">
                  <Users className="w-5 h-5 text-blue-400" />
                </div>
              </div>
              <div>
                <CountUp
                  value={totalPatients}
                  className="block text-6xl sm:text-7xl font-extrabold text-white leading-none"
                />
                <p className="text-sm text-emerald-400 mt-4 flex items-center gap-1.5">
                  <ArrowUpRight className="w-4 h-4" />
                  Patients assigned to you
                </p>
              </div>
            </SpotlightCard>
          </Reveal>

          {/* Upcoming Schedule */}
          <Reveal delay={80} fill>
            <SpotlightCard
              color="245,158,11"
              className="h-full rounded-3xl border border-white/10 border-l-4 border-l-amber-500 bg-[#12172a]/85 backdrop-blur-sm shadow-xl hover:border-amber-500/40 transition-colors duration-300 p-6 flex flex-col justify-between"
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
                <CountUp
                  value={upcomingAppointments}
                  className="block text-3xl font-extrabold text-white"
                />
                <p className="text-xs text-amber-400 mt-2">
                  Pending &amp; Confirmed bookings
                </p>
              </div>
            </SpotlightCard>
          </Reveal>

          {/* Consultations completed */}
          <Reveal delay={160} fill>
            <SpotlightCard
              color="52,211,153"
              className="h-full rounded-3xl border border-white/10 bg-[#12172a]/85 backdrop-blur-sm shadow-xl hover:border-emerald-500/30 transition-colors duration-300 p-6 flex flex-col justify-between"
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
                <CountUp
                  value={completedAppointments}
                  className="block text-3xl font-extrabold text-white"
                />
                <p className="text-xs text-emerald-400 mt-2">
                  Completed sessions
                </p>
              </div>
            </SpotlightCard>
          </Reveal>

          {/* Patient Scans */}
          <Reveal delay={240} className="md:col-span-2 xl:col-span-2" fill>
            <SpotlightCard
              color="168,85,247"
              className="h-full rounded-3xl border border-white/10 bg-[#12172a]/85 backdrop-blur-sm shadow-xl hover:border-purple-500/30 transition-colors duration-300 p-6"
            >
              <div className="w-full flex items-center justify-between">
                <span className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
                  Patient Scans
                </span>
                <div className="w-14 h-14 rounded-2xl bg-purple-900/40 border border-purple-500/20 flex items-center justify-center flex-none">
                  <Brain className="w-7 h-7 text-purple-400" />
                </div>
              </div>

              <CountUp
                value={totalScansReviewed}
                className="block mt-3 text-4xl font-extrabold text-white"
              />
              <p className="text-xs text-purple-400 mt-2">
                Available for review
              </p>
            </SpotlightCard>
          </Reveal>
        </div>
      </div>
    </ProtectedRoute>
  );
}
