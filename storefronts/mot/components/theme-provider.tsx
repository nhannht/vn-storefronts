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
  theme: "light",
  toggle: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // mot is a light-first paper store, so the default is a hard "light" and the
  // OS setting is never consulted (night is an explicit opt-in). This is the one
  // intentional deviation from tiem-tao, which seeds "dark" and follows live
  // matchMedia changes while no choice is stored. Here there is no matchMedia
  // listener at all: the theme is either the stored explicit choice or light.
  const [theme, setTheme] = useState<Theme>("light");

  useEffect(() => {
    // Seed from the data-theme attribute the pre-paint script already stamped.
    const attr = document.documentElement.dataset.theme;
    if (attr === "light" || attr === "dark") setTheme(attr);
  }, []);

  const toggle = useCallback(() => {
    setTheme((prev) => {
      const next: Theme = prev === "light" ? "dark" : "light";
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
