"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Globe, FileText, Upload, Trash2, RefreshCw } from "lucide-react"
import { useParams } from "next/navigation"
import { AddContentDialog } from "@/components/dashboard/kb/add-content-dialog"
import { useQuery, useMutation } from "convex/react"
import { api } from "../../../../../convex/_generated/api"
import { useProject } from "@/context/ProjectContext"
import { Id } from "../../../../../convex/_generated/dataModel"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

export default function KnowledgeBaseDetailsPage() {
    const params = useParams()
    const rawKbId = params.kbId as string
    const router = useRouter()
    const { activeProject } = useProject()
    const [resolvedKbId, setResolvedKbId] = useState<Id<"knowledge_bases"> | null>(null)

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

    const sources = useQuery(api.knowledgeBases.listSources, resolvedKbId ? { kbId: resolvedKbId } : "skip")
    const addSource = useMutation(api.knowledgeBases.addSource)
    const removeSource = useMutation(api.knowledgeBases.removeSource)

    const loading = !resolvedKbId || sources === undefined

    const handleAddContent = async (type: string, value: string) => {
        if (!resolvedKbId) return
        await addSource({ kbId: resolvedKbId, type, value })
    }

    const handleRemove = async (id: Id<"knowledge_base_sources">) => {
        await removeSource({ id })
    }

    if (loading) return <div className="p-6">Loading...</div>

    const contents = sources ?? []

    return (
        <div className="flex flex-col h-full bg-background">
            <div className="flex items-center justify-between p-6 border-b">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Knowledge Base Details</h1>
                    <p className="text-muted-foreground">Manage data sources for your AI agents.</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline">Import</Button>
                    <Button variant="outline">Export</Button>
                </div>
            </div>

            <div className="flex-1 p-6 space-y-6">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Tokens</CardTitle>
                            <FileText className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">0</div>
                            <p className="text-xs text-muted-foreground">Used in this KB</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Sources</CardTitle>
                            <Globe className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{contents.length}</div>
                            <p className="text-xs text-muted-foreground">Active data sources</p>
                        </CardContent>
                    </Card>
                </div>

                <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold">Data Sources</h2>
                    <div className="flex gap-2">
                        <AddContentDialog onAdd={handleAddContent} />
                    </div>
                </div>

                <div className="border rounded-md">
                    <div className="grid grid-cols-12 gap-4 p-4 border-b bg-muted/50 font-medium text-sm">
                        <div className="col-span-1">Type</div>
                        <div className="col-span-6">Source</div>
                        <div className="col-span-2">Status</div>
                        <div className="col-span-2">Date</div>
                        <div className="col-span-1">Actions</div>
                    </div>
                    {contents.length === 0 ? (
                        <div className="p-8 text-center text-muted-foreground">
                            No content added yet. Click &quot;Add Content&quot; to start indexing.
                        </div>
                    ) : (
                        contents.map((item: any) => (
                            <div key={item._id} className="grid grid-cols-12 gap-4 p-4 border-b last:border-0 items-center text-sm hover:bg-muted/10 transition-colors">
                                <div className="col-span-1">
                                    {item.type === 'url' && <Globe className="h-4 w-4 text-blue-500" />}
                                    {item.type === 'text' && <FileText className="h-4 w-4 text-orange-500" />}
                                    {item.type === 'file' && <Upload className="h-4 w-4 text-green-500" />}
                                </div>
                                <div className="col-span-6 truncate font-medium">{item.value}</div>
                                <div className="col-span-2">
                                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${item.status === 'indexed' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                                        item.status === 'indexing' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                                            'bg-red-100 text-red-700'
                                        }`}>
                                        {item.status === 'indexing' && <RefreshCw className="mr-1 h-3 w-3 animate-spin" />}
                                        {(item.status ?? "unknown").charAt(0).toUpperCase() + (item.status ?? "unknown").slice(1)}
                                    </span>
                                </div>
                                <div className="col-span-2 text-muted-foreground">
                                    {item._creationTime ? new Date(item._creationTime).toLocaleDateString() : "-"}
                                </div>
                                <div className="col-span-1">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50"
                                        onClick={() => handleRemove(item._id)}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    )
}
