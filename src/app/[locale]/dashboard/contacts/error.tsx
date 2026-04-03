"use client"

import { ErrorFallback } from "@/components/error-fallback"

export default function ContactsError({

    reset,
}: {

    reset: () => void
}) {
    return <ErrorFallback reset={reset} homeHref="/dashboard" />
}
