"use client";

import { createContext, useContext, useState } from "react";

// Shared "is the mobile nav sheet open" flag. The nav owns it; the PDP buy bar
// reads it to hide itself, so two floating layers never compete for the same
// viewport (materials rule: glass never stacks / competes with glass).
type MobileMenu = { open: boolean; setOpen: (v: boolean) => void };

const MobileMenuContext = createContext<MobileMenu>({
  open: false,
  setOpen: () => {},
});

export function MobileMenuProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <MobileMenuContext.Provider value={{ open, setOpen }}>
      {children}
    </MobileMenuContext.Provider>
  );
}

export const useMobileMenu = () => useContext(MobileMenuContext);
