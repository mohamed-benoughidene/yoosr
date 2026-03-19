"use client"

import { useTranslations } from "next-intl"
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
} from "lucide-react"
import { useMutation } from "convex/react"
import { api } from "../../../../../convex/_generated/api"



export default function SettingsPage() {
    const { activeProject } = useProject()

    return <SettingsContent key={activeProject?._id} />
}

function SettingsContent() {
    const t = useTranslations("settings.project")
    const { activeProject } = useProject()
    const isAdmin = activeProject?.userRole === "org:admin"
    const [loading, setLoading] = useState(false)
    const [defaultModel, setDefaultModel] = useState(activeProject?.defaultModel ?? "openrouter/free")
    const [slaHours, setSlaHours] = useState(activeProject?.slaHours ? String(activeProject.slaHours) : "")

    const modelOptions = [
        { id: "openrouter/free", name: "OpenRouter Free", description: t("openrouter_free_desc") }
    ]





    const updateProject = useMutation(api.projects.update)
    const updateWidgetLocale = useMutation(api.projects.updateWidgetLocale)
    const clearWidgetLocale = useMutation(api.projects.clearWidgetLocale)

    const handleLocaleChange = async (value: string) => {
        if (!activeProject) return
        try {
            if (value === "auto") {
                await clearWidgetLocale({ projectId: activeProject._id })
            } else {
                await updateWidgetLocale({
                    projectId: activeProject._id,
                    locale: value as "en" | "ar" | "fr"
                })
            }
            toast.success("Language saved.")
        } catch {
            toast.error("Failed to save language.")
        }
    }

    const handleSave = async () => {
        if (!activeProject) return
        setLoading(true)

        try {
            await updateProject({
                id: activeProject._id,
                defaultModel,
            })
            toast.success(t("settings_updated"))
        } catch {
            toast.error(t("settings_update_failed"))
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
            toast.success(t("sla_saved"))
        } catch {
            toast.error(t("sla_save_failed"))
        }
    }

    const copyToClipboard = (text: string, label: string) => {
        navigator.clipboard.writeText(text)
        toast.success(t("copied_to_clipboard", { label }))
    }

    const projectId = activeProject?._id || ""



    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-medium">{t("title")}</h3>
                <p className="text-sm text-muted-foreground">
                    {t("description")}
                </p>
            </div>
            <Separator />

            <Tabs defaultValue="general" className="space-y-6">
                <TabsList className="grid w-full grid-cols-1 max-w-[200px]">
                    <TabsTrigger value="general">{t("tab_general")}</TabsTrigger>
                </TabsList>

                {/* ──────── GENERAL TAB ──────── */}
                <TabsContent value="general" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>{t("settings_project_language")}</CardTitle>
                            <CardDescription>
                                {t("settings_project_language_desc")}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Select
                                value={activeProject?.widgetLocale || "auto"}
                                onValueChange={handleLocaleChange}
                            >
                                <SelectTrigger className="w-full md:w-[280px]">
                                    <SelectValue placeholder="Select Language" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="auto">{t("settings_language_auto")}</SelectItem>
                                    <SelectItem value="en">{t("settings_language_en")}</SelectItem>
                                    <SelectItem value="ar">{t("settings_language_ar")}</SelectItem>
                                    <SelectItem value="fr">{t("settings_language_fr")}</SelectItem>
                                </SelectContent>
                            </Select>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>{t("details_title")}</CardTitle>
                            <CardDescription>
                                {t("details_desc")}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">

                            <div className="space-y-2">
                                <Label htmlFor="model-select">{t("default_model")}</Label>
                                <Select value={defaultModel} onValueChange={setDefaultModel}>
                                    <SelectTrigger id="model-select" className="w-full">
                                        <SelectValue placeholder={t("select_model_placeholder")} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectGroup>
                                            <SelectLabel>{t("model_preference")}</SelectLabel>
                                            {modelOptions.map((m) => (
                                                <SelectItem key={m.id} value={m.id} className="cursor-pointer">
                                                    {m.name}
                                                </SelectItem>
                                            ))}
                                        </SelectGroup>
                                    </SelectContent>
                                </Select>
                                <p className="text-xs text-muted-foreground mt-1">
                                    {modelOptions.find(m => m.id === defaultModel)?.description || t("openrouter_free_desc")}
                                </p>
                            </div>

                            <Separator />

                            <div className="space-y-2">
                                <Label htmlFor="sla-hours">{t("first_response_sla")}</Label>
                                <div className="flex items-center gap-2">
                                    <Input
                                        id="sla-hours"
                                        type="number"
                                        placeholder={t("sla_placeholder")}
                                        value={slaHours}
                                        onChange={(e) => setSlaHours(e.target.value)}
                                        onBlur={handleSlaBlur}
                                        className="w-32"
                                        min="0"
                                        step="0.5"
                                    />
                                    <span className="text-sm text-muted-foreground">{t("sla_hours_label")}</span>
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">
                                    {t("sla_desc")}
                                </p>
                            </div>

                            <div className="space-y-2">
                                <Label>{t("project_id")}</Label>
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
                                                t("project_id")
                                            )
                                        }
                                    >
                                        <Copy className="h-4 w-4" />
                                    </Button>
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    {t("project_id_desc")}
                                </p>
                            </div>
                        </CardContent>
                        <CardFooter className="border-t px-6 py-4">
                            <Button onClick={handleSave} disabled={loading}>
                                {loading && (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                )}
                                {t("save_changes")}
                            </Button>
                        </CardFooter>
                    </Card>


                </TabsContent>



            </Tabs>
        </div>
    )
}
