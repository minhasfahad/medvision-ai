"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

const VARIANT_CLASS = {
  up: "reveal-on-scroll",
  left: "reveal-left",
  right: "reveal-right",
  zoom: "reveal-zoom",
} as const;

export default function Reveal({
  children,
  className = "",
  delay = 0,
  variant = "up",
  fill = false,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  variant?: keyof typeof VARIANT_CLASS;
  /**
   * Opt-in only: makes this wrapper stretch to fill its grid/flex cell and
   * forces its single child to fill it back, so equal-height card rows keep
   * matching heights even though the card is no longer the direct grid/flex
   * item. Only pass this when Reveal wraps exactly one card-like element
   * inside an items-stretch grid/flex row — forcing height:100% onto plain
   * content (nav links, headings, text blocks) cascades into runaway
   * computed heights against any ancestor with a resolved definite height.
   */
  fill?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15, rootMargin: "0px 0px -8% 0px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`${VARIANT_CLASS[variant]} ${fill ? "h-full [&>*]:h-full" : ""} ${visible ? "is-visible" : ""} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}
