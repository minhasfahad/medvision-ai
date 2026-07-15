"use client";
import Link from "next/link";
import api from "@/src/lib/axios";
import { useState } from "react";
import { Mail, KeyRound, CheckCircle2, ArrowLeft, Loader2 } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleResetRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    try {
      // We will build this API route in Step 2
      const response = await api.post("/api/users/forgot-password", { email });
      setMessage(response.data.message || "Reset link sent to your email!");
    } catch (error: any) {
      const backendMessage = error.response?.data?.message;
      setError(backendMessage || error.response?.data?.error || "Failed to send reset link");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid gap-6">
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 flex-none rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
          <KeyRound className="w-5 h-5 text-blue-400" />
        </div>
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-white m-0">
            Reset your password
          </h1>
          <p className="text-gray-400 text-sm mt-0.5 mb-0">
            Enter the email tied to your account.
          </p>
        </div>
      </div>

      <form onSubmit={handleResetRequest} className="grid gap-4">
        {error && (
          <p className="text-red-400 text-sm sm:text-base bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2 text-center m-0">
            {error}
          </p>
        )}
        {message && (
          <p className="text-green-400 text-sm sm:text-base bg-green-500/10 border border-green-500/20 rounded-lg px-3 py-2 text-center m-0 flex items-center justify-center gap-2">
            <CheckCircle2 className="w-4 h-4 flex-none" />
            {message}
          </p>
        )}

        <div className="relative w-full">
          <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
          <input
            required
            type="email"
            placeholder="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="text-white placeholder-gray-500 bg-white/5 w-full pl-11 pr-4 py-2.5 border border-white/10 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all text-sm sm:text-base"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold py-2.5 sm:py-3 px-4 text-sm sm:text-base shadow-[0_0_20px_rgba(37,99,235,0.4)] hover:shadow-[0_0_30px_rgba(168,85,247,0.5)] hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-60 disabled:hover:translate-y-0 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading && <Loader2 className="w-4 h-4 animate-spin" />}
          {loading ? "Sending..." : "Send Reset Link"}
        </button>

        <Link
          href="/login"
          className="mx-auto inline-flex items-center gap-1.5 text-sm sm:text-base text-gray-400 hover:text-blue-400 transition-colors no-underline hover:underline"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Login
        </Link>
      </form>
    </div>
  );
}
