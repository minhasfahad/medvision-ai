"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { useAuthStore } from "../lib/store/useAuthStore";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";

export const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const { user, isAuthenticated, clear } = useAuthStore();

  const pathname = usePathname();

  const isDoctor = user?.role?.toLowerCase() === "doctor";
  const isAdmin = user?.role?.toLowerCase() === "admin";

  const getLinkClasses = (path: string) => {
    const isActive = pathname === path || pathname.startsWith(`${path}/`);
    return `px-3 py-2 text-base no-underline transition-all duration-200 block w-full lg:w-auto ${
      isActive
        ? "text-blue-400 font-bold bg-white/5 lg:bg-transparent rounded-lg"
        : "text-gray-300 font-medium hover:text-white hover:bg-white/5 lg:hover:bg-transparent rounded-lg"
    }`;
  };

  const getInitials = (name: string) => {
    return name ? name.charAt(0).toUpperCase() : "U";
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-gray-800 bg-[#060b30]/90 backdrop-blur-md print:hidden font-sans tracking-wide">
      <div className="mx-auto flex max-w-7xl items-center justify-between p-4 relative">
        {/* LOGO SECTION */}
        <Link
          href="/"
          className="no-underline flex items-center space-x-2 rtl:space-x-reverse flex-none"
        >
          <Image
            src="/logoo.jpg"
            alt="MedVision Logo"
            width={100}
            height={50}
            className="rounded-full w-auto h-10 sm:h-12 object-contain"
          />
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white m-0">
            MedVision <span className="text-blue-500 font-medium">AI</span>
          </h1>
        </Link>

        {/* MOBILE HAMBURGER BUTTON */}
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          type="button"
          className="inline-flex h-10 w-10 items-center justify-center rounded-lg p-2 text-sm text-gray-400 hover:bg-gray-800/60 focus:outline-none lg:hidden bg-transparent border-0 cursor-pointer"
        >
          <svg
            className="h-5 w-5"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 17 14"
          >
            <path
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M1 1h15M1 7h15M1 13h15"
            />
          </svg>
        </button>

        {/* LINKS SECTION */}
        <div
          className={`${
            isMenuOpen ? "absolute top-full left-0 right-0 block" : "hidden"
          } w-full lg:relative lg:top-auto lg:left-auto lg:right-auto lg:block lg:w-auto bg-[#060b30] lg:bg-transparent border-b border-gray-800 lg:border-0 px-4 pb-4 lg:p-0 z-50 shadow-2xl lg:shadow-none max-h-[85vh] overflow-y-auto lg:overflow-visible`}
        >
          <ul className="flex list-none mt-4 flex-col rounded-lg border border-gray-800 bg-gray-900/60 p-2 gap-2 lg:mt-0 lg:flex-row lg:items-center lg:gap-1 lg:border-0 lg:bg-transparent lg:p-0">
            <li
              className="w-full lg:w-auto"
              onClick={() => setIsMenuOpen(false)}
            >
              <Link href="/" className={getLinkClasses("/")}>
                Home
              </Link>
            </li>
            <li
              className="w-full lg:w-auto"
              onClick={() => setIsMenuOpen(false)}
            >
              <Link href="/about" className={getLinkClasses("/about")}>
                About
              </Link>
            </li>
            <li
              className="w-full lg:w-auto"
              onClick={() => setIsMenuOpen(false)}
            >
              <Link href="/contact" className={getLinkClasses("/contact")}>
                Contact
              </Link>
            </li>

            {/* DYNAMIC PORTAL LINK */}
            {isAuthenticated && user && (
              <li
                className="w-full lg:w-auto"
                onClick={() => setIsMenuOpen(false)}
              >
                <Link
                  href={
                    isAdmin
                      ? "/admin"
                      : isDoctor
                        ? "/doctor-dashboard"
                        : "/patient-dashboard"
                  }
                  className={getLinkClasses(
                    isAdmin
                      ? "/admin"
                      : isDoctor
                        ? "/doctor-dashboard"
                        : "/patient-dashboard",
                  )}
                >
                  {isAdmin
                    ? "Admin Portal"
                    : isDoctor
                      ? "Clinical Portal"
                      : "Dashboard"}
                </Link>
              </li>
            )}

            {/* SCAN MRI BUTTON */}
            {isAuthenticated &&
              user?.role?.trim().toLowerCase() !== "admin" && (
                <li
                  className="w-full lg:w-auto my-2 lg:my-0 lg:ml-3 lg:mr-1"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Link
                    href="/try-demo"
                    className="no-underline block w-full lg:w-auto"
                  >
                    <button className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-5 py-2.5 text-sm font-bold text-white hover:from-blue-500 hover:to-purple-500 transition-all duration-300 shadow-[0_0_15px_rgba(168,85,247,0.4)] hover:shadow-[0_0_25px_rgba(168,85,247,0.6)] hover:-translate-y-0.5 border-0 cursor-pointer w-full lg:w-auto min-h-[40px] whitespace-nowrap">
                      Scan MRI Now
                    </button>
                  </Link>
                </li>
              )}

            {/* USER PROFILE DROPDOWN - Original Styles Restored */}
            {isAuthenticated && user ? (
              <li className="relative w-full lg:w-auto mt-2 lg:mt-0 lg:ml-4 lg:pl-4 border-t lg:border-t-0 lg:border-l border-gray-800 pt-3 lg:pt-0">
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center justify-between lg:justify-start gap-3 w-full lg:w-auto px-3 py-1.5 rounded-full hover:bg-white/10 transition-colors focus:outline-none bg-transparent border-0 cursor-pointer text-left"
                >
                  <div className="flex flex-col text-left">
                    <span className="text-sm font-bold text-gray-100 truncate max-w-[120px]">
                      {user.name}
                    </span>
                    <span
                      className={`text-xs font-semibold capitalize ${isAdmin ? "text-emerald-400" : isDoctor ? "text-purple-400" : "text-blue-400"}`}
                    >
                      {isDoctor ? `Doctor` : user.role}
                    </span>
                  </div>

                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-600 to-purple-600 flex items-center justify-center text-white font-bold text-lg shadow-lg border-2 border-[#1a163a] flex-none">
                    {getInitials(user.name)}
                  </div>
                </button>

                {isProfileOpen && (
                  <div className="absolute right-0 bottom-full mb-2 lg:bottom-auto lg:top-full lg:mt-3 w-full lg:w-56 bg-[#121726] border border-gray-700 rounded-xl shadow-2xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                    {/* THIS IS THE MISSING LINK */}
                    <Link
                      href="/manage-account"
                      onClick={() => {
                        setIsProfileOpen(false);
                        setIsMenuOpen(false);
                      }}
                      className="flex items-center px-4 py-2 text-sm text-gray-300 hover:bg-[#1e2235] hover:text-white transition-colors no-underline"
                    >
                      <svg
                        className="w-4 h-4 mr-3 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37.996.608 2.296.07 2.572-1.065z"
                        ></path>
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        ></path>
                      </svg>
                      Manage Account
                    </Link>

                    {/* Secure Logout Button */}
                    <button
                      onClick={async () => {
                        setIsProfileOpen(false);
                        setIsMenuOpen(false);
                        clear();
                        await signOut({ callbackUrl: "/" });
                      }}
                      className="w-full flex items-center px-4 py-2 text-sm text-red-400 hover:bg-red-900/20 transition-colors mt-1 border-t border-gray-800 pt-2.5 bg-transparent border-0 cursor-pointer text-left"
                    >
                      <svg
                        className="w-4 h-4 mr-3"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                        ></path>
                      </svg>
                      Secure Logout
                    </button>
                  </div>
                )}
              </li>
            ) : (
              <>
                {/* LOGIN/SIGNUP BUTTONS (Unchanged) */}
                <li
                  className="w-full lg:w-auto my-1 lg:my-0 lg:ml-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Link href="/login" className="no-underline block w-full">
                    <button className="rounded-xl border-2 border-blue-600 px-5 py-2 text-sm font-bold text-blue-400 hover:bg-blue-600 hover:text-white transition-all bg-transparent cursor-pointer w-full lg:w-auto min-h-[38px]">
                      Login
                    </button>
                  </Link>
                </li>
                <li
                  className="w-full lg:w-auto my-1 lg:my-0"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Link href="/signup" className="no-underline block w-full">
                    <button className="rounded-xl bg-blue-600 border-2 border-blue-600 px-5 py-2 text-sm font-bold text-white hover:bg-blue-500 hover:border-blue-500 transition-all shadow-[0_0_15px_rgba(37,99,235,0.3)] cursor-pointer w-full lg:w-auto min-h-[38px]">
                      Sign Up
                    </button>
                  </Link>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
};
