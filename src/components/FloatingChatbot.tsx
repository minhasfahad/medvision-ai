"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Sparkles } from "lucide-react";

export const FloatingChatbot = () => {
  const pathname = usePathname();

  // If the user is ALREADY on the chatbot page, we don't need to show the floating button
  if (pathname === "/chatbot") {
    return null;
  }

  return (
    <Link
      href="/chatbot"
      target="_blank"
      rel="noopener noreferrer"
      // Pinned in the bottom-right corner as a label + orb launcher pair
      className="fixed bottom-8 right-6 sm:bottom-10 sm:right-10 z-50 group print:hidden no-underline flex items-center gap-3"
    >
      {/* Always-present label chip, nudges further away and brightens on hover */}
      <span className="hidden sm:flex items-center gap-1.5 whitespace-nowrap px-4 py-2.5 rounded-full bg-[#12172a]/90 backdrop-blur-md border border-white/10 text-xs font-bold text-gray-200 opacity-90 shadow-xl group-hover:opacity-100 group-hover:-translate-x-1 transition-all duration-300">
        <Sparkles className="w-3.5 h-3.5 text-purple-400" />
        Ask MedVision AI
      </span>

      {/* Rotating conic-gradient ring wrapper around the orb */}
      <div className="spin-border-wrap rounded-full">
        <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-[#1a163a] flex items-center justify-center shadow-[0_0_20px_rgba(168,85,247,0.4)] transition-all duration-300 transform group-hover:scale-110 group-hover:-translate-y-2 group-hover:shadow-[0_0_30px_rgba(168,85,247,0.6)] animate-bounce-slow cursor-pointer">
          <Image
            src="/chatbot.png"
            width={50}
            height={50}
            alt="AI Chatbot"
            className="drop-shadow-lg w-9 h-9 sm:w-[50px] sm:h-[50px]"
          />

          {/* Small Notification Dot */}
          <span className="absolute top-1 right-1 flex h-4.5 w-4.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-4.5 w-4.5 bg-purple-500 border-2 border-[#1a163a]"></span>
          </span>
        </div>
      </div>
    </Link>
  );
};
