import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

// Routes that don't require authentication
const publicPaths = [
  "/",
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
];

// Routes that should be accessible without a complete profile
const noProfilePaths = ["/onboarding", "/api", "/_next", "/favicon.ico"];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow static files and API routes
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon.ico") ||
    pathname.startsWith("/api")
  ) {
    return NextResponse.next();
  }

  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  // Check if this is a public path
  const isPublicPath = publicPaths.some(
    (path) => pathname === path || pathname.startsWith(path + "/")
  );

  // Redirect authenticated users away from login
  if (token && pathname === "/login") {
    if (!token.onboardingComplete) {
      return NextResponse.redirect(new URL("/onboarding", request.url));
    }
    return NextResponse.redirect(new URL("/discover", request.url));
  }

  // Redirect to login if not authenticated and not on public path
  if (!token && !isPublicPath) {
    const url = new URL("/login", request.url);
    return NextResponse.redirect(url);
  }

  // If authenticated but onboarding not complete, redirect to onboarding
  // (except if already on onboarding or using noProfilePaths)
  if (token && !token.onboardingComplete) {
    const isAllowedWithoutProfile = noProfilePaths.some(
      (path) => pathname === path || pathname.startsWith(path)
    );
    if (!isAllowedWithoutProfile && !isPublicPath) {
      return NextResponse.redirect(new URL("/onboarding", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
