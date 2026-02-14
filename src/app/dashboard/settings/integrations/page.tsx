"use client"

import { useProject } from "@/context/ProjectContext"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { createClient } from "@/lib/supabase/client"
import { useState, useEffect } from "react"
import { toast } from "sonner"
import {
    Bot,
    MessageCircle,
    Phone,
    Send,
    Sparkles,
    Lock,
    ChevronRight,
    ArrowLeft,
    Save,
    ExternalLink,
} from "lucide-react"

// Integration definitions
const INTEGRATIONS = [
    {
        id: "openai",
        name: "OpenAI",
        description: "GPT models for AI-powered conversations",
        category: "ai",
        icon: "✦",
        color: "bg-emerald-100 text-emerald-700",
        locked: false,
        fields: [
            { key: "api_key", label: "API Key", type: "password", placeholder: "sk-..." },
            { key: "model", label: "Model", type: "text", placeholder: "gpt-4o" },
        ],
        instructions: "Get your API key from [platform.openai.com](https://platform.openai.com/api-keys).",
    },
    {
        id: "gemini",
        name: "Google Gemini",
        description: "Google's AI models for intelligent responses",
        category: "ai",
        icon: "◆",
        color: "bg-blue-100 text-blue-700",
        locked: false,
        fields: [
            { key: "api_key", label: "API Key", type: "password", placeholder: "AIza..." },
            { key: "model", label: "Model", type: "text", placeholder: "gemini-2.0-flash" },
        ],
        instructions: "Get your API key from [Google AI Studio](https://aistudio.google.com/apikey).",
    },
    {
        id: "anthropic",
        name: "Anthropic",
        description: "Claude models for safe, helpful AI",
        category: "ai",
        icon: "◇",
        color: "bg-amber-100 text-amber-700",
        locked: false,
        fields: [
            { key: "api_key", label: "API Key", type: "password", placeholder: "sk-ant-..." },
            { key: "model", label: "Model", type: "text", placeholder: "claude-sonnet-4-20250514" },
        ],
        instructions: "Get your API key from [console.anthropic.com](https://console.anthropic.com/).",
    },
    {
        id: "deepseek",
        name: "DeepSeek",
        description: "DeepSeek models for advanced reasoning",
        category: "ai",
        icon: "🔮",
        color: "bg-violet-100 text-violet-700",
        locked: false,
        fields: [
            { key: "api_key", label: "API Key", type: "password", placeholder: "sk-..." },
            { key: "model", label: "Model", type: "text", placeholder: "deepseek-chat" },
        ],
        instructions: "Get your API key from [platform.deepseek.com](https://platform.deepseek.com/api_keys).",
    },
    {
        id: "openrouter",
        name: "OpenRouter",
        description: "Unified API for 100+ AI models",
        category: "ai",
        icon: "🔀",
        color: "bg-pink-100 text-pink-700",
        locked: false,
        fields: [
            { key: "api_key", label: "API Key", type: "password", placeholder: "sk-or-..." },
            { key: "model", label: "Model", type: "text", placeholder: "openai/gpt-4o" },
        ],
        instructions: "Get your API key from [openrouter.ai/keys](https://openrouter.ai/keys). Browse available models at [openrouter.ai/models](https://openrouter.ai/models).",
    },
    {
        id: "telegram",
        name: "Telegram",
        description: "Connect your Telegram bot to receive messages",
        category: "channel",
        icon: "✈",
        color: "bg-sky-100 text-sky-700",
        locked: false,
        fields: [
            { key: "bot_token", label: "Bot Token", type: "password", placeholder: "123456:ABC-DEF..." },
        ],
        instructions: "1. Open Telegram and search for **@BotFather**.\n2. Send `/newbot` and follow the prompts.\n3. Copy the bot token and paste it here.\n4. Set the webhook URL to your project's webhook endpoint.",
    },
    {
        id: "messenger",
        name: "Messenger",
        description: "Facebook Messenger via Meta Graph API",
        category: "channel",
        icon: "💬",
        color: "bg-indigo-100 text-indigo-700",
        locked: true,
        fields: [
            { key: "page_id", label: "Page ID", type: "text", placeholder: "Your Facebook Page ID" },
            { key: "access_token", label: "Page Access Token", type: "password", placeholder: "EAA..." },
            { key: "app_secret", label: "App Secret", type: "password", placeholder: "Your app secret" },
            { key: "verify_token", label: "Verify Token", type: "text", placeholder: "Custom verify token" },
        ],
        instructions: "1. Create an app at [developers.facebook.com](https://developers.facebook.com/).\n2. Add the Messenger product and subscribe to your Page.\n3. Copy the Page ID, Access Token, and App Secret here.\n4. Set the webhook URL and Verify Token.",
    },
    {
        id: "instagram",
        name: "Instagram",
        description: "Instagram DMs via Meta Graph API",
        category: "channel",
        icon: "📸",
        color: "bg-fuchsia-100 text-fuchsia-700",
        locked: true,
        fields: [
            { key: "page_id", label: "Instagram Account ID", type: "text", placeholder: "Your Instagram Professional Account ID" },
            { key: "access_token", label: "Page Access Token", type: "password", placeholder: "EAA..." },
            { key: "app_secret", label: "App Secret", type: "password", placeholder: "Your app secret" },
            { key: "verify_token", label: "Verify Token", type: "text", placeholder: "Custom verify token" },
        ],
        instructions: "1. Create an app at [developers.facebook.com](https://developers.facebook.com/).\n2. Add the Instagram product and connect your Professional Account.\n3. Copy the Account ID, Access Token, and App Secret here.\n4. Set the webhook URL and Verify Token.",
    },
    {
        id: "twilio",
        name: "Twilio SMS",
        description: "SMS messaging via Twilio",
        category: "channel",
        icon: "📞",
        color: "bg-red-100 text-red-700",
        locked: true,
        fields: [
            { key: "account_sid", label: "Account SID", type: "text", placeholder: "AC..." },
            { key: "auth_token", label: "Auth Token", type: "password", placeholder: "Your auth token" },
            { key: "phone_number", label: "Phone Number", type: "text", placeholder: "+1234567890" },
        ],
        instructions: "Get credentials from [Twilio Console](https://console.twilio.com/).",
    },
]

