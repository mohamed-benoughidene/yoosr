import type { Metadata } from "next"
import { SignupClient } from "./SignupClient"

export const metadata: Metadata = {
    title: "Get Started — Yoosr",
    description: "Create your Yoosr account and start managing customer support in minutes."
}

export default function SignupPage() {
    return <SignupClient />
}
