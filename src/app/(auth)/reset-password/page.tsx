"use client";
import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import api from "@/src/lib/axios";
import Link from "next/link";
import {
  CheckCircle2,
  Lock,
  Eye,
  EyeOff,
  CheckCheck,
  Loader2,
} from "lucide-react";

// We wrap the main form in a component so we can wrap it in Suspense
// (Next.js requires Suspense when reading URL parameters)
function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!token) {
      setError("Invalid or missing reset token.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match!");
      return;
    }

    // Password strength validation
    if (
      password.length < 8 ||
      !/[A-Z]/.test(password) ||
      !/[0-9]/.test(password)
    ) {
      setError("Password must be at least 8 chars, 1 uppercase, and 1 number.");
      return;
    }

    setLoading(true);

    try {
      await api.post("/api/users/reset-password", {
        token,
        newPassword: password,
      });
      setSuccess(true);
      // Automatically redirect to login after 3 seconds
      setTimeout(() => router.push("/login"), 3000);
    } catch (error: any) {
      setError(error.response?.data?.error || "Failed to reset password.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="text-center animate-fade-in-up">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-500/10 border border-green-500/30 flex items-center justify-center">
          <CheckCircle2 className="w-8 h-8 text-green-400" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">
          Password Reset Successful!
        </h2>
        <p className="text-gray-400 mb-6">
          You can now log in with your new password.
        </p>
        <Link
          href="/login"
          className="rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 shadow-[0_0_20px_rgba(37,99,235,0.4)] hover:shadow-[0_0_30px_rgba(168,85,247,0.5)] hover:-translate-y-0.5 py-2.5 px-6 font-bold transition-all duration-300 inline-block text-white no-underline"
        >
          Go to Login
        </Link>
      </div>
    );
  }

  // Live strength check, reusing the exact same validation the submit
  // handler enforces — purely presentational, no new state.
  const strengthChecks = [
    password.length >= 8,
    /[A-Z]/.test(password),
    /[0-9]/.test(password),
  ];
  const strengthScore = strengthChecks.filter(Boolean).length;
  const passwordsMismatch = confirmPassword.length > 0 && password !== confirmPassword;

  return (
    <div className="grid gap-6">
      <div>
        <div className="w-11 h-11 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mb-3">
          <Lock className="w-5 h-5 text-blue-400" />
        </div>
        <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-white m-0">
          Create a new password
        </h1>
        <p className="text-gray-400 text-sm mt-0.5 mb-0">
          Make it strong — you&apos;ll use this to sign back in.
        </p>
      </div>

      <form onSubmit={handleReset} className="grid gap-4">
        {error && (
          <p className="text-red-400 text-sm sm:text-base bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2 text-center m-0">
            {error}
          </p>
        )}

        <div>
          <div className="relative w-full">
            <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
            <input
              required
              type={showPassword ? "text" : "password"}
              placeholder="New Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="text-white placeholder-gray-500 bg-white/5 w-full pl-11 pr-12 py-2.5 border border-white/10 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all text-sm sm:text-base"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 bg-transparent border-none p-0 m-0 z-10 text-gray-500 hover:text-white transition-colors"
            >
              {showPassword ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          </div>
          <div className="flex gap-1 mt-2">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className={`h-1 flex-1 rounded-full transition-colors duration-300 ${
                  strengthScore > i ? "bg-green-400" : "bg-white/10"
                }`}
              />
            ))}
          </div>
          <p className="text-[11px] text-gray-500 mt-1.5 mb-0">
            At least 8 characters, 1 uppercase letter, 1 number.
          </p>
        </div>

        <div>
          <div className="relative w-full">
            <CheckCheck className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
            <input
              required
              type="password"
              placeholder="Confirm New Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="text-white placeholder-gray-500 bg-white/5 w-full pl-11 pr-4 py-2.5 border border-white/10 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all text-sm sm:text-base"
            />
          </div>
          {passwordsMismatch && (
            <p className="text-[11px] text-red-400 mt-1.5 mb-0">Passwords do not match yet.</p>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="flex items-center justify-center gap-2 text-center w-full rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold shadow-[0_0_20px_rgba(37,99,235,0.4)] hover:shadow-[0_0_30px_rgba(168,85,247,0.5)] hover:-translate-y-0.5 py-2.5 px-4 text-sm sm:text-base transition-all duration-300 disabled:opacity-60 disabled:hover:translate-y-0 disabled:cursor-not-allowed"
        >
          {loading && <Loader2 className="w-4 h-4 animate-spin" />}
          {loading ? "Resetting..." : "Reset Password"}
        </button>
      </form>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center gap-2 text-center text-blue-400">
          <Loader2 className="w-4 h-4 animate-spin" />
          Loading secure form...
        </div>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  );
}
