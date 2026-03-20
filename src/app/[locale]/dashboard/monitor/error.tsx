"use client"

import { ErrorFallback } from "@/components/error-fallback"

export default function MonitorError({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    return <ErrorFallback reset={reset} homeHref="/dashboard" />
}
