import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { PROTECTED_ROUTES, ROLE_COOKIE, SESSION_COOKIE } from "@/lib/constants";

/**
 * Modul 6: Middleware proteksi rute.
 * Dijalankan di edge sebelum request mencapai halaman. Memeriksa cookie
 * session; jika tidak ada, redirect ke /login dengan parameter redirect.
 * Rute /admin juga memerlukan role admin (RBAC).
 */
export function middleware(request: NextRequest): NextResponse {
  const { pathname } = request.nextUrl;

  const isProtected = PROTECTED_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );

  if (!isProtected) {
    return NextResponse.next();
  }

  const session = request.cookies.get(SESSION_COOKIE)?.value;
  if (!session) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    loginUrl.searchParams.set("auth_error", "1");
    return NextResponse.redirect(loginUrl);
  }

  // RBAC: hanya role admin yang boleh masuk /admin.
  const isAdminRoute = pathname === "/admin" || pathname.startsWith("/admin/");
  if (isAdminRoute) {
    const role = request.cookies.get(ROLE_COOKIE)?.value;
    if (role !== "admin") {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  const response = NextResponse.next();
  // Menandai request terautentikasi untuk observability/security header.
  response.headers.set("x-nutrivillage-session", "active");
  return response;
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/onboarding/:path*",
    "/explore/:path*",
    "/history/:path*",
    "/favorites/:path*",
    "/meal-planner/:path*",
    "/shopping-list/:path*",
    "/profile/:path*",
    "/notifications/:path*",
    "/admin/:path*",
  ],
};
