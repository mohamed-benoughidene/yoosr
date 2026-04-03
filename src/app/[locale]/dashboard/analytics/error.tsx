"use client"

import { ErrorFallback } from "@/components/error-fallback"

export default function AnalyticsError({

    reset,
}: {

    reset: () => void
}) {
    return <ErrorFallback reset={reset} homeHref="/dashboard" />
}
