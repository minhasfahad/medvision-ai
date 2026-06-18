"use client";

import { useEffect, useRef, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuthStore } from "@/src/lib/store/useAuthStore";
import ProtectedRoute from "@/src/components/ProtectedRoute";
import DailyIframe from "@daily-co/daily-js";

export default function ConsultationRoom() {
  const router = useRouter();
  const { user } = useAuthStore();
  const iframeRef = useRef<HTMLDivElement>(null);

  const roomUrl = useMemo(() => {
    const isDoctor = user?.role === "doctor";
    const baseUrl =
      "https://medvision-ai.whereby.com/meadvision-video-consult696c32bc-d666-4288-bd8d-dc10edfeec7b";
    const roomKey =
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJtZWV0aW5nSWQiOiIxMzMwMzY3NDAiLCJyb29tUmVmZXJlbmNlIjp7InJvb21OYW1lIjoiL21lYWR2aXNpb24tdmlkZW8tY29uc3VsdDY5NmMzMmJjLWQ2NjYtNDI4OC1iZDhkLWRjMTBlZGZlZWM3YiIsIm9yZ2FuaXphdGlvbklkIjoiMzQyNTczIn0sImlzcyI6Imh0dHBzOi8vYWNjb3VudHMuc3J2LndoZXJlYnkuY29tIiwiaWF0IjoxNzgxNzQyODk1LCJyb29tS2V5VHlwZSI6Im1lZXRpbmdIb3N0In0.jyDlceooJoTd-l2yDPDnv69J7yEnJkapUkkpxe2aYaI";
    const params = "?skipMediaPermissionPrompt=true&background=off&minimal=on";

    return isDoctor
      ? `${baseUrl}${params}&roomKey=${roomKey}`
      : `${baseUrl}${params}`;
  }, [user?.role]);

  useEffect(() => {
    if (!roomUrl) return;

    const timer = setTimeout(() => {
      if (!iframeRef.current) {
        console.log("❌ iframeRef still null after delay");
        return;
      }

      console.log("✅ Creating Daily frame with URL:", roomUrl);

      const callFrame = DailyIframe.createFrame(iframeRef.current, {
        iframeStyle: {
          width: "100%",
          height: "100%",
          border: "none",
        },
        showLeaveButton: true,
        showFullscreenButton: true,
      });

      callFrame
        .join({ url: roomUrl })
        .then(() => {
          console.log("✅ Joined successfully");
        })
        .catch((err) => {
          console.log("❌ Join failed:", err);
        });

      callFrame.on("left-meeting", () => {
        router.back();
      });
    }, 500);

    return () => {
      clearTimeout(timer);
    };
  }, [roomUrl, router]);

  return (
    <ProtectedRoute>
      <div className="flex h-screen w-full flex-col overflow-hidden mb-[10px]">
        <div className="flex items-center justify-between  p-4">
          <div>
            <h1 className="text-lg font-bold text-white">
              MedVision Secure Telehealth
            </h1>
            <p className="text-xs text-green-400">
              End-to-end encrypted connection
            </p>
          </div>
          <button
            onClick={() => router.back()}
            className="rounded-lg bg-red-600 px-4 py-2 text-xs font-bold text-white hover:bg-red-500"
          >
            Leave Consultation
          </button>
        </div>
        <div
          ref={iframeRef}
          style={{ width: "100%", height: "calc(100vh - 160px)" }}
          className="bg-black"
        />
      </div>
    </ProtectedRoute>
  );
}
