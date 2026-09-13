import { NextResponse, type NextRequest } from "next/server";

/**
 * Edge middleware: a lightweight first line of defense for private areas.
 *
 * This is intentionally cheap and dependency-free so it runs in the edge
 * runtime — it does NOT import the Firebase Admin SDK or any `server-only`
 * module. It cannot cryptographically verify the session cookie; that remains
 * the job of the server-side layout guards (`getSession` /
 * `requireStaffOrRedirect` in `lib/session.ts`), which stay authoritative.
 *
 * Responsibilities:
 * - Redirect visitors with no session cookie away from `/dashboard/*` and
 *   `/admin/*` before any sensitive UI renders (defense in depth).
 * - Attach `X-Robots-Tag: noindex, nofollow` to private routes so they are
 *   never indexed, complementing the per-route metadata (Section 55).
 */

// MUST match SESSION_COOKIE_NAME in `lib/session.ts`.
const SESSION_COOKIE_NAME = "afrivps_session";

const NOINDEX_HEADER = "noindex, nofollow, noarchive";

function isAuthGated(pathname: string): boolean {
  return pathname.startsWith("/dashboard") || pathname.startsWith("/admin");
}

function isPrivate(pathname: string): boolean {
  return isAuthGated(pathname) || pathname.startsWith("/checkout");
}

export function middleware(request: NextRequest): NextResponse {
  const { pathname, search } = request.nextUrl;
  const hasSession = Boolean(request.cookies.get(SESSION_COOKIE_NAME)?.value);

  if (isAuthGated(pathname) && !hasSession) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", `${pathname}${search}`);
    const response = NextResponse.redirect(loginUrl);
    response.headers.set("X-Robots-Tag", NOINDEX_HEADER);
    return response;
  }

  const response = NextResponse.next();
  if (isPrivate(pathname)) {
    response.headers.set("X-Robots-Tag", NOINDEX_HEADER);
  }
  return response;
}

export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*", "/checkout/:path*"],
};
