import { createNavigation } from "next-intl/navigation";
import { routing } from "./routing";

// Locale-aware Link / router helpers. Use these instead of next/link so hrefs
// carry the active locale prefix automatically.
export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing);
