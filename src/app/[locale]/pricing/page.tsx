import type { Metadata } from "next"
import { PricingTable } from "@/components/pricing/PricingTable"
import { setRequestLocale as unstable_setRequestLocale } from "next-intl/server"

export const metadata: Metadata = {
    title: "Pricing — Yoosr",
    description: "Simple, transparent pricing for teams of all sizes."
}

export default async function PricingPage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    unstable_setRequestLocale(locale);
    return (
        <div className="container py-20 relative overflow-hidden">
            <div className="absolute inset-0 z-10 bg-background/10 backdrop-blur-[1px] flex items-center justify-center pointer-events-none">
                <div className="bg-background/80 backdrop-blur-md border border-border shadow-2xl px-6 py-3 rounded-full flex items-center gap-3 animate-in fade-in zoom-in duration-1000">
                    <span className="relative flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-20"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
                    </span>
                    <span className="text-sm font-semibold tracking-tight uppercase">Early Access — Plans Coming Soon</span>
                </div>
            </div>
            <div className="grayscale-[0.8] opacity-30 pointer-events-none">
                <PricingTable />
            </div>
        </div>
    )
}