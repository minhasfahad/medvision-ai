"use client";
import Link from "next/link";
import api from "@/src/lib/axios";
import { signIn } from "next-auth/react";
import { useState, useEffect } from "react";
import { useAuthStore } from "@/src/lib/store/useAuthStore";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Mail, Lock, Eye, EyeOff, ShieldAlert, Loader2 } from "lucide-react";

export default function LoginPage() {
  // 1. Create a state to control the visibility of the message
  const [showExpiredMessage, setShowExpiredMessage] = useState(false);

  // 2. Check the URL when the page loads
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get("expired") === "true") {
      // A tiny 10-millisecond delay keeps the React linter happy
      setTimeout(() => {
        setShowExpiredMessage(true);
      }, 10);

      window.history.replaceState(null, "", "/login");
    }
  }, []);

  const router = useRouter();
  const setAuthValues = useAuthStore((state) => state.setAuth);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // 1. Add state for password visibility
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await api.post("/api/users/login", { email, password });
      const { user, token } = response.data;
      setAuthValues(user, token);
      router.replace("/");
    } catch (error: any) {
      debugger;
      setError(error.response?.data?.error || "Login Failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="min-h-screen w-full px-4 py-10 flex items-center justify-center">
        <div className="grid w-full items-center justify-items-center">
          {/* 3. Display the professional warning box if the state is true */}

          {showExpiredMessage && (
            <div className="mb-6 w-full max-w-md p-4 flex items-start gap-3 bg-red-500/10 border border-red-500/30 text-red-300 rounded-xl backdrop-blur-sm animate-fade-in-up">
              <ShieldAlert className="w-5 h-5 flex-none mt-0.5 text-red-400" />
              <div>
                <p className="font-semibold m-0">Session Expired!</p>
                <p className="text-sm text-red-300/80 mt-1 mb-0">
                  For your security, please log in again to continue.
                </p>
              </div>
            </div>
          )}
          <form
            onSubmit={handleLogin}
            className="grid gap-6 sm:gap-8 w-full max-w-md p-6 sm:p-10 pt-5 border border-white/10 shadow-[0_0_40px_rgba(37,99,235,0.15)] rounded-2xl bg-white/5 backdrop-blur-md animate-fade-in-up"
          >
            {error && (
              <p className="text-red-400 text-sm sm:text-base bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2 text-center m-0">
                {error}
              </p>
            )}
            <h1 className="m-0">
              <Link
                // Added 'font-sans' here
                className="font-sans grid text-center no-underline text-3xl font-extrabold tracking-tight"
                href="/"
              >
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-400 to-blue-400 animate-gradient-x">
                  Login to Medvision AI
                </span>
              </Link>
            </h1>

            <div className="relative w-full max-w-sm mx-auto">
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

            <div className="relative w-full max-w-sm mx-auto">
              <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 z-10 pointer-events-none" />

              <input
                required
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="text-white placeholder-gray-500 bg-white/5 w-full pl-11 pr-12 py-2.5 border border-white/10 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all text-sm sm:text-base"
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                /* Added bg-transparent, border-none, and z-10 to fix the background box */
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors focus:outline-none bg-transparent border-none p-0 m-0 z-10"
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>

            <div className="w-full max-w-sm mx-auto">
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold py-2.5 sm:py-3 px-4 text-sm shadow-[0_0_20px_rgba(37,99,235,0.4)] hover:shadow-[0_0_30px_rgba(168,85,247,0.5)] hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-60 disabled:hover:translate-y-0 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                {loading ? "Signing in..." : "Sign In"}
              </button>
            </div>

            <div className="flex items-center gap-3 w-full max-w-sm mx-auto -my-2">
              <div className="h-px flex-1 bg-white/10"></div>
              <span className="text-[11px] uppercase tracking-widest text-gray-500">
                or
              </span>
              <div className="h-px flex-1 bg-white/10"></div>
            </div>

            <div className="w-full max-w-sm mx-auto">
              <button
                className="w-full rounded-xl bg-white/5 border border-white/10 text-white hover:bg-white/10 font-bold py-2.5 sm:py-3 px-4 text-sm flex items-center justify-center transition-all duration-300 hover:-translate-y-0.5"
                type="button"
                onClick={() => signIn("google", { callbackUrl: "/" })}
              >
                <Image
                  className="mr-3 flex-none"
                  src="/google.png"
                  alt="google"
                  width={16}
                  height={16}
                />
                Continue with Google
              </button>
            </div>
            <div className="m-auto text-sm sm:text-base">
              <Link
                href="/forgot-password"
                className="text-gray-400 hover:text-blue-400 transition-colors no-underline hover:underline"
              >
                Forgot Password?
              </Link>
            </div>
            <div className="m-auto text-center text-sm sm:text-base text-gray-400">
              Do not have an Account?{" "}
              <Link
                href="/signup"
                className="text-blue-400 hover:text-blue-300 transition-colors no-underline whitespace-nowrap font-semibold"
              >
                Create New
              </Link>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
