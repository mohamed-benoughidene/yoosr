"use client"

import { ClerkProvider } from "@clerk/nextjs"
import { Toaster } from "sonner"
import { DirectionProvider } from "@radix-ui/react-direction"
import { useLocale } from "next-intl"
import { arSA, enUS, frFR } from "@clerk/localizations"

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

export function MarketingProviders({ children }: { children: React.ReactNode }) {
    const locale = useLocale()
    const localeMap = { ar: arSAWithPlaceholders, en: enUS, fr: frFR }
    const clerkLocalization = localeMap[locale as keyof typeof localeMap] ?? enUS
    const dir = locale === "ar" ? "rtl" : "ltr"

    return (
        <DirectionProvider dir={dir}>
            <ClerkProvider
                localization={clerkLocalization}
                waitlistUrl="/waitlist"
                afterSignInUrl="/dashboard"
                afterSignUpUrl="/onboarding"
                afterSignOutUrl="/"
            >
                {children}
                <Toaster position="top-right" richColors closeButton duration={10000} theme="light" dir={dir} />
            </ClerkProvider>
        </DirectionProvider>
    )
}
