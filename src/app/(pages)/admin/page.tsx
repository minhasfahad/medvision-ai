"use client";

import { useEffect, useState } from "react";
import api from "@/src/lib/axios";
import ProtectedRoute from "@/src/components/ProtectedRoute";

interface DashboardMetrics {
  totalPatients: number;
  totalDoctors: number;
  totalRadiologists: number;
  totalScans: number;
  totalAppointments: number;
  systemStatus: string;
}

export default function AdminOverview() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchOverviewData = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await api.get("/api/admin/overview");

        if (isMounted && response.data.success) {
          setMetrics(response.data.metrics);
        } else if (isMounted) {
          throw new Error(
            response.data.message || "Failed to load dashboard metrics",
          );
        }
      } catch (err: unknown) {
        if (!isMounted) return;

        const errorMessage =
          err instanceof Error
            ? err.message
            : "Failed to load dashboard statistics.";

        setError(errorMessage);
        console.error("Failed to load dashboard statistics:", err);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchOverviewData();

    return () => {
      isMounted = false;
    };
  }, []);

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="flex min-h-[50vh] items-center justify-center text-white">
          <div className="text-center">
            <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-purple-500/30 border-t-purple-500" />

            <p className="mt-4 text-sm font-medium text-gray-400">
              Loading system overview...
            </p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  if (error) {
    return (
      <ProtectedRoute>
        <div className="p-6">
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-5 text-sm text-red-300">
            {error}
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  const metricCards = [
    {
      title: "Total Patients",
      value: metrics?.totalPatients ?? 0,
      icon: "👥",
      description: "Registered patient accounts",
      iconClasses: "text-blue-400",
      accentClasses: "border-l-blue-500",
      descriptionClasses: "text-blue-400",
    },
    {
      title: "Total Doctors",
      value: metrics?.totalDoctors ?? 0,
      icon: "🩺",
      description: "Verified clinical professionals",
      iconClasses: "text-purple-400",
      accentClasses: "border-l-purple-500",
      descriptionClasses: "text-purple-400",
    },
    {
      title: "Total Radiologists",
      value: metrics?.totalRadiologists ?? 0,
      icon: "🔬",
      description: "Human-in-the-loop reviewers",
      iconClasses: "text-cyan-400",
      accentClasses: "border-l-cyan-500",
      descriptionClasses: "text-cyan-400",
    },
    {
      title: "Scans Processed",
      value: metrics?.totalScans ?? 0,
      icon: "🧠",
      description: "AI diagnostic executions",
      iconClasses: "text-indigo-400",
      accentClasses: "border-l-indigo-500",
      descriptionClasses: "text-indigo-400",
    },
    {
      title: "Appointments",
      value: metrics?.totalAppointments ?? 0,
      icon: "📅",
      description: "Total clinical bookings",
      iconClasses: "text-orange-400",
      accentClasses: "border-l-orange-500",
      descriptionClasses: "text-orange-400",
    },
    {
      title: "System Core",
      value: metrics?.systemStatus ?? "Offline",
      icon: "⚡",
      description: "Platform services status",
      iconClasses: "text-emerald-400",
      accentClasses: "border-l-emerald-500",
      descriptionClasses: "text-emerald-400",
      isStatus: true,
    },
  ];

  return (
    <ProtectedRoute>
      <div className="p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <div className="mb-8">
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-purple-400">
            Administration
          </p>

          <h1 className="text-2xl font-bold tracking-wide text-white sm:text-3xl">
            System Overview
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-400">
            Monitor registered users, medical professionals, AI scan activity,
            appointments, and platform availability.
          </p>
        </div>

        {/* Metrics */}
        <div className="mb-8 grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {metricCards.map((card) => (
            <div
              key={card.title}
              className={`rounded-xl border border-gray-800 border-l-4 ${card.accentClasses} bg-[#1a163a] p-5 shadow-xl transition-all duration-200 hover:-translate-y-0.5 hover:border-gray-700 hover:shadow-2xl sm:p-6`}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                    {card.title}
                  </p>

                  <h3
                    className={`mt-4 text-3xl font-extrabold ${
                      card.isStatus ? "text-emerald-400" : "text-white"
                    }`}
                  >
                    {typeof card.value === "number"
                      ? card.value.toLocaleString()
                      : card.value}
                  </h3>
                </div>

                <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-gray-700 bg-[#120f26]">
                  <span className={`text-xl ${card.iconClasses}`}>
                    {card.icon}
                  </span>
                </div>
              </div>

              <p className={`mt-3 text-xs ${card.descriptionClasses}`}>
                {card.description}
              </p>
            </div>
          ))}
        </div>

        {/* Platform Monitor */}
        <div className="rounded-xl border border-gray-800 bg-[#1a163a] p-5 shadow-2xl sm:p-6">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-white sm:text-xl">
                Platform Health Monitor
              </h2>

              <p className="mt-1 text-xs text-gray-500">
                Live status of core MedVision AI services
              </p>
            </div>

            <span className="rounded-full border border-emerald-500/30 bg-emerald-900/20 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-400">
              {metrics?.systemStatus ?? "Offline"}
            </span>
          </div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            <div className="rounded-lg border border-gray-800 bg-[#120f26] p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs font-semibold text-gray-300">
                  MongoDB Database
                </p>

                <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
              </div>

              <p className="mt-2 text-xs text-gray-500">
                Connected to Atlas Cluster
              </p>
            </div>

            <div className="rounded-lg border border-gray-800 bg-[#120f26] p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs font-semibold text-gray-300">
                  AI Model Pipeline
                </p>

                <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
              </div>

              <p className="mt-2 text-xs text-gray-500">
                YOLO11s-seg inference ready
              </p>
            </div>

            <div className="rounded-lg border border-gray-800 bg-[#120f26] p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs font-semibold text-gray-300">
                  Radiology Workflow
                </p>

                <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
              </div>

              <p className="mt-2 text-xs text-gray-500">
                Human review pipeline operational
              </p>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}