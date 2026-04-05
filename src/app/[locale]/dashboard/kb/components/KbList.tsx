"use client"

import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { Plus, Database, Trash2 } from "lucide-react"
import Link from "next/link"
import { useParams, usePathname } from "next/navigation"
import { useQuery } from "convex/react"
import { api } from "../../../../../../convex/_generated/api"
import { Id } from "../../../../../../convex/_generated/dataModel"
import { useProject } from "@/context/ProjectContext"
import { useTranslations } from "next-intl"
import { cn } from "@/lib/utils"

interface KbListProps {
    isAdmin: boolean
    onCreateClick: () => void
    onDeleteClick: (kbId: Id<"knowledge_bases">) => void
}

export function KbList({ isAdmin, onCreateClick, onDeleteClick }: KbListProps) {
    const t = useTranslations("knowledge_base")
    const params = useParams()
    const pathname = usePathname()
    const activeId = params.kbId as string
    const { activeProject } = useProject()

    const knowledgeBases = useQuery(
        api.knowledgeBases.list,
        activeProject ? { projectId: activeProject._id } : "skip"
    )

    return (
        <div className="w-full md:w-64 border-r bg-muted/10 flex flex-col">
            <div className="p-4 border-b flex items-center justify-between">
                <h2 className="font-semibold text-sm">{t("title")}</h2>
                {isAdmin && (
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onCreateClick}>
                        <Plus className="h-4 w-4" />
                    </Button>
                )}
            </div>
            <ScrollArea className="flex-1">
                <div className="p-2 space-y-1">
                    {(knowledgeBases ?? []).length === 0 && (
                        <div className="p-4 text-xs text-muted-foreground text-center">
                            {t("no_kbs")}
                        </div>
                    )}
                    {(knowledgeBases ?? []).map((kb: {
                        _id: Id<"knowledge_bases">;
                        name?: string;
                        isDefault?: boolean;
                    }) => (
                        <div key={kb._id} className={cn(
                            "group relative flex items-center justify-between rounded-md transition-colors hover:bg-accent",
                            (activeId === kb._id || (!activeId && pathname === '/dashboard/kb' && kb.isDefault))
                                ? "bg-accent"
                                : ""
                        )}>
                            <Link
                                href={`/dashboard/kb/${kb._id}`}
                                className={cn(
                                    "flex flex-1 items-center gap-2 px-3 py-2 text-sm font-medium",
                                    (activeId === kb._id || (!activeId && pathname === '/dashboard/kb' && kb.isDefault))
                                        ? "text-accent-foreground"
                                        : "text-muted-foreground"
                                )}
                            >
                                <Database className="h-4 w-4 shrink-0" />
                                <span className="truncate">{kb.name}</span>
                            </Link>
                            {isAdmin && (
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={(e) => {
                                        e.preventDefault()
                                        onDeleteClick(kb._id)
                                    }}
                                    className="h-7 w-7 mr-2 opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive hover:bg-destructive/10 shrink-0"
                                >
                                    <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                            )}
                        </div>
                    ))}
                </div>
            </ScrollArea>
        </div>
    )
}
