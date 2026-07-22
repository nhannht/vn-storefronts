"use client";

import { useRef, useState } from "react";
import { cn } from "@/lib/cn";
import "./segmented-control.css";

// Variant picker segmented control. The knob flashes transient glass while it
// slides to the selected segment, then settles solid (Materials map / the
// apple-web-design skill's transient-glass switch pattern).
export function SegmentedControl({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: string[];
  value: string;
  onChange: (value: string) => void;
}) {
  const [sliding, setSliding] = useState(false);
  const activeIndex = Math.max(0, options.indexOf(value));

  // Keyboard navigation has to move real DOM focus, not just state: under a
  // roving tabindex the segment the user is leaving becomes untabbable, so
  // without this the browser would strand focus on a tabIndex -1 node.
  const segments = useRef<Array<HTMLButtonElement | null>>([]);

  function select(option: string) {
    if (option === value) return;
    setSliding(true);
    onChange(option);
  }

  // The WAI-ARIA radio-group contract: arrows move focus AND the selection
  // together and wrap at both ends, which is why this is a single tab stop -
  // Tab reaches the group, arrows choose inside it. Home/End are an extra on
  // top of the APG table, which stops at the arrow keys.
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
    select(options[next]);
  }

  return (
    <div>
      <p className="mb-2 text-[0.8125rem] font-medium uppercase tracking-[0.08em] text-[var(--label-tertiary)]">
        {label}
      </p>
      <div
        className="tt-seg"
        role="radiogroup"
        aria-label={label}
        style={{ "--n": options.length } as React.CSSProperties}
      >
        <span
          className={cn("tt-seg-knob", sliding && "tt-seg-knob--sliding")}
          style={{ "--i": activeIndex } as React.CSSProperties}
          onTransitionEnd={() => setSliding(false)}
          aria-hidden="true"
        />
        {options.map((option, index) => (
          <button
            key={option}
            ref={(el) => {
              segments.current[index] = el;
            }}
            type="button"
            role="radio"
            aria-checked={option === value}
            // Roving tabindex: Tab enters the group on the checked segment, or
            // on the first one when the value matches no option.
            tabIndex={index === activeIndex ? 0 : -1}
            onKeyDown={(event) => handleKeyDown(event, index)}
            onClick={() => select(option)}
            className="tt-seg-btn"
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );
}
