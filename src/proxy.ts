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
  if (isProtectedRoute(req)) {
    await auth.protect();
  }

  const { pathname } = req.nextUrl;

  if (pathname === "/dashboard" || pathname.startsWith("/dashboard/")) {
    const authData = await auth();
    const unsafeMetadata = authData.sessionClaims?.unsafeMetadata as
      | { locale?: string }
      | undefined;
    const locale = unsafeMetadata?.locale;

    if (typeof locale === "string" && ["en", "ar", "fr"].includes(locale)) {
      const targetUrl = req.nextUrl.clone();
      targetUrl.pathname = `/${locale}${pathname}`;
      return NextResponse.redirect(targetUrl);
    }
  }

  return intlMiddleware(req);
});

export const config = {
  matcher: [
    "/((?!api|_next|static|favicon\\.ico|.*\\.(?:png|jpg|svg|ico|css|js)).*)",
  ],
};
