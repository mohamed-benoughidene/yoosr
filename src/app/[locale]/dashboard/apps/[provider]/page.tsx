"use client"

import { useProject } from "@/context/ProjectContext"
import { AVAILABLE_APPS } from "@/config/apps"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Loader2, Save, Trash2 } from "lucide-react"
import { useRouter } from "@/i18n/navigation"
import { useQuery, useMutation } from "convex/react"
import { api } from "../../../../../../convex/_generated/api"
import { useState, use } from "react"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"

export default function AppDetailsPage({ params }: { params: Promise<{ provider: string }> }) {
    const { provider } = use(params)
    const { activeProject } = useProject()
    const router = useRouter()
    const app = AVAILABLE_APPS.find(a => a.id === provider)

    const [saving, setSaving] = useState(false)
    const [credentialValue, setCredentialValue] = useState("")

    const integrations = useQuery(api.integrations.list, activeProject ? { projectId: activeProject._id } : "skip")
    const upsertIntegration = useMutation(api.integrations.upsert)
    const removeIntegration = useMutation(api.integrations.remove)

    const loading = integrations === undefined
    const existingIntegration = (integrations ?? []).find((i: { provider?: string; credentials?: unknown }) => i.provider === provider)
    const isInstalled = !!existingIntegration

    // Populate credential on first load
    const populatedRef = useState(false)
    if (existingIntegration && !populatedRef[0]) {
        const creds = existingIntegration.credentials as { token?: string; apiKey?: string }
        if (creds?.token) setCredentialValue(creds.token)
        else if (creds?.apiKey) setCredentialValue(creds.apiKey)
        populatedRef[1](true)
    }

    const handleSave = async () => {
        if (!activeProject) return
        setSaving(true)
        try {
            let creds: Record<string, string> = {}
            if (provider === "telegram") creds = { token: credentialValue }
            if (provider === "openai") creds = { apiKey: credentialValue }

            await upsertIntegration({
                projectId: activeProject._id,
                provider,
                credentials: creds,
                enabled: true,
            })
            toast.success("Configuration saved")
        } catch {
            toast.error("Failed to save configuration")
        }
        setSaving(false)
    }

    const handleUninstall = async () => {
        if (!activeProject || !existingIntegration) return
        if (!confirm("Are you sure you want to remove this integration? This may break existing flows.")) return

        setSaving(true)
        try {
            await removeIntegration({ id: existingIntegration._id })
            toast.success("Uninstalled successfully")
            router.push("/dashboard/apps")
        } catch {
            toast.error("Failed to uninstall")
        }
        setSaving(false)
    }

    if (!app) return <div>App not found</div>

    const renderConfigForm = () => {
        if (app.isPro) {
            return (
                <div className="bg-muted/30 p-8 rounded-lg text-center border border-dashed">
                    <h3 className="text-lg font-semibold mb-2">Upgrade to Pro</h3>
                    <p className="text-muted-foreground mb-4">
                        Integration with {app.name} is available on the Pro plan.
                    </p>
                    <Button variant="default">Upgrade Now</Button>
                </div>
            )
        }

        if (app.id === "telegram") {
            return (
                <div className="space-y-4">
                    <div className="grid w-full max-w-sm items-center gap-1.5">
                        <Label htmlFor="token">Bot Token</Label>
                        <Input
                            type="password"
                            id="token"
                            placeholder="123456:ABC-DEF1234ghIwkl..."
                            value={credentialValue}
                            onChange={(e) => setCredentialValue(e.target.value)}
                        />
                        <p className="text-xs text-muted-foreground">
                            Talk to @BotFather on Telegram to create a bot and get your token.
                        </p>
                    </div>
                </div>
            )
        }

        if (app.id === "openai") {
            return (
                <div className="space-y-4">
                    <div className="grid w-full max-w-sm items-center gap-1.5">
                        <Label htmlFor="apiKey">OpenAI API Key</Label>
                        <Input
                            type="password"
                            id="apiKey"
                            placeholder="sk-..."
                            value={credentialValue}
                            onChange={(e) => setCredentialValue(e.target.value)}
                        />
                    </div>
                </div>
            )
        }

        return <div>Configuration not implemented for this app.</div>
    }

    return (
        <div className="flex flex-col gap-6 p-6 max-w-4xl mx-auto">
            <Button variant="ghost" className="w-fit -ml-4" onClick={() => router.back()}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to App Store
            </Button>

            <div className="flex items-start gap-6">
                <div className="p-4 bg-primary/10 rounded-xl">
                    <app.icon className="h-12 w-12 text-primary" />
                </div>
                <div className="flex-1">
                    <div className="flex items-center gap-3">
                        <h1 className="text-3xl font-bold tracking-tight">{app.name}</h1>
                        {isInstalled && <Badge className="bg-green-500">Installed</Badge>}
                    </div>
                    <p className="text-lg text-muted-foreground mt-2">
                        {app.description}
                    </p>
                </div>
            </div>

            <Card className="mt-6">
                <CardHeader>
                    <CardTitle>Configuration</CardTitle>
                    <CardDescription>
                        Manage your connection settings.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="flex h-20 items-center justify-center">
                            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                        </div>
                    ) : renderConfigForm()}
                </CardContent>
                <CardFooter className="flex justify-between border-t px-6 py-4">
                    {isInstalled ? (
                        <Button variant="destructive" onClick={handleUninstall} disabled={saving}>
                            <Trash2 className="mr-2 h-4 w-4" />
                            Uninstall
                        </Button>
                    ) : <div />}

                    {!app.isPro && (
                        <Button onClick={handleSave} disabled={saving}>
                            {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                            Save & Install
                        </Button>
                    )}
                </CardFooter>
            </Card>
        </div>
    )
}
