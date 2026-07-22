"use client";

import { useRouter } from "@/i18n/navigation";
import { useTheme } from "./theme-provider";
import SpecularButton from "./reactbits/SpecularButton/SpecularButton";

// WebGL rim-light CTA. SpecularButton renders a <button>, so it navigates via
// the locale-aware router instead of nesting inside a Link. Colors are JS
// literals mirroring the cta tokens (the component parses them for WebGL).
export function SpecularCta({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { theme } = useTheme();
  const baseColor = theme === "light" ? "#c9a24a" : "#e4c57e";

  return (
    <SpecularButton
      size="lg"
      radius={18}
      baseColor={baseColor}
      textColor="#1d1d1f"
      tint="#ffffff"
      onClick={() => router.push(href)}
    >
      {children}
    </SpecularButton>
  );
}
