"use client"

import { useAuth } from "@clerk/nextjs"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { Loader2 } from "lucide-react"

export function DashboardAuthGuard({ children }: { children: React.ReactNode }) {
    const { isLoaded, isSignedIn } = useAuth()
    const router = useRouter()

    useEffect(() => {
        if (isLoaded && !isSignedIn) {
            router.push("/login")
        }
    }, [isLoaded, isSignedIn, router])

    if (!isLoaded) {
        return (
            <div className="flex min-h-screen w-full items-center justify-center bg-background">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    if (!isSignedIn) {
        return null
    }

    return <>{children}</>
}
