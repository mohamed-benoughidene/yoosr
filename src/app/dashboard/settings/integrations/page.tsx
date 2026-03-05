"use client"

import { useProject } from "@/context/ProjectContext"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { useState } from "react"
import { toast } from "sonner"
import { Sparkles, Lock, ChevronRight, ArrowLeft, Save, MessageCircle } from "lucide-react"
import { useQuery, useMutation } from "convex/react"
import { api } from "../../../../../convex/_generated/api"

const INTEGRATIONS = [
    { id: "openai", name: "OpenAI", description: "GPT models for AI-powered conversations", category: "ai", icon: "✦", color: "bg-emerald-100 text-emerald-700", locked: false, fields: [{ key: "api_key", label: "API Key", type: "password", placeholder: "sk-..." }, { key: "model", label: "Model", type: "text", placeholder: "gpt-4o" }], instructions: "Get your API key from platform.openai.com." },
    { id: "gemini", name: "Google Gemini", description: "Google's AI models", category: "ai", icon: "◆", color: "bg-blue-100 text-blue-700", locked: false, fields: [{ key: "api_key", label: "API Key", type: "password", placeholder: "AIza..." }, { key: "model", label: "Model", type: "text", placeholder: "gemini-2.0-flash" }], instructions: "Get your API key from Google AI Studio." },
    { id: "anthropic", name: "Anthropic", description: "Claude models for safe, helpful AI", category: "ai", icon: "◇", color: "bg-amber-100 text-amber-700", locked: false, fields: [{ key: "api_key", label: "API Key", type: "password", placeholder: "sk-ant-..." }, { key: "model", label: "Model", type: "text", placeholder: "claude-sonnet-4-20250514" }], instructions: "Get your API key from console.anthropic.com." },
    { id: "deepseek", name: "DeepSeek", description: "DeepSeek models for advanced reasoning", category: "ai", icon: "🔮", color: "bg-violet-100 text-violet-700", locked: false, fields: [{ key: "api_key", label: "API Key", type: "password", placeholder: "sk-..." }, { key: "model", label: "Model", type: "text", placeholder: "deepseek-chat" }], instructions: "Get your API key from platform.deepseek.com." },
    { id: "openrouter", name: "OpenRouter", description: "Unified API for 100+ AI models", category: "ai", icon: "🔀", color: "bg-pink-100 text-pink-700", locked: false, fields: [{ key: "api_key", label: "API Key", type: "password", placeholder: "sk-or-..." }, { key: "model", label: "Model", type: "text", placeholder: "openai/gpt-4o" }], instructions: "Get your API key from openrouter.ai/keys." },
    { id: "telegram", name: "Telegram", description: "Connect your Telegram bot", category: "channel", icon: "✈", color: "bg-sky-100 text-sky-700", locked: false, fields: [{ key: "bot_token", label: "Bot Token", type: "password", placeholder: "123456:ABC-DEF..." }], instructions: "Create a bot via @BotFather on Telegram." },
    { id: "messenger", name: "Messenger", description: "Facebook Messenger via Meta Graph API", category: "channel", icon: "💬", color: "bg-indigo-100 text-indigo-700", locked: false, fields: [{ key: "page_id", label: "Page ID", type: "text", placeholder: "Page ID" }, { key: "access_token", label: "Access Token", type: "password", placeholder: "EAA..." }], instructions: "Create an app at developers.facebook.com." },
    { id: "instagram", name: "Instagram", description: "Instagram DMs via Meta Graph API", category: "channel", icon: "📸", color: "bg-fuchsia-100 text-fuchsia-700", locked: false, fields: [{ key: "page_id", label: "Account ID", type: "text", placeholder: "Account ID" }, { key: "access_token", label: "Access Token", type: "password", placeholder: "EAA..." }], instructions: "Connect your Professional Account." },
    { id: "twilio", name: "Twilio SMS", description: "SMS messaging via Twilio", category: "channel", icon: "📞", color: "bg-red-100 text-red-700", locked: true, fields: [{ key: "account_sid", label: "Account SID", type: "text", placeholder: "AC..." }, { key: "auth_token", label: "Auth Token", type: "password", placeholder: "Token" }], instructions: "Get credentials from console.twilio.com." },
] as const

type IntegrationDef = (typeof INTEGRATIONS)[number]

