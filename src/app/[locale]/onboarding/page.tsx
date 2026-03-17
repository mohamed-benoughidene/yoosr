import type { Metadata } from "next"
import { OnboardingClient } from "./OnboardingClient"
import { setRequestLocale as unstable_setRequestLocale } from "next-intl/server"

export const metadata: Metadata = {
    title: "Set Up Your Workspace — Yoosr",
    description: "Configure your Yoosr workspace to get started."
}

export default async function OnboardingPage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    unstable_setRequestLocale(locale);
    return <OnboardingClient />
}
