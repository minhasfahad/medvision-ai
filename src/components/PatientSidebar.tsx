"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

export default function PatientSidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

// Update this array in your PatientSidebar.tsx
const links = [
    { name: "My History", path: "/patient-dashboard/my-history" },
    { name: "My Appointments", path: "/patient-dashboard/my-appointments" },
    { name: "Book Specialist", path: "/patient-dashboard/appointments" },
];

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-24 z-[50] p-2 bg-[#060b30] text-blue-500 rounded-r-xl border border-blue-500/30 shadow-lg"
      >
        {isOpen ? "✕" : "☰"}
      </button>

      {isOpen && <div className="fixed inset-0 bg-black/60 z-[40] lg:hidden" onClick={() => setIsOpen(false)} />}

      <aside className={`fixed top-[80px] left-0 z-[20] w-64 border-r border-gray-800 p-6 flex flex-col bg-[#060b30] h-[calc(100vh-80px)] lg:sticky lg:top-[80px] transition-transform duration-300 ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}>
        <nav className="space-y-2 flex-1">
          {links.map((link) => (
            <Link
              key={link.name}
              href={link.path}
              onClick={() => setIsOpen(false)}
              className={`block rounded-xl px-4 py-3 font-medium text-sm transition-all ${
                pathname === link.path 
                ? "bg-blue-600/20 text-blue-400 border border-blue-500/30" 
                : "text-gray-400 hover:text-white hover:bg-white/5"
              }`}
            >
              {link.name}
            </Link>
          ))}
        </nav>
      </aside>
    </>
  );
}