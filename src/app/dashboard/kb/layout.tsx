"use client"

import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import { Plus, Database } from "lucide-react"
import Link from "next/link"
import { useParams, usePathname } from "next/navigation"
import { useQuery } from "convex/react"
import { api } from "../../../../convex/_generated/api"
import { useProject } from "@/context/ProjectContext"

export default function KnowledgeBaseLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const params = useParams()
    const pathname = usePathname()
    const activeId = params.kbId as string
    const { activeProject } = useProject()

    const knowledgeBases = useQuery(
        api.knowledgeBases.list,
        activeProject ? { projectId: activeProject._id } : "skip"
    )

    return (
        <div className="flex h-[calc(100vh-60px)] flex-col md:flex-row">
            {/* Sidebar */}
            <div className="w-full md:w-64 border-r bg-muted/10 flex flex-col">
                <div className="p-4 border-b flex items-center justify-between">
                    <h2 className="font-semibold text-sm">Knowledge Bases</h2>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Plus className="h-4 w-4" />
                    </Button>
                </div>
                <ScrollArea className="flex-1">
                    <div className="p-2 space-y-1">
                        {(knowledgeBases ?? []).length === 0 && (
                            <div className="p-4 text-xs text-muted-foreground text-center">
                                No knowledge bases found.
                            </div>
                        )}
                        {(knowledgeBases ?? []).map((kb: any) => (
                            <Link
                                key={kb._id}
                                href={`/dashboard/kb/${kb._id}`}
                                className={cn(
                                    "flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md transition-colors hover:bg-accent",
                                    (activeId === kb._id || (!activeId && pathname === '/dashboard/kb' && kb.isDefault))
                                        ? "bg-accent text-accent-foreground"
                                        : "text-muted-foreground"
                                )}
                            >
                                <Database className="h-4 w-4" />
                                {kb.name}
                            </Link>
                        ))}
                    </div>
                </ScrollArea>
            </div>

            {/* Main Content */}
            <div className="flex-1 overflow-auto">
                {children}
            </div>
        </div>
    )
}
