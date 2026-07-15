"use client";
import { useState } from "react";
import { useAuthStore } from "@/src/lib/store/useAuthStore";
import api from "@/src/lib/axios"; // Using your existing axios setup
import { Sparkles, User, Stethoscope, ShieldCheck, Microscope } from "lucide-react";
import SpotlightCard from "@/src/components/SpotlightCard";

const ROLES = [
  {
    key: "Patient",
    label: "I am a Patient",
    sub: "Track scans & reports",
    icon: User,
    bg: "bg-blue-500/10",
    text: "text-blue-400",
    border: "hover:border-blue-500/40",
    glow: "37,99,235",
  },
  {
    key: "Doctor",
    label: "I am a Doctor",
    sub: "Review & annotate cases",
    icon: Stethoscope,
    bg: "bg-purple-500/10",
    text: "text-purple-400",
    border: "hover:border-purple-500/40",
    glow: "168,85,247",
  },
  {
    key: "Admin",
    label: "I am an Admin",
    sub: "Manage the platform",
    icon: ShieldCheck,
    bg: "bg-emerald-500/10",
    text: "text-emerald-400",
    border: "hover:border-emerald-500/40",
    glow: "16,185,129",
  },
  {
    key: "Radiologist",
    label: "I am a Radiologist",
    sub: "Deep diagnostic analysis",
    icon: Microscope,
    bg: "bg-amber-500/10",
    text: "text-amber-400",
    border: "hover:border-amber-500/40",
    glow: "245,158,11",
  },
] as const;

export default function RoleModal() {
  const { user, updateUser } = useAuthStore();

  const [loading, setLoading] = useState(false);

  // If there is no user, OR if they already have a proper role, hide the modal completely.
  // We only show this if their role is the default "user".
  if (!user || user.role !== "user") return null;

  const handleRoleSelect = async (selectedRole: string) => {
    setLoading(true);
    try {
      // 1. Update the database (Keep your existing api.post code here)
      await api.post("/api/users/update-role", {
        email: user.email,
        role: selectedRole,
      });

      // 2. Update your global Zustand store immediately (this closes the modal)
      updateUser({ role: selectedRole.toLowerCase() }); // <-- NEW LINE

      // 3. Show the Success/Welcome Message!
      alert(
        `Account created successfully! Welcome to MedVision AI as a ${selectedRole}.`,
      );
    } catch (error: any) {
      console.error(error);
      // This will alert the ACTUAL error coming from your backend
      alert("Error: " + (error.response?.data?.error || error.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4">
      <div className="relative w-full max-w-2xl p-6 sm:p-10 border border-white/10 shadow-[0_0_50px_rgba(37,99,235,0.25)] rounded-3xl bg-[#0b0e24]/95 backdrop-blur-md text-white animate-fade-in-up overflow-hidden">
        {/* Ambient tech-grid + glow backdrop, echoing the rest of the app */}
        <div className="absolute inset-0 bg-grid-fade opacity-40 -z-10"></div>
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-purple-600/20 rounded-full blur-[100px] -z-10 pointer-events-none"></div>

        <div className="text-center mb-8">
          <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center shadow-[0_0_20px_rgba(37,99,235,0.4)]">
            <Sparkles className="w-7 h-7 text-white" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold mb-2 text-white">
            Welcome to MedVision AI!
          </h2>
          <p className="text-gray-400 text-sm leading-relaxed max-w-md mx-auto">
            To complete your account setup, please tell us how you will be
            using the platform.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {ROLES.map(({ key, label, sub, icon: Icon, bg, text, border, glow }) => (
            <SpotlightCard key={key} color={glow} className="rounded-2xl h-full">
              <button
                onClick={() => handleRoleSelect(key)}
                disabled={loading}
                className={`w-full h-full flex items-center gap-4 rounded-2xl border border-white/10 bg-white/5 py-4 px-5 font-bold text-gray-100 transition-all duration-300 hover:bg-white/10 ${border} hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 text-left`}
              >
                <div className={`w-11 h-11 rounded-xl ${bg} flex items-center justify-center flex-none`}>
                  <Icon className={`w-5 h-5 ${text}`} />
                </div>
                <div className="min-w-0">
                  <p className="m-0 truncate">{label}</p>
                  <p className="m-0 text-xs font-normal text-gray-500 truncate">
                    {sub}
                  </p>
                </div>
              </button>
            </SpotlightCard>
          ))}
        </div>

        {loading && (
          <p className="mt-6 text-center text-sm text-blue-300 animate-pulse">
            Setting up your account...
          </p>
        )}
      </div>
    </div>
  );
}
