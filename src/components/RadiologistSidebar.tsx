"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuthStore } from "../lib/store/useAuthStore";
import {
  ScanLine,
  LayoutDashboard,
  Clock,
  CheckCircle2,
  AlertTriangle,
  History,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

export default function RadiologistSidebar() {
  const checkTokenExpiry = useAuthStore((state) => state.checkTokenExpiry);

  useEffect(() => {
    // This runs the moment the page loads
    checkTokenExpiry();
  }, [checkTokenExpiry]);

  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const links = [
    { name: "Radiology Dashboard", path: "/radiologist-dashboard", icon: LayoutDashboard },
    { name: "Pending Reviews", path: "/radiologist-dashboard/scan-reviews", icon: Clock },
    { name: "Reviewed Scans", path: "/radiologist-dashboard/reviewed-scans", icon: CheckCircle2 },
    { name: "Needs Recheck", path: "/radiologist-dashboard/needs-recheck", icon: AlertTriangle },
    { name: "My Personal Scans", path: "/radiologist-dashboard/my-scans", icon: ScanLine },
    { name: "My Review History", path: "/radiologist-dashboard/my-history", icon: History },
  ];

  return (
    <>
      {/* Mobile Arrow Button - Same style as Doctor Sidebar */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`
          lg:hidden fixed top-24 z-[60] p-2
          bg-[#060b30] text-purple-500 rounded-r-xl border-y border-r border-purple-500/30
          shadow-[4px_0_15px_rgba(168,85,247,0.2)] hover:bg-purple-950/60 hover:text-purple-400
          focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500/50
          transition-all duration-300 ease-in-out
          ${isOpen ? "left-64" : "left-0"}
        `}
      >
        {isOpen ? (
          <ChevronLeft className="w-6 h-6" strokeWidth={2.5} />
        ) : (
          <ChevronRight className="w-6 h-6" strokeWidth={2.5} />
        )}
      </button>

      {/* Background Overlay for Mobile */}
      {isOpen && (
        <div
          className="fixed top-[80px] inset-x-0 bottom-0 bg-black/60 z-[40] lg:hidden backdrop-blur-sm transition-opacity duration-300"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Container - Same design as Doctor Sidebar */}
      <aside
        className={`
          fixed top-[80px] left-0 z-[50] w-64 border-r border-white/10 p-6 flex flex-col bg-[#060b30]/95 backdrop-blur-md
          h-[calc(100dvh-80px)] overflow-y-auto transition-transform duration-300 ease-in-out

          lg:sticky lg:top-[80px] lg:h-[calc(100vh-80px)] lg:translate-x-0 lg:z-[30]

          ${isOpen ? "translate-x-0 shadow-[10px_0_30px_rgba(0,0,0,0.8)]" : "-translate-x-full"}
        `}
      >
        {/* Panel Header */}
        <div className="mb-6 pb-5 border-b border-white/10 animate-fade-in-up">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center flex-none">
              <ScanLine className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <h2 className="text-base font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-blue-400 leading-tight">
                Radiology Suite
              </h2>
              <p className="text-[11px] text-gray-500">Scan review workspace</p>
            </div>
          </div>
        </div>

        <nav className="space-y-2 lg:space-y-3 flex-1">
          {links.map((link, idx) => {
            const isActive = pathname === link.path;
            const Icon = link.icon;

            return (
              <Link
                key={link.name}
                href={link.path}
                onClick={() => setIsOpen(false)}
                style={{ animationDelay: `${idx * 60}ms` }}
                className={`group flex items-center gap-3 rounded-xl transition-all duration-300 font-medium animate-fade-in-up
                  text-sm px-3 py-2.5
                  lg:text-base lg:px-4 lg:py-3
                  ${
                    isActive
                      ? "bg-purple-600/20 text-purple-400 border border-purple-500/30 shadow-[0_0_15px_rgba(168,85,247,0.15)]"
                      : "text-gray-400 hover:text-white hover:bg-white/5 hover:translate-x-1 border border-transparent"
                  }`}
              >
                <Icon
                  className={`w-4 h-4 lg:w-[18px] lg:h-[18px] flex-none transition-colors duration-300 ${
                    isActive ? "text-purple-400" : "text-gray-500 group-hover:text-purple-400"
                  }`}
                />
                {link.name}
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
