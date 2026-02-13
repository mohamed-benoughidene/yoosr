"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Upload, Globe, FileText, Plus, Trash2, RefreshCw } from "lucide-react"
import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { AddContentDialog } from "@/components/dashboard/kb/add-content-dialog"
import { createClient } from "@/lib/supabase/client"
import { useProject } from "@/context/ProjectContext"

export default function KnowledgeBaseDetailsPage() {
    const params = useParams()
    const rawKbId = params.kbId as string
    const [kbId, setKbId] = useState<string | null>(null)
    const [contents, setContents] = useState<any[]>([])
    const { activeProject } = useProject()
    const supabase = createClient()
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (!activeProject) return

        const resolveKbId = async () => {
            setLoading(true)
            let resolvedId = rawKbId

            if (rawKbId === 'default') {
                // Find or create default KB
                const { data: existing } = await supabase
                    .from("knowledge_bases")
                    .select("id")
                    .eq("project_id", activeProject.id)
                    .eq("is_default", true)
                    .single()

                if (existing) {
                    resolvedId = existing.id
                } else {
                    // Create default
                    const { data: newKb, error } = await supabase
                        .from("knowledge_bases")
                        .insert({
                            project_id: activeProject.id,
                            name: "Default Knowledge Base",
                            description: "Default knowledge base for the project",
                            is_default: true
                        })
                        .select("id")
                        .single()

                    if (newKb) resolvedId = newKb.id
                }
            }

            setKbId(resolvedId)

            if (resolvedId && resolvedId !== 'default') {
                fetchContents(resolvedId)
            }
            setLoading(false)
        }

        resolveKbId()
    }, [activeProject, rawKbId, supabase])

    const fetchContents = async (id: string) => {
        const { data } = await supabase
            .from("knowledge_base_sources")
            .select("*")
            .eq("kb_id", id)
            .order("created_at", { ascending: false })

        if (data) setContents(data)
    }

    const handleAddContent = async (type: string, value: string) => {
        if (!kbId) return

        const { error } = await supabase
            .from("knowledge_base_sources")
            .insert({
                kb_id: kbId,
                type,
                value,
                status: "indexing"
            })

        if (!error) {
            fetchContents(kbId)
        }
    }

    if (loading) return <div className="p-6">Loading...</div>

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
                            No content added yet. Click "Add Content" to start indexing.
                        </div>
                    ) : (
                        contents.map((item) => (
                            <div key={item.id} className="grid grid-cols-12 gap-4 p-4 border-b last:border-0 items-center text-sm hover:bg-muted/10 transition-colors">
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
                                        {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                                    </span>
                                </div>
                                <div className="col-span-2 text-muted-foreground">
                                    {new Date(item.created_at).toLocaleDateString()}
                                </div>
                                <div className="col-span-1">
                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50">
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
