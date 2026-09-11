import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Publicly accessible paths that bypass auth checks
  const isPublicPath =
    pathname === "/login" ||
    pathname === "/checkin" ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.includes(".");

  // Check auth session indicator from cookie or header if present
  const authSessionCookie = request.cookies.get("hms_user_auth_session")?.value;

  if (!isPublicPath && !authSessionCookie) {
    // If no cookie exists, client-side Zustand store will handle redirection via HmsAppShell
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
