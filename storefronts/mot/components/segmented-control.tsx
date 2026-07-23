"use client";

import { useRef, useState } from "react";
import { cn } from "@/lib/cn";
import "./segmented-control.css";

// The edition picker's segmented control. Options carry a stable `value` (a
// variant id) and a localized `label`, so the segment text can be Vietnamese
// while the selection stays keyed to the variant. The knob is paper at rest and
// flashes TRANSIENT glass only while it slides to the chosen segment - mot's
// single glass moment - then settles solid. The glass is gated on
// prefers-reduced-motion in the CSS, so it can never turn persistent.
export function SegmentedControl({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: { value: string; label: string }[];
  value: string;
  onChange: (value: string) => void;
}) {
  const [sliding, setSliding] = useState(false);
  const activeIndex = Math.max(
    0,
    options.findIndex((o) => o.value === value),
  );

  // Keyboard navigation has to move real DOM focus, not just state: under a
  // roving tabindex the segment the user is leaving becomes untabbable, so
  // without this the browser would strand focus on a tabIndex -1 node.
  const segments = useRef<Array<HTMLButtonElement | null>>([]);

  function select(next: string) {
    if (next === value) return;
    setSliding(true);
    onChange(next);
  }

  // The WAI-ARIA radio-group contract: arrows move focus AND the selection
  // together and wrap at both ends, which is why this is a single tab stop -
  // Tab reaches the group, arrows choose inside it. Home/End are an extra on top.
  function handleKeyDown(
    event: React.KeyboardEvent<HTMLButtonElement>,
    index: number,
  ) {
    const last = options.length - 1;
    let next: number;
    switch (event.key) {
      case "ArrowRight":
      case "ArrowDown":
        next = index === last ? 0 : index + 1;
        break;
      case "ArrowLeft":
      case "ArrowUp":
        next = index === 0 ? last : index - 1;
        break;
      case "Home":
        next = 0;
        break;
      case "End":
        next = last;
        break;
      default:
        return;
    }
    // Every key handled here would otherwise scroll the page under the picker.
    event.preventDefault();
    segments.current[next]?.focus();
    select(options[next].value);
  }

  return (
    <div>
      <p className="mb-2 text-[0.8125rem] font-medium uppercase tracking-[0.08em] text-[var(--label-tertiary)]">
        {label}
      </p>
      <div
        className="mot-seg"
        role="radiogroup"
        aria-label={label}
        style={{ "--n": options.length } as React.CSSProperties}
      >
        <span
          className={cn("mot-seg-knob", sliding && "mot-seg-knob--sliding")}
          style={{ "--i": activeIndex } as React.CSSProperties}
          onTransitionEnd={() => setSliding(false)}
          aria-hidden="true"
        />
        {options.map((option, index) => (
          <button
            key={option.value}
            ref={(el) => {
              segments.current[index] = el;
            }}
            type="button"
            role="radio"
            aria-checked={option.value === value}
            // Roving tabindex: Tab enters the group on the checked segment, or
            // on the first one when the value matches no option.
            tabIndex={index === activeIndex ? 0 : -1}
            onKeyDown={(event) => handleKeyDown(event, index)}
            onClick={() => select(option.value)}
            className="mot-seg-btn"
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}
