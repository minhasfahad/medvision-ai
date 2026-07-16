"use client";

import { useState, useEffect, useRef } from "react";
import { useAuthStore } from "@/src/lib/store/useAuthStore";
import api from "@/src/lib/axios";
import { useRouter } from "next/navigation";
import ProtectedRoute from "@/src/components/ProtectedRoute";
import Image from "next/image"; // Added for optimized avatar rendering
import { User, Lock, AlertTriangle, Camera, Save, KeyRound, Trash2 } from "lucide-react";

export default function ManageAccountPage() {
  const { user, clear, updateUser } = useAuthStore();
  const router = useRouter();

  // Reference for the hidden file input
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- FORM STATES ---
  const [profileData, setProfileData] = useState({
    name: user?.name || "",
    age: user?.age ? String(user.age) : "",
    image: user?.image || "", // This will hold the Cloudinary URL or new Base64 string
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  useEffect(() => {
    if (user) {
      const timer = setTimeout(() => {
        setProfileData({
          name: user.name || "",
          age: user.age ? String(user.age) : "",
          image: user.image || "",
        });
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [user]);

  // --- NEW: Image Selection Handler ---
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert("Image is too large. Please select an image under 5MB.");
      return;
    }

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = document.createElement("img");
    const url = URL.createObjectURL(file);

    img.onload = () => {
      const maxSize = 800;
      let width = img.width;
      let height = img.height;

      if (width > height) {
        if (width > maxSize) {
          height = (height * maxSize) / width;
          width = maxSize;
        }
      } else {
        if (height > maxSize) {
          width = (width * maxSize) / height;
          height = maxSize;
        }
      }

      canvas.width = width;
      canvas.height = height;
      ctx?.drawImage(img, 0, 0, width, height);
      const compressedBase64 = canvas.toDataURL("image/jpeg", 0.8);
      setProfileData({ ...profileData, image: compressedBase64 });
      URL.revokeObjectURL(url);
    };

    img.src = url;
  };

  // --- HANDLERS ---
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const payload = {
      userId: user.id || (user as any)._id,
      name: profileData.name,
      age: profileData.age ? Number(profileData.age) : undefined,
      image: profileData.image, // Send the URL or new Base64 string to the backend
    };

    console.log("🚀 SENDING PAYLOAD TO BACKEND:", payload);

    if (!payload.userId) {
      alert(
        "CRITICAL ERROR: Your User ID is completely missing! You must log out and log back in.",
      );
      return;
    }

    try {
      const response = await api.put("/api/users/profile", payload);

      if (response.data.success) {
        updateUser({
          name: profileData.name,
          age: profileData.age ? Number(profileData.age) : undefined,
          image: response.data.data.image, // Use the returned Cloudinary URL
        });
        alert("Profile updated successfully!");
      }
    } catch (error: any) {
      console.log("FULL ERROR:", error.response?.data || error);
      alert(error.response?.data?.message || "Failed to update profile");
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert("New passwords do not match!");
      return;
    }

    try {
      const response = await api.patch("/api/users/profile", {
        userId: user.id || (user as any)._id,
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });

      if (response.data.success) {
        alert("Password updated successfully! Please log in again.");
        clear();
        router.push("/login");
      }
    } catch (error: any) {
      alert(error.response?.data?.message || "Failed to update password");
    }
  };

  const handleDeleteAccount = async () => {
    if (!user) return;

    const confirmDelete = window.confirm(
      "Are you absolutely sure? This action cannot be undone and will permanently delete your account.",
    );
    if (!confirmDelete) return;

    try {
      const response = await api.delete(`/api/users/profile?userId=${user.id}`);
      if (response.data.success) {
        alert("Your account has been deleted.");
        clear();
        router.push("/");
      }
    } catch (error: any) {
      alert(error.response?.data?.message || "Failed to delete account");
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-transparent text-white pt-20 sm:pt-24 px-4 pb-12">
        <div className="max-w-4xl mx-auto space-y-6 sm:space-y-8">
          <div className="text-left">
            <h1 className="text-2xl sm:text-3xl font-bold text-white leading-tight">
              Account Settings
            </h1>
            <p className="text-gray-400 text-xs sm:text-sm mt-1">
              Manage your personal information and security preferences.
            </p>
          </div>

          {/* 1. PROFILE INFORMATION CARD */}
          <div className="bg-[#0f1123]/60 backdrop-blur-md border border-white/10 rounded-2xl p-5 sm:p-8 shadow-xl animate-fade-in-up">
            <h2 className="text-lg sm:text-xl font-bold text-white mb-5 sm:mb-6 flex items-center gap-2">
              <User className="w-5 h-5 text-blue-500 flex-none" />
              Personal Information
            </h2>

            <form
              onSubmit={handleUpdateProfile}
              className="space-y-5 sm:space-y-6"
            >
              {/* --- NEW: Avatar Upload Section --- */}
              <div className="flex flex-col items-center sm:items-start mb-6">
                <label className="block text-xs sm:text-sm font-medium text-gray-400 mb-3">
                  Profile Picture
                </label>
                <div className="flex items-center gap-5">
                  <div
                    className="group relative w-20 h-20 rounded-full overflow-hidden bg-white/5 border-2 border-white/10 cursor-pointer hover:border-blue-500 transition-colors flex-shrink-0"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {profileData.image ? (
                      <Image
                        src={profileData.image}
                        alt="Profile Preview"
                        fill
                        unoptimized   
                        className="object-cover"
                        sizes="40px"
                      />
                    ) : (
                      <div className="flex items-center justify-center w-full h-full text-gray-500">
                        <User className="w-8 h-8" />
                      </div>
                    )}
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                      <Camera className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="text-sm bg-white/5 hover:bg-white/10 border border-white/10 text-white px-4 py-2 rounded-lg transition-all duration-300 hover:-translate-y-0.5 flex items-center gap-2 w-fit"
                    >
                      <Camera className="w-4 h-4" /> Change Picture
                    </button>
                    <p className="text-xs text-gray-500">
                      JPG, PNG or WEBP. Max 5MB.
                    </p>
                  </div>
                  {/* Hidden file input */}
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageChange}
                    accept="image/jpeg, image/png, image/webp"
                    className="hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                {/* Name */}
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-400 mb-1.5 sm:mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={profileData.name}
                    onChange={(e) =>
                      setProfileData({ ...profileData, name: e.target.value })
                    }
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 text-sm text-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all placeholder:text-gray-500"
                  />
                </div>

                {/* Email (Disabled / Read Only) */}
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-400 mb-1.5 sm:mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={user?.email || ""}
                    disabled
                    className="w-full bg-white/5 border border-white/5 rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 text-sm text-gray-500 cursor-not-allowed truncate"
                  />
                </div>

                {/* Age */}
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-400 mb-1.5 sm:mb-2">
                    Age
                  </label>
                  <input
                    type="number"
                    value={profileData.age}
                    onChange={(e) =>
                      setProfileData({ ...profileData, age: e.target.value })
                    }
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 text-sm text-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all placeholder:text-gray-500"
                  />
                </div>

                {/* Role (Disabled / Read Only) */}
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-400 mb-1.5 sm:mb-2">
                    Account Type
                  </label>
                  <input
                    type="text"
                    value={user?.role || ""}
                    disabled
                    className="w-full bg-white/5 border border-white/5 rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 text-sm text-gray-500 cursor-not-allowed capitalize"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t border-white/10">
                <button
                  type="submit"
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white px-6 py-2.5 rounded-xl text-sm font-bold transition-all shadow-[0_0_20px_rgba(37,99,235,0.3)] hover:shadow-[0_0_30px_rgba(168,85,247,0.5)] hover:-translate-y-1 w-full sm:w-auto flex items-center justify-center gap-2"
                >
                  <Save className="w-4 h-4" /> Save Changes
                </button>
              </div>
            </form>
          </div>

          {/* 2. SECURITY CARD */}
          <div className="bg-[#0f1123]/60 backdrop-blur-md border border-white/10 rounded-2xl p-5 sm:p-8 shadow-xl animate-fade-in-up" style={{ animationDelay: "80ms" }}>
            <h2 className="text-lg sm:text-xl font-bold text-white mb-5 sm:mb-6 flex items-center gap-2">
              <Lock className="w-5 h-5 text-emerald-500 flex-none" />
              Security & Password
            </h2>

            <form
              onSubmit={handleUpdatePassword}
              className="space-y-5 sm:space-y-6 max-w-md w-full"
            >
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-400 mb-1.5 sm:mb-2">
                  Current Password
                </label>
                <input
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={(e) =>
                    setPasswordData({
                      ...passwordData,
                      currentPassword: e.target.value,
                    })
                  }
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 text-sm text-white focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                  required
                />
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-400 mb-1.5 sm:mb-2">
                  New Password
                </label>
                <input
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) =>
                    setPasswordData({
                      ...passwordData,
                      newPassword: e.target.value,
                    })
                  }
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 text-sm text-white focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                  required
                />
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-400 mb-1.5 sm:mb-2">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) =>
                    setPasswordData({
                      ...passwordData,
                      confirmPassword: e.target.value,
                    })
                  }
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 text-sm text-white focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                  required
                />
              </div>

              <div className="pt-4 border-t border-white/10">
                <button
                  type="submit"
                  className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white px-6 py-2.5 rounded-xl text-sm font-bold transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_30px_rgba(45,212,191,0.4)] hover:-translate-y-1 w-full sm:w-auto flex items-center justify-center gap-2"
                >
                  <KeyRound className="w-4 h-4" /> Update Password
                </button>
              </div>
            </form>
          </div>

          {/* 3. DANGER ZONE CARD */}
          <div className="bg-red-950/10 backdrop-blur-md border border-red-900/30 rounded-2xl p-5 sm:p-8 shadow-xl w-full animate-fade-in-up" style={{ animationDelay: "160ms" }}>
            <h2 className="text-lg sm:text-xl font-bold text-red-500 mb-2 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 flex-none" />
              Danger Zone
            </h2>
            <p className="text-gray-400 text-xs sm:text-sm mb-5 sm:mb-6 leading-relaxed">
              Once you delete your account, there is no going back. All your
              medical scans, history, and appointments will be permanently
              erased.
            </p>

            <button
              onClick={handleDeleteAccount}
              className="bg-red-600/20 border border-red-500 hover:bg-red-600 text-red-400 hover:text-white px-6 py-2.5 rounded-xl text-sm font-bold transition-all hover:-translate-y-1 w-full sm:w-auto flex items-center justify-center gap-2"
            >
              <Trash2 className="w-4 h-4" /> Delete Account
            </button>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
