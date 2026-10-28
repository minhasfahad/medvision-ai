"use client";
import { useState } from "react";
import { AlertTriangle, X } from "lucide-react";

export default function DemoNoticeDialog() {
  const [open, setOpen] = useState(true);


  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="demo-notice-title"
        className="relative w-full max-w-md rounded-2xl border border-amber-500/30 bg-[#0f1123] p-6 shadow-2xl"
      >
        <button
          onClick={() => setOpen(false)}
          aria-label="Close notice"
          className="absolute right-4 top-4 text-gray-400 hover:text-white"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-500/15">
            <AlertTriangle className="h-5 w-5 text-amber-300" />
          </div>
          <h2 id="demo-notice-title" className="text-lg font-bold text-white">
            Free-Tier Demo Notice
          </h2>
        </div>

        <p className="mt-4 text-sm leading-6 text-gray-300">
          This is a free-tier deployment. The AI tumor detection module (MRI analysis) is not available on this demo server at the moment and will be enabled soon.
        </p>
        <p className="mt-3 text-sm leading-6 text-gray-400">
          This is not an error. All other features, including patient, doctor, and appointment workflows, work normally.
        </p>

        <button
          onClick={() => setOpen(false)}
          className="mt-6 w-full rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 py-2.5 text-sm font-bold text-white hover:from-blue-500 hover:to-purple-500"
        >
          I Understand
        </button>
      </div>
    </div>
  );
}