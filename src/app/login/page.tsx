import type { Metadata } from "next"
import { LoginClient } from "./LoginClient"

export const metadata: Metadata = {
    title: "Sign In — Yoosr",
    description: "Sign in to your Yoosr account to manage customer conversations."
}

export default function LoginPage() {
    return <LoginClient />
}

