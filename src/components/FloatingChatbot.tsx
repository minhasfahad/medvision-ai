"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

export const FloatingChatbot = () => {
  const pathname = usePathname();

  // If the user is ALREADY on the chatbot page, we don't need to show the floating button
  if (pathname === "/chatbot") {
    return null;
  }

  return (
    <Link 
      href="/chatbot"
      // Pinned in the bottom-right corner, slightly larger edge spacing for a larger icon
      className="fixed bottom-10 right-10 z-50 group print:hidden no-underline"
    >
      {/* Key Professional Changes:
        - Container Size: Increased size from w-16 to w-20 h-20 (80px).
        - Borders: Removed border-2. Added a subtle border border-purple-500/20.
        - Background: Kept bg-[#1a163a] for necessary contrast and product anchoring.
        - Professional Glow: The shadow shadow-xl shadow-purple-500/30 adds depth.
        - Custom Animation: Replaced animate-bounce with animate-bounce-slow.
      */}
      <div className="relative w-20 h-20 rounded-full bg-[#1a163a] border border-purple-500/20 flex items-center justify-center shadow-[0_0_20px_rgba(168,85,247,0.4)] transition-all duration-300 transform group-hover:scale-110 group-hover:-translate-y-2 animate-bounce-slow cursor-pointer">
        
        {/* Increased image size from 40 to 50 */}
        <Image 
          src="/chatbot.png" 
          width={50} 
          height={50} 
          alt="AI Chatbot" 
          className="drop-shadow-lg"
        />

        {/* Small Notification Dot (Optional visual flare, adjusted for larger size) */}
        <span className="absolute top-1 right-1 flex h-4.5 w-4.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-4.5 w-4.5 bg-purple-500 border-2 border-[#1a163a]"></span>
        </span>

      </div>
    </Link>
  );
};