"use client"

import { ConvexClientProvider } from "@/components/ConvexClientProvider"
import { ThemeProvider } from "@/components/theme-provider"
import { ProjectProvider } from "@/context/ProjectContext"
import { Toaster } from "sonner"
import { DirectionProvider } from "@radix-ui/react-direction"
import { useLocale } from "next-intl"
import { useTheme } from "next-themes"

function AppToaster({ dir }: { dir: "ltr" | "rtl" }) {
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

export function Providers({ children }: { children: React.ReactNode }) {
    const locale = useLocale()
    const dir = locale === "ar" ? "rtl" : "ltr"

    return (
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
            <DirectionProvider dir={dir}>
                <ConvexClientProvider>
                    <ProjectProvider>
                        {children}
                        <AppToaster dir={dir} />
                    </ProjectProvider>
                </ConvexClientProvider>
            </DirectionProvider>
        </ThemeProvider>
    )
}
