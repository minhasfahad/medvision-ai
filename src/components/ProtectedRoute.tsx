"use client";

import Link from "next/link";
import { Lock, LogIn, ShieldAlert, Home } from "lucide-react";
import { useAuthStore } from "@/src/lib/store/useAuthStore";

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
      <div className="min-h-screen flex flex-col items-center justify-center text-white px-4">
        <div className="w-full max-w-md text-center bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-8 sm:p-10 shadow-2xl animate-fade-in-up">
          <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-blue-600/20 to-purple-600/20 border border-blue-500/30 flex items-center justify-center">
            <Lock className="w-8 h-8 text-blue-400" />
          </div>
          <h3 className="text-2xl sm:text-3xl font-bold mb-8 text-center">
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
    );
  }

  // 2. If logged in but WRONG role (e.g. Patient trying to view Doctor page)
  if (allowedRole && user?.role !== allowedRole) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-white px-4">
        <div className="w-full max-w-md text-center bg-white/5 backdrop-blur-md border border-red-500/20 rounded-3xl p-8 sm:p-10 shadow-2xl animate-fade-in-up">
          <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-center">
            <ShieldAlert className="w-8 h-8 text-red-400" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold mb-4 text-center text-red-400">
            Unauthorized Access
          </h2>
          <p className="text-gray-400 mb-8 text-center">
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
      </div>
    );
  }

  // 3. They passed all checks! Show the actual page.
  return <>{children}</>;
}
