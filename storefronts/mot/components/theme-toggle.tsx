"use client";

import { useTranslations } from "next-intl";
import { useTheme } from "./theme-provider";

// Transient-glass knob: rests flat, lifts a faint glass sheen on hover/press.
export function ThemeToggle() {
  const t = useTranslations("nav");
  const { theme, toggle } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={t("toggleTheme")}
      className="grid size-9 place-items-center rounded-full border border-[var(--hairline)] text-[var(--label-secondary)] transition-colors duration-200 hover:border-[var(--hairline-strong)] hover:bg-[var(--accent-soft)] hover:text-[var(--label-primary)]"
    >
      {isDark ? (
        // Sun: tapping switches to light.
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <circle cx="12" cy="12" r="4.2" stroke="currentColor" strokeWidth="1.6" />
          <g stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
            <path d="M12 2.6v2.4M12 19v2.4M4.2 4.2l1.7 1.7M18.1 18.1l1.7 1.7M2.6 12h2.4M19 12h2.4M4.2 19.8l1.7-1.7M18.1 5.9l1.7-1.7" />
          </g>
        </svg>
      ) : (
        // Moon: tapping switches to dark.
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M20 14.2A8 8 0 0 1 9.8 4a6.4 6.4 0 1 0 10.2 10.2z"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinejoin="round"
          />
        </svg>
      )}
    </button>
  );
}
