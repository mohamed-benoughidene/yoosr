"use client"

import { SignIn } from "@clerk/nextjs"
import { dark } from "@clerk/themes"
import { AuthProviders } from "@/components/AuthProviders"
import { useLocale } from "next-intl"

function LoginContent() {
    const locale = useLocale()
    
    return (
        <div className="flex w-full flex-col items-center justify-center" style={{ backgroundColor: 'var(--lp-bg)', minHeight: '100vh' }}>
            <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[400px]">
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
