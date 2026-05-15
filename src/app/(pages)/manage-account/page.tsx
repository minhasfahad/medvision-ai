"use client";

import { useState, useEffect } from "react";
import { useAuthStore } from "@/src/lib/store/useAuthStore";
import api from "@/src/lib/axios";
import { useRouter } from "next/navigation";

export default function ManageAccountPage() {
  const { user, isAuthenticated, clear, updateUser } = useAuthStore();
  const router = useRouter();

  // --- FORM STATES ---
 // --- FORM STATES ---
  // 1. Initialize directly with user data if it's already available
  const [profileData, setProfileData] = useState({
    name: user?.name || "",
    age: user?.age ? String(user.age) : "",
    image: user?.image || ""
  });
  
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  // Pre-fill user data when the component loads
  useEffect(() => {
    if (user) {
      // Using a tiny timeout safely bypasses the strict 'synchronous render' warning
      const timer = setTimeout(() => {
        setProfileData({
          name: user.name || "",
          age: user.age ? String(user.age) : "",
          image: user.image || ""
        });
      }, 0);
      
      // Cleanup function
      return () => clearTimeout(timer);
    }
  }, [user]);

  // --- HANDLERS (To be connected to backend APIs next) ---
// --- HANDLERS ---
 const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    // 1. Prepare the exact data we are sending
    const payload = {
      userId: user.id || (user as any)._id, 
      name: profileData.name,
      age: profileData.age ? Number(profileData.age) : undefined,
    };

    // 2. Log it to the console so we can see it
    console.log("🚀 SENDING PAYLOAD TO BACKEND:", payload);

    // 3. Catch the missing ID bug immediately
    if (!payload.userId) {
      alert("CRITICAL ERROR: Your User ID is completely missing! You must log out and log back in.");
      return;
    }

    try {
      const response = await api.put("/api/users/profile", {
        userId: user.id || (user as any)._id, 
        name: profileData.name,
        age: profileData.age ? Number(profileData.age) : undefined,
      });

      if (response.data.success) {
        // 1. Instantly update the browser's memory without reloading!
        updateUser({ 
          name: profileData.name, 
          age: profileData.age ? Number(profileData.age) : undefined 
        });

        // 2. Show success message
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
        userId: user.id || (user as any)._id, // <--- CHANGE THIS LINE
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });

      if (response.data.success) {
        alert("Password updated successfully! Please log in again.");
        clear(); // Log them out so they use the new password
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
      // Pass the userId as a URL parameter for the DELETE request
      const response = await api.delete(`/api/users/profile?userId=${user.id}`);
      if (response.data.success) {
        alert("Your account has been deleted.");
        clear(); // Clear local state/cookies
        router.push("/"); // Send back to home page
      }
    } catch (error: any) {
      alert(error.response?.data?.message || "Failed to delete account");
    }
  };

  if (!isAuthenticated) {
    return <div className="min-h-screen flex items-center justify-center text-white">Please log in to manage your account.</div>;
  }

  return (
    <div className="min-h-screen bg-transparent text-white pt-24 px-4 pb-12">
      <div className="max-w-4xl mx-auto space-y-8">
        
        <div>
          <h1 className="text-3xl font-bold text-gray-100">Account Settings</h1>
          <p className="text-gray-400 mt-1">Manage your personal information and security preferences.</p>
        </div>

        {/* 1. PROFILE INFORMATION CARD */}
        <div className="bg-[#121726] border border-[#2a3655] rounded-2xl p-8 shadow-xl">
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
            Personal Information
          </h2>
          
          <form onSubmit={handleUpdateProfile} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Full Name</label>
                <input 
                  type="text" 
                  value={profileData.name}
                  onChange={(e) => setProfileData({...profileData, name: e.target.value})}
                  className="w-full bg-[#1e2235] border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>
              
              {/* Email (Disabled / Read Only) */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Email Address</label>
                <input 
                  type="email" 
                  value={user?.email || ""}
                  disabled
                  className="w-full bg-[#1e2235]/50 border border-gray-800 rounded-lg px-4 py-3 text-gray-500 cursor-not-allowed"
                />
              </div>

              {/* Age */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Age</label>
                <input 
                  type="number" 
                  value={profileData.age}
                  onChange={(e) => setProfileData({...profileData, age: e.target.value})}
                  className="w-full bg-[#1e2235] border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>

              {/* Role (Disabled / Read Only) */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Account Type</label>
                <input 
                  type="text" 
                  value={user?.role || ""}
                  disabled
                  className="w-full bg-[#1e2235]/50 border border-gray-800 rounded-lg px-4 py-3 text-gray-500 cursor-not-allowed capitalize"
                />
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-gray-800">
              <button type="submit" className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2.5 rounded-lg font-bold transition-colors">
                Save Changes
              </button>
            </div>
          </form>
        </div>

        {/* 2. SECURITY CARD */}
        <div className="bg-[#121726] border border-[#2a3655] rounded-2xl p-8 shadow-xl">
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <svg className="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
            Security & Password
          </h2>
          
          <form onSubmit={handleUpdatePassword} className="space-y-6 max-w-md">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Current Password</label>
              <input 
                type="password" 
                value={passwordData.currentPassword}
                onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                className="w-full bg-[#1e2235] border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500 transition-colors"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">New Password</label>
              <input 
                type="password" 
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                className="w-full bg-[#1e2235] border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500 transition-colors"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Confirm New Password</label>
              <input 
                type="password" 
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                className="w-full bg-[#1e2235] border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500 transition-colors"
                required
              />
            </div>

            <div className="pt-4 border-t border-gray-800">
              <button type="submit" className="bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-2.5 rounded-lg font-bold transition-colors">
                Update Password
              </button>
            </div>
          </form>
        </div>

        {/* 3. DANGER ZONE CARD */}
        <div className="bg-red-950/10 border border-red-900/30 rounded-2xl p-8 shadow-xl">
          <h2 className="text-xl font-bold text-red-500 mb-2 flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
            Danger Zone
          </h2>
          <p className="text-gray-400 text-sm mb-6">Once you delete your account, there is no going back. All your medical scans, history, and appointments will be permanently erased.</p>
          
          <button 
            onClick={handleDeleteAccount}
            className="bg-red-600/20 border border-red-500 hover:bg-red-600 text-red-400 hover:text-white px-6 py-2.5 rounded-lg font-bold transition-colors"
          >
            Delete Account
          </button>
        </div>

      </div>
    </div>
  );
}