"use client";

import { ConvexReactClient } from "convex/react";
import { ClerkProvider, useAuth } from "@clerk/nextjs";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { shadcn } from "@clerk/themes";
import { ReactNode } from "react";
import { useLocale } from "next-intl";
import { arSA, enUS, frFR } from "@clerk/localizations";

const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
const convex = convexUrl ? new ConvexReactClient(convexUrl) : null;

const arSAWithPlaceholders = {
    ...arSA,
    formFieldInputPlaceholder__emailAddress: 'أدخل بريدك الإلكتروني',
    formFieldInputPlaceholder__emailAddress_username: 'البريد الإلكتروني أو اسم المستخدم',
    formFieldInputPlaceholder__emailAddresses: 'example@email.com, example2@email.com',
    formFieldInputPlaceholder__firstName: 'الاسم الأول',
    formFieldInputPlaceholder__lastName: 'اسم العائلة',
    formFieldInputPlaceholder__password: 'أدخل كلمة المرور',
    formFieldInputPlaceholder__phoneNumber: 'أدخل رقم هاتفك',
    formFieldInputPlaceholder__organizationName: 'اسم المؤسسة',
    formFieldInputPlaceholder__organizationSlug: 'my-org',
    signUp: {
        start: {
            title: 'إنشاء حساب',
            subtitle: 'أدخل بياناتك أدناه لإنشاء حسابك',
        }
    }
}

export function ConvexClientProvider({ children }: { children: ReactNode }) {
    const locale = useLocale();
    const localeMap = { ar: arSAWithPlaceholders, en: enUS, fr: frFR };
    const clerkLocalization = localeMap[locale as keyof typeof localeMap] ?? enUS;

    // During static generation (CI build), Convex URL may not be available.
    // In that case, just render children without Convex provider (static pages
    // like marketing won't need it; dashboard pages will render empty anyway).
    if (!convex) {
        return (
            <ClerkProvider
                localization={clerkLocalization}
                appearance={{
                    baseTheme: shadcn,
                    variables: {
                        colorPrimary: "var(--lp-gold)",
                        colorBackground: "var(--lp-surface)",
                        colorForeground: "var(--lp-text)",
                        colorMutedForeground: "var(--lp-text-secondary)",
                        colorInput: "var(--lp-surface-2)",
                        colorInputForeground: "var(--lp-text)",
                        colorMuted: "var(--lp-surface)",
                        colorBorder: "var(--lp-border)",
                        fontFamily: "inherit",
                    },
                }}
            >
                {children}
            </ClerkProvider>
        );
    }

    // Locale-aware URLs for Clerk redirects
    const urls = {
        signInUrl: `/${locale}/login`,
        signUpUrl: `/${locale}/signup`,
        waitlistUrl: `/${locale}/waitlist`,
        afterSignInUrl: `/${locale}/dashboard`,
        afterSignUpUrl: `/${locale}/onboarding`,
        afterSignOutUrl: `/${locale}`,
    }

    return (
        <ClerkProvider
            localization={clerkLocalization}
            appearance={{
                baseTheme: shadcn,
                variables: {
                    colorPrimary: "var(--lp-gold)",
                    colorBackground: "var(--lp-surface)",
                    colorForeground: "var(--lp-text)",
                    colorMutedForeground: "var(--lp-text-secondary)",
                    colorInput: "var(--lp-surface-2)",
                    colorInputForeground: "var(--lp-text)",
                    colorMuted: "var(--lp-surface)",
                    colorBorder: "var(--lp-border)",
                    fontFamily: "inherit",
                },
            }}
            {...urls}
        >
            <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
                {children}
            </ConvexProviderWithClerk>
        </ClerkProvider>
    );
}
