"use client"

import Link from "next/link"
import { SignUp } from "@clerk/nextjs"
import { useLocale } from "next-intl"
import { AuthProviders } from "@/components/AuthProviders"

function SignupContent() {
    const locale = useLocale()
    return (
        <div className="flex w-full flex-col items-center justify-center" style={{ backgroundColor: 'var(--lp-bg)', minHeight: '100vh' }}>
            <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[400px]">
                <div className="flex justify-center">
                    <SignUp
                        routing="hash"
                        forceRedirectUrl={`/${locale}/onboarding`}
                        signInUrl={`/${locale}/login`}
                        afterSignUpUrl={`/${locale}/dashboard`}
                    />
                </div>
                <p className="px-8 text-center text-sm" style={{ color: 'var(--lp-text-secondary)' }}>
                    By clicking continue, you agree to our{" "}
                    <Link
                        href={`/${locale}/legal/terms`}
                        className="underline underline-offset-4"
                        style={{ color: 'var(--lp-text-secondary)' }}
                        onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--lp-gold)' }}
                        onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--lp-text-secondary)' }}
                    >
                        Terms of Service
                    </Link>{" "}
                    and{" "}
                    <Link
                        href={`/${locale}/legal/privacy`}
                        className="underline underline-offset-4"
                        style={{ color: 'var(--lp-text-secondary)' }}
                        onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--lp-gold)' }}
                        onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--lp-text-secondary)' }}
                    >
                        Privacy Policy
                    </Link>
                    .
                </p>
            </div>
        </div>
    )
}

export function SignupClient() {
    return (
        <AuthProviders>
            <SignupContent />
        </AuthProviders>
    )
}
