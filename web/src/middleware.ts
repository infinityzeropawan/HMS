import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const SESSION_COOKIE = "hms_user_auth_session";

/** Pages reachable without a session: the login screen and the self-service kiosk terminal. */
const PUBLIC_PATHS = new Set(["/login", "/checkin"]);

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isPublicPath =
    PUBLIC_PATHS.has(pathname) ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.includes(".");

  // The session cookie mirrors the client session store (written on login, cleared on logout).
  // Previously the cookie was never written, so this guard never fired and every console —
  // including the reception desk — was reachable without authentication.
  const hasSession = Boolean(request.cookies.get(SESSION_COOKIE)?.value);

  if (!isPublicPath && !hasSession) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}



export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
