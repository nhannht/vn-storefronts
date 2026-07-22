"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

type Theme = "dark" | "light";

const ThemeContext = createContext<{ theme: Theme; toggle: () => void }>({
  theme: "dark",
  toggle: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // Seed from the data-theme attribute the pre-paint script already stamped.
  const [theme, setTheme] = useState<Theme>("dark");

  useEffect(() => {
    const attr = document.documentElement.dataset.theme;
    if (attr === "light" || attr === "dark") setTheme(attr);

    // Follow live system changes only while no explicit choice is stored.
    const mq = window.matchMedia("(prefers-color-scheme: light)");
    const onChange = () => {
      if (localStorage.getItem("theme")) return;
      const next: Theme = mq.matches ? "light" : "dark";
      document.documentElement.dataset.theme = next;
      setTheme(next);
    };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  const toggle = useCallback(() => {
    setTheme((prev) => {
      const next: Theme = prev === "dark" ? "light" : "dark";
      document.documentElement.dataset.theme = next;
      try {
        localStorage.setItem("theme", next);
      } catch {}
      return next;
    });
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, toggle }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
