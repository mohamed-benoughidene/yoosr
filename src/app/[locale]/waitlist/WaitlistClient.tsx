"use client"

import { Waitlist } from "@clerk/nextjs"
import { useSearchParams } from "@/i18n/navigation"
import { dark } from "@clerk/themes"
import { Suspense } from "react"
import { AuthProviders } from "@/components/AuthProviders"

function WaitlistForm() {
    const searchParams = useSearchParams()
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const _email = searchParams.get('email') ?? ''

    return (
        <div className="flex flex-col items-center justify-center w-full" style={{ backgroundColor: 'var(--lp-bg)', minHeight: '100vh' }}>
            <Waitlist
                signInUrl="/login"
                appearance={{
                    baseTheme: dark,
                    elements: {
                        rootBox: "w-full",
                        cardBox: "w-full shadow-none",
                        card: "shadow-none w-full",
                    },
                }}
            />
        </div>
    )
}

function WaitlistContent() {
    return (
        <Suspense fallback={<div style={{ backgroundColor: 'var(--lp-bg)', minHeight: '100vh' }} />}>
            <WaitlistForm />
        </Suspense>
    )
}

export function WaitlistClient() {
    return (
        <AuthProviders>
            <WaitlistContent />
        </AuthProviders>
    )
}
