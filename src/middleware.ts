import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import createMiddleware from "next-intl/middleware";
import { NextResponse, type NextRequest } from "next/server";
import { routing } from "./i18n/routing";
const intlMiddleware = createMiddleware(routing);

const LOCALE_COOKIE = "NEXT_LOCALE";
const VALID_LOCALES = ["en", "ar", "fr"] as const;
type ValidLocale = (typeof VALID_LOCALES)[number];

const isProtectedRoute = createRouteMatcher([
  "/dashboard(.*)",
  "/design-studio(.*)",
]);

function getSavedLocale(req: NextRequest): ValidLocale | null {
  const cookieLocale = req.cookies.get(LOCALE_COOKIE)?.value;
  if (cookieLocale && VALID_LOCALES.includes(cookieLocale as ValidLocale)) {
    return cookieLocale as ValidLocale;
  }
  return null;
}

export default clerkMiddleware(async (auth, req) => {
  const { pathname } = req.nextUrl;

  // Redirect bare root to saved locale (Clerk metadata > cookie > default "en")
  if (pathname === "/") {
    // Priority 1: Check authenticated user's Clerk metadata
    const authData = await auth();
    let targetLocale: ValidLocale | null = null;

    if (authData.userId) {
      const unsafeMetadata = authData.sessionClaims?.unsafeMetadata as
        | { locale?: string }
        | undefined;
      const clerkLocale = unsafeMetadata?.locale;
      if (
        typeof clerkLocale === "string" &&
        VALID_LOCALES.includes(clerkLocale as ValidLocale)
      ) {
        targetLocale = clerkLocale as ValidLocale;
      }
    }

    // Priority 2: Fall back to cookie for unauthenticated users
    if (!targetLocale) {
      targetLocale = getSavedLocale(req);
    }

    // Priority 3: Default to "en"
    const locale = targetLocale ?? "en";
    return NextResponse.redirect(new URL(`/${locale}`, req.url));
  }

  // Skip middleware for static assets and API routes early
  if (
    pathname.startsWith("/api") ||
    pathname.startsWith("/widget") ||
    pathname.startsWith("/_next") ||
    pathname.includes(".") ||
    pathname === "/sitemap.xml" ||
    pathname === "/robots.txt" ||
    pathname === "/llms.txt"
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

      if (typeof locale === "string" && VALID_LOCALES.includes(locale as ValidLocale)) {
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

  // Set the NEXT_LOCALE cookie when a valid locale is detected in the URL path
  // This ensures unauthenticated users' locale preference is remembered
  const urlLocaleMatch = pathname.match(/^\/(en|ar|fr)(?:\/|$)/);
  if (urlLocaleMatch) {
    const urlLocale = urlLocaleMatch[1] as ValidLocale;
    const currentCookie = req.cookies.get(LOCALE_COOKIE)?.value;
    if (currentCookie !== urlLocale) {
      // Sync cookie to match URL locale
      const response = intlMiddleware(req);
      response.cookies.set(LOCALE_COOKIE, urlLocale, {
        path: "/",
        maxAge: 31536000, // 1 year
        sameSite: "lax",
      });
      return response;
    }
  }

  return intlMiddleware(req);
});

export const config = {
  matcher: [
    "/((?!api|widget|_next|static|favicon\\.ico|.*\\.(?:png|jpg|svg|ico|css|js|mp4)).*)",
  ],
};
