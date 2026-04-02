"use client";
import Link from "next/link";
import api from "@/src/lib/axios";

import { useAuthStore } from "@/src/lib/store/useAuthStore";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LoginPage() {
  const router = useRouter();
  const setAuthValues = useAuthStore((state) => state.setAuth);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await api.post("/api/users/login", { email, password });
      const { user, token } = response.data;
      setAuthValues(user, token);
      router.replace('/');
    } catch (error: any) {
      debugger;
      setError(error.response?.data?.error || "Login Failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="h-[100vh] w-full">
        <div className="grid h-full w-full items-center justify-items-center">
          <form
            onSubmit={handleLogin}
            className="grid gap-8 border-2  min-w-md p-10 pt-5 border-blue-400 shadow-lg shadow-blue-500/50 rounded-lg bg-black/10"
          >
            {error && <p className="text-red-500">{error}</p>}
            <h1>
              <Link
                className="grid  text-center text-white no-underline"
                href="/"
              >
                Medvision AI
              </Link>
            </h1>
            <div className="relative w-full max-w-sm">
              <i className="fa-regular fa-envelope absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>

              <input
                type="email"
                placeholder="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="text-white shadow-[0_0_10px_#5ed4ff,0_0_10px_#5ed4ff] bg-white/10 w-full pl-10 pr-4 py-2 border border-gray-300 shadow-blue-500/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="relative w-full max-w-sm">
              <i className="fa-solid fa-unlock-keyhole absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>

              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="text-white shadow-blue-500/50 shadow-[0_0_10px_#5ed4ff,0_0_10px_#5ed4ff] bg-white/10 w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="login-signup w-full border-2 border-[#cfeffa] shadow-[0_0_10px_#bfa9d9,0_0_20px_#bfa9d9]"
              >
                {loading ? "Singning in..." : "Sign In"}
              </button>
            </div>
            <div className="m-auto">
              <Link href="#" className="underline text-white">
                Forgot Password?
              </Link>
            </div>
            <div className="m-auto">
              Do not have an Account?{" "}
              <Link href="/signup" className="underline text-white">
                Create New
              </Link>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
