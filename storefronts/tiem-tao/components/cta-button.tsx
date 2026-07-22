"use client";

import { useState } from "react";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/cn";

// Locked primary-CTA contract: gold FILL (--cta-fill), near-black label
// (--cta-label, 10.1:1), radius 18, semibold. Transient glass ONLY on
// pointerdown (paper->glass while held, per the materials rule).

const BASE =
  "inline-flex items-center justify-center rounded-[18px] text-sm font-semibold text-[var(--cta-label)] outline-none transition-[transform,background-color] duration-150 disabled:opacity-45 disabled:pointer-events-none";

const SIZES = { md: "px-6 py-3", sm: "px-5 py-2.5" } as const;
type Size = keyof typeof SIZES;

function pressStyle(pressed: boolean): React.CSSProperties {
  return pressed
    ? {
        backgroundColor: "var(--cta-glass)",
        backdropFilter: "blur(10px) saturate(160%)",
        WebkitBackdropFilter: "blur(10px) saturate(160%)",
        transform: "scale(0.985)",
      }
    : { backgroundColor: "var(--cta-fill)" };
}

function usePress() {
  const [pressed, setPressed] = useState(false);
  return {
    pressed,
    handlers: {
      onPointerDown: () => setPressed(true),
      onPointerUp: () => setPressed(false),
      onPointerLeave: () => setPressed(false),
      onPointerCancel: () => setPressed(false),
    },
  };
}

type CommonProps = {
  children: React.ReactNode;
  className?: string;
  fullWidth?: boolean;
  size?: Size;
};

export function CtaLink({
  href,
  children,
  className,
  fullWidth,
  size = "md",
}: CommonProps & { href: string }) {
  const { pressed, handlers } = usePress();
  return (
    <Link
      href={href}
      {...handlers}
      style={pressStyle(pressed)}
      className={cn(BASE, SIZES[size], fullWidth && "w-full", className)}
    >
      {children}
    </Link>
  );
}

export function CtaButton({
  children,
  className,
  fullWidth,
  size = "md",
  onClick,
  type = "button",
  disabled,
}: CommonProps & {
  onClick?: () => void;
  type?: "button" | "submit";
  disabled?: boolean;
}) {
  const { pressed, handlers } = usePress();
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      {...handlers}
      style={pressStyle(pressed && !disabled)}
      className={cn(BASE, SIZES[size], fullWidth && "w-full", className)}
    >
      {children}
    </button>
  );
}
