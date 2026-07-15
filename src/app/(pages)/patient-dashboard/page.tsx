"use client";

import Link from "next/link";
import ProtectedRoute from "@/src/components/ProtectedRoute";
import Reveal from "@/src/components/Reveal";
import SpotlightCard from "@/src/components/SpotlightCard";
import { useAuthStore } from "@/src/lib/store/useAuthStore";
import {
  HeartPulse,
  Sparkles,
  Stethoscope,
  CalendarClock,
  History,
  ArrowUpRight,
} from "lucide-react";

// ─── Quick-action tile definitions ─────────────────────────────────────────────
// Pure navigation — same destinations already exposed via the patient sidebar.

const QUICK_ACTIONS = [
  {
    title: "Book a Specialist",
    description:
      "Browse available doctors, compare expertise and confirm a time slot in a couple of taps.",
    href: "/patient-dashboard/appointments",
    icon: Stethoscope,
    glow: "168,85,247",
    accent: "from-purple-600/20 to-purple-500/5 border-purple-500/30",
    iconAccent: "text-purple-300",
  },
  {
    title: "My Appointments",
    description:
      "Track upcoming visits, join a video consultation, or reschedule when plans change.",
    href: "/patient-dashboard/my-appointments",
    icon: CalendarClock,
    glow: "96,165,250",
    accent: "from-blue-600/20 to-blue-500/5 border-blue-500/30",
    iconAccent: "text-blue-300",
  },
  {
    title: "My Scan History",
    description:
      "Revisit past MRI scans alongside doctor notes and radiologist verification.",
    href: "/patient-dashboard/my-history",
    icon: History,
    glow: "96,165,250",
    accent: "from-blue-600/10 via-purple-600/10 to-blue-600/10 border-white/10",
    iconAccent: "text-blue-300",
  },
] as const;

export default function PatientDashboard() {
  const { user } = useAuthStore();

  return (
    <ProtectedRoute>
      <div className="relative p-6 md:p-10 overflow-hidden">
        {/* Decorative ambient glows */}
        <div className="pointer-events-none absolute -top-16 -left-16 w-72 h-72 bg-blue-600/20 rounded-full blur-[100px] -z-10" />
        <div className="pointer-events-none absolute top-10 right-0 w-80 h-80 bg-purple-600/20 rounded-full blur-[110px] -z-10" />

        {/* ── Hero header ── */}
        <Reveal variant="up">
          <div className="relative overflow-hidden bg-[#0d1128]/80 bg-gradient-to-br from-white/[0.07] via-white/[0.04] to-transparent backdrop-blur-sm border border-white/10 rounded-3xl p-7 md:p-12 shadow-2xl">
            <div className="pointer-events-none absolute -top-24 -right-24 w-64 h-64 rounded-full bg-purple-500/10 blur-[90px]" />

            <div className="relative flex flex-col gap-6">
              <div className="flex flex-wrap items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600/30 to-purple-600/30 border border-blue-500/30 flex items-center justify-center flex-none shadow-[0_0_20px_rgba(59,130,246,0.25)]">
                  <HeartPulse className="w-6 h-6 text-blue-300" />
                </div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-300 text-xs font-semibold">
                  <Sparkles className="w-3.5 h-3.5" /> Patient Portal
                </span>
              </div>

              <div>
                <p className="text-gray-400 text-sm font-medium mb-2 tracking-wide uppercase">
                  Welcome back
                </p>
                <h1 className="text-4xl md:text-6xl font-bold text-white leading-[1.05] tracking-tight">
                  <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-400 to-blue-400 animate-gradient-x">
                    {user?.name}
                  </span>
                </h1>
              </div>

              <p className="text-gray-300 max-w-2xl leading-relaxed text-sm md:text-base">
                Everything about your care lives in one place — book a
                specialist, keep tabs on your appointments, and review your
                scan history whenever you need to.
              </p>
            </div>
          </div>
        </Reveal>

        {/* ── Quick-action tiles ── */}
        <div className="mt-6 md:mt-8 grid grid-cols-1 md:grid-cols-3 gap-5">
          {QUICK_ACTIONS.map((action, i) => {
            const Icon = action.icon;
            return (
              <Reveal key={action.href} delay={i * 100} variant="up" fill>
                <Link href={action.href} className="block h-full group">
                  <SpotlightCard
                    color={action.glow}
                    className={`h-full rounded-2xl border bg-gradient-to-br ${action.accent} backdrop-blur-sm p-6 shadow-lg transition-all duration-300 group-hover:-translate-y-1.5 group-hover:shadow-2xl`}
                  >
                    <div className="flex h-full flex-col justify-between gap-8">
                      <div className="flex items-start justify-between">
                        <div className="w-12 h-12 rounded-xl bg-white/10 border border-white/10 flex items-center justify-center">
                          <Icon className={`w-6 h-6 ${action.iconAccent}`} />
                        </div>
                        <ArrowUpRight className="w-5 h-5 text-gray-500 transition-all duration-300 group-hover:text-white group-hover:translate-x-1 group-hover:-translate-y-1" />
                      </div>

                      <div>
                        <h3 className="text-lg font-bold text-white mb-1.5">
                          {action.title}
                        </h3>
                        <p className="text-sm text-gray-400 leading-relaxed">
                          {action.description}
                        </p>
                      </div>
                    </div>
                  </SpotlightCard>
                </Link>
              </Reveal>
            );
          })}
        </div>
      </div>
    </ProtectedRoute>
  );
}
