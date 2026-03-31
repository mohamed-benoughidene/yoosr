"use client"

import { Toaster } from "sonner"
import { DirectionProvider } from "@radix-ui/react-direction"
import { useLocale } from "next-intl"

export function MarketingProviders({ children }: { children: React.ReactNode }) {
    const locale = useLocale()
    const dir = locale === "ar" ? "rtl" : "ltr"

    return (
        <DirectionProvider dir={dir}>
            {children}
            <Toaster position="top-right" richColors closeButton duration={10000} theme="light" dir={dir} />
        </DirectionProvider>
    )
}
