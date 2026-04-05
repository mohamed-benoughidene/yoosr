"use client"

import {
    ResizableHandle,
    ResizablePanel,
    ResizablePanelGroup,
} from "@/components/ui/resizable"
import { AppErrorBoundary } from "@/components/error-boundary"
import { Suspense } from "react"
import { Loader2 } from "lucide-react"

interface ThreePanelLayoutProps {
    /** Left panel content (e.g., list/sidebar) */
    leftPanel: React.ReactNode
    /** Main center panel content */
    mainPanel: React.ReactNode
    /** Right panel content (e.g., details/info) */
    rightPanel: React.ReactNode
    /** Left panel size percentage */
    leftPanelSize?: { default?: number; min?: number; max?: number }
    /** Main panel size percentage */
    mainPanelSize?: { default?: number; min?: number; max?: number }
    /** Right panel size percentage */
    rightPanelSize?: { default?: number; min?: number; max?: number }
    /** Loading fallback for panels */
    loadingFallback?: React.ReactNode
    /** Auto-save ID for layout persistence */
    autoSaveId?: string
    /** Height override */
    height?: string
}

const defaultLoading = (
    <div className="flex h-full items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
    </div>
)

export function ThreePanelLayout({
    leftPanel,
    mainPanel,
    rightPanel,
    leftPanelSize = { default: 20, min: 15, max: 30 },
    mainPanelSize = { default: 55, min: 30 },
    rightPanelSize = { default: 25, min: 20, max: 40 },
    loadingFallback = defaultLoading,
    autoSaveId,
    height = "h-[calc(100vh-64px)]",
}: ThreePanelLayoutProps) {
    return (
        <div className={`${height} w-full border rounded-lg bg-background overflow-hidden`}>
            <div className="hidden lg:flex h-full w-full">
                <AppErrorBoundary>
                    <ResizablePanelGroup
                        direction="horizontal"
                        autoSaveId={autoSaveId}
                        className="h-full items-stretch"
                    >
                        <ResizablePanel
                            defaultSize={leftPanelSize.default}
                            minSize={leftPanelSize.min}
                            maxSize={leftPanelSize.max}
                        >
                            <Suspense fallback={loadingFallback}>{leftPanel}</Suspense>
                        </ResizablePanel>

                        <ResizableHandle />

                        <ResizablePanel
                            defaultSize={mainPanelSize.default}
                            minSize={mainPanelSize.min}
                            maxSize={mainPanelSize.max}
                        >
                            {mainPanel}
                        </ResizablePanel>

                        <ResizableHandle />

                        <ResizablePanel
                            defaultSize={rightPanelSize.default}
                            minSize={rightPanelSize.min}
                            maxSize={rightPanelSize.max}
                        >
                            <Suspense fallback={loadingFallback}>{rightPanel}</Suspense>
                        </ResizablePanel>
                    </ResizablePanelGroup>
                </AppErrorBoundary>
            </div>
        </div>
    )
}
