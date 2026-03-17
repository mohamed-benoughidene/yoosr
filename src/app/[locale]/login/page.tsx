import type { Metadata } from "next"
import { LoginClient } from "./LoginClient"
import { setRequestLocale as unstable_setRequestLocale } from "next-intl/server"

export const metadata: Metadata = {
    title: "Sign In — Yoosr",
    description: "Sign in to your Yoosr account to manage customer conversations."
}

export default async function LoginPage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    unstable_setRequestLocale(locale);
    return <LoginClient />
}
