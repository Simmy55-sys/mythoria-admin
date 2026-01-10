import { NextRequest, NextResponse } from "next/server";
import { login, dashboard } from "@/routes/client";
import { profile } from "@/routes/server";

const ADMIN_ACCESS_TOKEN_COOKIE_ID = "adminAccessToken";

export default async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Get the access token from cookies
  const accessToken = request.cookies.get(ADMIN_ACCESS_TOKEN_COOKIE_ID)?.value;

  // If no token, redirect to login (unless already on login page)
  if (!accessToken) {
    if (pathname === login) return NextResponse.next();

    const loginUrl = new URL(login, request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // If token exists, verify it by calling the profile endpoint
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:5000";
    const profileResponse = await fetch(`${baseUrl}${profile}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      credentials: "include",
    });

    // If profile request is successful (200), user is authenticated
    if (profileResponse.ok) {
      // If user is trying to access login page, redirect to dashboard
      if (pathname === login) {
        return NextResponse.redirect(new URL(dashboard, request.url));
      }
      // Otherwise, allow access
      return NextResponse.next();
    } else {
      // Profile request failed, token is invalid
      // Clear the cookie and redirect to login
      const loginUrl = new URL(login, request.url);
      loginUrl.searchParams.set("redirect", pathname);
      const response = NextResponse.redirect(loginUrl);
      response.cookies.delete(ADMIN_ACCESS_TOKEN_COOKIE_ID);
      return response;
    }
  } catch (error) {
    // Error making the request, treat as unauthenticated
    console.error("Middleware error:", error);
    const loginUrl = new URL(login, request.url);
    loginUrl.searchParams.set("redirect", pathname);
    const response = NextResponse.redirect(loginUrl);
    response.cookies.delete(ADMIN_ACCESS_TOKEN_COOKIE_ID);
    return response;
  }
}

// Configure which routes the middleware should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)",
  ],
};
