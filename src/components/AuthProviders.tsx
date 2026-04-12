"use client"

import { ClerkProvider } from "@clerk/nextjs"
import { shadcn } from "@clerk/themes"
import { useLocale } from "next-intl"
import { arSA, enUS, frFR } from "@clerk/localizations"
import { ThemeProvider } from "@/components/theme-provider"

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

export function AuthProviders({ children }: { children: React.ReactNode }) {
    const locale = useLocale()
    const localeMap = { ar: arSAWithPlaceholders, en: enUS, fr: frFR }
    const clerkLocalization = localeMap[locale as keyof typeof localeMap] ?? enUS

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
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
            <ClerkProvider
                localization={clerkLocalization}
                appearance={{
                    baseTheme: shadcn,
                    variables: {
                        colorPrimary: "var(--primary)",
                        colorBackground: "var(--background)",
                        colorForeground: "var(--foreground)",
                        colorMutedForeground: "var(--muted-foreground)",
                        colorInput: "var(--input)",
                        colorInputForeground: "var(--foreground)",
                        colorMuted: "var(--muted)",
                        colorBorder: "var(--border)",
                        fontFamily: "inherit",
                    },
                }}
                {...urls}
            >
                {children}
            </ClerkProvider>
        </ThemeProvider>
    )
}
