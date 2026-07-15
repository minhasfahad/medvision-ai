"use client";

import Link from "next/link";
import { Lock, LogIn, ShieldAlert, Home, Sparkles, ScanLine } from "lucide-react";
import { useAuthStore } from "@/src/lib/store/useAuthStore";
import Reveal from "./Reveal";
import SpotlightCard from "./SpotlightCard";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRole?: "doctor" | "patient";
}

export default function ProtectedRoute({
  children,
  allowedRole,
}: ProtectedRouteProps) {
  const { isAuthenticated, user } = useAuthStore();

  // 1. If NOT logged in: Show the Login Prompt
  if (!isAuthenticated) {
    return (
      <div className="relative min-h-screen flex items-center justify-center text-white px-4 overflow-hidden">
        {/* Ambient background glows — matches the site-wide dark navy/purple language */}
        <div className="pointer-events-none absolute top-1/4 left-1/2 -translate-x-1/2 w-[520px] h-[520px] bg-blue-600/10 rounded-full blur-[130px] animate-float-slow" />
        <div className="pointer-events-none absolute bottom-0 right-1/3 w-[420px] h-[420px] bg-purple-600/10 rounded-full blur-[120px] animate-float-slower" />

        <Reveal variant="zoom">
          <SpotlightCard
            color="96,165,250"
            className="w-full max-w-lg rounded-3xl bg-[#0f1123]/70 backdrop-blur-md border border-white/10 shadow-2xl"
          >
            <div className="grid sm:grid-cols-[auto_1fr] gap-6 sm:gap-8 items-center p-8 sm:p-10">
              <div className="spin-border-wrap relative w-16 h-16 rounded-2xl mx-auto sm:mx-0">
                <div className="relative z-10 w-full h-full rounded-2xl bg-gradient-to-br from-blue-600/20 to-purple-600/20 border border-blue-500/30 flex items-center justify-center">
                  <Lock className="w-8 h-8 text-blue-400" />
                </div>
              </div>

              <div className="text-center sm:text-left">
                <p className="inline-flex items-center gap-1.5 text-[11px] font-semibold tracking-wide text-blue-400 uppercase mb-2">
                  <Sparkles className="w-3.5 h-3.5" />
                  Secure area
                </p>
                <h3 className="text-2xl sm:text-3xl font-bold mb-6">
                  Please Login to continue
                </h3>
                <Link
                  href="/login"
                  className="no-underline inline-flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold py-3 px-10 rounded-xl transition-all duration-300 shadow-[0_0_30px_rgba(37,99,235,0.4)] hover:-translate-y-1"
                >
                  <LogIn className="w-5 h-5" />
                  Login
                </Link>
              </div>
            </div>
          </SpotlightCard>
        </Reveal>
      </div>
    );
  }

  // 2. If logged in but WRONG role (e.g. Patient trying to view Doctor page)
  if (allowedRole && user?.role !== allowedRole) {
    return (
      <div className="relative min-h-screen flex items-center justify-center text-white px-4 overflow-hidden">
        {/* Ambient background glows — dialed toward red to signal a blocked state */}
        <div className="pointer-events-none absolute top-1/4 left-1/2 -translate-x-1/2 w-[520px] h-[520px] bg-red-600/10 rounded-full blur-[130px] animate-float-slow" />
        <div className="pointer-events-none absolute bottom-0 right-1/3 w-[420px] h-[420px] bg-purple-600/10 rounded-full blur-[120px] animate-float-slower" />

        <Reveal variant="zoom">
          <SpotlightCard
            color="248,113,113"
            className="w-full max-w-lg rounded-3xl bg-[#0f1123]/70 backdrop-blur-md border border-red-500/20 shadow-2xl"
          >
            <div className="p-8 sm:p-10 text-center">
              <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-center">
                <ShieldAlert className="w-8 h-8 text-red-400" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold mb-4 text-red-400">
                Unauthorized Access
              </h2>
              <p className="text-gray-400 mb-8 flex items-center justify-center gap-2">
                <ScanLine className="w-4 h-4 flex-none text-gray-500" />
                You do not have permission to view this clinical page.
              </p>
              <Link
                href="/"
                className="no-underline inline-flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold py-3 px-8 rounded-xl transition-all duration-300 hover:-translate-y-1"
              >
                <Home className="w-5 h-5" />
                Return Home
              </Link>
            </div>
          </SpotlightCard>
        </Reveal>
      </div>
    );
  }

  // 3. They passed all checks! Show the actual page.
  return <>{children}</>;
}
