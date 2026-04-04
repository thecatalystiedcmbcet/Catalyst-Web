import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const SESSION_COOKIE = "admin_session";
const INTERNAL_SECRET = process.env.INTERNAL_API_KEY || "catalyst-internal-ssr";

/**
 * Middleware (Edge Runtime):
 * Only checks whether the session cookie EXISTS.
 * Actual Appwrite validation happens in the admin layout Server Component.
 */
export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Allow internal SSR fetch bypass
  const internalToken = req.headers.get("x-internal-token");
  if (internalToken === INTERNAL_SECRET && internalToken !== null) {
    return NextResponse.next();
  }

  // ── Guard /admin/* ─────────────────────────────────────────────────────────
  if (pathname.startsWith("/admin")) {
    const cookie = req.cookies.get(SESSION_COOKIE)?.value;
    if (!cookie) {
      return NextResponse.redirect(new URL("/login", req.url));
    }
  }

  // ── /api/v1/* (not auth routes) ───────────────────────────────────────────
  // Require session cookie on all non-auth API routes in every environment.
  if (
    pathname.startsWith("/api/v1") &&
    !pathname.startsWith("/api/v1/auth")
  ) {
    const cookie = req.cookies.get(SESSION_COOKIE)?.value;
    if (!cookie) {
      return NextResponse.json(
        { error: "Authentication credentials were not provided" },
        { status: 401 }
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/v1/:path*"],
};