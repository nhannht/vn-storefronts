"use client";

import GlassSurface, {
  type GlassSurfaceProps,
} from "./reactbits/GlassSurface/GlassSurface";
import { cn } from "@/lib/cn";
import "./glass-pane.css";

/*
  App-side client boundary for the vendored react-bits GlassSurface (which ships
  without a "use client" directive and must never be edited).

  It composes instead of re-exporting the default straight through, because the
  material has to be identical on both persistent panes - the nav pill and the
  PDP buy bar. One file owning the shared params is what keeps a refracting nav
  from ever floating above a merely-frosted buy bar on the same screen.

  Only the geometry is passed per pane. The vendored displacement params
  (distortionScale, per-channel offsets, brightness, opacity) drive a GRAYSCALE
  displacement map, not visible color, so they are theme-independent and stay at
  their shipped values. `saturation` and `backgroundOpacity` are deliberately
  not passed: glass-pane.css restates both declarations that consume them so the
  visible color comes from tokens.css instead.

  Sizing note: GlassSurface only writes `width`/`height` into inline CSS. It
  re-measures the real box with getBoundingClientRect() inside a ResizeObserver
  before generating each displacement map, so a CSS keyword width ("auto",
  "100%") produces a correct filter at fluid width.
*/

// GlassSurface parses the radius in JS - it is drawn as the `rx` of the rounded
// rects inside the SVG displacement map - so it cannot read a CSS var. Mirrors
// --radius-pill in app/tokens.css; change both together.
const PILL_RADIUS = 28;

export function GlassPane({ className, ...props }: GlassSurfaceProps) {
  return (
    <GlassSurface
      borderRadius={PILL_RADIUS}
      {...props}
      className={cn("tt-glass", className)}
    />
  );
}
