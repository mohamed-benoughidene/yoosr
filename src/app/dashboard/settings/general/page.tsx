"use client"

import { useProject } from "@/context/ProjectContext"
import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { createClient } from "@/lib/supabase/client"
import { useState, useEffect } from "react"
import { toast } from "sonner"
import {
    Loader2,
    Copy,
    Eye,
    EyeOff,
    RefreshCw,
    AlertTriangle,
    Trash2,
    Shield,
    Key,
    Webhook,
} from "lucide-react"
import { logActivity } from "@/lib/logging"

export default function GeneralSettingsPage() {
    const { activeProject } = useProject()
    const [loading, setLoading] = useState(false)
    const [projectName, setProjectName] = useState("")
    const [projectDesc, setProjectDesc] = useState("")

    // Developer settings state
    const [showApiKey, setShowApiKey] = useState(false)
    const [showJwtSecret, setShowJwtSecret] = useState(false)
    const [webhookUrl, setWebhookUrl] = useState("")
    const [webhookEnabled, setWebhookEnabled] = useState(false)
    const [webhookLoading, setWebhookLoading] = useState(false)

    // Advanced state
    const [confirmDelete, setConfirmDelete] = useState("")
    const [deleting, setDeleting] = useState(false)

    useEffect(() => {
        if (activeProject) {
            setProjectName(activeProject.name)
            setProjectDesc(activeProject.description || "")
        }
    }, [activeProject])

    // Load webhook settings
    useEffect(() => {
        const loadWebhook = async () => {
            if (!activeProject) return
            const supabase = createClient()
            const { data } = await supabase
                .from("projects")
                .select("webhook_url, webhook_enabled")
                .eq("id", activeProject.id)
                .single()
            if (data) {
                setWebhookUrl(data.webhook_url || "")
                setWebhookEnabled(data.webhook_enabled || false)
            }
        }
        loadWebhook()
    }, [activeProject])

    const handleSave = async () => {
        if (!activeProject) return
        setLoading(true)
        const supabase = createClient()

        const { error } = await supabase
            .from("projects")
            .update({
                name: projectName,
                description: projectDesc,
            })
            .eq("id", activeProject.id)

        if (error) {
            toast.error("Failed to update project settings")
        } else {
            toast.success("Project settings updated")
            await logActivity({
                projectId: activeProject.id,
                actionType: "update_project",
                description: `Updated project settings (Name: ${projectName})`,
            })
        }
        setLoading(false)
    }

    const handleSaveWebhook = async () => {
        if (!activeProject) return
        setWebhookLoading(true)
        const supabase = createClient()

        const { error } = await supabase
            .from("projects")
            .update({
                webhook_url: webhookUrl,
                webhook_enabled: webhookEnabled,
            })
            .eq("id", activeProject.id)

        if (error) {
            toast.error("Failed to save webhook settings")
        } else {
            toast.success("Webhook settings saved")
        }
        setWebhookLoading(false)
    }

    const copyToClipboard = (text: string, label: string) => {
        navigator.clipboard.writeText(text)
        toast.success(`${label} copied to clipboard`)
    }

    // Derived keys
    const apiKey = activeProject
        ? `ys_${btoa(activeProject.id).replace(/=/g, "").slice(0, 24)}`
        : ""
    const jwtSecret = activeProject
        ? `ysjwt_${btoa(activeProject.id + "_secret").replace(/=/g, "").slice(0, 32)}`
        : ""

    const handleDeleteProject = async () => {
        if (!activeProject) return
        if (confirmDelete !== activeProject.name) {
            toast.error("Project name doesn't match")
            return
        }
        setDeleting(true)
        const supabase = createClient()
        const { error } = await supabase
            .from("projects")
            .delete()
            .eq("id", activeProject.id)

        if (error) {
            toast.error("Failed to delete project")
        } else {
            toast.success("Project deleted")
            window.location.href = "/dashboard"
        }
        setDeleting(false)
    }

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-medium">Project Settings</h3>
                <p className="text-sm text-muted-foreground">
                    Manage your project configuration, security, and developer settings.
                </p>
            </div>
            <Separator />

            <Tabs defaultValue="general" className="space-y-6">
                <TabsList className="grid w-full grid-cols-3 max-w-md">
                    <TabsTrigger value="general">General</TabsTrigger>
                    <TabsTrigger value="advanced">Advanced</TabsTrigger>
                    <TabsTrigger value="developer">Developer</TabsTrigger>
                </TabsList>

                {/* ──────── GENERAL TAB ──────── */}
                <TabsContent value="general" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Project Details</CardTitle>
                            <CardDescription>
                                Used to identify your project in the dashboard.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Project Name</Label>
                                <Input
                                    id="name"
                                    value={projectName}
                                    onChange={(e) =>
                                        setProjectName(e.target.value)
                                    }
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="description">
                                    Description (Optional)
                                </Label>
                                <Textarea
                                    id="description"
                                    value={projectDesc}
                                    onChange={(e) =>
                                        setProjectDesc(e.target.value)
                                    }
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Project ID</Label>
                                <div className="flex gap-2">
                                    <Input
                                        disabled
                                        value={activeProject?.id || ""}
                                        className="bg-muted font-mono text-xs"
                                    />
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        className="shrink-0"
                                        onClick={() =>
                                            copyToClipboard(
                                                activeProject?.id || "",
                                                "Project ID"
                                            )
                                        }
                                    >
                                        <Copy className="h-4 w-4" />
                                    </Button>
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    Use this ID when installing the widget or
                                    calling the API.
                                </p>
                            </div>
                        </CardContent>
                        <CardFooter className="border-t px-6 py-4">
                            <Button onClick={handleSave} disabled={loading}>
                                {loading && (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                )}
                                Save Changes
                            </Button>
                        </CardFooter>
                    </Card>
                </TabsContent>

                {/* ──────── ADVANCED TAB ──────── */}
                <TabsContent value="advanced" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Shield className="h-5 w-5 text-muted-foreground" />
                                Security Preferences
                            </CardTitle>
                            <CardDescription>
                                Configure security settings for your project.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label className="text-sm font-medium">
                                        Require Email Verification
                                    </Label>
                                    <p className="text-xs text-muted-foreground">
                                        Contacts must verify their email before
                                        starting a conversation.
                                    </p>
                                </div>
                                <Switch defaultChecked={false} />
                            </div>
                            <Separator />
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label className="text-sm font-medium">
                                        Block Spam Messages
                                    </Label>
                                    <p className="text-xs text-muted-foreground">
                                        Automatically filter and block suspected
                                        spam conversations.
                                    </p>
                                </div>
                                <Switch defaultChecked={true} />
                            </div>
                            <Separator />
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label className="text-sm font-medium">
                                        IP Rate Limiting
                                    </Label>
                                    <p className="text-xs text-muted-foreground">
                                        Limit API requests per IP to prevent
                                        abuse.
                                    </p>
                                </div>
                                <Switch defaultChecked={true} />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Danger Zone */}
                    <Card className="border-destructive/50">
                        <CardHeader>
                            <CardTitle className="text-destructive flex items-center gap-2">
                                <AlertTriangle className="h-5 w-5" />
                                Danger Zone
                            </CardTitle>
                            <CardDescription>
                                Irreversible actions. Proceed with caution.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="rounded-lg border border-destructive/30 p-4 space-y-3">
                                <div className="flex items-start gap-3">
                                    <Trash2 className="h-5 w-5 text-destructive mt-0.5" />
                                    <div className="space-y-1">
                                        <p className="text-sm font-medium">
                                            Delete this project
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            This will permanently delete all
                                            conversations, contacts, bots,
                                            integrations, and settings. This
                                            action cannot be undone.
                                        </p>
                                    </div>
                                </div>
                                <div className="space-y-2 pl-8">
                                    <Label className="text-xs text-muted-foreground">
                                        Type{" "}
                                        <span className="font-mono font-bold text-destructive">
                                            {activeProject?.name}
                                        </span>{" "}
                                        to confirm:
                                    </Label>
                                    <div className="flex gap-2">
                                        <Input
                                            value={confirmDelete}
                                            onChange={(e) =>
                                                setConfirmDelete(e.target.value)
                                            }
                                            placeholder="Project name"
                                            className="max-w-xs text-sm"
                                        />
                                        <Button
                                            variant="destructive"
                                            disabled={
                                                confirmDelete !==
                                                activeProject?.name ||
                                                deleting
                                            }
                                            onClick={handleDeleteProject}
                                        >
                                            {deleting && (
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            )}
                                            Delete Project
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* ──────── DEVELOPER TAB ──────── */}
                <TabsContent value="developer" className="space-y-6">
                    {/* API Key */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Key className="h-5 w-5 text-muted-foreground" />
                                API Key
                            </CardTitle>
                            <CardDescription>
                                Use this key to authenticate REST API requests.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="flex gap-2">
                                <Input
                                    readOnly
                                    value={
                                        showApiKey
                                            ? apiKey
                                            : "•".repeat(32)
                                    }
                                    className="font-mono text-xs bg-muted"
                                />
                                <Button
                                    variant="outline"
                                    size="icon"
                                    className="shrink-0"
                                    onClick={() => setShowApiKey(!showApiKey)}
                                >
                                    {showApiKey ? (
                                        <EyeOff className="h-4 w-4" />
                                    ) : (
                                        <Eye className="h-4 w-4" />
                                    )}
                                </Button>
                                <Button
                                    variant="outline"
                                    size="icon"
                                    className="shrink-0"
                                    onClick={() =>
                                        copyToClipboard(apiKey, "API Key")
                                    }
                                >
                                    <Copy className="h-4 w-4" />
                                </Button>
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Include this key in the{" "}
                                <code className="text-xs bg-muted px-1 py-0.5 rounded">
                                    Authorization
                                </code>{" "}
                                header:{" "}
                                <code className="text-xs bg-muted px-1 py-0.5 rounded">
                                    Bearer {"<api_key>"}
                                </code>
                            </p>
                        </CardContent>
                    </Card>

                    {/* JWT Secret */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Shield className="h-5 w-5 text-muted-foreground" />
                                JWT Secret
                            </CardTitle>
                            <CardDescription>
                                Used to sign and verify JWT tokens for
                                authenticated users.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="flex gap-2">
                                <Input
                                    readOnly
                                    value={
                                        showJwtSecret
                                            ? jwtSecret
                                            : "•".repeat(40)
                                    }
                                    className="font-mono text-xs bg-muted"
                                />
                                <Button
                                    variant="outline"
                                    size="icon"
                                    className="shrink-0"
                                    onClick={() =>
                                        setShowJwtSecret(!showJwtSecret)
                                    }
                                >
                                    {showJwtSecret ? (
                                        <EyeOff className="h-4 w-4" />
                                    ) : (
                                        <Eye className="h-4 w-4" />
                                    )}
                                </Button>
                                <Button
                                    variant="outline"
                                    size="icon"
                                    className="shrink-0"
                                    onClick={() =>
                                        copyToClipboard(
                                            jwtSecret,
                                            "JWT Secret"
                                        )
                                    }
                                >
                                    <Copy className="h-4 w-4" />
                                </Button>
                            </div>
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="text-xs"
                                    onClick={() =>
                                        toast.info(
                                            "Secret rotation is not yet available."
                                        )
                                    }
                                >
                                    <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
                                    Rotate Secret
                                </Button>
                                <p className="text-xs text-muted-foreground">
                                    Rotating will invalidate existing tokens.
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Webhooks */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Webhook className="h-5 w-5 text-muted-foreground" />
                                Webhooks
                            </CardTitle>
                            <CardDescription>
                                Receive real-time event notifications via HTTP
                                POST.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label className="text-sm font-medium">
                                        Enable Webhooks
                                    </Label>
                                    <p className="text-xs text-muted-foreground">
                                        Send events (new message, conversation
                                        closed, etc.) to your endpoint.
                                    </p>
                                </div>
                                <Switch
                                    checked={webhookEnabled}
                                    onCheckedChange={setWebhookEnabled}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="webhook-url" className="text-sm">
                                    Endpoint URL
                                </Label>
                                <Input
                                    id="webhook-url"
                                    type="url"
                                    placeholder="https://your-server.com/api/webhooks"
                                    value={webhookUrl}
                                    onChange={(e) =>
                                        setWebhookUrl(e.target.value)
                                    }
                                />
                            </div>
                            <div className="rounded-lg bg-muted/50 p-3">
                                <p className="text-xs font-medium mb-1.5">
                                    Events sent:
                                </p>
                                <div className="flex flex-wrap gap-1.5">
                                    {[
                                        "message.created",
                                        "conversation.opened",
                                        "conversation.closed",
                                        "contact.created",
                                        "agent.assigned",
                                    ].map((evt) => (
                                        <span
                                            key={evt}
                                            className="inline-flex text-[10px] font-mono bg-background border px-2 py-0.5 rounded"
                                        >
                                            {evt}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter className="border-t px-6 py-4">
                            <Button
                                onClick={handleSaveWebhook}
                                disabled={webhookLoading}
                            >
                                {webhookLoading && (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                )}
                                Save Webhook Settings
                            </Button>
                        </CardFooter>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}
