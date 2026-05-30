"use client";

import { useState, useEffect } from "react";
import api from "@/src/lib/axios";
import ProtectedRoute from "@/src/components/ProtectedRoute";
// 1. Update the interface to include appointments
interface DashboardMetrics {
  totalPatients: number;
  totalDoctors: number;
  totalScans: number;
  totalAppointments: number;
  systemStatus: string;
}

export default function AdminOverview() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOverviewData = async () => {
      try {
        const res = await api.get("/api/admin/overview");
        if (res.data.success) {
          setMetrics(res.data.metrics);
        }
      } catch (error) {
        console.error("Failed to load dashboard statistics:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOverviewData();
  }, []);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center text-white">
        <span className="text-lg font-medium animate-pulse">
          Loading system overview...
        </span>
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <div className="p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white tracking-wide">
            System Overview
          </h1>
          <p className="text-gray-400 mt-2 text-sm">
            Real-time status metrics and user analytical insights.
          </p>
        </div>

        {/* Analytics Grid - Updated to xl:grid-cols-5 to accommodate the new card */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mb-8">
          {/* Metric Card 1: Patients */}
          <div className="bg-[#1a163a] p-6 rounded-xl border border-gray-800 shadow-xl">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
                Total Patients
              </span>
              <span className="text-blue-500 text-xl font-bold">👥</span>
            </div>
            <div className="mt-4">
              <h3 className="text-3xl font-extrabold text-white">
                {metrics?.totalPatients ?? 0}
              </h3>
              <p className="text-xs text-emerald-400 mt-2">
                Active records registered
              </p>
            </div>
          </div>

          {/* Metric Card 2: Doctors */}
          <div className="bg-[#1a163a] p-6 rounded-xl border border-gray-800 shadow-xl">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
                Total Doctors
              </span>
              <span className="text-purple-500 text-xl font-bold">🩺</span>
            </div>
            <div className="mt-4">
              <h3 className="text-3xl font-extrabold text-white">
                {metrics?.totalDoctors ?? 0}
              </h3>
              <p className="text-xs text-emerald-400 mt-2">
                Verified medical staff
              </p>
            </div>
          </div>

          {/* Metric Card 3: Scans */}
          <div className="bg-[#1a163a] p-6 rounded-xl border border-gray-800 shadow-xl">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
                Scans Processed
              </span>
              <span className="text-indigo-500 text-xl font-bold">🧠</span>
            </div>
            <div className="mt-4">
              <h3 className="text-3xl font-extrabold text-white">
                {metrics?.totalScans.toLocaleString() ?? "0"}
              </h3>
              <p className="text-xs text-purple-400 mt-2">
                YOLOv11 execution count
              </p>
            </div>
          </div>

          {/* NEW Metric Card 4: Appointments */}
          <div className="bg-[#1a163a] p-6 rounded-xl border border-gray-800 shadow-xl border-l-4 border-l-orange-500">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
                Appointments
              </span>
              <span className="text-orange-500 text-xl font-bold">📅</span>
            </div>
            <div className="mt-4">
              <h3 className="text-3xl font-extrabold text-white">
                {metrics?.totalAppointments.toLocaleString() ?? "0"}
              </h3>
              <p className="text-xs text-orange-400 mt-2">
                Total clinic bookings
              </p>
            </div>
          </div>

          {/* Metric Card 5: System Core */}
          <div className="bg-[#1a163a] p-6 rounded-xl border border-gray-800 shadow-xl">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
                System Core
              </span>
              <span className="text-emerald-500 text-xl font-bold">⚡</span>
            </div>
            <div className="mt-4">
              <h3 className="text-3xl font-extrabold text-emerald-400">
                {metrics?.systemStatus ?? "Offline"}
              </h3>
              <p className="text-xs text-gray-400 mt-2">
                All gateway servers live
              </p>
            </div>
          </div>
        </div>

        {/* Secondary Quick-Actions Area */}
        <div className="bg-[#1a163a] rounded-xl border border-gray-800 p-6 shadow-2xl">
          <h2 className="text-xl font-bold text-white mb-4">
            Quick Diagnostic Monitor
          </h2>
          <div className="p-4 bg-[#120f26] rounded-lg text-sm text-gray-300 font-mono space-y-2 border border-gray-800">
            <p className="text-gray-500">
              Active server environmental variables loaded
            </p>
            <p>
              <span className="text-purple-400">MongoDB connection:</span>{" "}
              Connected to Atlas Cluster
            </p>
            <p>
              <span className="text-purple-400">Model pipeline status:</span>{" "}
              YOLOv11 Inference Ready
            </p>
            <p>
              <span className="text-purple-400">Nginx Handshake:</span> Upstream
              Reverse Proxy Responsive
            </p>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
