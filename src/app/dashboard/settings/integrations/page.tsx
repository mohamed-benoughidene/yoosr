"use client"

import { useProject } from "@/context/ProjectContext"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { useState, useEffect } from "react"
import { toast } from "sonner"
import { Sparkles, Lock, ChevronRight, ArrowLeft, Save, MessageCircle, Send, Loader2 } from "lucide-react"
import { useQuery, useMutation, useAction } from "convex/react"
import { api } from "../../../../../convex/_generated/api"

const INTEGRATIONS = [
    { id: "telegram", name: "Telegram", description: "Connect a Telegram bot to receive and reply to messages", category: "channel", icon: <Send className="h-5 w-5" />, color: "bg-sky-100 text-sky-600", locked: false, fields: [{ key: "bot_token", label: "Bot Token", type: "password", placeholder: "Paste your bot token from @BotFather" }], instructions: "Create a bot via @BotFather on Telegram, copy the token, paste it here, then set your webhook URL to: https://your-domain.com/webhooks/telegram" },
    { id: "messenger", name: "Messenger", description: "Facebook Messenger via Meta Graph API", category: "channel", icon: "💬", color: "bg-indigo-100 text-indigo-700", locked: false, fields: [{ key: "page_id", label: "Page ID", type: "text", placeholder: "Page ID" }, { key: "access_token", label: "Access Token", type: "password", placeholder: "EAA..." }], instructions: "Create an app at developers.facebook.com." },
    { id: "instagram", name: "Instagram", description: "Instagram DMs via Meta Graph API", category: "channel", icon: "📸", color: "bg-fuchsia-100 text-fuchsia-700", locked: false, fields: [{ key: "page_id", label: "Account ID", type: "text", placeholder: "Account ID" }, { key: "access_token", label: "Access Token", type: "password", placeholder: "EAA..." }], instructions: "Connect your Professional Account." },
] as const

type IntegrationDef = (typeof INTEGRATIONS)[number]

