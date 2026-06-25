"use client";

import { useState, useEffect, useRef } from "react";
import { useAuthStore } from "@/src/lib/store/useAuthStore";
import api from "@/src/lib/axios";
import { useRouter } from "next/navigation";
import ProtectedRoute from "@/src/components/ProtectedRoute";
import Image from "next/image"; // Added for optimized avatar rendering

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
    if (file) {
      // Check file size (limit to 5MB for profile pics)
      if (file.size > 5 * 1024 * 1024) {
        alert("Image is too large. Please select an image under 5MB.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileData({ ...profileData, image: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
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
      alert("CRITICAL ERROR: Your User ID is completely missing! You must log out and log back in.");
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
      "Are you absolutely sure? This action cannot be undone and will permanently delete your account."
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
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-100 leading-tight">
              Account Settings
            </h1>
            <p className="text-gray-400 text-xs sm:text-sm mt-1">
              Manage your personal information and security preferences.
            </p>
          </div>

          {/* 1. PROFILE INFORMATION CARD */}
          <div className="bg-[#121726] border border-[#2a3655] rounded-2xl p-5 sm:p-8 shadow-xl">
            <h2 className="text-lg sm:text-xl font-bold text-white mb-5 sm:mb-6 flex items-center gap-2">
              <svg
                className="w-5 h-5 text-blue-500 flex-none"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                ></path>
              </svg>
              Personal Information
            </h2>

            <form onSubmit={handleUpdateProfile} className="space-y-5 sm:space-y-6">
              
              {/* --- NEW: Avatar Upload Section --- */}
              <div className="flex flex-col items-center sm:items-start mb-6">
                <label className="block text-xs sm:text-sm font-medium text-gray-400 mb-3">
                  Profile Picture
                </label>
                <div className="flex items-center gap-5">
                  <div 
                    className="relative w-20 h-20 rounded-full overflow-hidden bg-[#1e2235] border-2 border-gray-700 cursor-pointer hover:border-blue-500 transition-colors flex-shrink-0"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {profileData.image ? (
                      <Image 
                        src={profileData.image} 
                        alt="Profile Preview" 
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex items-center justify-center w-full h-full text-gray-500">
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col gap-2">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="text-sm bg-[#1e2235] hover:bg-gray-700 border border-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
                    >
                      Change Picture
                    </button>
                    <p className="text-xs text-gray-500">JPG, PNG or WEBP. Max 5MB.</p>
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
                    className="w-full bg-[#1e2235] border border-gray-700 rounded-lg px-3 sm:px-4 py-2.5 sm:py-3 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors placeholder:text-gray-600"
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
                    className="w-full bg-[#1e2235]/50 border border-gray-800 rounded-lg px-3 sm:px-4 py-2.5 sm:py-3 text-sm text-gray-500 cursor-not-allowed truncate"
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
                    className="w-full bg-[#1e2235] border border-gray-700 rounded-lg px-3 sm:px-4 py-2.5 sm:py-3 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors placeholder:text-gray-600"
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
                    className="w-full bg-[#1e2235]/50 border border-gray-800 rounded-lg px-3 sm:px-4 py-2.5 sm:py-3 text-sm text-gray-500 cursor-not-allowed capitalize"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t border-gray-800">
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2.5 rounded-lg text-sm font-bold transition-colors w-full sm:w-auto"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>

          {/* 2. SECURITY CARD */}
          <div className="bg-[#121726] border border-[#2a3655] rounded-2xl p-5 sm:p-8 shadow-xl">
            <h2 className="text-lg sm:text-xl font-bold text-white mb-5 sm:mb-6 flex items-center gap-2">
              <svg
                className="w-5 h-5 text-emerald-500 flex-none"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                ></path>
              </svg>
              Security & Password
            </h2>

            <form onSubmit={handleUpdatePassword} className="space-y-5 sm:space-y-6 max-w-md w-full">
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
                  className="w-full bg-[#1e2235] border border-gray-700 rounded-lg px-3 sm:px-4 py-2.5 sm:py-3 text-sm text-white focus:outline-none focus:border-emerald-500 transition-colors"
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
                  className="w-full bg-[#1e2235] border border-gray-700 rounded-lg px-3 sm:px-4 py-2.5 sm:py-3 text-sm text-white focus:outline-none focus:border-emerald-500 transition-colors"
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
                  className="w-full bg-[#1e2235] border border-gray-700 rounded-lg px-3 sm:px-4 py-2.5 sm:py-3 text-sm text-white focus:outline-none focus:border-emerald-500 transition-colors"
                  required
                />
              </div>

              <div className="pt-4 border-t border-gray-800">
                <button
                  type="submit"
                  className="bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-2.5 rounded-lg text-sm font-bold transition-colors w-full sm:w-auto"
                >
                  Update Password
                </button>
              </div>
            </form>
          </div>

          {/* 3. DANGER ZONE CARD */}
          <div className="bg-red-950/10 border border-red-900/30 rounded-2xl p-5 sm:p-8 shadow-xl w-full">
            <h2 className="text-lg sm:text-xl font-bold text-red-500 mb-2 flex items-center gap-2">
              <svg
                className="w-5 h-5 flex-none"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
              </svg>
              Danger Zone
            </h2>
            <p className="text-gray-400 text-xs sm:text-sm mb-5 sm:mb-6 leading-relaxed">
              Once you delete your account, there is no going back. All your medical scans, history, and appointments will be permanently erased.
            </p>

            <button
              onClick={handleDeleteAccount}
              className="bg-red-600/20 border border-red-500 hover:bg-red-600 text-red-400 hover:text-white px-6 py-2.5 rounded-lg text-sm font-bold transition-colors w-full sm:w-auto"
            >
              Delete Account
            </button>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}