"use client";

import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";

export default function ScrollToTopButton() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 400);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <button
      type="button"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      aria-label="Scroll back to top"
      className={`fixed bottom-28 right-6 sm:bottom-32 sm:right-10 z-40 flex items-center justify-center w-11 h-11 rounded-full bg-[#0f1123]/80 border border-white/10 text-gray-300 shadow-[0_10px_30px_rgba(0,0,0,0.45)] backdrop-blur-md hover:text-white hover:border-blue-500/40 hover:-translate-y-1 transition-all duration-300 print:hidden cursor-pointer ${
        visible ? "opacity-100 translate-y-0 pointer-events-auto" : "opacity-0 translate-y-4 pointer-events-none"
      }`}
    >
      <ArrowUp className="w-5 h-5" />
    </button>
  );
}
