"use client";
import { signIn } from "next-auth/react";
import api from "@/src/lib/axios";
import { useAuthStore } from "@/src/lib/store/useAuthStore";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useRef } from "react";

export default function Signup() {
  const router = useRouter();
  const setAuthValues = useAuthStore((state) => state.setAuth);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("Patient");
  const [age, setAge] = useState("");
  const [password, setPassword] = useState("");
  const [image, setImage] = useState(""); // NEW: State for profile picture
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // --- NEW: Handle Image Selection & Conversion ---
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("Image is too large. Please select an image under 5MB.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => setImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // NEW: Included image in the payload
      const response = await api.post("/api/users/signup", {
        name,
        email,
        age,
        password,
        role,
        image, 
      });
      const { user, token } = response.data;
      setAuthValues(user, token);
      router.replace("/");
      alert("Welcome to Medvision AI");
    } catch (error: any) {
      setError(error.response?.data?.error || "Signup Failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="min-h-[calc(100vh-80px)] w-full px-4 py-6 sm:py-10 flex items-center justify-center text-white">
        <div className="w-full flex items-center justify-center">
          <form
            onSubmit={handleSignup}
            className="grid gap-5 sm:gap-6 border-2 w-full max-w-md p-6 sm:p-8 pt-5 border-blue-400 shadow-lg shadow-blue-500/50 rounded-lg bg-black/10"
          >
            {error && (
              <p className="text-red-500 text-sm sm:text-base m-0 text-center">
                {error}
              </p>
            )}
            <h1 className="m-0">
              <Link
                className="font-sans grid text-center no-underline text-3xl font-extrabold tracking-tight"
                href="/"
              >
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-400 to-blue-400 animate-gradient-x">
                  Join Medvision AI
                </span>
              </Link>
            </h1>

            {/* --- NEW: Profile Picture Uploader --- */}
            <div className="flex flex-col items-center justify-center -mt-2">
              <div
                className="relative w-20 h-20 rounded-full overflow-hidden bg-[#1a163a] border-2 border-gray-600 cursor-pointer hover:border-blue-400 transition-colors shadow-[0_0_10px_rgba(94,212,255,0.15)] flex-shrink-0 flex items-center justify-center"
                onClick={() => fileInputRef.current?.click()}
              >
                {image ? (
                  <Image src={image} alt="Avatar Preview" fill className="object-cover" />
                ) : (
                  <i className="fa-solid fa-camera text-xl text-gray-400"></i>
                )}
              </div>
              <p className="text-[11px] text-gray-400 mt-2">Profile Picture (Optional)</p>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageChange}
                accept="image/jpeg, image/png, image/webp"
                className="hidden"
              />
            </div>

            {/* Full Name */}
            <div className="relative w-full max-w-sm mx-auto">
              <i className="fa-solid fa-user absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
              <input
                type="text"
                placeholder="Full Name"
                value={name}
                required
                onChange={(e) => setName(e.target.value)}
                className="text-white shadow-[0_0_10px_#5ed4ff,0_0_10px_#5ed4ff] bg-white/10 w-full pl-10 pr-4 py-2 border border-gray-300 shadow-blue-500/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
              />
            </div>

            {/* Email Address */}
            <div className="relative w-full max-w-sm mx-auto">
              <i className="fa-regular fa-envelope absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
              <input
                type="email"
                placeholder="Email Address"
                value={email}
                required
                onChange={(e) => setEmail(e.target.value)}
                className="text-white shadow-[0_0_10px_#5ed4ff,0_0_10px_#5ed4ff] bg-white/10 w-full pl-10 pr-4 py-2 border border-gray-300 shadow-blue-500/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
              />
            </div>

            {/* Role Dropdown Selector */}
            <div className="relative w-full max-w-sm mx-auto">
              <i className="fa-brands fa-critical-role absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 z-10"></i>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="text-white shadow-[0_0_10px_#5ed4ff,0_0_10px_#5ed4ff] bg-[#1a163a] w-full pl-10 pr-8 py-2 border border-gray-300 shadow-blue-500/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base cursor-pointer appearance-none"
              >
                <option value="Patient" className="bg-[#1a163a]">Patient</option>
                <option value="Doctor" className="bg-[#1a163a]">Doctor</option>
                <option value="Admin" className="bg-[#1a163a]">Admin</option>
                <option value="Radiologist" className="bg-[#1a163a]">Radiologist</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-400">
                <i className="fa-solid fa-chevron-down text-xs"></i>
              </div>
            </div>

            {/* Age */}
            <div className="relative w-full max-w-sm mx-auto">
              <i className="fas fa-user absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
              <input
                type="number"
                placeholder="Age"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                className="text-white shadow-[0_0_10px_#5ed4ff,0_0_10px_#5ed4ff] bg-white/10 w-full pl-10 pr-4 py-2 border border-gray-300 shadow-blue-500/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
              />
            </div>

            {/* Password */}
            <div className="relative w-full max-w-sm mx-auto">
              <i className="fa-solid fa-unlock-keyhole absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="text-white shadow-blue-500/50 shadow-[0_0_10px_#5ed4ff,0_0_10px_#5ed4ff] bg-white/10 w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 bg-transparent border-none p-0 m-0 z-10 text-gray-400 hover:text-white"
              >
                <i className={`fa-solid ${showPassword ? "fa-eye-slash" : "fa-eye"}`}></i>
              </button>
            </div>

            {/* Live password requirement hints */}
            <div className="max-w-sm mx-auto -mt-2 mb-1 flex flex-wrap gap-x-3 gap-y-1">
              <span className={`text-[11px] flex items-center gap-1 transition-colors duration-300 ${password.length >= 8 ? "text-green-400" : "text-gray-500"}`}>
                <i className={`fa-solid fa-circle-check text-[10px] transition-opacity duration-300 ${password.length >= 8 ? "opacity-100" : "opacity-30"}`}></i>
                At least 8 characters
              </span>
              <span className={`text-[11px] flex items-center gap-1 transition-colors duration-300 ${/[A-Z]/.test(password) ? "text-green-400" : "text-gray-500"}`}>
                <i className={`fa-solid fa-circle-check text-[10px] transition-opacity duration-300 ${/[A-Z]/.test(password) ? "opacity-100" : "opacity-30"}`}></i>
                One uppercase letter
              </span>
              <span className={`text-[11px] flex items-center gap-1 transition-colors duration-300 ${/[0-9]/.test(password) ? "text-green-400" : "text-gray-500"}`}>
                <i className={`fa-solid fa-circle-check text-[10px] transition-opacity duration-300 ${/[0-9]/.test(password) ? "opacity-100" : "opacity-30"}`}></i>
                One number
              </span>
            </div>

            {/* Action Buttons */}
            <div className="w-full max-w-sm mx-auto mt-2">
              <button
                className="login-signup w-full border-2 border-[#cfeffa] shadow-[0_0_10px_#bfa9d9,0_0_20px_#bfa9d9] py-1.5 sm:py-2 px-4 text-sm font-bold transition-all"
                type="submit"
                disabled={loading}
              >
                {loading ? "Creating Account..." : "Create Account"}
              </button>
            </div>

            <div className="w-full max-w-sm mx-auto">
              <button
                className="login-signup w-full border-2 border-[#cfeffa] shadow-[0_0_10px_#bfa9d9,0_0_20px_#bfa9d9] py-1.5 sm:py-2 px-4 text-sm font-bold flex items-center justify-center transition-all"
                type="button"
                onClick={() => signIn("google", { callbackUrl: "/" })}
              >
                <Image className="mr-3 flex-none" src="/google.png" alt="google" width={16} height={16} />
                Continue with Google
              </button>
            </div>

            <div className="text-center text-sm mt-1">
              Already Have an Account?{" "}
              <Link href="/login" className="underline text-white whitespace-nowrap font-medium ml-1">
                Sign In
              </Link>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}