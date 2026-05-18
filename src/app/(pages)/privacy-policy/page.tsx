"use client";

import Link from "next/link";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen text-white px-4 py-16 max-w-4xl mx-auto font-sans tracking-wide">
      <div className="bg-[#0f1123]/60 backdrop-blur-md border border-white/10 rounded-3xl p-6 sm:p-10 shadow-2xl">
        <h1 className="text-3xl font-extrabold text-purple-400 mb-2">Privacy Policy</h1>
        <p className="text-gray-400 text-xs sm:text-sm mb-6">Last Updated: May 2026</p>
        
        <div className="space-y-6 text-sm sm:text-base text-gray-300 leading-relaxed">
          <section>
            <h2 className="text-xl font-bold text-white mb-2">1. Patient Data Protection</h2>
            <p className="text-gray-400">
              At MedVision AI, we prioritize medical file integrity. MRI scan uploads are heavily processed locally using modern authentication variables and are encrypted end-to-end to ensure patient confidentiality remains secure.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-2">2. Scanning & Model Imagery Logs</h2>
            <p className="text-gray-400">
              Anonymized data matrices extracted during YOLOv11 inference checking processes are used solely to populate your secure account history dashboard pipeline. We never sell, share, or lease diagnostic images to third-party entities.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-2">3. Research-Scale Analytics</h2>
            <p className="text-gray-400">
              Any baseline computational meta-metrics collected during guardrail processes are restricted exclusively to improving our underlying computer vision algorithms.
            </p>
          </section>
        </div>

        <div className="mt-8 pt-6 border-t border-white/10">
          <Link href="/">
            <button className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm transition-all cursor-pointer border-0">
              Return to Home
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}