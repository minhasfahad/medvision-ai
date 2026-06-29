"use client";
import Link from "next/link";
import api from "@/src/lib/axios";
import { signIn } from "next-auth/react";
import { useState, useEffect } from "react";
import { useAuthStore } from "@/src/lib/store/useAuthStore";
import { useRouter } from "next/navigation";
import Image from "next/image";

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
      <div className="min-h-screen h-[100vh] w-full px-4 flex items-center justify-center">
        <div className="grid h-full w-full items-center justify-items-center">
          {/* 3. Display the professional warning box if the state is true */}

          {showExpiredMessage && (
            <div className="mb-6 w-full max-w-md p-4 bg-red-100 border-l-4 border-red-500 text-red-700 rounded shadow-md">
              <p className="font-semibold">Session Expired!</p>

              <p className="text-sm">
                For your security, please log in again to continue.
              </p>
            </div>
          )}
          <form
            onSubmit={handleLogin}
            className="grid gap-6 sm:gap-8 border-2 w-full max-w-md p-6 sm:p-10 pt-5 border-blue-400 shadow-lg shadow-blue-500/50 rounded-lg bg-black/10"
          >
            {error && (
              <p className="text-red-500 text-sm sm:text-base">{error}</p>
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

            <div className="relative w-full max-w-sm mx-auto">
              <i className="fa-solid fa-unlock-keyhole absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 z-10 pointer-events-none"></i>

              <input
                required
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="text-white shadow-blue-500/50 shadow-[0_0_10px_#5ed4ff,0_0_10px_#5ed4ff] bg-white/10 w-full pl-10 pr-12 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                /* Added bg-transparent, border-none, and z-10 to fix the background box */
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors focus:outline-none bg-transparent border-none p-0 m-0 z-10"
              >
                <i
                  className={`fa-solid ${showPassword ? "fa-eye-slash" : "fa-eye"} bg-transparent`}
                ></i>
              </button>
            </div>

            <div className="w-full max-w-sm mx-auto">
              <button
                type="submit"
                disabled={loading}
                className="login-signup w-full border-2 border-[#cfeffa] shadow-[0_0_10px_#bfa9d9,0_0_20px_#bfa9d9] py-1.5 sm:py-2 px-4 text-sm font-bold flex items-center justify-center transition-all"
              >
                {loading ? "Singning in..." : "Sign In"}
              </button>
            </div>
            <div className="w-full max-w-sm mx-auto">
              <button
                className="login-signup w-full border-2 border-[#cfeffa] shadow-[0_0_10px_#bfa9d9,0_0_20px_#bfa9d9] py-1.5 sm:py-2 px-4 text-sm font-bold flex items-center justify-center transition-all"
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
              <Link href="/forgot-password" className="underline text-white">
                Forgot Password?
              </Link>
            </div>
            <div className="m-auto text-center text-sm sm:text-base">
              Do not have an Account?{" "}
              <Link
                href="/signup"
                className="underline text-white whitespace-nowrap"
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
