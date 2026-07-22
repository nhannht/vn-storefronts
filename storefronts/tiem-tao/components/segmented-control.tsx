"use client";

import { useState } from "react";
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
        {options.map((option) => (
          <button
            key={option}
            type="button"
            role="radio"
            aria-checked={option === value}
            onClick={() => {
              if (option === value) return;
              setSliding(true);
              onChange(option);
            }}
            className="tt-seg-btn"
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );
}
