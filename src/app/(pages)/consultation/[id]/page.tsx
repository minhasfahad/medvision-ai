"use client";

import { useMemo } from "react";
import { useAuthStore } from "@/src/lib/store/useAuthStore";
import ProtectedRoute from "@/src/components/ProtectedRoute";

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
      <div className="flex h-screen w-full flex-col overflow-hidden">
        <div className="flex items-center justify-between p-4">
          <div>
            <h1 className="text-lg font-bold text-white">
              MedVision Secure Telehealth
            </h1>
            <p className="text-xs text-green-400">
              End-to-end encrypted connection
            </p>
          </div>
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