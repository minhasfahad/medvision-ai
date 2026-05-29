"use client";
import { useState } from "react";
import { useAuthStore } from "@/src/lib/store/useAuthStore";
import api from "@/src/lib/axios"; // Using your existing axios setup

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
      <div className="w-full max-w-md p-8 border-2 border-blue-400 shadow-[0_0_20px_#5ed4ff] rounded-lg bg-[#1a163a] text-white text-center">
        <h2 className="text-2xl font-bold mb-2">Welcome to MedVision AI!</h2>
        <p className="text-gray-300 mb-6 text-sm">
          To complete your account setup, please tell us how you will be using
          the platform.
        </p>

        <div className="flex flex-col gap-3 justify-center mt-4">
          <button
            onClick={() => handleRoleSelect("Patient")}
            disabled={loading}
            className="w-full border-2 border-[#cfeffa] shadow-[0_0_10px_#bfa9d9] py-2 px-4 font-bold transition-all hover:bg-white/10 disabled:opacity-50"
          >
            I am a Patient
          </button>

          <button
            onClick={() => handleRoleSelect("Doctor")}
            disabled={loading}
            className="w-full border-2 border-[#cfeffa] shadow-[0_0_10px_#bfa9d9] py-2 px-4 font-bold transition-all hover:bg-white/10 disabled:opacity-50"
          >
            I am a Doctor
          </button>

          <button
            onClick={() => handleRoleSelect("Admin")}
            disabled={loading}
            className="w-full border-2 border-red-400 shadow-[0_0_10px_#ff7b7b] py-2 px-4 font-bold transition-all hover:bg-white/10 disabled:opacity-50 text-red-200"
          >
            I am an Admin
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
