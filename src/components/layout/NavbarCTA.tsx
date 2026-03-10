"use client"

import Link from "next/link"
import { useAuth, UserButton } from "@clerk/nextjs"
import { Button } from "@/components/ui/button"

export function NavbarCTA() {
    const { isSignedIn, isLoaded } = useAuth()

    // Loading state: placeholder to prevent layout shift
    if (!isLoaded) {
        return (
            <div className="flex items-center gap-2">
                <div className="h-9 w-20 animate-pulse rounded-md bg-muted" />
                <div className="h-9 w-24 animate-pulse rounded-md bg-muted" />
            </div>
        )
    }

    if (isSignedIn) {
        return (
            <div className="flex items-center gap-4">
                <Button asChild variant="default">
                    <Link href="/dashboard">Go to Dashboard</Link>
                </Button>
                <div className="hidden lg:flex">
                    <UserButton afterSignOutUrl="/" />
                </div>
            </div>
        )
    }

    return (
        <div className="flex items-center gap-2">
            <Button variant="ghost" asChild>
                <Link href="/login">Sign In</Link>
            </Button>
            <Button asChild>
                <Link href="/signup">Get Started</Link>
            </Button>
        </div>
    )
}
