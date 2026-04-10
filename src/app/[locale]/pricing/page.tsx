import type { Metadata } from "next"
import { PricingTable } from "@/components/pricing/PricingTable"
import { PricingJsonLd } from "@/components/seo/PricingJsonLd"
import { setRequestLocale as unstable_setRequestLocale } from "next-intl/server"

export async function generateMetadata(): Promise<Metadata> {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://yoosr.co";
    const ogUrl = `${baseUrl}/og/image?title=Pricing&description=Simple,%20transparent%20pricing%20for%20teams%20of%20all%20sizes`;
    return {
        title: "Pricing — Yoosr",
        description: "Simple, transparent pricing for teams of all sizes.",
        openGraph: {
            images: [{ url: ogUrl, width: 1200, height: 630, alt: "Yoosr Pricing" }],
        },
        twitter: {
            images: [ogUrl],
        },
    }
}

export default async function PricingPage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    unstable_setRequestLocale(locale);
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://yoosr.co";

    // Plan data matching the pricing table for structured data
    const plans = [
        { name: "Free", description: "Get started with basic AI support", monthlyPrice: 0, yearlyPrice: 0, features: ["100 conversations/mo", "Basic bot builder", "Email support"] },
        { name: "Starter", description: "For growing teams", monthlyPrice: 29, yearlyPrice: 290, features: ["1,000 conversations/mo", "Full bot builder", "Knowledge base", "Priority support"] },
        { name: "Pro", description: "For scaling businesses", monthlyPrice: 99, yearlyPrice: 990, features: ["Unlimited conversations", "Advanced analytics", "All integrations", "Dedicated support"] },
        { name: "Enterprise", description: "Custom solutions", monthlyPrice: null, yearlyPrice: null, features: ["Custom SLA", "On-premise deployment", "White label", "Custom integrations"] },
    ];

    return (
        <div className="container py-20 relative overflow-hidden">
            <PricingJsonLd plans={plans} siteUrl={siteUrl} />
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