import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

export default createMiddleware(routing);

export const config = {
  // Match every path except API routes, Next internals, and files with an
  // extension (favicons, images, etc.).
  matcher: "/((?!api|_next|_vercel|.*\\..*).*)",
};
