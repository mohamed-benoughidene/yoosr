import type { Metadata } from "next"
import { PricingTable } from "@/components/pricing/PricingTable"

export const metadata: Metadata = {
    title: "Pricing — Yoosr",
    description: "Simple, transparent pricing for teams of all sizes."
}

export default function PricingPage() {
    return (
        <div className="container">
            <PricingTable />
        </div>
    )
}