type IntegrationDef = (typeof INTEGRATIONS)[number]

export default function IntegrationsPage() {
    const { activeProject } = useProject()
    const [savedIntegrations, setSavedIntegrations] = useState<Record<string, any>>({})
    const [loading, setLoading] = useState(true)
    const [activeConfig, setActiveConfig] = useState<IntegrationDef | null>(null)
    const [formValues, setFormValues] = useState<Record<string, string>>({})
    const [formEnabled, setFormEnabled] = useState(false)
    const [saving, setSaving] = useState(false)

    const fetchIntegrations = async () => {
        if (!activeProject) return
        const supabase = createClient()
        const { data } = await supabase
            .from("integrations")
            .select("*")
            .eq("project_id", activeProject.id)

        if (data) {
            const map: Record<string, any> = {}
            data.forEach((row: any) => {
                map[row.provider] = row
            })
            setSavedIntegrations(map)
        }
        setLoading(false)
    }

    useEffect(() => {
        fetchIntegrations()
    }, [activeProject])

    const openConfig = (integration: IntegrationDef) => {
        if (integration.locked) return
        setActiveConfig(integration)
        const saved = savedIntegrations[integration.id]
        if (saved) {
            setFormValues(saved.credentials || {})
            setFormEnabled(saved.enabled || false)
        } else {
            const defaults: Record<string, string> = {}
            integration.fields.forEach((f) => (defaults[f.key] = ""))
            setFormValues(defaults)
            setFormEnabled(false)
        }
    }

    const handleSave = async () => {
        if (!activeProject || !activeConfig) return
        setSaving(true)
        const supabase = createClient()

        const existing = savedIntegrations[activeConfig.id]
        const payload = {
            project_id: activeProject.id,
            provider: activeConfig.id,
            credentials: formValues,
            enabled: formEnabled,
            updated_at: new Date().toISOString(),
        }

        let error
        if (existing) {
            const result = await supabase
                .from("integrations")
                .update(payload)
                .eq("id", existing.id)
            error = result.error
        } else {
            const result = await supabase
                .from("integrations")
                .insert(payload)
            error = result.error
        }

        if (error) {
            toast.error("Failed to save integration")
            console.error(error)
        } else {
            toast.success(`${activeConfig.name} integration saved`)
            fetchIntegrations()
        }
        setSaving(false)
    }

    // Configuration view
    if (activeConfig) {
        return (
            <div className="space-y-6">
                <div className="flex items-center gap-3">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setActiveConfig(null)}
                        className="h-8 w-8"
                    >
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div>
                        <h3 className="text-lg font-medium flex items-center gap-2">
                            <span className={`inline-flex items-center justify-center h-8 w-8 rounded-lg text-sm ${activeConfig.color}`}>
                                {activeConfig.icon}
                            </span>
                            {activeConfig.name}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                            {activeConfig.description}
                        </p>
                    </div>
                </div>
                <Separator />

                {/* Enable toggle */}
                <Card className="p-5">
                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <Label className="text-sm font-medium">
                                Enable {activeConfig.name}
                            </Label>
                            <p className="text-xs text-muted-foreground">
                                Toggle this integration on or off.
                            </p>
                        </div>
                        <Switch
                            checked={formEnabled}
                            onCheckedChange={setFormEnabled}
                        />
                    </div>
                </Card>

                {/* Credential fields */}
                <Card className="p-5 space-y-4">
                    <h4 className="text-sm font-medium">Credentials</h4>
                    {activeConfig.fields.map((field) => (
                        <div key={field.key} className="grid gap-1.5">
                            <Label htmlFor={field.key} className="text-sm">
                                {field.label}
                            </Label>
                            <Input
                                id={field.key}
                                type={field.type}
                                placeholder={field.placeholder}
                                value={formValues[field.key] || ""}
                                onChange={(e) =>
                                    setFormValues((prev) => ({
                                        ...prev,
                                        [field.key]: e.target.value,
                                    }))
                                }
                            />
                        </div>
                    ))}
                </Card>

                {/* Instructions */}
                {activeConfig.instructions && (
                    <Card className="p-5 bg-muted/30">
                        <h4 className="text-sm font-medium mb-2">Setup Instructions</h4>
                        <div className="text-sm text-muted-foreground whitespace-pre-line leading-relaxed">
                            {activeConfig.instructions}
                        </div>
                    </Card>
                )}

                <div className="flex justify-end">
                    <Button onClick={handleSave} disabled={saving}>
                        <Save className="mr-2 h-4 w-4" />
                        {saving ? "Saving..." : "Save Configuration"}
                    </Button>
                </div>
            </div>
        )
    }

    // Grid view
    const aiIntegrations = INTEGRATIONS.filter((i) => i.category === "ai")
    const channelIntegrations = INTEGRATIONS.filter((i) => i.category === "channel")

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-medium">Integrations</h3>
                <p className="text-sm text-muted-foreground">
                    Connect AI providers and messaging channels to your project.
                </p>
            </div>
            <Separator />

            {/* AI Providers */}
            <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
                    <Sparkles className="h-4 w-4" />
                    AI Providers
                </h4>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {aiIntegrations.map((integration) => {
                        const saved = savedIntegrations[integration.id]
                        return (
                            <Card
                                key={integration.id}
                                className="p-4 cursor-pointer hover:shadow-md transition-shadow group relative"
                                onClick={() => openConfig(integration)}
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-3">
                                        <span className={`inline-flex items-center justify-center h-10 w-10 rounded-lg text-lg ${integration.color}`}>
                                            {integration.icon}
                                        </span>
                                        <div>
                                            <p className="text-sm font-medium">
                                                {integration.name}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                {integration.description}
                                            </p>
                                        </div>
                                    </div>
                                    <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity mt-1" />
                                </div>
                                {saved?.enabled && (
                                    <div className="mt-3">
                                        <span className="inline-flex items-center text-xs font-medium text-green-700 bg-green-100 px-2 py-0.5 rounded-full">
                                            <span className="h-1.5 w-1.5 rounded-full bg-green-500 mr-1" />
                                            Connected
                                        </span>
                                    </div>
                                )}
                            </Card>
                        )
                    })}
                </div>
            </div>

            {/* Channels */}
            <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
                    <MessageCircle className="h-4 w-4" />
                    Channels
                </h4>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {channelIntegrations.map((integration) => {
                        const saved = savedIntegrations[integration.id]
                        return (
                            <Card
                                key={integration.id}
                                className={`p-4 relative group transition-shadow ${integration.locked
                                    ? "opacity-70 cursor-not-allowed"
                                    : "cursor-pointer hover:shadow-md"
                                    }`}
                                onClick={() => openConfig(integration)}
                            >
                                {integration.locked && (
                                    <div className="absolute top-3 right-3">
                                        <span className="inline-flex items-center text-xs font-medium text-orange-700 bg-orange-100 px-2 py-0.5 rounded-full">
                                            <Lock className="h-3 w-3 mr-1" />
                                            Pro
                                        </span>
                                    </div>
                                )}
                                <div className="flex items-start gap-3">
                                    <span className={`inline-flex items-center justify-center h-10 w-10 rounded-lg text-lg ${integration.color}`}>
                                        {integration.icon}
                                    </span>
                                    <div>
                                        <p className="text-sm font-medium">
                                            {integration.name}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            {integration.description}
                                        </p>
                                    </div>
                                    {!integration.locked && (
                                        <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity mt-1 ml-auto" />
                                    )}
                                </div>
                                {saved?.enabled && (
                                    <div className="mt-3">
                                        <span className="inline-flex items-center text-xs font-medium text-green-700 bg-green-100 px-2 py-0.5 rounded-full">
                                            <span className="h-1.5 w-1.5 rounded-full bg-green-500 mr-1" />
                                            Connected
                                        </span>
                                    </div>
                                )}
                            </Card>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}
