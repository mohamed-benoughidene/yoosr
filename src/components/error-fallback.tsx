"use client"

import Link from "next/link"
import { AlertCircle, RotateCcw, Home } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ErrorFallbackProps {
    message?: string
    reset: () => void
    homeHref: string
}

export function ErrorFallback({ message, reset, homeHref }: ErrorFallbackProps) {
    return (
        <div className="flex min-h-[400px] w-full flex-col items-center justify-center rounded-xl border border-border bg-card p-8 text-center shadow-lg animate-in fade-in zoom-in duration-300">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-destructive/15 text-destructive mb-6 ring-8 ring-destructive/5">
                <AlertCircle className="h-8 w-8" />
            </div>
            
            <h2 className="text-2xl font-bold tracking-tight text-foreground mb-3">
                {message || "Something went wrong"}
            </h2>
            
            <p className="text-muted-foreground mb-8 max-w-[350px] leading-relaxed">
                An unexpected error occurred while processing your request. 
                You can try to refresh the page or return to safety.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                <Button 
                    onClick={reset} 
                    variant="default" 
                    size="lg"
                    className="gap-2 px-8 font-semibold shadow-sm transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                    <RotateCcw className="h-4 w-4" />
                    Try again
                </Button>
                
                <Button 
                    variant="outline" 
                    size="lg"
                    asChild 
                    className="gap-2 px-8 font-semibold transition-all hover:bg-accent hover:text-accent-foreground hover:scale-[1.02] active:scale-[0.98]"
                >
                    <Link href={homeHref}>
                        <Home className="h-4 w-4" />
                        Go home
                    </Link>
                </Button>
            </div>
        </div>
    )
}
