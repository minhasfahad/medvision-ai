"use client";
import { useAuthStore } from "@/src/lib/store/useAuthStore";
import Link from "next/link";

export default function DoctorDashboard() {
  const authState = useAuthStore();
  return (
    <>
      {(authState.isAuthenticated && authState.user?.role === "doctor") ||
      authState.user?.role === "Doctor" ||
      authState.user?.role === "DOCTOR" ? (
        <h1 className="text-center">Welcome to Doctor's DoctorDashboard</h1>
      ) : (
        <Link href="/login">
          <button className="login-signup-btn">
            Login as a doctor to access this page.
          </button>
        </Link>
      )}
    </>
  );
}
