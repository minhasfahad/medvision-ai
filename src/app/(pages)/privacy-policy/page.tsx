"use client";

import Link from "next/link";
import { ShieldCheck, Database, BarChart3, ArrowLeft } from "lucide-react";
import AmbientBackground from "@/src/components/AmbientBackground";
import Reveal from "@/src/components/Reveal";

const SECTIONS = [
  {
    id: "patient-data-protection",
    icon: ShieldCheck,
    color: "text-blue-400",
    title: "1. Patient Data Protection",
    body: "At MedVision AI, we prioritize medical file integrity. MRI scan uploads are heavily processed locally using modern authentication variables and are encrypted end-to-end to ensure patient confidentiality remains secure.",
  },
  {
    id: "scanning-model-imagery-logs",
    icon: Database,
    color: "text-purple-400",
    title: "2. Scanning & Model Imagery Logs",
    body: "Anonymized data matrices extracted during YOLOv11 inference checking processes are used solely to populate your secure account history dashboard pipeline. We never sell, share, or lease diagnostic images to third-party entities.",
  },
  {
    id: "research-scale-analytics",
    icon: BarChart3,
    color: "text-green-400",
    title: "3. Research-Scale Analytics",
    body: "Any baseline computational meta-metrics collected during guardrail processes are restricted exclusively to improving our underlying computer vision algorithms.",
  },
];

export default function PrivacyPolicy() {
  return (
    <div className="relative min-h-screen text-white font-sans tracking-wide">
      <AmbientBackground />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-14 sm:py-20">
        {/* HEADER */}
        <Reveal>
          <div className="relative mb-10 sm:mb-14 overflow-hidden">
            <div className="absolute -top-16 -right-16 w-[280px] h-[280px] bg-purple-600/10 rounded-full blur-[100px] -z-10 pointer-events-none"></div>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-11 h-11 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center flex-none">
                <ShieldCheck className="w-5 h-5 text-purple-400" />
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-purple-400">Privacy Policy</h1>
            </div>
            <p className="text-gray-400 text-xs sm:text-sm">Last Updated: May 2026</p>
          </div>
        </Reveal>

        {/* MOBILE TOC — horizontal pill row */}
        <div className="flex lg:hidden gap-2 overflow-x-auto pb-4 mb-6 -mx-1 px-1">
          {SECTIONS.map((s) => (
            <a
              key={s.id}
              href={`#${s.id}`}
              className="flex-none px-4 py-2 rounded-full bg-white/5 border border-white/10 text-xs font-semibold text-gray-300 hover:text-white hover:border-purple-500/30 whitespace-nowrap transition-colors"
            >
              {s.title}
            </a>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-8 sm:gap-12 items-start">
          {/* STICKY SIDEBAR TOC */}
          <Reveal variant="left" className="hidden lg:block">
            <nav className="sticky top-28 bg-[#0f1123]/60 backdrop-blur-md border border-white/10 rounded-2xl p-5">
              <span className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-4">
                On This Page
              </span>
              <ul className="space-y-1 list-none m-0 p-0">
                {SECTIONS.map((s) => {
                  const Icon = s.icon;
                  return (
                    <li key={s.id}>
                      <a
                        href={`#${s.id}`}
                        className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-white/5 transition-colors no-underline"
                      >
                        <Icon className={`w-4 h-4 flex-none ${s.color}`} />
                        <span>{s.title}</span>
                      </a>
                    </li>
                  );
                })}
              </ul>
            </nav>
          </Reveal>

          {/* NUMBERED SECTION CARDS */}
          <div className="space-y-5 sm:space-y-6">
            {SECTIONS.map((s, i) => {
              const Icon = s.icon;
              return (
                <Reveal key={s.id} delay={i * 80}>
                  <section
                    id={s.id}
                    className="relative overflow-hidden p-6 sm:p-8 bg-[#0f1123]/60 backdrop-blur-md border border-white/10 rounded-2xl scroll-mt-28 hover:border-white/20 transition-colors duration-300"
                  >
                    <span
                      aria-hidden="true"
                      className="absolute -right-2 -top-6 text-[6rem] sm:text-[8rem] font-black text-white/[0.04] select-none pointer-events-none leading-none"
                    >
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <div className="relative">
                      <h2 className="text-xl sm:text-2xl font-bold text-white mb-3 flex items-center gap-2">
                        <Icon className={`w-5 h-5 flex-none ${s.color}`} /> {s.title}
                      </h2>
                      <p className="text-sm sm:text-base text-gray-400 leading-relaxed max-w-2xl">
                        {s.body}
                      </p>
                    </div>
                  </section>
                </Reveal>
              );
            })}

            <Reveal delay={SECTIONS.length * 80}>
              <div className="pt-2">
                <Link href="/">
                  <button className="group px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold text-sm transition-all shadow-[0_0_20px_rgba(37,99,235,0.3)] hover:shadow-[0_0_30px_rgba(168,85,247,0.5)] hover:-translate-y-1 cursor-pointer border-0 flex items-center gap-2">
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform duration-300" /> Return to Home
                  </button>
                </Link>
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </div>
  );
}
