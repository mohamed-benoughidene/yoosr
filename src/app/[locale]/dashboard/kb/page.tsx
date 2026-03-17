"use client"

import { redirect } from "next/navigation"

export default function KnowledgeBasePage() {
    // Auto-redirect to the default KB for better UX
    redirect("/dashboard/kb/default")
}
