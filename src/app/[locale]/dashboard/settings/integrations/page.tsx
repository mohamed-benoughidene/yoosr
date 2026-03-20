"use client"

import { useTranslations } from "next-intl"
import { useProject } from "@/context/ProjectContext"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { useState, useEffect } from "react"
import { toast } from "sonner"
import { Sparkles, Lock, ChevronRight, ArrowLeft, Save, MessageCircle, Send, Loader2, Phone } from "lucide-react"
import { useQuery, useMutation, useAction } from "convex/react"
import { api } from "../../../../../../convex/_generated/api"

interface IntegrationField {
    key: string
    label: string
    type: string
    placeholder: string
}

interface IntegrationDef {
    id: "telegram" | "messenger" | "instagram" | "whatsapp"
    name: string
    description: string
    category: "channel"
    icon: React.ReactNode
    color: string
    locked: boolean
    fields: IntegrationField[]
    instructions: string
}

export default function IntegrationsPage() {
    const t = useTranslations("settings.integrations")

    const INTEGRATIONS: IntegrationDef[] = [
        { 
            id: "telegram", 
            name: "Telegram", 
            description: t("telegram_description"), 
            category: "channel", 
            icon: <Send className="h-5 w-5" />, 
            color: "bg-sky-100 text-sky-600", 
            locked: false, 
            fields: [
                { 
                    key: "bot_token", 
                    label: t("bot_token_label"), 
                    type: "password", 
                    placeholder: t("bot_token_placeholder") 
                }
            ], 
            instructions: `${t("telegram_instructions")} https://your-domain.com/webhooks/telegram` 
        },
        { 
            id: "messenger", 
            name: "Messenger", 
            description: t("messenger_description"), 
            category: "channel", 
            icon: "💬", 
            color: "bg-indigo-100 text-indigo-700", 
            locked: false, 
            fields: [
                { key: "page_id", label: t("page_id_label"), type: "text", placeholder: t("page_id_label") }, 
                { key: "access_token", label: t("access_token_label"), type: "password", placeholder: "EAA..." }
            ], 
            instructions: t("messenger_instructions") 
        },
        { 
            id: "instagram", 
            name: "Instagram", 
            description: t("instagram_description"), 
            category: "channel", 
            icon: "📸", 
            color: "bg-fuchsia-100 text-fuchsia-700", 
            locked: false, 
            fields: [
                { key: "page_id", label: t("account_id_label"), type: "text", placeholder: t("account_id_label") }, 
                { key: "access_token", label: t("access_token_label"), type: "password", placeholder: "EAA..." }
            ], 
            instructions: t("instagram_instructions") 
        },
        { 
            id: "whatsapp", 
            name: "WhatsApp", 
            description: t("whatsapp_description"), 
            category: "channel", 
            icon: <Phone className="h-5 w-5" />, 
            color: "bg-green-100 text-green-700", 
            locked: false, 
            fields: [], 
            instructions: t("whatsapp_instructions") 
        },
    ]

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
    
    // WhatsApp Specific States
    const [phoneNumberId, setPhoneNumberId] = useState("")
    const [accessToken, setAccessToken] = useState("")
    const [verifyToken, setVerifyToken] = useState("")
    const [whatsappEnabled, setWhatsappEnabled] = useState(false)
    const [hasExistingToken, setHasExistingToken] = useState(false)

    const updateProject = useMutation(api.projects.update)

    useEffect(() => {
        if (activeProject?.defaultModel) {
            setDefaultModel(activeProject.defaultModel)
        } else {
            setDefaultModel("")
        }
    }, [activeProject?._id, activeProject?.defaultModel])

    const integrations = useQuery(api.integrations.list, activeProject ? { projectId: activeProject._id } : "skip")
    
    useEffect(() => {
        if (activeConfig && (activeConfig as IntegrationDef).id === "whatsapp") {
            const saved = (integrations ?? []).find((r: any) => r.provider === "whatsapp")
            if (saved) {
                setPhoneNumberId(saved.credentials?.phone_number_id || "")
                setVerifyToken(saved.credentials?.verify_token || "")
                setWhatsappEnabled(saved.enabled || false)
                setHasExistingToken(!!saved.credentials?.access_token)
            } else {
                setPhoneNumberId("")
                setVerifyToken("")
                setWhatsappEnabled(false)
                setHasExistingToken(false)
            }
            setAccessToken("")
        }
    }, [activeConfig, integrations])
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
            if (activeConfig.id === "whatsapp") {
                await saveChannelIntegration({
                    projectId: activeProject._id,
                    provider: "whatsapp",
                    credentials: {
                        phone_number_id: phoneNumberId,
                        access_token: accessToken,
                        verify_token: verifyToken
                    },
                    enabled: whatsappEnabled
                })
                toast.success(t("whatsapp_connected"))
            } else if (activeConfig.category === "channel") {
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
                    toast.success(t("telegram_connected"))
                } catch (err: any) {
                    toast.error(t("webhook_registration_failed").replace("{error}", err.message))
                    setSaving(false)
                    return
                }
            } else {
                toast.success(t("integration_saved").replace("{name}", activeConfig.name))
            }
        } catch { toast.error(t("integration_save_failed")) }
        setSaving(false)
    }

    const handleSaveOpenRouter = async () => {
        if (!openRouterKey) return
        setSavingOr(true)
        try {
            await saveOpenRouter({ key: openRouterKey })
            setOpenRouterKey("")
            setTestResult(null)
            toast.success(t("openrouter_saved"))
        } catch (e: any) {
            toast.error(e.message ?? t("openrouter_save_failed"))
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
            setTestResult({ ok: false, error: e.message ?? t("test_key_failed") })
        } finally {
            setTestingOr(false)
        }
    }

    const handleClearOpenRouter = async () => {
        try {
            await clearOpenRouter()
            setTestResult(null)
            toast.success(t("openrouter_removed"))
        } catch (e: any) {
            toast.error(e.message ?? t("openrouter_remove_failed"))
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
            toast.success(t("model_updated"))
        } catch {
            toast.error(t("model_update_failed"))
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
                        <p className="text-sm text-muted-foreground">{t("openrouter_desc")}</p>
                    </div>
                </div>
                <Separator />
                
                {!hasKey ? (
                    <Card className="p-5 space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="or_key">{t("api_key")}</Label>
                            <Input 
                                id="or_key" 
                                type="password" 
                                placeholder="sk-or-..." 
                                value={openRouterKey}
                                onChange={e => setOpenRouterKey(e.target.value)}
                            />
                            <p className="text-xs text-muted-foreground">
                                {t("key_desc")}
                            </p>
                        </div>
                        <Button onClick={handleSaveOpenRouter} disabled={savingOr || !openRouterKey}>
                            {savingOr ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                            {savingOr ? t("saving") : t("save")}
                        </Button>
                    </Card>
                ) : (
                    <Card className="p-5 space-y-4">
                        <div className="space-y-2">
                            <Label>{t("api_key")}</Label>
                            <Input readOnly value={maskedKey} className="text-muted-foreground bg-muted/50" />
                        </div>
                        <div className="flex items-center gap-3">
                            <Button onClick={handleTestOpenRouter} disabled={testingOr} variant="secondary">
                                {testingOr && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {t("test")}
                            </Button>
                            <Button onClick={handleClearOpenRouter} variant="destructive">
                                {t("remove")}
                            </Button>
                        </div>
                        {testResult && (
                            <div className="mt-4">
                                {testResult.ok ? (
                                    <div className="rounded-lg border border-green-200 bg-green-50/50 p-4 space-y-3 dark:border-green-900/50 dark:bg-green-900/10">
                                        <div className="flex items-center gap-2">
                                            <span className="inline-flex items-center text-xs font-medium text-green-700 bg-green-100 px-2 py-1 rounded-md dark:bg-green-900/30 dark:text-green-400">
                                                <span className="h-1.5 w-1.5 rounded-full bg-green-500 mr-2" />
                                                {t("connected")}
                                            </span>
                                        </div>
                                        {testResult.model && (
                                            <p className="text-sm font-medium text-green-900 dark:text-green-300">
                                                {t("model")}: {testResult.model}
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
                                                {t("error")}
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
                        <Label htmlFor="default_model">{t("default_model")}</Label>
                        <Input 
                            id="default_model" 
                            placeholder="e.g. openai/gpt-4o, stepfun/step-3.5-flash:free" 
                            value={defaultModel}
                            onChange={e => setDefaultModel(e.target.value)}
                        />
                        <p className="text-xs text-muted-foreground">
                            {t("default_model_desc")}
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
                                {t("saving")}
                            </>
                        ) : (
                            <>
                                <Save className="mr-2 h-4 w-4" />
                                {t("save_model")}
                            </>
                        )}
                    </Button>
                </Card>
            </div>
        )
    }

    // WhatsApp Specific Detail View
    if (activeConfig && (activeConfig as IntegrationDef).id === "whatsapp") {
        return (
            <div className="space-y-6">
                <div className="flex items-center gap-3">
                    <Button variant="ghost" size="icon" onClick={() => setActiveConfig(null)} className="h-8 w-8">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div>
                        <h3 className="text-lg font-medium flex items-center gap-2">
                            <span className={`inline-flex items-center justify-center h-8 w-8 rounded-lg text-sm ${activeConfig.color}`}>
                                {activeConfig.icon}
                            </span>
                            {activeConfig.name}
                        </h3>
                        <p className="text-sm text-muted-foreground">{activeConfig.description}</p>
                    </div>
                </div>
                <Separator />
                <Card className="p-5">
                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <Label className="text-sm font-medium">{t("enable_integration", { name: activeConfig.name })}</Label>
                            <p className="text-xs text-muted-foreground">{t("enable_desc")}</p>
                        </div>
                        <Switch checked={whatsappEnabled} onCheckedChange={setWhatsappEnabled} />
                    </div>
                </Card>
                <Card className="p-5 space-y-4">
                    <h4 className="text-sm font-medium">{t("credentials")}</h4>
                    
                    <div className="grid gap-1.5">
                        <Label htmlFor="phoneNumberId" className="text-sm">{t("phone_number_id_label")}</Label>
                        <Input 
                            id="phoneNumberId" 
                            type="text" 
                            placeholder={t("phone_number_id_label")} 
                            value={phoneNumberId} 
                            onChange={e => setPhoneNumberId(e.target.value)} 
                        />
                    </div>

                    <div className="grid gap-1.5">
                        <Label htmlFor="accessToken" className="text-sm">{t("access_token_label")}</Label>
                        <Input 
                            id="accessToken" 
                            type="password" 
                            placeholder={hasExistingToken ? t("token_saved_placeholder") : t("token_placeholder")} 
                            value={accessToken} 
                            onChange={e => setAccessToken(e.target.value)} 
                        />
                    </div>

                    <div className="grid gap-1.5">
                        <Label htmlFor="verifyToken" className="text-sm">{t("verify_token_label")}</Label>
                        <div className="flex gap-2">
                            <Input 
                                id="verifyToken" 
                                type="text" 
                                placeholder={t("verify_token_label")} 
                                value={verifyToken} 
                                onChange={e => setVerifyToken(e.target.value)} 
                            />
                            <Button variant="outline" onClick={() => setVerifyToken(crypto.randomUUID())}>
                                {t("generate_token")}
                            </Button>
                        </div>
                    </div>
                </Card>

                <Card className="p-5 bg-muted/30">
                    <details className="group">
                        <summary className="text-sm font-medium cursor-pointer list-none flex items-center gap-2">
                            <ChevronRight className="h-4 w-4 transition-transform group-open:rotate-90" />
                            {t("setup_guide_title")}
                        </summary>
                        <div className="mt-4 text-sm text-muted-foreground">
                            <a 
                                href="https://developers.facebook.com/docs/whatsapp/cloud-api/get-started" 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-primary hover:underline"
                            >
                                {t("setup_guide_link")}
                            </a>
                        </div>
                    </details>
                </Card>

                <div className="flex justify-end">
                    <Button onClick={handleSave} disabled={saving}>
                        {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                        {saving ? t("saving") : t("save_config")}
                    </Button>
                </div>
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
                            <Label className="text-sm font-medium">{t("enable_integration", { name: activeConfig.name })}</Label>
                            <p className="text-xs text-muted-foreground">{t("enable_desc")}</p>
                        </div>
                        <Switch checked={formEnabled} onCheckedChange={setFormEnabled} />
                    </div>
                </Card>
                <Card className="p-5 space-y-4">
                    <h4 className="text-sm font-medium">{t("credentials")}</h4>
                    {activeConfig.fields.map(field => (
                        <div key={field.key} className="grid gap-1.5">
                            <Label htmlFor={field.key} className="text-sm">{field.label}</Label>
                            <Input id={field.key} type={field.type} placeholder={field.placeholder} value={formValues[field.key] || ""} onChange={e => setFormValues(prev => ({ ...prev, [field.key]: e.target.value }))} />
                        </div>
                    ))}
                </Card>
                {activeConfig.instructions && (
                    <Card className="p-5 bg-muted/30">
                        <h4 className="text-sm font-medium mb-2">{t("setup_instructions")}</h4>
                        <p className="text-sm text-muted-foreground">{activeConfig.instructions}</p>
                    </Card>
                )}
                <div className="flex justify-end">
                    <Button onClick={handleSave} disabled={saving}><Save className="mr-2 h-4 w-4" />{saving ? t("saving") : t("save_config")}</Button>
                </div>
            </div>
        )
    }

    const channels = INTEGRATIONS.filter(i => i.category === "channel")

    const renderCard = (integration: IntegrationDef) => {
        const saved = savedMap[integration.id]
        return (
            <Card key={integration.id} className={`p-4 relative group transition-shadow ${integration.locked ? "opacity-70 cursor-not-allowed" : "cursor-pointer hover:shadow-md"}`} onClick={() => openConfig(integration)}>
                {integration.locked && <div className="absolute top-3 right-3"><span className="inline-flex items-center text-xs font-medium text-orange-700 bg-orange-100 px-2 py-0.5 rounded-full"><Lock className="h-3 w-3 mr-1" />{t("pro")}</span></div>}
                <div className="flex items-start gap-3">
                    <span className={`inline-flex items-center justify-center h-10 w-10 rounded-lg text-lg ${integration.color}`}>{integration.icon}</span>
                    <div>
                        <p className="text-sm font-medium">{integration.name}</p>
                        <p className="text-xs text-muted-foreground">{integration.description}</p>
                    </div>
                    {!integration.locked && <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity mt-1 ml-auto" />}
                </div>
                {saved?.enabled && <div className="mt-3"><span className="inline-flex items-center text-xs font-medium text-green-700 bg-green-100 px-2 py-0.5 rounded-full"><span className="h-1.5 w-1.5 rounded-full bg-green-500 mr-1" />{t("connected")}</span></div>}
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
                        {t("connected")}
                    </span>
                </div>
            )}
        </Card>
    )

    return (
        <div className="space-y-6">
            <div><h3 className="text-lg font-medium">{t("title")}</h3><p className="text-sm text-muted-foreground">{t("description")}</p></div>
            <Separator />
            <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2"><Sparkles className="h-4 w-4" />{t("ai_providers")}</h4>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {renderOpenRouterCard()}
                </div>
            </div>
            <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2"><MessageCircle className="h-4 w-4" />{t("channels")}</h4>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{channels.map(renderCard)}</div>
            </div>
        </div>
    )
}
