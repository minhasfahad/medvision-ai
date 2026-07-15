"use client";

import { useMemo } from "react";
import { useAuthStore } from "@/src/lib/store/useAuthStore";
import ProtectedRoute from "@/src/components/ProtectedRoute";
import AmbientBackground from "@/src/components/AmbientBackground";
import { Video, ShieldCheck } from "lucide-react";

export default function ConsultationRoom() {
  const { user } = useAuthStore();

  const roomUrl = useMemo(() => {
    const isDoctor = user?.role === "doctor";
    const baseUrl =
      "https://medvision-ai.whereby.com/meadvision-video-consult696c32bc-d666-4288-bd8d-dc10edfeec7b";
    const roomKey =
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJtZWV0aW5nSWQiOiIxMzMwMzY3NDAiLCJyb29tUmVmZXJlbmNlIjp7InJvb21OYW1lIjoiL21lYWR2aXNpb24tdmlkZW8tY29uc3VsdDY5NmMzMmJjLWQ2NjYtNDI4OC1iZDhkLWRjMTBlZGZlZWM3YiIsIm9yZ2FuaXphdGlvbklkIjoiMzQyNTczIn0sImlzcyI6Imh0dHBzOi8vYWNjb3VudHMuc3J2LndoZXJlYnkuY29tIiwiaWF0IjoxNzgxNzQyODk1LCJyb29tS2V5VHlwZSI6Im1lZXRpbmdIb3N0In0.jyDlceooJoTd-l2yDPDnv69J7yEnJkapUkkpxe2aYaI";
    const params = "?skipMediaPermissionPrompt=true&leaveButton=on&background=off&minimal=on";

    return isDoctor
      ? `${baseUrl}${params}&roomKey=${roomKey}`
      : `${baseUrl}${params}`;
  }, [user?.role]);

  return (
    <ProtectedRoute>
      <div className="relative flex h-screen w-full flex-col overflow-hidden">
        <AmbientBackground />

        <div className="relative flex items-center justify-between p-4 bg-[#0f1123]/80 backdrop-blur-md border-b border-white/10 shadow-[0_4px_30px_rgba(59,130,246,0.12)] z-10 animate-fade-in-up overflow-hidden">
          <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-blue-500 via-purple-500 to-blue-500 bg-[length:200%_auto] animate-gradient-x" />

          <div className="relative flex items-center gap-3 min-w-0">
            <div className="relative w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center flex-none shadow-[0_0_15px_rgba(37,99,235,0.4)]">
              <Video className="w-4 h-4 text-white" />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full ring-2 ring-[#0f1123] animate-pulse" />
            </div>
            <div className="min-w-0">
              <h1 className="text-base sm:text-lg font-extrabold truncate bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-400 to-blue-400 animate-gradient-x">
                MedVision Secure Telehealth
              </h1>
              <p className="text-[11px] sm:text-xs text-green-400 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 flex-none" />
                End-to-end encrypted connection
              </p>
            </div>
          </div>

          <span className="hidden sm:inline-flex items-center gap-1.5 rounded-full border border-red-500/30 bg-red-900/20 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-red-300 flex-none">
            <span className="w-1.5 h-1.5 bg-red-400 rounded-full animate-pulse"></span>
            Live Session
          </span>
        </div>
        <iframe
          src={roomUrl}
          allow="camera; microphone; fullscreen; speaker; display-capture; autoplay"
          style={{ width: "100%", height: "calc(100vh - 80px)", border: "none" }}
        />
      </div>
    </ProtectedRoute>
  );
}
