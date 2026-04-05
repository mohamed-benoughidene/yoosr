"use client"

import { Toaster } from "sonner"
import { DirectionProvider } from "@radix-ui/react-direction"
import { useLocale } from "next-intl"
import { useTheme } from "next-themes"

function MarketingToaster({ dir }: { dir: "ltr" | "rtl" }) {
    const { theme } = useTheme()
    return (
        <Toaster
            position="top-right"
            richColors
            closeButton
            duration={10000}
            theme={theme as "light" | "dark" | "system"}
            dir={dir}
        />
    )
}

export function MarketingProviders({ children }: { children: React.ReactNode }) {
    const locale = useLocale()
    const dir = locale === "ar" ? "rtl" : "ltr"

    return (
        <DirectionProvider dir={dir}>
            {children}
            <MarketingToaster dir={dir} />
        </DirectionProvider>
    )
}
