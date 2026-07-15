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
  const user = useAuthStore((state) => state.user);

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

  // Purely visual grouping over the same links array above — no route/order changes.
  const groups = [
    { label: "Overview", items: links.slice(0, 1) },
    { label: "Review Queue", items: links.slice(1, 4) },
    { label: "My Work", items: links.slice(4, 6) },
  ];

  const labelReveal =
    "lg:max-w-0 lg:opacity-0 lg:group-hover/rail:max-w-[12rem] lg:group-hover/rail:opacity-100 overflow-hidden whitespace-nowrap transition-all duration-300";

  return (
    <>
      {/* Mobile Arrow Button - hides at 1024px (lg) */}
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

      {/* Background Overlay for Mobile — fixed inset-0 (full screen, since sidebar itself is now full-height from y=0) */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-[40] lg:hidden backdrop-blur-sm transition-opacity duration-300"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Container — permanently fixed to the viewport (never scrolls away,
          never unmounts between dashboard route changes since it lives in the layout).
          On desktop this collapses to an icon rail and expands into a full panel as a
          hover flyout (overlaying content, never reflowing it). Mobile keeps a classic
          slide-in drawer. */}
      <aside
        className={`
          peer group/rail fixed top-0 left-0 z-40 w-64 border-r border-white/10 flex flex-col
          bg-[#060b30]/95 backdrop-blur-md h-dvh overflow-y-auto overflow-x-hidden
          transition-all duration-300 ease-in-out

          lg:w-[76px] lg:hover:w-72 lg:shadow-[0_0_40px_rgba(0,0,0,0.35)]

          ${isOpen ? "translate-x-0 shadow-[10px_0_30px_rgba(0,0,0,0.8)]" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        {/* Panel Header */}
        <div className="px-5 pt-6 pb-5 border-b border-white/10">
          <div className="flex items-center gap-3 lg:justify-center lg:group-hover/rail:justify-start">
            <div className="w-9 h-9 rounded-xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center flex-none">
              <ScanLine className="w-5 h-5 text-purple-400" />
            </div>
            <div className={labelReveal}>
              <h2 className="text-base font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-blue-400 leading-tight">
                Radiology Suite
              </h2>
              <p className="text-[11px] text-gray-500">Scan review workspace</p>
            </div>
          </div>
          <div className={`mt-3 inline-flex items-center gap-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 px-2.5 py-1 ${labelReveal}`}>
            <span className="relative flex h-1.5 w-1.5 flex-none">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-purple-400" />
            </span>
            <span className="text-[10px] font-medium text-purple-300 tracking-wide">On duty</span>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4">
          {groups.map((group, gIdx) => (
            <div
              key={group.label}
              className="mb-5 last:mb-0 animate-fade-in-up"
              style={{ animationDelay: `${gIdx * 90}ms` }}
            >
              <p className={`px-3 mb-1.5 text-[10px] font-semibold tracking-[0.14em] text-gray-600 uppercase ${labelReveal}`}>
                {group.label}
              </p>
              <div className="space-y-1">
                {group.items.map((link) => {
                  const isActive = pathname === link.path;
                  const Icon = link.icon;
                  return (
                    <Link
                      key={link.name}
                      href={link.path}
                      onClick={() => setIsOpen(false)}
                      title={link.name}
                      className={`group/item relative flex items-center gap-3 rounded-xl font-medium
                        text-sm px-3 py-2.5 transition-all duration-300
                        lg:justify-center lg:group-hover/rail:justify-start lg:px-0 lg:group-hover/rail:px-3
                        ${isActive
                          ? "bg-gradient-to-r from-purple-600/80 to-blue-600/80 text-white font-bold shadow-[0_0_15px_rgba(168,85,247,0.35)]"
                          : "text-gray-400 hover:text-white hover:bg-white/5 border border-transparent"}`}
                    >
                      <Icon className={`w-[18px] h-[18px] flex-none transition-colors duration-300 ${isActive ? "text-white" : "text-gray-500 group-hover/item:text-purple-400"}`} />
                      <span className={labelReveal}>{link.name}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Footer mini profile card */}
        <div className="mt-auto p-3 border-t border-white/10">
          <div className="flex items-center gap-3 rounded-xl bg-white/5 border border-white/10 px-3 py-2.5 lg:justify-center lg:group-hover/rail:justify-start">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center text-xs font-bold flex-none">
              {(user?.name || "R").charAt(0).toUpperCase()}
            </div>
            <div className={labelReveal}>
              <p className="text-xs font-semibold text-white truncate">{user?.name || "Radiologist"}</p>
              <p className="text-[10px] text-gray-500 truncate capitalize">{user?.role || "radiologist"}</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
