import type { Metadata } from "next"
import { OnboardingClient } from "./OnboardingClient"
import { setRequestLocale as unstable_setRequestLocale } from "next-intl/server"

export const metadata: Metadata = {
    title: "Set Up Your Workspace",
    description: "Configure your Yoosr workspace to get started."
}

export const dynamic = "force-dynamic";

export default async function OnboardingPage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    unstable_setRequestLocale(locale);
    return <OnboardingClient />
}
