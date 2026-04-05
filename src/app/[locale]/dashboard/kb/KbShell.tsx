"use client"

import { useState } from "react"
import { useQuery } from "convex/react"
import { useProject } from "@/context/ProjectContext"
import { AppErrorBoundary } from "@/components/error-boundary"
import { KbList } from "./components/KbList"
import { KbCreateDialog } from "./components/KbCreateDialog"
import { KbDeleteDialog } from "./components/KbDeleteDialog"
import { api } from "../../../../../convex/_generated/api"
import { Id } from "../../../../../convex/_generated/dataModel"

export default function KbShell({
    children,
}: {
    children: React.ReactNode
}) {
    const { activeProject } = useProject()
    const isAdmin = activeProject?.userRole === "org:admin"

    const [createDialogOpen, setCreateDialogOpen] = useState(false)
    const [deleteTarget, setDeleteTarget] = useState<Id<"knowledge_bases"> | null>(null)

    const knowledgeBases = useQuery(
        api.knowledgeBases.list,
        activeProject ? { projectId: activeProject._id } : "skip"
    )

    const kbToDelete = (knowledgeBases ?? []).find((k: { _id: Id<"knowledge_bases"> }) => k._id === deleteTarget)

    return (
        <div className="flex h-[calc(100vh-60px)] flex-col md:flex-row">
            {/* Sidebar */}
            <KbList
                isAdmin={isAdmin ?? false}
                onCreateClick={() => setCreateDialogOpen(true)}
                onDeleteClick={(kbId) => setDeleteTarget(kbId)}
            />

            {/* Main Content */}
            <AppErrorBoundary>
                <div className="flex-1 overflow-auto">
                    {children}
                </div>
            </AppErrorBoundary>

            {/* Create Dialog */}
            <KbCreateDialog
                open={createDialogOpen}
                onOpenChange={setCreateDialogOpen}
            />

            {/* Delete Dialog */}
            <KbDeleteDialog
                kbId={deleteTarget}
                kbName={kbToDelete?.name}
                onOpenChange={(open) => { if (!open) setDeleteTarget(null) }}
            />
        </div>
    )
}
