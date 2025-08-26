import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyToken } from "@/lib/auth";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("auth-token")?.value;

  // Check if user is authenticated

  // Define protected routes (require authentication)
  const protectedRoutes = ["/dashboard", "/weekly", "/analytics"];
  // Define auth routes (redirect to dashboard if already authenticated)
  const authRoutes = ["/login", "/register"];
  // Landing page route
  const isLandingPage = pathname === "/";

  // If user is accessing a protected route without authentication
  if (protectedRoutes.some((route) => pathname.startsWith(route)) && !token) {
    console.log("REDIRECTING");
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // If authenticated user tries to access auth pages, redirect to dashboard
  if (authRoutes.includes(pathname) && token) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Landing page behavior: if user is authenticated and clicks "Get Started", redirect to dashboard
  // This will be handled by the client-side component, but we can also handle direct navigation
  if (isLandingPage && token) {
    // Allow landing page access but the component will handle redirection logic
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
