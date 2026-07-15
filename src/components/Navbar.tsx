"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useAuthStore } from "../lib/store/useAuthStore";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  Menu,
  X,
  Settings,
  LogOut,
  ChevronDown,
  User,
  Stethoscope,
  ShieldCheck,
  Microscope,
} from "lucide-react";

export const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const { user, isAuthenticated, clear } = useAuthStore();

  const pathname = usePathname();

  const isDoctor = user?.role?.toLowerCase() === "doctor";
  const isAdmin = user?.role?.toLowerCase() === "admin";
  const isRadiologist = user?.role?.toLowerCase() === "radiologist";

  // Purely presentational: shrinks / solidifies the floating nav bar on scroll.
  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const getLinkClasses = (path: string) => {
    const isActive = pathname === path || pathname.startsWith(`${path}/`);
    return `px-4 py-2.5 text-sm no-underline transition-all duration-200 block w-full lg:w-auto rounded-xl lg:rounded-full ${
      isActive
        ? "text-white font-bold bg-gradient-to-r from-blue-600/80 to-purple-600/80 lg:shadow-[0_0_15px_rgba(124,58,237,0.35)]"
        : "text-gray-300 font-semibold hover:text-white hover:bg-white/5"
    }`;
  };

  const getInitials = (name: string) => {
    return name ? name.charAt(0).toUpperCase() : "U";
  };

  // Shared derived values (used by both the desktop bar and the mobile panel).
  const RoleIcon = isAdmin
    ? ShieldCheck
    : isDoctor
      ? Stethoscope
      : isRadiologist
        ? Microscope
        : User;

  const portalHref = isAdmin
    ? "/admin"
    : isDoctor
      ? "/doctor-dashboard"
      : isRadiologist
        ? "/radiologist-dashboard"
        : "/patient-dashboard";

  const portalLabel = isAdmin
    ? "Admin Portal"
    : isDoctor
      ? "Clinical Portal"
      : isRadiologist
        ? "Radiology Portal"
        : "Patient Dashboard";

  const roleLabel = isDoctor ? "Doctor" : isRadiologist ? "Radiologist" : user?.role;

  const roleColorClass = isAdmin
    ? "text-emerald-400"
    : isDoctor
      ? "text-purple-400"
      : isRadiologist
        ? "text-amber-400"
        : "text-blue-400";

  const canScan = isAuthenticated && user?.role?.trim().toLowerCase() !== "admin";

  return (
    <nav className="relative z-30 w-full print:hidden font-sans tracking-wide px-2 sm:px-4 pt-3">
      <div
        className={`mx-auto max-w-7xl rounded-2xl border transition-all duration-300 relative ${
          isScrolled
            ? "border-white/10 bg-[#060b16]/95 shadow-[0_10px_40px_rgba(0,0,0,0.45)] backdrop-blur-xl"
            : "border-white/5 bg-[#060b30]/70 backdrop-blur-md"
        }`}
      >
        <div className="flex items-center justify-between gap-3 px-3 sm:px-5 py-2.5">
          {/* LOGO */}
          <Link
            href="/"
            className="no-underline flex items-center gap-2 rtl:space-x-reverse flex-none"
          >
            <Image
              src="/logo-mark.png"
              alt="MedVision Logo"
              width={100}
              height={50}
              className="w-auto h-9 sm:h-10 object-contain"
            />
            <h1 className="text-lg sm:text-xl font-black tracking-tight text-white m-0">
              MedVision <span className="text-blue-500 font-medium">AI</span>
            </h1>
          </Link>

          {/* DESKTOP CENTER LINKS -- pill-segmented tab bar */}
          <ul className="hidden lg:flex items-center gap-1 list-none rounded-full border border-white/5 bg-black/20 p-1">
            <li>
              <Link href="/" className={getLinkClasses("/")}>
                Home
              </Link>
            </li>
            <li>
              <Link href="/about" className={getLinkClasses("/about")}>
                About
              </Link>
            </li>
            <li>
              <Link href="/contact" className={getLinkClasses("/contact")}>
                Contact
              </Link>
            </li>
            {isAuthenticated && user && (
              <li>
                <Link href={portalHref} className={getLinkClasses(portalHref)}>
                  {portalLabel}
                </Link>
              </li>
            )}
          </ul>

          {/* DESKTOP RIGHT ACTIONS */}
          <div className="hidden lg:flex items-center gap-3 flex-none">
            {canScan && (
              <Link href="/try-demo" className="no-underline">
                <button className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-5 py-2.5 text-sm font-bold text-white hover:from-blue-500 hover:to-purple-500 transition-all duration-300 shadow-[0_0_15px_rgba(168,85,247,0.4)] hover:shadow-[0_0_25px_rgba(168,85,247,0.6)] hover:-translate-y-0.5 border-0 cursor-pointer whitespace-nowrap">
                  Scan MRI Now
                </button>
              </Link>
            )}

            {isAuthenticated && user ? (
              <div className="relative">
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center gap-2 pl-1 pr-3 py-1 rounded-full border border-white/10 hover:border-white/20 hover:bg-white/5 transition-all duration-200 focus:outline-none bg-transparent cursor-pointer"
                >
                  <div className="relative w-9 h-9 rounded-full flex-none overflow-hidden border-2 border-[#1a163a] shadow-[0_0_15px_rgba(37,99,235,0.4)] bg-gradient-to-tr from-blue-600 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
                    {user.image ? (
                      <Image
                        src={user.image}
                        alt={`${user.name}'s Profile`}
                        fill
                        className="object-cover"
                        sizes="36px"
                      />
                    ) : (
                      getInitials(user.name)
                    )}
                  </div>
                  <span className="text-sm font-bold text-gray-100 max-w-[100px] truncate">
                    {user.name}
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 text-gray-400 transition-transform duration-300 ${
                      isProfileOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {isProfileOpen && (
                  <div className="absolute right-0 top-full mt-3 w-64 bg-[#12172a]/95 backdrop-blur-md border border-white/10 rounded-2xl shadow-2xl py-2 z-50 animate-in overflow-hidden">
                    <div className="px-4 py-3 border-b border-white/10 flex items-center gap-3">
                      <div
                        className={`w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center flex-none ${roleColorClass}`}
                      >
                        <RoleIcon className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-white truncate m-0">
                          {user.name}
                        </p>
                        <p
                          className={`text-xs font-semibold capitalize m-0 ${roleColorClass}`}
                        >
                          {roleLabel}
                        </p>
                      </div>
                    </div>

                    <Link
                      href="/manage-account"
                      onClick={() => {
                        setIsProfileOpen(false);
                        setIsMenuOpen(false);
                      }}
                      className="flex items-center px-4 py-2.5 text-sm text-gray-300 hover:bg-white/10 hover:text-white transition-colors no-underline mt-1"
                    >
                      <Settings className="w-4 h-4 mr-3 text-gray-400" />
                      Manage Account
                    </Link>

                    <button
                      onClick={async () => {
                        setIsProfileOpen(false);
                        setIsMenuOpen(false);
                        clear();
                        await signOut({ callbackUrl: "/" });
                      }}
                      className="w-full flex items-center px-4 py-2.5 text-sm text-red-400 hover:bg-red-900/20 transition-colors mt-1 border-t border-white/10 pt-2.5 bg-transparent border-0 cursor-pointer text-left"
                    >
                      <LogOut className="w-4 h-4 mr-3" />
                      Secure Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/login" className="no-underline">
                  <button className="rounded-xl border-2 border-blue-600/70 px-5 py-2 text-sm font-bold text-blue-400 hover:bg-blue-600 hover:text-white hover:-translate-y-0.5 transition-all duration-300 bg-transparent cursor-pointer">
                    Login
                  </button>
                </Link>
                <Link href="/signup" className="no-underline">
                  <button className="rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 border-2 border-transparent px-5 py-2 text-sm font-bold text-white hover:from-blue-500 hover:to-purple-500 hover:-translate-y-0.5 transition-all duration-300 shadow-[0_0_15px_rgba(37,99,235,0.4)] hover:shadow-[0_0_25px_rgba(168,85,247,0.5)] cursor-pointer">
                    Sign Up
                  </button>
                </Link>
              </div>
            )}
          </div>

          {/* MOBILE HAMBURGER BUTTON */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl p-2 text-sm text-gray-300 hover:bg-white/10 hover:text-white transition-all duration-200 focus:outline-none lg:hidden bg-white/5 border border-white/10 cursor-pointer flex-none"
          >
            {isMenuOpen ? (
              <X className="h-5 w-5" aria-hidden="true" />
            ) : (
              <Menu className="h-5 w-5" aria-hidden="true" />
            )}
          </button>
        </div>

        {/* MOBILE MENU PANEL */}
        {isMenuOpen && (
          <div className="lg:hidden border-t border-white/10 px-3 pb-4 pt-3 animate-in max-h-[75vh] overflow-y-auto">
            <ul className="flex flex-col list-none gap-1.5">
              <li onClick={() => setIsMenuOpen(false)}>
                <Link href="/" className={getLinkClasses("/")}>
                  Home
                </Link>
              </li>
              <li onClick={() => setIsMenuOpen(false)}>
                <Link href="/about" className={getLinkClasses("/about")}>
                  About
                </Link>
              </li>
              <li onClick={() => setIsMenuOpen(false)}>
                <Link href="/contact" className={getLinkClasses("/contact")}>
                  Contact
                </Link>
              </li>

              {isAuthenticated && user && (
                <li onClick={() => setIsMenuOpen(false)}>
                  <Link href={portalHref} className={getLinkClasses(portalHref)}>
                    {portalLabel}
                  </Link>
                </li>
              )}

              {canScan && (
                <li className="pt-2" onClick={() => setIsMenuOpen(false)}>
                  <Link href="/try-demo" className="no-underline block w-full">
                    <button className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-5 py-2.5 text-sm font-bold text-white hover:from-blue-500 hover:to-purple-500 transition-all duration-300 shadow-[0_0_15px_rgba(168,85,247,0.4)] w-full border-0 cursor-pointer min-h-[40px]">
                      Scan MRI Now
                    </button>
                  </Link>
                </li>
              )}

              {isAuthenticated && user ? (
                <li className="relative mt-2 pt-3 border-t border-white/10">
                  <button
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                    className="flex items-center justify-between gap-3 w-full px-3 py-2.5 rounded-xl hover:bg-white/10 transition-all duration-200 focus:outline-none bg-white/5 border border-white/10 cursor-pointer text-left"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="relative w-10 h-10 rounded-full flex-none overflow-hidden border-2 border-[#1a163a] shadow-[0_0_15px_rgba(37,99,235,0.4)] bg-gradient-to-tr from-blue-600 to-purple-600 flex items-center justify-center text-white font-bold text-base">
                        {user.image ? (
                          <Image
                            src={user.image}
                            alt={`${user.name}'s Profile`}
                            fill
                            className="object-cover"
                            sizes="40px"
                          />
                        ) : (
                          getInitials(user.name)
                        )}
                      </div>
                      <div className="flex flex-col text-left min-w-0">
                        <span className="text-sm font-bold text-gray-100 truncate max-w-[160px]">
                          {user.name}
                        </span>
                        <span className={`text-xs font-semibold capitalize ${roleColorClass}`}>
                          {roleLabel}
                        </span>
                      </div>
                    </div>
                    <ChevronDown
                      className={`w-4 h-4 text-gray-400 transition-transform duration-300 flex-none ${
                        isProfileOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {isProfileOpen && (
                    <div className="mt-2 w-full bg-[#12172a]/95 backdrop-blur-md border border-white/10 rounded-xl shadow-2xl py-2 z-50 animate-in overflow-hidden">
                      <Link
                        href="/manage-account"
                        onClick={() => {
                          setIsProfileOpen(false);
                          setIsMenuOpen(false);
                        }}
                        className="flex items-center px-4 py-2 text-sm text-gray-300 hover:bg-white/10 hover:text-white transition-colors no-underline"
                      >
                        <Settings className="w-4 h-4 mr-3 text-gray-400" />
                        Manage Account
                      </Link>

                      <button
                        onClick={async () => {
                          setIsProfileOpen(false);
                          setIsMenuOpen(false);
                          clear();
                          await signOut({ callbackUrl: "/" });
                        }}
                        className="w-full flex items-center px-4 py-2 text-sm text-red-400 hover:bg-red-900/20 transition-colors mt-1 border-t border-white/10 pt-2.5 bg-transparent border-0 cursor-pointer text-left"
                      >
                        <LogOut className="w-4 h-4 mr-3" />
                        Secure Logout
                      </button>
                    </div>
                  )}
                </li>
              ) : (
                <li className="flex flex-col gap-2 pt-2 mt-1 border-t border-white/10">
                  <Link
                    href="/login"
                    className="no-underline block w-full"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <button className="rounded-xl border-2 border-blue-600/70 px-5 py-2 text-sm font-bold text-blue-400 hover:bg-blue-600 hover:text-white transition-all duration-300 bg-transparent cursor-pointer w-full min-h-[38px]">
                      Login
                    </button>
                  </Link>
                  <Link
                    href="/signup"
                    className="no-underline block w-full"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <button className="rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 border-2 border-transparent px-5 py-2 text-sm font-bold text-white hover:from-blue-500 hover:to-purple-500 transition-all duration-300 shadow-[0_0_15px_rgba(37,99,235,0.4)] cursor-pointer w-full min-h-[38px]">
                      Sign Up
                    </button>
                  </Link>
                </li>
              )}
            </ul>
          </div>
        )}
      </div>
    </nav>
  );
};
