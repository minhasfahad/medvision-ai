"use client";

import Link from "next/link";
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
        
        <h3 className="h2-protected">
          Access Denied!
        </h3>
        <h3 className="text-2xl sm:text-3xl font-bold mb-6 text-center">
          Please Login to continue
        </h3>
        <Link
          href="/login"
          className=" no-underline bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-10 rounded-xl transition-all shadow-lg shadow-blue-900/20"
        >
          Login
        </Link>
      </div>
    );
  }

  // 2. If logged in but WRONG role (e.g. Patient trying to view Doctor page)
  if (allowedRole && user?.role !== allowedRole) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#0f111a] text-white px-4">
        <h2 className="text-2xl sm:text-3xl font-bold mb-4 text-center text-red-400">
          Unauthorized Access
        </h2>
        <p className="text-gray-400 mb-8 text-center">
          You do not have permission to view this clinical page.
        </p>
        <Link
          href="/"
          className="bg-gray-800 hover:bg-gray-700 border border-gray-700 text-white font-bold py-3 px-8 rounded-xl transition-all"
        >
          Return Home
        </Link>
      </div>
    );
  }

  // 3. They passed all checks! Show the actual page.
  return <>{children}</>;
}
