"use client"; // Required for the mobile menu toggle to work

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { useAuthStore } from "../lib/store/useAuthStore";

export const Navbar = () => {
  // State to handle mobile menu opening/closing
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const authState = useAuthStore();
  const Logout = () => {
    authState.clear();
  };

  return (
    <nav className="items-center top-0 z-20 w-full border-b border-gray-700 bg-[#060b30]/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-screen-xl flex-wrap items-center justify-between p-4 items-center">
        {/* LOGO SECTION */}
        <Link
          href="/"
          className="no-underline flex items-center space-x-3 rtl:space-x-reverse "
        >
          <Image
            src="/logoo.jpg" // Make sure this file exists in your public folder!
            alt="MedVision Logo"
            width={150}
            height={80}
            className="rounded-full"
          />
          <span className="self-center whitespace-nowrap text-2xl font-semibold text-white">
            MedVision <span className="text-slate-500">AI</span>
          </span>
        </Link>

        {/* MOBILE HAMBURGER BUTTON */}
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          type="button"
          className="inline-flex h-10 w-10 items-center justify-center rounded-lg p-2 text-sm text-gray-400 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-600 md:hidden"
          aria-controls="navbar-default"
          aria-expanded={isMenuOpen}
        >
          <span className="sr-only">Open main menu</span>
          <svg
            className="h-5 w-5"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 17 14"
          >
            <path
              stroke="currentColor"
              strokeLinecap="round" // Fixed: React uses camelCase
              strokeLinejoin="round"
              strokeWidth="2" // Fixed: React uses camelCase
              d="M1 1h15M1 7h15M1 13h15"
            />
          </svg>
        </button>

        {/* LINKS SECTION */}
        <div
          className={`${
            isMenuOpen ? "block" : "hidden"
          } w-full md:block md:w-auto`}
          id="navbar-default"
        >
          <ul className="flex items-center gap-2 list-none mt-4 flex-col rounded-lg border border-gray-700 bg-gray-800 p-0 font-medium md:mt-0 md:flex-row md:space-x-8 md:border-0 md:bg-transparent md:p-0 rtl:space-x-reverse ">
            <li>
              <Link
                href="/"
                className="no-underline block rounded bg-blue-700 py-2 px-3 text-white md:bg-transparent md:p-0 md:text-blue-500"
                aria-current="page"
              >
                Home
              </Link>
            </li>
            <li>
              <Link
                href="/about"
                className="no-underline block rounded py-2 px-3 text-white hover:bg-gray-700 md:border-0 md:p-0 md:hover:bg-transparent md:hover:text-blue-500"
              >
                About
              </Link>
            </li>
            <li>
              <Link
                href="/contact"
                className=" no-underline block rounded py-2 px-3 text-white hover:bg-gray-700 md:border-0 md:p-0 md:hover:bg-transparent md:hover:text-blue-500"
              >
                Contact
              </Link>
            </li>
            {authState.isAuthenticated && (
              <>
                <li className="chatbot-img flex gap-2">
                  <Image
                    className="chatbot-img gap-2"
                    src="/chatbot.png"
                    width={50}
                    height={50}
                    alt="Chatbot"
                  />
                  <Link
                    href="/chatbot"
                    className=" no-underline block rounded py-2 px-3 text-white hover:bg-gray-700 md:border-0 md:p-0 md:hover:bg-transparent md:hover:text-blue-500"
                  >
                    AI ChatBot
                  </Link>
                </li>
                <li>
                  <Link
                    href="/try-demo"
                    className=" demo text-xl bg-blue-500 no-underline block rounded py-2 px-3 text-white hover:bg-blue-400 md:border-0 md:p-0 md:hover:text-blck-500"
                  >
                    Try Demo
                  </Link>
                </li>
                <li>
                  <button
                    className="demo  no-underline block rounded py-2 px-3 text-white hover:bg-blue-400 md:border-0  md:hover:text-blck-500 bg-red-500 text-xl p-20"
                    onClick={Logout}
                  >
                    Logout
                  </button>
                </li>
              </>
            )}
            {!authState.isAuthenticated ? (
              <>
                <li>
                  <Link href="/login">
                    <button className="login-signup-btn">Login</button>
                  </Link>
                </li>
                <li>
                  <Link href="/signup">
                    <button className="login-signup-btn">Sign Up</button>
                  </Link>
                </li>
              </>
            ) : (
              <></>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
