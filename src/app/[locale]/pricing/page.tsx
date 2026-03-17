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
        <div className="container">
            <PricingTable />
        </div>
    )
}