import type { Metadata } from "next"
import { OnboardingClient } from "./OnboardingClient"

export const metadata: Metadata = {
    title: "Set Up Your Workspace — Yoosr",
    description: "Configure your Yoosr workspace to get started."
}

export default function OnboardingPage() {
    return <OnboardingClient />
}

