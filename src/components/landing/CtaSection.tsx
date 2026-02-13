import Link from "next/link"
import { Button } from "@/components/ui/button"

export function CtaSection() {
    return (
        <section className="container py-24 lg:py-32">
            <div className="relative rounded-3xl bg-primary px-6 py-16 md:px-12 lg:px-24 overflow-hidden text-center text-primary-foreground shadow-2xl">
                <div className="relative z-10 max-w-3xl mx-auto">
                    <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl mb-6">
                        Ready to automate your customer support?
                    </h2>
                    <p className="text-lg md:text-xl text-primary-foreground/90 mb-10 max-w-2xl mx-auto leading-relaxed">
                        Join thousands of businesses using Yoosr to build AI agents and improve customer satisfaction.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Button size="lg" variant="secondary" className="h-14 px-8 text-lg font-semibold text-primary" asChild>
                            <Link href="/signup">Start Free Trial</Link>
                        </Button>
                        <Button size="lg" variant="outline" className="h-14 px-8 text-lg font-medium bg-transparent border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary" asChild>
                            <Link href="/demo">Contact Sales</Link>
                        </Button>
                    </div>
                </div>

                {/* Background Pattern */}
                <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
                    <svg className="h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                        <path d="M0 100 C 20 0 50 0 100 100 Z" fill="currentColor" />
                    </svg>
                </div>
            </div>
        </section>
    )
}
