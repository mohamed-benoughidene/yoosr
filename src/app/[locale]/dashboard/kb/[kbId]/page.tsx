"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Globe, FileText, Trash2, RefreshCw, Type } from "lucide-react"
import { useParams } from "@/i18n/navigation"
import { AddContentDialog } from "@/components/dashboard/kb/add-content-dialog"
import { useMutation, usePaginatedQuery } from "convex/react"
import { api } from "../../../../../../convex/_generated/api"
import { useProject } from "@/context/ProjectContext"
import { Id } from "../../../../../../convex/_generated/dataModel"
import { useEffect, useState } from "react"
import { toast } from "sonner"
import { useTranslations } from "next-intl"

export default function KnowledgeBaseDetailsPage() {
    const params = useParams()
    const rawKbId = params.kbId as string
    const { activeProject } = useProject()
    const t = useTranslations("knowledge_base")
    const tCommon = useTranslations("common")
    const isAdmin = activeProject?.userRole === "org:admin"
    const [resolvedKbId, setResolvedKbId] = useState<Id<"knowledge_bases"> | null>(null)
    const [pendingDeleteId, setPendingDeleteId] = useState<Id<"knowledge_base_sources"> | null>(null)

    const getDefaultKb = useMutation(api.knowledgeBases.getOrCreateDefault)

    useEffect(() => {
        const resolveId = async () => {
            if (rawKbId === "default") {
                if (activeProject) {
                    try {
                        const kb = await getDefaultKb({ projectId: activeProject._id })
                        if (kb) {
                            // Update the URL to the real ID to avoid repeated fetching, or just hold it in state.
                            // Holding in state is cleaner so the URL stays "default"
                            setResolvedKbId(kb._id)
                        }
                    } catch (e) {
                        console.error("Failed to get default KB", e)
                    }
                }
            } else {
                setResolvedKbId(rawKbId as Id<"knowledge_bases">)
            }
        }
        resolveId()
    }, [rawKbId, activeProject, getDefaultKb])

    const sourcesResult = usePaginatedQuery(
        api.knowledgeBases.listSourcesPaginated,
        resolvedKbId ? { kbId: resolvedKbId } : "skip",
        { initialNumItems: 50 }
    )
    const addSource = useMutation(api.knowledgeBases.addSource)
    const removeSource = useMutation(api.knowledgeBases.removeSource)

    const loading = !resolvedKbId || !sourcesResult

    const sources = sourcesResult?.results ?? []

    const handleAddContent = async (type: string, value: string) => {
        if (!resolvedKbId) return
        await addSource({ kbId: resolvedKbId, type, value })
    }

    const handleRemove = async (id: Id<"knowledge_base_sources">) => {
        try {
            await removeSource({ id })
            toast.success(t("source_deleted"))
        } catch (error: unknown) {
            const err = error as { data?: { message?: string }; message?: string };
            const errorMessage = err.data?.message || err.message || t("delete_failed")
            toast.error(errorMessage)
        }
    }

    const handleExport = () => {
        if (!sources || sources.length === 0) return

        const exportData = sources.map(s => ({
            type: s.type,
            value: s.value,
            status: s.status
        }))

        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" })
        const url = URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = "kb-export.json"
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
    }

    if (loading) return <div className="p-6">{tCommon("loading")}</div>

    const contents = sources ?? []

    return (
        <div className="flex flex-col h-full bg-background">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between p-6 border-b">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">{t("detail_title")}</h1>
                    <p className="text-muted-foreground">{t("detail_subtitle")}</p>
                </div>
                <div className="flex flex-wrap gap-2 shrink-0">
                    <Button
                        variant="outline"
                        onClick={handleExport}
                        disabled={loading || contents.length === 0}
                    >
                        {t("export")}
                    </Button>
                </div>
            </div>

            <div className="flex-1 p-6 space-y-6">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">{t("total_tokens")}</CardTitle>
                            <FileText className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">0</div>
                            <p className="text-xs text-muted-foreground">{t("tokens_used")}</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">{t("sources")}</CardTitle>
                            <Globe className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{contents.length}</div>
                            <p className="text-xs text-muted-foreground">{t("sources_active")}</p>
                        </CardContent>
                    </Card>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <h2 className="text-lg font-semibold">{t("data_sources")}</h2>
                    <div className="flex flex-wrap gap-2 shrink-0">
                        {isAdmin && <AddContentDialog onAdd={handleAddContent} />}
                    </div>
                </div>

                <div className="border rounded-md overflow-x-auto">
                    <div className="grid grid-cols-12 gap-4 p-4 border-b bg-muted/50 font-medium text-sm min-w-[800px]">
                        <div className="col-span-1">{t("type")}</div>
                        <div className="col-span-6">{t("source")}</div>
                        <div className="col-span-2">{t("status")}</div>
                        <div className="col-span-2">{t("date")}</div>
                        <div className="col-span-1">{t("actions")}</div>
                    </div>
                    {contents.length === 0 ? (
                        <div className="p-8 text-center text-muted-foreground">
                            {t("no_content")}
                        </div>
                    ) : (
                        contents.map((item: {
                            _id: Id<"knowledge_base_sources">;
                            type?: string;
                            value?: string;
                            status?: string;
                            _creationTime?: number;
                        }) => (
                            <div key={item._id} className="grid grid-cols-12 gap-4 p-4 border-b last:border-0 items-center text-sm hover:bg-muted/10 transition-colors min-w-[800px]">
                                <div className="col-span-1">
                                    {item.type === 'url' && (
                                        <Badge variant="secondary" className="bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800">
                                            <Globe className="mr-1 h-3 w-3" />
                                            {t("url")}
                                        </Badge>
                                    )}
                                    {item.type === 'text' && (
                                        <Badge variant="secondary" className="bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700">
                                            <Type className="mr-1 h-3 w-3" />
                                            {t("text")}
                                        </Badge>
                                    )}
                                    {item.type === 'file' && (
                                        <Badge variant="secondary" className="bg-purple-100 text-purple-700 border-purple-200 hover:bg-purple-100 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-800">
                                            <FileText className="mr-1 h-3 w-3" />
                                            {t("file")}
                                        </Badge>
                                    )}
                                </div>
                                <div className="col-span-6 font-medium">
                                    {item.type === 'url' ? (
                                        <a href={item.value} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                                            {item.value && item.value.length > 50 ? item.value.substring(0, 50) + '...' : item.value}
                                        </a>
                                    ) : item.type === 'file' ? (
                                        <span className="text-muted-foreground">{t("uploaded_file")}</span>
                                    ) : (
                                        <span className="text-muted-foreground truncate block">
                                            {item.value && item.value.length > 80 ? item.value.substring(0, 80) + '...' : item.value}
                                        </span>
                                    )}
                                </div>
                                <div className="col-span-2">
                                    {item.status === 'indexing' && (
                                        <Badge variant="secondary" className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800">
                                            <RefreshCw className="mr-1.5 h-3 w-3 animate-spin" />
                                            {t("indexing")}
                                        </Badge>
                                    )}
                                    {item.status === 'indexed' && (
                                        <Badge variant="secondary" className="bg-green-100 text-green-700 hover:bg-green-100 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800">
                                            <div className="mr-1.5 h-2 w-2 rounded-full bg-green-500" />
                                            {t("indexed")}
                                        </Badge>
                                    )}
                                    {item.status === 'failed' && (
                                        <Badge variant="secondary" className="bg-red-100 text-red-700 hover:bg-red-100 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800">
                                            <div className="mr-1.5 h-2 w-2 rounded-full bg-red-500" />
                                            {t("failed")}
                                        </Badge>
                                    )}
                                </div>
                                <div className="col-span-2 text-muted-foreground">
                                    {item._creationTime ? new Date(item._creationTime).toLocaleDateString() : "-"}
                                </div>
                                <div className="col-span-1">
                                    {isAdmin && (
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50"
                                            onClick={() => setPendingDeleteId(item._id)}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Load more button for pagination */}
                {sourcesResult?.status === "CanLoadMore" && (
                    <div className="flex justify-center">
                        <Button
                            variant="outline"
                            onClick={() => sourcesResult.loadMore(50)}
                            disabled={sourcesResult.status !== "CanLoadMore"}
                        >
                            {t("load_more")}
                        </Button>
                    </div>
                )}
            </div>

            {/* Delete Source Confirmation */}
            <AlertDialog open={pendingDeleteId !== null} onOpenChange={(open) => { if (!open) setPendingDeleteId(null) }}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>{t("delete_source_title")}</AlertDialogTitle>
                        <AlertDialogDescription>
                            {t("delete_source_desc")}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>{tCommon("cancel")}</AlertDialogCancel>
                        <AlertDialogAction
                            className="bg-destructive text-white hover:bg-destructive/90"
                            onClick={async () => {
                                if (pendingDeleteId) {
                                    await handleRemove(pendingDeleteId)
                                    setPendingDeleteId(null)
                                }
                            }}
                        >
                            {tCommon("delete")}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}
