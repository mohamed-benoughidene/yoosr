"use client"

import { ConvexClientProvider } from "@/components/ConvexClientProvider"
import { ProjectProvider } from "@/context/ProjectContext"
import { Toaster } from "sonner"
import { DirectionProvider } from "@radix-ui/react-direction"
import { useLocale } from "next-intl"

export function Providers({ children }: { children: React.ReactNode }) {
    const locale = useLocale()
    const dir = locale === "ar" ? "rtl" : "ltr"

    return (
        <DirectionProvider dir={dir}>
            <ConvexClientProvider>
                <ProjectProvider>
                    {children}
                    <Toaster position="top-right" richColors closeButton duration={10000} theme="light" dir={dir} />
                </ProjectProvider>
            </ConvexClientProvider>
        </DirectionProvider>
    )
}
