"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

export default function RadiologistSidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

const links = [
  { name: "Radiology Dashboard", path: "/radiologist-dashboard" },
  { name: "Pending Reviews", path: "/radiologist-dashboard/scan-reviews" },
  { name: "Reviewed Scans", path: "/radiologist-dashboard/reviewed-scans" },
  { name: "Needs Recheck", path: "/radiologist-dashboard/needs-recheck" },
  { name: "My Personal Scans", path: "/radiologist-dashboard/my-scans" },
  { name: "My Review History", path: "/radiologist-dashboard/my-history" },
];

  return (
    <>
      {/* Mobile Arrow Button - Same style as Doctor Sidebar */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`
          lg:hidden fixed top-24 z-[60] p-2 
          bg-[#060b30] text-purple-500 rounded-r-xl border-y border-r border-purple-500/30 
          shadow-[4px_0_15px_rgba(168,85,247,0.2)] focus:outline-none 
          transition-all duration-300 ease-in-out
          ${isOpen ? "left-64" : "left-0"}
        `}
      >
        {isOpen ? (
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2.5"
              d="M15 19l-7-7 7-7"
            ></path>
          </svg>
        ) : (
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2.5"
              d="M9 5l7 7-7 7"
            ></path>
          </svg>
        )}
      </button>

      {/* Background Overlay for Mobile */}
      {isOpen && (
        <div
          className="fixed top-[80px] inset-x-0 bottom-0 bg-black/60 z-[40] lg:hidden backdrop-blur-sm transition-opacity"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Container - Same design as Doctor Sidebar */}
      <aside
        className={`
          fixed top-[80px] left-0 z-[50] w-64 border-r border-gray-800 p-6 flex flex-col bg-[#060b30] 
          h-[calc(100dvh-80px)] overflow-y-auto transition-transform duration-300 ease-in-out
          
          lg:sticky lg:top-[80px] lg:h-[calc(100vh-80px)] lg:translate-x-0 lg:z-[30]
          
          ${isOpen ? "translate-x-0 shadow-[10px_0_30px_rgba(0,0,0,0.8)]" : "-translate-x-full"}
        `}
      >
        <nav className="space-y-2 lg:space-y-3 flex-1">
          {links.map((link) => {
            const isActive = pathname === link.path;

            return (
              <Link
                key={link.name}
                href={link.path}
                onClick={() => setIsOpen(false)}
                className={`block rounded-xl transition-all duration-300 font-medium 
                  text-sm px-3 py-2.5 
                  lg:text-base lg:px-4 lg:py-3 
                  ${
                    isActive
                      ? "bg-purple-600/20 text-purple-400 border border-purple-500/30 shadow-[0_0_15px_rgba(168,85,247,0.1)]"
                      : "text-gray-400 hover:text-white hover:bg-white/5 border border-transparent"
                  }`}
              >
                {link.name}
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}