"use client";
import Link from "next/link";
import api from "@/src/lib/axios";
import { useState } from "react";

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
    <div className="min-h-screen h-[100vh] w-full px-4 flex items-center justify-center">
      <div className="grid h-full w-full items-center justify-items-center">
        <form
          onSubmit={handleResetRequest}
          className="grid gap-6 sm:gap-8 border-2 w-full max-w-md p-6 sm:p-10 pt-5 border-blue-400 shadow-lg shadow-blue-500/50 rounded-lg bg-black/10"
        >
          {error && <p className="text-red-500 text-sm sm:text-base text-center">{error}</p>}
          {message && <p className="text-green-400 text-sm sm:text-base text-center">{message}</p>}
          
          <h1 className="text-center">
            <span className="text-white text-xl sm:text-2xl font-semibold tracking-wide block mb-2">
              Reset Password
            </span>
            <span className="text-gray-400 text-sm font-normal leading-[0px]">
              Enter your email address to get a link to reset your password.
            </span>
          </h1>

          <div className="relative w-full max-w-sm mx-auto">
            <i className="fa-regular fa-envelope absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
            <input
              required
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="text-white shadow-[0_0_10px_#5ed4ff,0_0_10px_#5ed4ff] bg-white/10 w-full pl-10 pr-4 py-2 border border-gray-300 shadow-blue-500/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
            />
          </div>

          <div className="w-full max-w-sm mx-auto">
            <button
              type="submit"
              disabled={loading}
              className="login-signup w-full border-2 border-[#cfeffa] shadow-[0_0_10px_#bfa9d9,0_0_20px_#bfa9d9] py-2 px-4 text-sm sm:text-base transition-all disabled:opacity-50"
            >
              {loading ? "Sending..." : "Send Reset Link"}
            </button>
          </div>

          <div className="m-auto text-center text-sm sm:text-base mt-2">
            <Link href="/login" className="underline text-gray-300 hover:text-white transition-colors">
              Back to Login
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}