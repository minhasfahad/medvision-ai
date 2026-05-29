"use client";
import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import api from "@/src/lib/axios";
import Link from "next/link";

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
      <div className="text-center">
        <div className="text-green-400 text-5xl mb-4">
          <i className="fa-solid fa-circle-check"></i>
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">
          Password Reset Successful!
        </h2>
        <p className="text-gray-400 mb-6">
          You can now log in with your new password.
        </p>
        <Link
          href="/login"
          className="login-signup border-2 border-[#cfeffa] shadow-[0_0_10px_#bfa9d9] py-2 px-6 font-bold transition-all inline-block text-white no-underline"
        >
          Go to Login
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleReset} className="grid gap-6 sm:gap-8 w-full">
      {error && (
        <p className="text-red-500 text-sm sm:text-base text-center m-0">
          {error}
        </p>
      )}

      <h1 className="text-center m-0">
        <span className="text-white text-xl sm:text-2xl font-semibold tracking-wide block mb-2">
          Create New Password
        </span>
        <span className="text-gray-400 text-sm font-normal">
          Please enter your new strong password below.
        </span>
      </h1>

      <div className="relative w-full max-w-sm mx-auto">
        <i className="fa-solid fa-unlock-keyhole absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
        <input
          required
          type={showPassword ? "text" : "password"}
          placeholder="New Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="text-white shadow-[0_0_10px_#5ed4ff,0_0_10px_#5ed4ff] bg-white/10 w-full pl-10 pr-4 py-2 border border-gray-300 shadow-blue-500/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-1/2 -translate-y-1/2 bg-transparent border-none p-0 m-0 z-10 text-gray-400 hover:text-white"
        >
          <i
            className={`fa-solid ${showPassword ? "fa-eye-slash" : "fa-eye"}`}
          ></i>
        </button>
      </div>

      <div className="relative w-full max-w-sm mx-auto">
        <i className="fa-solid fa-check-double absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
        <input
          required
          type="password"
          placeholder="Confirm New Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="text-white shadow-[0_0_10px_#5ed4ff,0_0_10px_#5ed4ff] bg-white/10 w-full pl-10 pr-4 py-2 border border-gray-300 shadow-blue-500/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
        />
      </div>

      <div className="w-full max-w-sm mx-auto">
        <button
          type="submit"
          disabled={loading}
          // Added 'flex items-center' to make 'justify-center' work perfectly
          className="login-signup flex items-center justify-center text-center w-full border-2 border-[#cfeffa] shadow-[0_0_10px_#bfa9d9,0_0_20px_#bfa9d9] py-2 px-4 text-sm sm:text-base transition-all disabled:opacity-50"
        >
          {loading ? "Resetting..." : "Reset Password"}
        </button>
      </div>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen h-[100vh] w-full px-4 flex items-center justify-center text-white">
      <div className="grid h-full w-full items-center justify-items-center">
        <div className="border-2 w-full max-w-md p-6 sm:p-10 pt-5 border-blue-400 shadow-lg shadow-blue-500/50 rounded-lg bg-black/10">
          <Suspense
            fallback={
              <div className="text-center text-blue-400">
                Loading secure form...
              </div>
            }
          >
            <ResetPasswordForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
