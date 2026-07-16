"use client";
import { SessionProvider, useSession } from "next-auth/react";
import { useEffect } from "react";
import { useAuthStore } from "@/src/lib/store/useAuthStore";
import RoleModal from "./RoleModal"; // <-- Import the new modal

function AuthStateSyncer({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const setAuthValues = useAuthStore((state) => state.setAuth);

useEffect(() => {
    if (status === "authenticated" && session) {
      // 1. Peek at what is currently saved in Zustand's memory
      const currentZustandUser = useAuthStore.getState().user;

      // 2. If Zustand already has a real role (not "user"), keep it!
      // Otherwise, use the role from NextAuth.
      const safeRole = (currentZustandUser?.role && currentZustandUser.role !== "user")
        ? currentZustandUser.role
        : session.user.role;

      const userPayload = {
        id: session.user.id,
        name: session.user.name || "",
        email: session.user.email || "",
        role: safeRole, // <-- Use the safe role here!
      };
      
      setAuthValues(userPayload, session.customToken);
    }
  }, [session, status, setAuthValues]);

  return (
    <>
      {children}
      <RoleModal /> {/* <-- Add the modal here */}
    </>
  );
}

export default function SessionWrapper({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <AuthStateSyncer>{children}</AuthStateSyncer>
    </SessionProvider>
  );
}