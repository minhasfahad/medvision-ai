"use client";

import Link from "next/link";
import { ShieldCheck, Database, BarChart3, ArrowLeft } from "lucide-react";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen text-white px-4 py-16 max-w-4xl mx-auto font-sans tracking-wide">
      <div className="relative bg-[#0f1123]/60 backdrop-blur-md border border-white/10 rounded-3xl p-6 sm:p-10 shadow-2xl overflow-hidden animate-fade-in-up">
        <div className="absolute -top-20 -right-20 w-[300px] h-[300px] bg-purple-600/10 rounded-full blur-[100px] -z-10 pointer-events-none"></div>

        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center flex-none">
            <ShieldCheck className="w-5 h-5 text-purple-400" />
          </div>
          <h1 className="text-3xl font-extrabold text-purple-400">Privacy Policy</h1>
        </div>
        <p className="text-gray-400 text-xs sm:text-sm mb-6">Last Updated: May 2026</p>

        <div className="space-y-4 text-sm sm:text-base text-gray-300 leading-relaxed">
          <section className="p-4 rounded-xl hover:bg-white/5 transition-colors duration-300 animate-fade-in-up">
            <h2 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-blue-400 flex-none" /> 1. Patient Data Protection
            </h2>
            <p className="text-gray-400">
              At MedVision AI, we prioritize medical file integrity. MRI scan uploads are heavily processed locally using modern authentication variables and are encrypted end-to-end to ensure patient confidentiality remains secure.
            </p>
          </section>

          <section className="p-4 rounded-xl hover:bg-white/5 transition-colors duration-300 animate-fade-in-up" style={{ animationDelay: "80ms" }}>
            <h2 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
              <Database className="w-5 h-5 text-purple-400 flex-none" /> 2. Scanning & Model Imagery Logs
            </h2>
            <p className="text-gray-400">
              Anonymized data matrices extracted during YOLOv11 inference checking processes are used solely to populate your secure account history dashboard pipeline. We never sell, share, or lease diagnostic images to third-party entities.
            </p>
          </section>

          <section className="p-4 rounded-xl hover:bg-white/5 transition-colors duration-300 animate-fade-in-up" style={{ animationDelay: "160ms" }}>
            <h2 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-green-400 flex-none" /> 3. Research-Scale Analytics
            </h2>
            <p className="text-gray-400">
              Any baseline computational meta-metrics collected during guardrail processes are restricted exclusively to improving our underlying computer vision algorithms.
            </p>
          </section>
        </div>

        <div className="mt-8 pt-6 border-t border-white/10">
          <Link href="/">
            <button className="group px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold text-sm transition-all shadow-[0_0_20px_rgba(37,99,235,0.3)] hover:shadow-[0_0_30px_rgba(168,85,247,0.5)] hover:-translate-y-1 cursor-pointer border-0 flex items-center gap-2">
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform duration-300" /> Return to Home
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}