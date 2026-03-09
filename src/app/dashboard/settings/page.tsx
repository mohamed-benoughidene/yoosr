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
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { useState } from "react"
import { toast } from "sonner"
import {
    Loader2,
    Copy,
    AlertTriangle,
    Trash2,
} from "lucide-react"
import { useMutation } from "convex/react"
import { api } from "../../../../convex/_generated/api"

const AVAILABLE_MODELS = [
    { id: "mistralai/mistral-small-3.1-24b-instruct:free", name: "Mistral Small 3.1", provider: "Mistral", description: "Reliable, balanced performance" },
    { id: "meta-llama/llama-3.3-70b-instruct:free", name: "Llama 3.3 70B", provider: "Meta", description: "Strong Arabic support, enterprise-grade" },
    { id: "mistralai/mistral-7b-instruct:free", name: "Mistral 7B", provider: "Mistral", description: "Lightweight, fast responses" },
    { id: "openrouter/free", name: "Auto (OpenRouter)", provider: "OpenRouter", description: "Automatically picks best available free model" },
]

export default function SettingsPage() {
    const { activeProject } = useProject()

    return <SettingsContent key={activeProject?._id} />
}

function SettingsContent() {
    const { activeProject } = useProject()
    const isAdmin = activeProject?.userRole === "org:admin"
    const [loading, setLoading] = useState(false)
    const [projectName, setProjectName] = useState(activeProject?.name || "")
    const [projectDesc, setProjectDesc] = useState(activeProject?.description || "")
    const [defaultModel, setDefaultModel] = useState(activeProject?.defaultModel || "mistralai/mistral-small-3.1-24b-instruct:free")
    const [slaHours, setSlaHours] = useState(activeProject?.slaHours ? String(activeProject.slaHours) : "")

    // Advanced state
    const [confirmDelete, setConfirmDelete] = useState("")
    const [deleting, setDeleting] = useState(false)

    const updateProject = useMutation(api.projects.update)
    const removeProject = useMutation(api.projects.remove)

    const handleSave = async () => {
        if (!activeProject) return
        setLoading(true)

        try {
            await updateProject({
                id: activeProject._id,
                name: projectName,
                description: projectDesc,
                defaultModel,
            })
            toast.success("Project settings updated")
        } catch {
            toast.error("Failed to update project settings")
        }
        setLoading(false)
    }

    const handleSlaBlur = async () => {
        if (!activeProject) return

        try {
            const parsed = slaHours ? parseFloat(slaHours) : undefined
            await updateProject({
                id: activeProject._id,
                slaHours: parsed,
            })
            toast.success("SLA setting saved")
        } catch {
            toast.error("Failed to save SLA setting")
        }
    }

    const copyToClipboard = (text: string, label: string) => {
        navigator.clipboard.writeText(text)
        toast.success(`${label} copied to clipboard`)
    }

    const projectId = activeProject?._id || ""

    const handleDeleteProject = async () => {
        if (!activeProject) return
        if (confirmDelete !== activeProject.name) {
            toast.error("Project name doesn't match")
            return
        }
        setDeleting(true)

        try {
            await removeProject({ id: activeProject._id })
            toast.success("Project deleted")
            window.location.href = "/dashboard"
        } catch {
            toast.error("Failed to delete project")
        }
        setDeleting(false)
    }

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-medium">Project Settings</h3>
                <p className="text-sm text-muted-foreground">
                    Manage your project configuration.
                </p>
            </div>
            <Separator />

            <Tabs defaultValue="general" className="space-y-6">
                <TabsList className="grid w-full grid-cols-2 max-w-md">
                    <TabsTrigger value="general">General</TabsTrigger>
                    <TabsTrigger value="advanced">Advanced</TabsTrigger>
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
                                <Label htmlFor="model-select">Default AI Model</Label>
                                <Select value={defaultModel} onValueChange={setDefaultModel}>
                                    <SelectTrigger id="model-select" className="w-full">
                                        <SelectValue placeholder="Select a model" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectGroup>
                                            <SelectLabel>Available Models</SelectLabel>
                                            {AVAILABLE_MODELS.map((m) => (
                                                <SelectItem key={m.id} value={m.id} className="cursor-pointer">
                                                    {m.name} <span className="text-muted-foreground font-mono text-xs ml-1">({m.provider})</span>
                                                </SelectItem>
                                            ))}
                                        </SelectGroup>
                                    </SelectContent>
                                </Select>
                                <p className="text-xs text-muted-foreground mt-1">
                                    {AVAILABLE_MODELS.find(m => m.id === defaultModel)?.description || "Select a model to use by default."}
                                </p>
                            </div>

                            <Separator />

                            <div className="space-y-2">
                                <Label htmlFor="sla-hours">First Response SLA</Label>
                                <div className="flex items-center gap-2">
                                    <Input
                                        id="sla-hours"
                                        type="number"
                                        placeholder="e.g. 4"
                                        value={slaHours}
                                        onChange={(e) => setSlaHours(e.target.value)}
                                        onBlur={handleSlaBlur}
                                        className="w-32"
                                        min="0"
                                        step="0.5"
                                    />
                                    <span className="text-sm text-muted-foreground">hours</span>
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">
                                    Agents must send the first reply within this window or the conversation is flagged as overdue.
                                </p>
                            </div>

                            <div className="space-y-2">
                                <Label>Project ID</Label>
                                <div className="flex gap-2">
                                    <Input
                                        disabled
                                        value={projectId}
                                        className="bg-muted font-mono text-xs"
                                    />
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        className="shrink-0"
                                        onClick={() =>
                                            copyToClipboard(
                                                projectId,
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

                    {/* Danger Zone */}
                    {isAdmin && (
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
                    )}
                </TabsContent>

            </Tabs>
        </div>
    )
}
