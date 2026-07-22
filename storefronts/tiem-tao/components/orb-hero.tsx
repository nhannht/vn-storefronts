"use client";

import { useEffect, useState } from "react";
import { useTheme } from "./theme-provider";
import Orb from "./reactbits/Orb/Orb";

// Signature WebGL hero. The vendored Orb stays byte-untouched; cost is bounded
// by SIZING the container (a capped square) rather than editing the shader, so
// even at DPR 2 the canvas edge stays under the ~1300px pixel budget. Mounted
// gate keeps WebGL off the server render.
export function OrbHero() {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // Orb parses backgroundColor in JS for the shader, so it cannot read a CSS
  // var. Mirror --base here (keep in sync with tokens.css).
  const backgroundColor = theme === "light" ? "#f5f5f7" : "#0b0b10";

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute left-1/2 top-1/2 -z-10 aspect-square w-[min(88vw,540px)] -translate-x-1/2 -translate-y-1/2 opacity-80"
    >
      {mounted && (
        <Orb
          hue={38}
          hoverIntensity={0.3}
          rotateOnHover={false}
          backgroundColor={backgroundColor}
        />
      )}
    </div>
  );
}
