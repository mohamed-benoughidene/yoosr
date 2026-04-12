"use client"

import { ConvexClientProvider } from "@/components/ConvexClientProvider"
import { ProjectProvider } from "@/context/ProjectContext"
import { DirectionProvider } from "@radix-ui/react-direction"
import { useLocale } from "next-intl"

/**
 * Widget-specific providers - intentionally excludes ThemeProvider
 * to prevent theme styling from affecting the embedded widget.
 * The widget uses its own inline styles and project config for theming.
 */
export function WidgetProviders({ children }: { children: React.ReactNode }) {
    const locale = useLocale()
    const dir = locale === "ar" ? "rtl" : "ltr"

    return (
        <DirectionProvider dir={dir}>
            <ConvexClientProvider>
                <ProjectProvider>
                    {children}
                </ProjectProvider>
            </ConvexClientProvider>
        </DirectionProvider>
    )
}
