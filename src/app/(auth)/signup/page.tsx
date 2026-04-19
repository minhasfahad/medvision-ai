"use client";
import api from "@/src/lib/axios";
import { useAuthStore } from "@/src/lib/store/useAuthStore";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function Signup() {
  const router = useRouter();
  const setAuthValues = useAuthStore((state) => state.setAuth);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await api.post("/api/users/signup", {
        name,
        email,
        password,
        role,
      });
      const { user, token } = response.data;
      setAuthValues(user, token);
      router.replace("/");
      alert("Welcome to Medvision AI")
    } catch (error: any) {
      debugger;
      setError(error.response?.data?.error || "Signup Failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="h-[100vh] w-full">
        <div className="grid h-full w-full items-center justify-items-center">
          <form
            onSubmit={handleSignup}
            className="grid gap-8 border-2  min-w-md p-10 pt-5 border-blue-400 shadow-lg shadow-blue-500/50 rounded-lg bg-black/10"
          >
            <h1>
              <Link
                className="grid  text-center text-white no-underline"
                href="/"
              >
                Join Medvision AI
              </Link>
            </h1>
            <div className="relative w-full max-w-sm">
              <i className="fa-solid fa-user absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>

              <input
                type="text"
                placeholder="Full Name"
                value={name}
                required
                onChange={(e) => setName(e.target.value)}
                className="text-white shadow-[0_0_10px_#5ed4ff,0_0_10px_#5ed4ff] bg-white/10 w-full pl-10 pr-4 py-2 border border-gray-300 shadow-blue-500/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="relative w-full max-w-sm">
              <i className="fa-regular fa-envelope absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>

              <input
                type="email"
                placeholder="Email Address"
                value={email}
                required
                onChange={(e) => setEmail(e.target.value)}
                className="text-white shadow-[0_0_10px_#5ed4ff,0_0_10px_#5ed4ff] bg-white/10 w-full pl-10 pr-4 py-2 border border-gray-300 shadow-blue-500/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="relative w-full max-w-sm">
              <i className="fa-brands fa-critical-role absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
              <input
                type="text"
                placeholder="Role"
                value={role}
                
                onChange={(e) => setRole(e.target.value)}
                className="text-white shadow-[0_0_10px_#5ed4ff,0_0_10px_#5ed4ff] bg-white/10 w-full pl-10 pr-4 py-2 border border-gray-300 shadow-blue-500/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="relative w-full max-w-sm">
              <i className="mt-6 fa-solid fa-unlock-keyhole absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
              <p className="mb-7">Password Must be at least 8 characters long.</p>
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
                className="login-signup w-full border-2 border-[#cfeffa] shadow-[0_0_10px_#bfa9d9,0_0_20px_#bfa9d9]"
                type="submit"
                disabled={loading}
              >
                {loading ? "Creating Account" : "Create Account"}
              </button>
            </div>
            <div>
              <button
                className="login-signup w-full border-2 border-[#cfeffa] shadow-[0_0_10px_#bfa9d9,0_0_20px_#bfa9d9]"
                type="submit"
              >
                <Image
                  className="mr-4"
                  src="/google.png"
                  alt="google"
                  width={20}
                  height={20}
                />
                Sign Up with Google
              </button>
            </div>
            <div className="text-center">
              Already Have and Account?{" "}
              <Link href="/login" className="underline text-white">
                Sign In
              </Link>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
