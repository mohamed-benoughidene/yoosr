"use client"

import { ErrorFallback } from "@/components/error-fallback"

export default function SettingsError({

    reset,
}: {

    reset: () => void
}) {
    return <ErrorFallback reset={reset} homeHref="/dashboard/settings" />
}
