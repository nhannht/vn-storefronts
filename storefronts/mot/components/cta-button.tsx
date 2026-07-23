"use client";

import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/cn";

// The shared primary-CTA look: SOLID sage fill (--cta-fill) + paired label
// (--cta-label), semibold, button radius. Paper, never glass - mot's single
// glass touch is the edition knob, so the CTA stays solid in both the button
// and the link. Size sizes only the padding so the same contract dresses a
// full-width checkout CTA and a small empty-state link.
const CTA_BASE =
  "inline-flex items-center justify-center rounded-[var(--radius-button)] text-sm font-semibold text-[var(--cta-label)] transition-[transform,opacity] duration-150 hover:opacity-90 active:scale-[0.985]";
const CTA_SIZES = { md: "px-6 py-3", sm: "px-5 py-2.5" } as const;
type CtaSize = keyof typeof CTA_SIZES;

// mot's primary button: hover dims slightly, press springs down; both are killed
// by prefers-reduced-motion via globals.css. The disabled state carries the
// adding / out-of-stock cases from the caller.
export function CtaButton({
  children,
  className,
  fullWidth,
  size = "md",
  onClick,
  type = "button",
  disabled,
}: {
  children: React.ReactNode;
  className?: string;
  fullWidth?: boolean;
  size?: CtaSize;
  onClick?: () => void;
  type?: "button" | "submit";
  disabled?: boolean;
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      style={{ backgroundColor: "var(--cta-fill)" }}
      className={cn(
        CTA_BASE,
        CTA_SIZES[size],
        "disabled:pointer-events-none disabled:opacity-45",
        fullWidth && "w-full",
        className,
      )}
    >
      {children}
    </button>
  );
}

// The same solid CTA as a locale-aware link (the cart's Checkout and the
// empty-state "keep browsing"). A Link, not a button, so it is a real
// navigation - and solid, so it never borrows the edition knob's glass.
export function CtaLink({
  href,
  children,
  className,
  fullWidth,
  size = "md",
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
  fullWidth?: boolean;
  size?: CtaSize;
}) {
  return (
    <Link
      href={href}
      style={{ backgroundColor: "var(--cta-fill)" }}
      className={cn(
        CTA_BASE,
        CTA_SIZES[size],
        fullWidth && "w-full",
        className,
      )}
    >
      {children}
    </Link>
  );
}
