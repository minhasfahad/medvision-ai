"use client";

import { useRef } from "react";

/**
 * Purely-visual wrapper: adds a cursor-tracked radial glow that fades in on
 * hover. Renders its own overlay div; does not intercept clicks or alter
 * anything about the children it wraps.
 */
export default function SpotlightCard({
  children,
  className = "",
  color = "96,165,250",
}: {
  children: React.ReactNode;
  className?: string;
  color?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    el.style.setProperty("--spot-x", `${e.clientX - rect.left}px`);
    el.style.setProperty("--spot-y", `${e.clientY - rect.top}px`);
  };

  return (
    <div
      ref={ref}
      onMouseMove={handleMouseMove}
      className={`group/spotlight relative overflow-hidden ${className}`}
    >
      <div
        className="pointer-events-none absolute inset-0 z-0 opacity-0 group-hover/spotlight:opacity-100 transition-opacity duration-500"
        style={{
          background: `radial-gradient(420px circle at var(--spot-x, 50%) var(--spot-y, 50%), rgba(${color},0.15), transparent 70%)`,
        }}
      />
      <div className="relative z-10 h-full">{children}</div>
    </div>
  );
}