export default function IntegrationsPage() {
    const { activeProject } = useProject()
    const [activeConfig, setActiveConfig] = useState<IntegrationDef | "openrouter" | null>(null)
    const [formValues, setFormValues] = useState<Record<string, string>>({})
    const [formEnabled, setFormEnabled] = useState(false)
    const [saving, setSaving] = useState(false)

    // OpenRouter Specific States
    const [openRouterKey, setOpenRouterKey] = useState("")
    const [savingOr, setSavingOr] = useState(false)
    const [testingOr, setTestingOr] = useState(false)
    const [testResult, setTestResult] = useState<{ ok: boolean, model?: string, message?: string, error?: string } | null>(null)
    const [defaultModel, setDefaultModel] = useState(activeProject?.defaultModel || "")
    const [savingModel, setSavingModel] = useState(false)

    const updateProject = useMutation(api.projects.update)

    useEffect(() => {
        if (activeProject?.defaultModel) {
            setDefaultModel(activeProject.defaultModel)
        } else {
            setDefaultModel("")
        }
    }, [activeProject?._id, activeProject?.defaultModel])

    const integrations = useQuery(api.integrations.list, activeProject ? { projectId: activeProject._id } : "skip")
    const upsertIntegration = useMutation(api.integrations.upsert)
    const saveChannelIntegration = useAction(api.integrations.saveChannelIntegration)
    const registerWebhook = useAction(api.integrations.registerTelegramWebhook)

    // OpenRouter Backend hooks
    const openRouterStatus = useQuery(api.openrouter_api.getOpenRouterKeyStatus)
    const hasKey = openRouterStatus?.hasKey ?? false
    const maskedKey = openRouterStatus?.maskedKey

    const saveOpenRouter = useMutation(api.openrouter_api.saveOpenRouterKey)
    const clearOpenRouter = useMutation(api.openrouter_api.clearOpenRouterKey)
    const testOpenRouter = useAction(api.openrouter_api.testOpenRouterKey)

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
        if (!activeProject || !activeConfig || activeConfig === "openrouter") return
        setSaving(true)
        try {
            if (activeConfig.category === "channel") {
                await saveChannelIntegration({ projectId: activeProject._id, provider: activeConfig.id, credentials: formValues, enabled: formEnabled })
            } else {
                await upsertIntegration({ projectId: activeProject._id, provider: activeConfig.id, credentials: formValues, enabled: formEnabled })
            }
            
            if (activeConfig.id === "telegram" && formValues.bot_token) {
                try {
                    await registerWebhook({
                        botToken: formValues.bot_token,
                        projectId: activeProject._id,
                    })
                    toast.success("Telegram bot connected and webhook registered")
                } catch (err: any) {
                    toast.error(`Webhook registration failed: ${err.message}`)
                    setSaving(false)
                    return
                }
            } else {
                toast.success(`${activeConfig.name} integration saved`)
            }
        } catch { toast.error("Failed to save integration") }
        setSaving(false)
    }

    const handleSaveOpenRouter = async () => {
        if (!openRouterKey) return
        setSavingOr(true)
        try {
            await saveOpenRouter({ key: openRouterKey })
            setOpenRouterKey("")
            setTestResult(null)
            toast.success("OpenRouter API key saved")
        } catch (e: any) {
            toast.error(e.message ?? "Failed to save OpenRouter API key")
        } finally {
            setSavingOr(false)
        }
    }

    const handleTestOpenRouter = async () => {
        setTestingOr(true)
        setTestResult(null)
        try {
            const res = await testOpenRouter()
            setTestResult(res)
        } catch (e: any) {
            setTestResult({ ok: false, error: e.message ?? "Failed to test key" })
        } finally {
            setTestingOr(false)
        }
    }

    const handleClearOpenRouter = async () => {
        try {
            await clearOpenRouter()
            setTestResult(null)
            toast.success("OpenRouter API key removed")
        } catch (e: any) {
            toast.error(e.message ?? "Failed to remove OpenRouter API key")
        }
    }

    const handleSaveModel = async () => {
        if (!activeProject) return
        setSavingModel(true)
        try {
            await updateProject({
                id: activeProject._id,
                defaultModel: defaultModel || undefined,
            })
            toast.success("Model updated")
        } catch {
            toast.error("Failed to update model")
        } finally {
            setSavingModel(false)
        }
    }

    // Custom OpenRouter Detail View
    if (activeConfig === "openrouter") {
        return (
            <div className="space-y-6">
                <div className="flex items-center gap-3">
                    <Button variant="ghost" size="icon" onClick={() => { setActiveConfig(null); setTestResult(null); }} className="h-8 w-8">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div>
                        <h3 className="text-lg font-medium flex items-center gap-2">
                            <span className="inline-flex items-center justify-center h-8 w-8 rounded-lg text-sm bg-pink-100 text-pink-700">🔀</span>
                            OpenRouter
                        </h3>
                        <p className="text-sm text-muted-foreground">Unified API for 100+ AI models</p>
                    </div>
                </div>
                <Separator />
                
                {!hasKey ? (
                    <Card className="p-5 space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="or_key">API Key</Label>
                            <Input 
                                id="or_key" 
                                type="password" 
                                placeholder="sk-or-..." 
                                value={openRouterKey}
                                onChange={e => setOpenRouterKey(e.target.value)}
                            />
                            <p className="text-xs text-muted-foreground">
                                Your key is encrypted and stored securely. Used for all bot LLM calls in this workspace.
                            </p>
                        </div>
                        <Button onClick={handleSaveOpenRouter} disabled={savingOr || !openRouterKey}>
                            {savingOr ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                            {savingOr ? "Saving..." : "Save"}
                        </Button>
                    </Card>
                ) : (
                    <Card className="p-5 space-y-4">
                        <div className="space-y-2">
                            <Label>API Key</Label>
                            <Input readOnly value={maskedKey} className="text-muted-foreground bg-muted/50" />
                        </div>
                        <div className="flex items-center gap-3">
                            <Button onClick={handleTestOpenRouter} disabled={testingOr} variant="secondary">
                                {testingOr && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Test
                            </Button>
                            <Button onClick={handleClearOpenRouter} variant="destructive">
                                Remove
                            </Button>
                        </div>
                        {testResult && (
                            <div className="mt-4">
                                {testResult.ok ? (
                                    <div className="rounded-lg border border-green-200 bg-green-50/50 p-4 space-y-3 dark:border-green-900/50 dark:bg-green-900/10">
                                        <div className="flex items-center gap-2">
                                            <span className="inline-flex items-center text-xs font-medium text-green-700 bg-green-100 px-2 py-1 rounded-md dark:bg-green-900/30 dark:text-green-400">
                                                <span className="h-1.5 w-1.5 rounded-full bg-green-500 mr-2" />
                                                Connected
                                            </span>
                                        </div>
                                        {testResult.model && (
                                            <p className="text-sm font-medium text-green-900 dark:text-green-300">
                                                Model: {testResult.model}
                                            </p>
                                        )}
                                        {testResult.message && (
                                            <blockquote className="border-l-2 border-green-300 pl-3 text-sm text-green-800/80 italic dark:border-green-700 dark:text-green-400/80">
                                                {testResult.message}
                                            </blockquote>
                                        )}
                                    </div>
                                ) : (
                                    <div className="rounded-lg border border-red-200 bg-red-50/50 p-4 space-y-3 dark:border-red-900/50 dark:bg-red-900/10">
                                        <div className="flex items-center gap-2">
                                            <span className="inline-flex items-center text-xs font-medium text-red-700 bg-red-100 px-2 py-1 rounded-md dark:bg-red-900/30 dark:text-red-400">
                                                <span className="h-1.5 w-1.5 rounded-full bg-red-500 mr-2" />
                                                Error
                                            </span>
                                        </div>
                                        <p className="text-sm text-red-800 dark:text-red-300">
                                            {testResult.error}
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}
                    </Card>
                )}

                <Card className="p-5 space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="default_model">Default Model</Label>
                        <Input 
                            id="default_model" 
                            placeholder="e.g. openai/gpt-4o, stepfun/step-3.5-flash:free" 
                            value={defaultModel}
                            onChange={e => setDefaultModel(e.target.value)}
                        />
                        <p className="text-xs text-muted-foreground">
                            Any OpenRouter model string. Leave blank to use the platform default.
                        </p>
                    </div>
                    <Button 
                        onClick={handleSaveModel} 
                        disabled={savingModel} 
                        variant="outline"
                        className="w-fit"
                    >
                        {savingModel ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Saving...
                            </>
                        ) : (
                            <>
                                <Save className="mr-2 h-4 w-4" />
                                Save Model
                            </>
                        )}
                    </Button>
                </Card>
            </div>
        )
    }

    // Generic Integration Detail View
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

    const renderOpenRouterCard = () => (
        <Card className="p-4 relative group transition-shadow cursor-pointer hover:shadow-md" onClick={() => { setActiveConfig("openrouter"); setTestResult(null); }}>
            <div className="flex items-start gap-3">
                <span className="inline-flex items-center justify-center h-10 w-10 rounded-lg text-lg bg-pink-100 text-pink-700">🔀</span>
                <div>
                    <p className="text-sm font-medium">OpenRouter</p>
                    <p className="text-xs text-muted-foreground">Unified API for 100+ AI models</p>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity mt-1 ml-auto" />
            </div>
            {hasKey && (
                <div className="mt-3">
                    <span className="inline-flex items-center text-xs font-medium text-green-700 bg-green-100 px-2 py-0.5 rounded-full">
                        <span className="h-1.5 w-1.5 rounded-full bg-green-500 mr-1" />
                        Connected
                    </span>
                </div>
            )}
        </Card>
    )

    return (
        <div className="space-y-6">
            <div><h3 className="text-lg font-medium">Integrations</h3><p className="text-sm text-muted-foreground">Connect AI providers and messaging channels.</p></div>
            <Separator />
            <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2"><Sparkles className="h-4 w-4" />AI Providers</h4>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {renderOpenRouterCard()}
                </div>
            </div>
            <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2"><MessageCircle className="h-4 w-4" />Channels</h4>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{channels.map(renderCard)}</div>
            </div>
        </div>
    )
}
