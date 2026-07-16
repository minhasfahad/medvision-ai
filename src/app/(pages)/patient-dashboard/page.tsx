"use client";

import ProtectedRoute from "@/src/components/ProtectedRoute";
import { useAuthStore } from "@/src/lib/store/useAuthStore";
import { HeartPulse, Sparkles } from "lucide-react";

export default function PatientDashboard() {
  const { user } = useAuthStore();

  return (
    <ProtectedRoute>
      <div className="relative p-6 md:p-10 overflow-hidden">
        {/* Decorative ambient glows */}
        <div className="pointer-events-none absolute -top-16 -left-16 w-72 h-72 bg-blue-600/20 rounded-full blur-[100px] -z-10" />
        <div className="pointer-events-none absolute top-10 right-0 w-80 h-80 bg-purple-600/20 rounded-full blur-[110px] -z-10" />

        <div className="animate-fade-in-up bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 md:p-8 shadow-xl">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-11 h-11 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center flex-none">
              <HeartPulse className="w-5 h-5 text-blue-400" />
            </div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-300 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" /> Patient Portal
            </span>
          </div>

          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4 leading-tight">
            Welcome back,{" "}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-400 to-blue-400 animate-gradient-x">
              {user?.name}
            </span>
          </h1>
          <p className="text-gray-300 max-w-2xl leading-relaxed">
            Use the sidebar to manage your appointments, view your scan history, or book a new specialist.
          </p>
        </div>

        {/* You can add summary cards here later,
            like 'Upcoming Appointment' or 'Recent Scan Result' */}
      </div>
    </ProtectedRoute>
  );
}