export default function IntegrationsPage() {
    const { activeProject } = useProject()
    const [activeConfig, setActiveConfig] = useState<IntegrationDef | null>(null)
    const [formValues, setFormValues] = useState<Record<string, string>>({})
    const [formEnabled, setFormEnabled] = useState(false)
    const [saving, setSaving] = useState(false)

    const integrations = useQuery(api.integrations.list, activeProject ? { projectId: activeProject._id } : "skip")
    const upsertIntegration = useMutation(api.integrations.upsert)

    const savedMap: Record<string, any> = {}
        ; (integrations ?? []).forEach((row: any) => { savedMap[row.provider] = row })

    const openConfig = (integration: IntegrationDef) => {
        if (integration.locked) return
        setActiveConfig(integration)
        const saved = savedMap[integration.id]
        if (saved) { setFormValues(saved.credentials || {}); setFormEnabled(saved.enabled || false) }
        else { const d: Record<string, string> = {}; integration.fields.forEach(f => d[f.key] = ""); setFormValues(d); setFormEnabled(false) }
    }

    const handleSave = async () => {
        if (!activeProject || !activeConfig) return
        setSaving(true)
        try {
            await upsertIntegration({ projectId: activeProject._id, provider: activeConfig.id, credentials: formValues, enabled: formEnabled })
            toast.success(`${activeConfig.name} integration saved`)
        } catch { toast.error("Failed to save integration") }
        setSaving(false)
    }

    if (activeConfig) {
        return (
            <div className="space-y-6">
                <div className="flex items-center gap-3">
                    <Button variant="ghost" size="icon" onClick={() => setActiveConfig(null)} className="h-8 w-8"><ArrowLeft className="h-4 w-4" /></Button>
                    <div>
                        <h3 className="text-lg font-medium flex items-center gap-2">
                            <span className={`inline-flex items-center justify-center h-8 w-8 rounded-lg text-sm ${activeConfig.color}`}>{activeConfig.icon}</span>
                            {activeConfig.name}
                        </h3>
                        <p className="text-sm text-muted-foreground">{activeConfig.description}</p>
                    </div>
                </div>
                <Separator />
                <Card className="p-5">
                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <Label className="text-sm font-medium">Enable {activeConfig.name}</Label>
                            <p className="text-xs text-muted-foreground">Toggle this integration on or off.</p>
                        </div>
                        <Switch checked={formEnabled} onCheckedChange={setFormEnabled} />
                    </div>
                </Card>
                <Card className="p-5 space-y-4">
                    <h4 className="text-sm font-medium">Credentials</h4>
                    {activeConfig.fields.map(field => (
                        <div key={field.key} className="grid gap-1.5">
                            <Label htmlFor={field.key} className="text-sm">{field.label}</Label>
                            <Input id={field.key} type={field.type} placeholder={field.placeholder} value={formValues[field.key] || ""} onChange={e => setFormValues(prev => ({ ...prev, [field.key]: e.target.value }))} />
                        </div>
                    ))}
                </Card>
                {activeConfig.instructions && (
                    <Card className="p-5 bg-muted/30">
                        <h4 className="text-sm font-medium mb-2">Setup Instructions</h4>
                        <p className="text-sm text-muted-foreground">{activeConfig.instructions}</p>
                    </Card>
                )}
                <div className="flex justify-end">
                    <Button onClick={handleSave} disabled={saving}><Save className="mr-2 h-4 w-4" />{saving ? "Saving..." : "Save Configuration"}</Button>
                </div>
            </div>
        )
    }

    const ai = INTEGRATIONS.filter(i => i.category === "ai")
    const channels = INTEGRATIONS.filter(i => i.category === "channel")

    const renderCard = (integration: IntegrationDef) => {
        const saved = savedMap[integration.id]
        return (
            <Card key={integration.id} className={`p-4 relative group transition-shadow ${integration.locked ? "opacity-70 cursor-not-allowed" : "cursor-pointer hover:shadow-md"}`} onClick={() => openConfig(integration)}>
                {integration.locked && <div className="absolute top-3 right-3"><span className="inline-flex items-center text-xs font-medium text-orange-700 bg-orange-100 px-2 py-0.5 rounded-full"><Lock className="h-3 w-3 mr-1" />Pro</span></div>}
                <div className="flex items-start gap-3">
                    <span className={`inline-flex items-center justify-center h-10 w-10 rounded-lg text-lg ${integration.color}`}>{integration.icon}</span>
                    <div>
                        <p className="text-sm font-medium">{integration.name}</p>
                        <p className="text-xs text-muted-foreground">{integration.description}</p>
                    </div>
                    {!integration.locked && <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity mt-1 ml-auto" />}
                </div>
                {saved?.enabled && <div className="mt-3"><span className="inline-flex items-center text-xs font-medium text-green-700 bg-green-100 px-2 py-0.5 rounded-full"><span className="h-1.5 w-1.5 rounded-full bg-green-500 mr-1" />Connected</span></div>}
            </Card>
        )
    }

    return (
        <div className="space-y-6">
            <div><h3 className="text-lg font-medium">Integrations</h3><p className="text-sm text-muted-foreground">Connect AI providers and messaging channels.</p></div>
            <Separator />
            <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2"><Sparkles className="h-4 w-4" />AI Providers</h4>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{ai.map(renderCard)}</div>
            </div>
            <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2"><MessageCircle className="h-4 w-4" />Channels</h4>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{channels.map(renderCard)}</div>
            </div>
        </div>
    )
}
