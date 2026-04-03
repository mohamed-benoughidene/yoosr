import type { Metadata } from "next"
import { SignupClient } from "./SignupClient"
import { setRequestLocale as unstable_setRequestLocale } from "next-intl/server"

export const metadata: Metadata = {
    title: "Get Started — Yoosr",
    description: "Create your Yoosr account and start managing customer support in minutes."
}

export const dynamic = "force-dynamic";

export default async function SignupPage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    unstable_setRequestLocale(locale);
    return <SignupClient />
}
