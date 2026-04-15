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
                { key: "access_token", label: t("access_token_label"), type: "password", placeholder: "EAA..." },
                { key: "app_secret", label: t("app_secret_label"), type: "password", placeholder: t("app_secret_placeholder") }
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
                { key: "access_token", label: t("access_token_label"), type: "password", placeholder: "EAA..." },
                { key: "app_secret", label: t("app_secret_label"), type: "password", placeholder: t("app_secret_placeholder") }
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
    const [activeConfig, setActiveConfig] = useState<IntegrationDef | null>(null)
    const [formValues, setFormValues] = useState<Record<string, string>>({})
    const [formEnabled, setFormEnabled] = useState(false)
    const [saving, setSaving] = useState(false)


    
    // WhatsApp Specific States
    const [whatsappState, setWhatsappState] = useState({
        phoneNumberId: "",
        accessToken: "",
        verifyToken: "",
        appSecret: "",
        enabled: false,
        hasExistingToken: false,
    })

    const updateProject = useMutation(api.projects.update)



    const integrations = useQuery(api.integrations.list, activeProject ? { projectId: activeProject._id } : "skip")

    useEffect(() => {
        if (activeConfig && (activeConfig as IntegrationDef).id === "whatsapp") {
            const saved = (integrations ?? []).find((r: { provider?: string; credentials?: Record<string, string> }) => r.provider === "whatsapp")
            setWhatsappState(saved ? {
                phoneNumberId: saved.credentials?.phone_number_id || "",
                accessToken: "",
                verifyToken: saved.credentials?.verify_token || "",
                appSecret: "",
                enabled: saved.enabled || false,
                hasExistingToken: !!saved.credentials?.access_token,
            } : {
                phoneNumberId: "",
                accessToken: "",
                verifyToken: "",
                appSecret: "",
                enabled: false,
                hasExistingToken: false,
            })
        }
    }, [activeConfig, integrations])
    const upsertIntegration = useMutation(api.integrations.upsert)
    const saveChannelIntegration = useAction(api.integrations.saveChannelIntegration)
    const registerWebhook = useAction(api.integrations.registerTelegramWebhook)
    
    const savedMap: Record<string, { credentials?: Record<string, string>; enabled?: boolean }> = {}
    ;(integrations ?? []).forEach((row: { provider?: string; credentials?: Record<string, string>; enabled?: boolean }) => {
        if (row.provider) savedMap[row.provider] = row
    })

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
            if (activeConfig.id === "whatsapp") {
                await saveChannelIntegration({
                    projectId: activeProject._id,
                    provider: "whatsapp",
                    credentials: {
                        phone_number_id: whatsappState.phoneNumberId,
                        access_token: whatsappState.accessToken,
                        verify_token: whatsappState.verifyToken,
                        app_secret: whatsappState.appSecret
                    },
                    enabled: whatsappState.enabled
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
                } catch (err: unknown) {
                    const errorMessage = err instanceof Error ? err.message : String(err);
                    toast.error(t("webhook_registration_failed").replace("{error}", errorMessage))
                    setSaving(false)
                    return
                }
            } else {
                toast.success(t("integration_saved").replace("{name}", activeConfig.name))
            }
        } catch { toast.error(t("integration_save_failed")) }
        setSaving(false)
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
                        <Switch checked={whatsappState.enabled} onCheckedChange={(val) => setWhatsappState(prev => ({ ...prev, enabled: val }))} />
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
                            value={whatsappState.phoneNumberId}
                            onChange={e => setWhatsappState(prev => ({ ...prev, phoneNumberId: e.target.value }))}
                        />
                    </div>

                    <div className="grid gap-1.5">
                        <Label htmlFor="accessToken" className="text-sm">{t("access_token_label")}</Label>
                        <Input
                            id="accessToken"
                            type="password"
                            placeholder={whatsappState.hasExistingToken ? t("token_saved_placeholder") : t("token_placeholder")}
                            value={whatsappState.accessToken}
                            onChange={e => setWhatsappState(prev => ({ ...prev, accessToken: e.target.value }))}
                        />
                    </div>

                    <div className="grid gap-1.5">
                        <Label htmlFor="verifyToken" className="text-sm">{t("verify_token_label")}</Label>
                        <div className="flex gap-2">
                            <Input
                                id="verifyToken"
                                type="text"
                                placeholder={t("verify_token_label")}
                                value={whatsappState.verifyToken}
                                onChange={e => setWhatsappState(prev => ({ ...prev, verifyToken: e.target.value }))}
                            />
                            <Button variant="outline" onClick={() => setWhatsappState(prev => ({ ...prev, verifyToken: crypto.randomUUID() }))}>
                                {t("generate_token")}
                            </Button>
                        </div>
                    </div>

                    <div className="grid gap-1.5">
                        <Label htmlFor="appSecret" className="text-sm">{t("app_secret_label")}</Label>
                        <Input
                            id="appSecret"
                            type="password"
                            placeholder={t("app_secret_placeholder")}
                            value={whatsappState.appSecret}
                            onChange={e => setWhatsappState(prev => ({ ...prev, appSecret: e.target.value }))}
                        />
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

    return (
        <div className="space-y-6">
            <div><h3 className="text-lg font-medium">{t("title")}</h3><p className="text-sm text-muted-foreground">{t("description")}</p></div>
            <Separator />

            <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2"><MessageCircle className="h-4 w-4" />{t("channels")}</h4>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{channels.map(renderCard)}</div>
            </div>
        </div>
    )
}
