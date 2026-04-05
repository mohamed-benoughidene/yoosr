"use client"

import { ErrorBoundary as ReactErrorBoundary, type FallbackProps } from "react-error-boundary"
import { Button } from "@/components/ui/button"
import { AlertTriangle, RefreshCw } from "lucide-react"

function ErrorFallback({ error, resetErrorBoundary }: FallbackProps) {
    return (
        <div className="flex min-h-[200px] flex-col items-center justify-center gap-4 rounded-lg border border-destructive/20 bg-destructive/5 p-6 text-center">
            <AlertTriangle className="size-8 text-destructive" />
            <div className="space-y-1">
                <h3 className="font-medium text-destructive">Something went wrong</h3>
                <p className="text-sm text-muted-foreground">
                    {error instanceof Error ? error.message : "An unexpected error occurred"}
                </p>
            </div>
            <div className="flex gap-2">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={resetErrorBoundary}
                >
                    <RefreshCw className="mr-1 size-3" />
                    Try again
                </Button>
            </div>
        </div>
    )
}

interface AppErrorBoundaryProps {
    children: React.ReactNode
}

export function AppErrorBoundary({ children }: AppErrorBoundaryProps) {
    return (
        <ReactErrorBoundary
            FallbackComponent={ErrorFallback}
            onReset={() => {
                // Optional: could add analytics tracking here
            }}
        >
            {children}
        </ReactErrorBoundary>
    )
}
