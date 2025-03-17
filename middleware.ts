import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Get the token
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  // Check if the user is authenticated
  const isAuthenticated = !!token;
  
  // Check if the user is an admin
  const isAdmin = token?.role === "ADMIN";
  
  // Check if the user's email is verified
  const isEmailVerified = !!token?.emailVerified;

  // Check maintenance mode
  let isMaintenanceMode = false;
  try {
    const maintenanceResponse = await fetch(`${request.nextUrl.origin}/api/maintenance`);
    if (maintenanceResponse.ok) {
      const { maintenanceMode } = await maintenanceResponse.json();
      isMaintenanceMode = maintenanceMode;
    }
  } catch (error) {
    console.error("Error checking maintenance mode:", error);
  }

  // Allow access to auth pages and API routes during maintenance
  const isAuthRoute = pathname.startsWith("/auth");
  const isApiRoute = pathname.startsWith("/api");
  const isAdminRoute = pathname.startsWith("/admin");
  const isVerifyRoute = pathname === "/auth/verify";

  // If in maintenance mode and not an allowed route, redirect to maintenance page
  if (isMaintenanceMode && !isAuthRoute && !isApiRoute && !isAdminRoute && !isAdmin) {
    return NextResponse.rewrite(new URL("/maintenance", request.url));
  }

  // Admin routes protection
  if (pathname.startsWith("/admin")) {
    if (!isAuthenticated) {
      return NextResponse.redirect(new URL("/auth/signin", request.url));
    }
    
    if (!isAdmin) {
      return NextResponse.redirect(new URL("/", request.url));
    }
    
    return NextResponse.next();
  }

  // Protected routes that require authentication and email verification
  if (
    pathname.startsWith("/cart") ||
    pathname.startsWith("/checkout") ||
    pathname.startsWith("/orders") ||
    pathname.startsWith("/profile")
  ) {
    if (!isAuthenticated) {
      return NextResponse.redirect(new URL("/auth/signin", request.url));
    }
    
    // Skip email verification check for Google OAuth users
    if (!isEmailVerified && !isVerifyRoute) {
      return NextResponse.redirect(new URL("/auth/verify-email", request.url));
    }
    
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/cart/:path*",
    "/checkout/:path*",
    "/orders/:path*",
    "/profile/:path*",
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};