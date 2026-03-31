import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import createMiddleware from "next-intl/middleware";
import { NextResponse } from "next/server";

const intlMiddleware = createMiddleware({
  locales: ["en", "ar", "fr"],
  defaultLocale: "en",
  localePrefix: "always",
});

const isProtectedRoute = createRouteMatcher([
  "/dashboard(.*)",
  "/design-studio(.*)",
]);

export default clerkMiddleware(async (auth, req) => {
  const { pathname } = req.nextUrl;

  // Skip middleware for static assets and API routes early
  if (
    pathname.startsWith("/api") ||
    pathname.startsWith("/widget") ||
    pathname.startsWith("/_next") ||
    pathname.includes(".")
  ) {
    return intlMiddleware(req);
  }

  // Handle dashboard locale redirect BEFORE auth check to avoid extra hops
  // This prevents the redirect chain: /dashboard -> /en/dashboard
  if (pathname === "/dashboard" || pathname === "/dashboard/") {
    const authData = await auth();
    if (authData.userId) {
      const unsafeMetadata = authData.sessionClaims?.unsafeMetadata as
        | { locale?: string }
        | undefined;
      const locale = unsafeMetadata?.locale;

      if (typeof locale === "string" && ["en", "ar", "fr"].includes(locale)) {
        const targetUrl = new URL(`/${locale}/dashboard`, req.url);
        return NextResponse.redirect(targetUrl);
      }
    }
  }

  // Handle protected routes - require auth
  if (isProtectedRoute(req)) {
    await auth.protect({
      unauthenticatedUrl: new URL("/login", req.url).toString(),
    });
  }

  return intlMiddleware(req);
});

export const config = {
  matcher: [
    "/((?!api|widget|_next|static|favicon\\.ico|.*\\.(?:png|jpg|svg|ico|css|js)).*)",
  ],
};
