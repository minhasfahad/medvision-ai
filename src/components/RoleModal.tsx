"use client";
import { useState } from "react";
import { useAuthStore } from "@/src/lib/store/useAuthStore";
import api from "@/src/lib/axios"; // Using your existing axios setup
import { Sparkles, User, Stethoscope, ShieldCheck, Microscope } from "lucide-react";

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
      <div className="w-full max-w-md p-8 border border-white/10 shadow-[0_0_40px_rgba(37,99,235,0.25)] rounded-2xl bg-[#12172a]/95 backdrop-blur-md text-white text-center animate-fade-in-up">
        <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center shadow-[0_0_20px_rgba(37,99,235,0.4)]">
          <Sparkles className="w-7 h-7 text-white" />
        </div>
        <h2 className="text-2xl font-bold mb-2 text-white">Welcome to MedVision AI!</h2>
        <p className="text-gray-400 mb-6 text-sm leading-relaxed">
          To complete your account setup, please tell us how you will be using
          the platform.
        </p>

        <div className="flex flex-col gap-3 justify-center mt-4">
          <button
            onClick={() => handleRoleSelect("Patient")}
            disabled={loading}
            className="w-full flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 py-3 px-4 font-bold text-gray-100 transition-all duration-300 hover:bg-white/10 hover:border-blue-500/40 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
          >
            <div className="w-9 h-9 rounded-lg bg-blue-500/10 flex items-center justify-center flex-none">
              <User className="w-5 h-5 text-blue-400" />
            </div>
            I am a Patient
          </button>

          <button
            onClick={() => handleRoleSelect("Doctor")}
            disabled={loading}
            className="w-full flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 py-3 px-4 font-bold text-gray-100 transition-all duration-300 hover:bg-white/10 hover:border-purple-500/40 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
          >
            <div className="w-9 h-9 rounded-lg bg-purple-500/10 flex items-center justify-center flex-none">
              <Stethoscope className="w-5 h-5 text-purple-400" />
            </div>
            I am a Doctor
          </button>

          <button
            onClick={() => handleRoleSelect("Admin")}
            disabled={loading}
            className="w-full flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 py-3 px-4 font-bold text-gray-100 transition-all duration-300 hover:bg-white/10 hover:border-emerald-500/40 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
          >
            <div className="w-9 h-9 rounded-lg bg-emerald-500/10 flex items-center justify-center flex-none">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
            </div>
            I am an Admin
          </button>
          <button
            onClick={() => handleRoleSelect("Radiologist")}
            disabled={loading}
            className="w-full flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 py-3 px-4 font-bold text-gray-100 transition-all duration-300 hover:bg-white/10 hover:border-amber-500/40 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
          >
            <div className="w-9 h-9 rounded-lg bg-amber-500/10 flex items-center justify-center flex-none">
              <Microscope className="w-5 h-5 text-amber-400" />
            </div>
            I am a Radiologist
          </button>
        </div>

        {loading && (
          <p className="mt-4 text-sm text-blue-300 animate-pulse">
            Setting up your account...
          </p>
        )}
      </div>
    </div>
  );
}
