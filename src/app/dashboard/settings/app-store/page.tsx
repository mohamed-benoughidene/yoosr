"use client"

import { useProject } from "@/context/ProjectContext"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { useState } from "react"
import {
    Search,
    Lock,
    Check,
    ArrowRight,
} from "lucide-react"
import { useQuery } from "convex/react"
import { api } from "../../../../../convex/_generated/api"

const CATEGORIES = ["All", "AI", "Channels", "Analytics", "CRM", "Productivity"] as const

type Category = (typeof CATEGORIES)[number]

interface AppItem {
    id: string
    name: string
    description: string
    icon: string
    color: string
    category: Category
    locked: boolean
    integrationId?: string
}

const APPS: AppItem[] = [
    { id: "openai", name: "OpenAI", description: "GPT models for AI-powered conversations and auto-replies.", icon: "✦", color: "bg-emerald-100 text-emerald-700", category: "AI", locked: false, integrationId: "openai" },
    { id: "gemini", name: "Google Gemini", description: "Google's AI models for intelligent, context-aware responses.", icon: "◆", color: "bg-blue-100 text-blue-700", category: "AI", locked: false, integrationId: "gemini" },
    { id: "anthropic", name: "Anthropic", description: "Claude models for safe, nuanced AI assistance.", icon: "◇", color: "bg-amber-100 text-amber-700", category: "AI", locked: false, integrationId: "anthropic" },
    { id: "deepseek", name: "DeepSeek", description: "Advanced reasoning models for complex queries.", icon: "🔮", color: "bg-violet-100 text-violet-700", category: "AI", locked: false, integrationId: "deepseek" },
    { id: "openrouter", name: "OpenRouter", description: "Unified API gateway for 100+ AI models.", icon: "🔀", color: "bg-pink-100 text-pink-700", category: "AI", locked: false, integrationId: "openrouter" },
    { id: "telegram", name: "Telegram", description: "Receive and reply to messages from Telegram bots.", icon: "✈", color: "bg-sky-100 text-sky-700", category: "Channels", locked: false, integrationId: "telegram" },
    { id: "messenger", name: "Messenger", description: "Connect Facebook Messenger to your inbox.", icon: "💬", color: "bg-indigo-100 text-indigo-700", category: "Channels", locked: true, integrationId: "messenger" },
    { id: "instagram", name: "Instagram", description: "Handle Instagram DMs from your dashboard.", icon: "📸", color: "bg-fuchsia-100 text-fuchsia-700", category: "Channels", locked: true, integrationId: "instagram" },
    { id: "twilio", name: "Twilio SMS", description: "Send and receive SMS messages via Twilio.", icon: "📞", color: "bg-red-100 text-red-700", category: "Channels", locked: true, integrationId: "twilio" },
    { id: "google-analytics", name: "Google Analytics", description: "Track visitor behavior and chat engagement metrics.", icon: "📊", color: "bg-orange-100 text-orange-700", category: "Analytics", locked: true },
    { id: "mixpanel", name: "Mixpanel", description: "Product analytics for user engagement tracking.", icon: "📈", color: "bg-purple-100 text-purple-700", category: "Analytics", locked: true },
    { id: "hubspot", name: "HubSpot", description: "Sync contacts and conversations with HubSpot CRM.", icon: "🔶", color: "bg-orange-100 text-orange-700", category: "CRM", locked: true },
    { id: "salesforce", name: "Salesforce", description: "Create leads and cases from conversations.", icon: "☁️", color: "bg-blue-100 text-blue-700", category: "CRM", locked: true },
    { id: "slack", name: "Slack", description: "Get notifications and reply from Slack channels.", icon: "💼", color: "bg-green-100 text-green-700", category: "Productivity", locked: true },
    { id: "zapier", name: "Zapier", description: "Automate workflows with 5,000+ apps.", icon: "⚡", color: "bg-amber-100 text-amber-700", category: "Productivity", locked: true },
]

export default function AppStorePage() {
    const { activeProject } = useProject()
    const [search, setSearch] = useState("")
    const [category, setCategory] = useState<Category>("All")

    const integrations = useQuery(api.integrations.list, activeProject ? { projectId: activeProject._id } : "skip")

    const installedProviders = new Set<string>()
        ; (integrations ?? []).forEach((row: any) => {
            if (row.enabled) installedProviders.add(row.provider)
        })

    const filtered = APPS.filter((app) => {
        const matchesCategory = category === "All" || app.category === category
        const matchesSearch =
            !search ||
            app.name.toLowerCase().includes(search.toLowerCase()) ||
            app.description.toLowerCase().includes(search.toLowerCase())
        return matchesCategory && matchesSearch
    })

    const getStatus = (app: AppItem) => {
        if (app.locked) return "upgrade"
        if (app.integrationId && installedProviders.has(app.integrationId))
            return "installed"
        return "install"
    }

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-medium">App Store</h3>
                <p className="text-sm text-muted-foreground">
                    Browse and install extensions for your project.
                </p>
            </div>
            <Separator />

            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search apps..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-9"
                    />
                </div>
                <div className="flex gap-1.5 flex-wrap">
                    {CATEGORIES.map((cat) => (
                        <Button
                            key={cat}
                            variant={category === cat ? "default" : "outline"}
                            size="sm"
                            className="h-8 text-xs"
                            onClick={() => setCategory(cat)}
                        >
                            {cat}
                        </Button>
                    ))}
                </div>
            </div>

            {integrations === undefined ? (
                <div className="text-center py-12 text-muted-foreground">
                    Loading...
                </div>
            ) : filtered.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                    <p className="text-sm">No apps found matching your search.</p>
                </div>
            ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {filtered.map((app) => {
                        const status = getStatus(app)
                        return (
                            <Card
                                key={app.id}
                                className="p-4 flex flex-col justify-between group hover:shadow-md transition-shadow"
                            >
                                <div>
                                    <div className="flex items-start gap-3 mb-3">
                                        <span
                                            className={`inline-flex items-center justify-center h-11 w-11 rounded-xl text-lg ${app.color}`}
                                        >
                                            {app.icon}
                                        </span>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <p className="text-sm font-semibold truncate">
                                                    {app.name}
                                                </p>
                                                <Badge
                                                    variant="secondary"
                                                    className="text-[10px] px-1.5 py-0 h-4 shrink-0"
                                                >
                                                    {app.category}
                                                </Badge>
                                            </div>
                                            <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                                                {app.description}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-2">
                                    {status === "installed" ? (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="w-full h-8 text-xs text-green-700 border-green-200 bg-green-50 hover:bg-green-100"
                                            onClick={() =>
                                                (window.location.href = `/dashboard/settings/integrations`)
                                            }
                                        >
                                            <Check className="mr-1.5 h-3.5 w-3.5" />
                                            Installed — Configure
                                        </Button>
                                    ) : status === "upgrade" ? (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="w-full h-8 text-xs text-orange-700 border-orange-200 bg-orange-50 hover:bg-orange-100"
                                            disabled
                                        >
                                            <Lock className="mr-1.5 h-3.5 w-3.5" />
                                            Upgrade to Pro
                                        </Button>
                                    ) : (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="w-full h-8 text-xs"
                                            onClick={() =>
                                                (window.location.href = `/dashboard/settings/integrations`)
                                            }
                                        >
                                            <ArrowRight className="mr-1.5 h-3.5 w-3.5" />
                                            Install
                                        </Button>
                                    )}
                                </div>
                            </Card>
                        )
                    })}
                </div>
            )}
        </div>
    )
}
