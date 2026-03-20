"use client"

import { ErrorFallback } from "@/components/error-fallback"

export default function ChatError({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    return <ErrorFallback reset={reset} homeHref="/dashboard" />
}
