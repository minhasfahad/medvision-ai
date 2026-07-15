"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import AmbientBackground from "@/src/components/AmbientBackground";
import Reveal from "@/src/components/Reveal";
import SpotlightCard from "@/src/components/SpotlightCard";
import CountUp from "@/src/components/CountUp";
import { Brain, Activity, ShieldCheck, Sparkles } from "lucide-react";

// Per-route brand copy for the left visual panel. Falls back to the login
// copy for any auth route not explicitly listed.
const BRAND_COPY: Record<string, { eyebrow: string; title: string; sub: string }> = {
  "/login": {
    eyebrow: "Welcome back",
    title: "Precision diagnostics,\none login away.",
    sub: "Securely access your MRI analysis workspace — trusted by radiologists and clinicians worldwide.",
  },
  "/signup": {
    eyebrow: "Get started free",
    title: "Join the future of\ntumor diagnostics.",
    sub: "Create your account and start analyzing MRI scans with deep-learning precision in seconds.",
  },
  "/forgot-password": {
    eyebrow: "Account recovery",
    title: "Let's get you\nback in, safely.",
    sub: "We'll help you securely regain access to your diagnostic workspace in moments.",
  },
  "/reset-password": {
    eyebrow: "Almost there",
    title: "Choose a new,\nstronger password.",
    sub: "Secure your account with a fresh password to keep patient data fully protected.",
  },
};

type StatItem = {
  value: number;
  label: string;
  decimals?: number;
  prefix?: string;
  suffix?: string;
};

const STATS: StatItem[] = [
  { value: 6000, suffix: "+", label: "Scans processed" },
  { value: 98.4, decimals: 1, suffix: "%", label: "Detection accuracy" },
  { value: 2.5, decimals: 1, prefix: "< ", suffix: "s", label: "Analysis time" },
];

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const copy = BRAND_COPY[pathname ?? ""] ?? BRAND_COPY["/login"];
  const titleLines = copy.title.split("\n");

  return (
    <div className="relative min-h-screen w-full">
      <AmbientBackground />

      <div className="relative z-10 lg:flex lg:min-h-screen">
        {/* LEFT — brand / visual panel (desktop only) */}
        <div className="hidden lg:flex lg:w-[46%] xl:w-[42%] lg:sticky lg:top-0 lg:h-screen flex-col justify-between overflow-hidden border-r border-white/10 bg-white/[0.02] px-12 py-12 xl:px-16">
          {/* floating icon motifs */}
          <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden="true">
            <Brain className="absolute top-[10%] left-[12%] w-10 h-10 text-blue-400/20 animate-float-slow" />
            <Activity
              className="absolute top-[58%] left-[6%] w-8 h-8 text-purple-400/20 animate-float-slower"
              style={{ animationDelay: "1.5s" }}
            />
            <ShieldCheck
              className="absolute bottom-[20%] right-[12%] w-9 h-9 text-blue-400/20 animate-float-slow"
              style={{ animationDelay: "3s" }}
            />
            <Sparkles
              className="absolute top-[32%] right-[18%] w-6 h-6 text-purple-400/20 animate-float-slower"
              style={{ animationDelay: "0.8s" }}
            />
          </div>

          {/* Brand mark */}
          <Link href="/" className="no-underline flex items-center gap-2.5 flex-none relative z-10 w-fit">
            <Image
              src="/logo-mark.png"
              alt="MedVision Logo"
              width={40}
              height={40}
              className="w-9 h-9 object-contain"
            />
            <span className="text-lg font-black tracking-tight text-white">
              MedVision <span className="text-blue-400 font-medium">AI</span>
            </span>
          </Link>

          {/* Headline + scan visual */}
          <div className="relative z-10">
            <Reveal variant="left">
              <p className="text-xs uppercase tracking-[0.25em] text-blue-400 font-semibold mb-4">
                {copy.eyebrow}
              </p>
              <h2 className="text-4xl xl:text-5xl font-extrabold tracking-tight text-white leading-[1.12] mb-5">
                {titleLines.map((line, i) => (
                  <span key={i} className="block">
                    {line}
                  </span>
                ))}
              </h2>
              <p className="text-gray-400 text-base leading-relaxed max-w-sm m-0">{copy.sub}</p>
            </Reveal>

            <Reveal variant="zoom" delay={150} className="mt-10 block">
              <div className="spin-border-wrap rounded-2xl w-full max-w-xs">
                <div className="relative h-40 rounded-2xl bg-[#0f1123]/60 backdrop-blur-md overflow-hidden">
                  <div className="absolute inset-0 bg-grid-fade opacity-70" />
                  <div className="absolute inset-x-0 h-1/3 bg-gradient-to-b from-transparent via-blue-400/25 to-transparent animate-scan-sweep" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Brain className="w-12 h-12 text-blue-400/80" />
                  </div>
                </div>
              </div>
            </Reveal>
          </div>

          {/* Trust stats */}
          <div className="relative z-10 grid grid-cols-3 gap-3">
            {STATS.map((s, i) => (
              <Reveal key={s.label} delay={i * 100} variant="up" fill>
                <SpotlightCard className="rounded-xl border border-white/10 bg-white/5 p-3 h-full">
                  <p className="text-lg font-bold text-white m-0 whitespace-nowrap">
                    <CountUp value={s.value} decimals={s.decimals} prefix={s.prefix} suffix={s.suffix} />
                  </p>
                  <p className="text-[11px] text-gray-400 mt-1 m-0 leading-snug">{s.label}</p>
                </SpotlightCard>
              </Reveal>
            ))}
          </div>
        </div>

        {/* RIGHT — form panel */}
        <div className="flex-1 flex items-center justify-center px-4 py-10 sm:py-14 lg:px-10">
          <div className="w-full max-w-md">
            {/* Compact brand header, mobile/tablet only */}
            <Link
              href="/"
              className="lg:hidden no-underline flex items-center justify-center gap-2 mb-8"
            >
              <Image
                src="/logo-mark.png"
                alt="MedVision Logo"
                width={32}
                height={32}
                className="w-8 h-8 object-contain"
              />
              <span className="text-lg font-black tracking-tight text-white">
                MedVision <span className="text-blue-400 font-medium">AI</span>
              </span>
            </Link>

            <div className="relative rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md shadow-[0_0_40px_rgba(37,99,235,0.15)] p-6 sm:p-8 animate-fade-in-up">
              {children}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
