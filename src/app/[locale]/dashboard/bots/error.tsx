"use client"

import { ErrorFallback } from "@/components/error-fallback"

export default function BotsError({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    return <ErrorFallback reset={reset} homeHref="/dashboard" />
}
