"use client";
import { signIn } from "next-auth/react";
import api from "@/src/lib/axios";
import { useAuthStore } from "@/src/lib/store/useAuthStore";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useRef } from "react";
import {
  Camera,
  User,
  Mail,
  UserCog,
  ChevronDown,
  Cake,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  Loader2,
} from "lucide-react";

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
      <div className="min-h-screen w-full px-4 py-10 flex items-center justify-center text-white">
        <div className="w-full flex items-center justify-center">
          <form
            onSubmit={handleSignup}
            className="grid gap-5 sm:gap-6 w-full max-w-md p-6 sm:p-8 pt-5 border border-white/10 shadow-[0_0_40px_rgba(37,99,235,0.15)] rounded-2xl bg-white/5 backdrop-blur-md animate-fade-in-up"
          >
            {error && (
              <p className="text-red-400 text-sm sm:text-base bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2 m-0 text-center">
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
                className="relative w-20 h-20 rounded-full overflow-hidden bg-white/5 border-2 border-white/10 cursor-pointer hover:border-blue-500/50 transition-colors shadow-[0_0_15px_rgba(37,99,235,0.15)] flex-shrink-0 flex items-center justify-center"
                onClick={() => fileInputRef.current?.click()}
              >
                {image ? (
                  <Image src={image} alt="Avatar Preview" fill className="object-cover" />
                ) : (
                  <Camera className="w-6 h-6 text-gray-400" />
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
              <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
              <input
                type="text"
                placeholder="Full Name"
                value={name}
                required
                onChange={(e) => setName(e.target.value)}
                className="text-white placeholder-gray-500 bg-white/5 w-full pl-11 pr-4 py-2.5 border border-white/10 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all text-sm sm:text-base"
              />
            </div>

            {/* Email Address */}
            <div className="relative w-full max-w-sm mx-auto">
              <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
              <input
                type="email"
                placeholder="Email Address"
                value={email}
                required
                onChange={(e) => setEmail(e.target.value)}
                className="text-white placeholder-gray-500 bg-white/5 w-full pl-11 pr-4 py-2.5 border border-white/10 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all text-sm sm:text-base"
              />
            </div>

            {/* Role Dropdown Selector */}
            <div className="relative w-full max-w-sm mx-auto">
              <UserCog className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 z-10 pointer-events-none" />
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="text-white bg-[#1a163a] w-full pl-11 pr-8 py-2.5 border border-white/10 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all text-sm sm:text-base cursor-pointer appearance-none"
              >
                <option value="Patient" className="bg-[#1a163a]">Patient</option>
                <option value="Doctor" className="bg-[#1a163a]">Doctor</option>
                <option value="Admin" className="bg-[#1a163a]">Admin</option>
                <option value="Radiologist" className="bg-[#1a163a]">Radiologist</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
                <ChevronDown className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* Age */}
            <div className="relative w-full max-w-sm mx-auto">
              <Cake className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
              <input
                type="number"
                placeholder="Age"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                className="text-white placeholder-gray-500 bg-white/5 w-full pl-11 pr-4 py-2.5 border border-white/10 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all text-sm sm:text-base"
              />
            </div>

            {/* Password */}
            <div className="relative w-full max-w-sm mx-auto">
              <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
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

            {/* Live password requirement hints */}
            <div className="max-w-sm mx-auto -mt-2 mb-1 flex flex-wrap gap-x-3 gap-y-1">
              <span className={`text-[11px] flex items-center gap-1 transition-colors duration-300 ${password.length >= 8 ? "text-green-400" : "text-gray-500"}`}>
                <CheckCircle2 className={`w-3 h-3 transition-opacity duration-300 ${password.length >= 8 ? "opacity-100" : "opacity-30"}`} />
                At least 8 characters
              </span>
              <span className={`text-[11px] flex items-center gap-1 transition-colors duration-300 ${/[A-Z]/.test(password) ? "text-green-400" : "text-gray-500"}`}>
                <CheckCircle2 className={`w-3 h-3 transition-opacity duration-300 ${/[A-Z]/.test(password) ? "opacity-100" : "opacity-30"}`} />
                One uppercase letter
              </span>
              <span className={`text-[11px] flex items-center gap-1 transition-colors duration-300 ${/[0-9]/.test(password) ? "text-green-400" : "text-gray-500"}`}>
                <CheckCircle2 className={`w-3 h-3 transition-opacity duration-300 ${/[0-9]/.test(password) ? "opacity-100" : "opacity-30"}`} />
                One number
              </span>
            </div>

            {/* Action Buttons */}
            <div className="w-full max-w-sm mx-auto mt-2">
              <button
                className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold py-2.5 sm:py-3 px-4 text-sm shadow-[0_0_20px_rgba(37,99,235,0.4)] hover:shadow-[0_0_30px_rgba(168,85,247,0.5)] hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-60 disabled:hover:translate-y-0 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                type="submit"
                disabled={loading}
              >
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                {loading ? "Creating Account..." : "Create Account"}
              </button>
            </div>

            <div className="flex items-center gap-3 w-full max-w-sm mx-auto -my-1">
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
                <Image className="mr-3 flex-none" src="/google.png" alt="google" width={16} height={16} />
                Continue with Google
              </button>
            </div>

            <div className="text-center text-sm mt-1 text-gray-400">
              Already Have an Account?{" "}
              <Link href="/login" className="text-blue-400 hover:text-blue-300 transition-colors no-underline whitespace-nowrap font-semibold ml-1">
                Sign In
              </Link>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}