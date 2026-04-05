"use client"

import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function KnowledgeBasePage() {
    // Auto-redirect to the default KB for better UX
    // Uses next/navigation because this is a simple client-side redirect
    const router = useRouter()
    useEffect(() => {
        router.replace("/dashboard/kb/default")
    }, [router])
    return null
}
