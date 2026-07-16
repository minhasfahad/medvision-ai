"use client";

import { useEffect, useState } from "react";
import api from "@/src/lib/axios";
import ProtectedRoute from "@/src/components/ProtectedRoute";
import {
  Users,
  Stethoscope,
  Microscope,
  Brain,
  CalendarClock,
  Zap,
  Database,
  Cpu,
  ClipboardCheck,
} from "lucide-react";

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
        <div className="flex min-h-[50vh] items-center justify-center text-white p-4 sm:p-6 lg:p-8">
          <div className="text-center animate-fade-in-up">
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
        <div className="p-4 sm:p-6 lg:p-8">
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 backdrop-blur-sm p-5 text-sm text-red-300 animate-fade-in-up">
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
      icon: Users,
      description: "Registered patient accounts",
      iconClasses: "text-blue-400",
      accentClasses: "border-l-blue-500",
      descriptionClasses: "text-blue-400",
    },
    {
      title: "Total Doctors",
      value: metrics?.totalDoctors ?? 0,
      icon: Stethoscope,
      description: "Verified clinical professionals",
      iconClasses: "text-purple-400",
      accentClasses: "border-l-purple-500",
      descriptionClasses: "text-purple-400",
    },
    {
      title: "Total Radiologists",
      value: metrics?.totalRadiologists ?? 0,
      icon: Microscope,
      description: "Human-in-the-loop reviewers",
      iconClasses: "text-cyan-400",
      accentClasses: "border-l-cyan-500",
      descriptionClasses: "text-cyan-400",
    },
    {
      title: "Scans Processed",
      value: metrics?.totalScans ?? 0,
      icon: Brain,
      description: "AI diagnostic executions",
      iconClasses: "text-indigo-400",
      accentClasses: "border-l-indigo-500",
      descriptionClasses: "text-indigo-400",
    },
    {
      title: "Appointments",
      value: metrics?.totalAppointments ?? 0,
      icon: CalendarClock,
      description: "Total clinical bookings",
      iconClasses: "text-orange-400",
      accentClasses: "border-l-orange-500",
      descriptionClasses: "text-orange-400",
    },
    {
      title: "System Core",
      value: metrics?.systemStatus ?? "Offline",
      icon: Zap,
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
        <div className="mb-8 animate-fade-in-up">
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-purple-400">
            Administration
          </p>

          <h1 className="text-2xl font-bold tracking-wide text-white sm:text-3xl bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-400 to-blue-400 animate-gradient-x">
            System Overview
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-400">
            Monitor registered users, medical professionals, AI scan activity,
            appointments, and platform availability.
          </p>
        </div>

        {/* Metrics */}
        <div className="mb-8 grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {metricCards.map((card, idx) => (
            <div
              key={card.title}
              style={{ animationDelay: `${idx * 80}ms` }}
              className={`group rounded-xl border border-white/10 border-l-4 ${card.accentClasses} bg-white/5 backdrop-blur-sm p-5 shadow-xl transition-all duration-300 hover:-translate-y-1 hover:border-l-8 hover:bg-white/[0.07] hover:shadow-2xl sm:p-6 animate-fade-in-up`}
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

                <div className="flex h-11 w-11 flex-none items-center justify-center rounded-xl border border-white/10 bg-[#120f26] transition-transform duration-300 group-hover:scale-110">
                  <card.icon className={`h-5 w-5 ${card.iconClasses}`} />
                </div>
              </div>

              <p className={`mt-3 text-xs ${card.descriptionClasses}`}>
                {card.description}
              </p>
            </div>
          ))}
        </div>

        {/* Platform Monitor */}
        <div
          className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm p-5 shadow-2xl sm:p-6 animate-fade-in-up"
          style={{ animationDelay: `${metricCards.length * 80}ms` }}
        >
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-white sm:text-xl">
                Platform Health Monitor
              </h2>

              <p className="mt-1 text-xs text-gray-500">
                Live status of core MedVision AI services
              </p>
            </div>

            <span className="rounded-full border border-emerald-500/30 bg-emerald-900/20 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-400 animate-pulse">
              {metrics?.systemStatus ?? "Offline"}
            </span>
          </div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            <div className="group rounded-lg border border-white/10 bg-[#120f26] p-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-emerald-500/30">
              <div className="flex items-center justify-between gap-3">
                <p className="flex items-center gap-2 text-xs font-semibold text-gray-300">
                  <Database className="h-3.5 w-3.5 text-emerald-400" />
                  MongoDB Database
                </p>

                <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.7)] animate-pulse" />
              </div>

              <p className="mt-2 text-xs text-gray-500">
                Connected to Atlas Cluster
              </p>
            </div>

            <div className="group rounded-lg border border-white/10 bg-[#120f26] p-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-emerald-500/30">
              <div className="flex items-center justify-between gap-3">
                <p className="flex items-center gap-2 text-xs font-semibold text-gray-300">
                  <Cpu className="h-3.5 w-3.5 text-emerald-400" />
                  AI Model Pipeline
                </p>

                <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.7)] animate-pulse" />
              </div>

              <p className="mt-2 text-xs text-gray-500">
                YOLO11s-seg inference ready
              </p>
            </div>

            <div className="group rounded-lg border border-white/10 bg-[#120f26] p-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-emerald-500/30">
              <div className="flex items-center justify-between gap-3">
                <p className="flex items-center gap-2 text-xs font-semibold text-gray-300">
                  <ClipboardCheck className="h-3.5 w-3.5 text-emerald-400" />
                  Radiology Workflow
                </p>

                <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.7)] animate-pulse" />
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