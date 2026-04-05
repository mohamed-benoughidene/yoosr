"use client"

import Link from "next/link"
import { SignIn } from "@clerk/nextjs"
import { dark } from "@clerk/themes"
import { AuthProviders } from "@/components/AuthProviders"
import { useLocale } from "next-intl"

function LoginContent() {
    const locale = useLocale()
    
    return (
        <div className="flex w-full flex-col items-center justify-center" style={{ backgroundColor: 'var(--lp-bg)', minHeight: '100vh' }}>
            <Link
                href={`/${locale}`}
                className="absolute left-4 top-4 md:left-8 md:top-8 flex items-center text-lg font-bold tracking-tight"
                style={{ color: 'var(--lp-text)' }}
            >
                <div className="h-6 w-6 rounded-md bg-primary flex items-center justify-center mr-2">
                    <span className="text-primary-foreground font-bold text-xs">Y</span>
                </div>
                Yoosr
            </Link>
            <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[400px]">
                <div className="flex flex-col space-y-2 text-center">
                    <h1 style={{ fontFamily: "var(--font-cabinet-grotesk), sans-serif", fontWeight: 700, fontSize: 28, color: 'var(--lp-text)' }}>
                        Welcome back
                    </h1>
                    <p style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400, fontSize: 14, color: 'var(--lp-text-secondary)', marginBottom: 24 }}>
                        Sign in to your account
                    </p>
                </div>
                <div className="flex justify-center">
                    <SignIn
                        appearance={{
                            baseTheme: dark,
                            elements: {
                                rootBox: "w-full",
                                cardBox: "w-full shadow-none",
                                card: "shadow-none w-full",
                            },
                        }}
                        routing="hash"
                        forceRedirectUrl={`/${locale}/onboarding`}
                        signUpUrl={`/${locale}/waitlist`}
                        afterSignInUrl={`/${locale}/dashboard`}
                    />
                </div>
            </div>
        </div>
    )
}

export function LoginClient() {
    return (
        <AuthProviders>
            <LoginContent />
        </AuthProviders>
    )
}
