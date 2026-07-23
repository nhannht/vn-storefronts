import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

// Next 16 renamed the "middleware" file convention to "proxy". next-intl's
// handler is a plain request handler, so it works unchanged here.
export default createMiddleware(routing);

export const config = {
  // Match every path except API routes, Next internals, and files with an
  // extension (favicons, images, etc.).
  matcher: "/((?!api|_next|_vercel|.*\\..*).*)",
};
