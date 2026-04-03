"use client";

import { ConvexReactClient } from "convex/react";
import { ClerkProvider, useAuth } from "@clerk/nextjs";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { ReactNode } from "react";
import { useLocale } from "next-intl";
import { arSA, enUS, frFR } from "@clerk/localizations";

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

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
            {...urls}
        >
            <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
                {children}
            </ConvexProviderWithClerk>
        </ClerkProvider>
    );
}
