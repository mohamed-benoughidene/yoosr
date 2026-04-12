import type { Metadata } from "next"
import { WaitlistClient } from "./WaitlistClient"
import { setRequestLocale as unstable_setRequestLocale } from "next-intl/server"

export const metadata: Metadata = {
    title: "Join Waitlist",
    description: "Get early access to Yoosr's AI-powered omnichannel inbox."
}

export const dynamic = "force-dynamic";

export default async function WaitlistPage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    unstable_setRequestLocale(locale);
    return <WaitlistClient />
}
