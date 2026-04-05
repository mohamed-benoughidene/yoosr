"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { cn } from "@/lib/utils"
import { Plus, Database, Loader2, Trash2 } from "lucide-react"
import Link from "next/link"
import { useParams, usePathname, useRouter } from "next/navigation"
import { useQuery, useMutation } from "convex/react"
import { api } from "../../../../../convex/_generated/api"
import { useProject } from "@/context/ProjectContext"
import { useTranslations } from "next-intl"
import { toast } from "sonner"
import { AppErrorBoundary } from "@/components/error-boundary"
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
import { Id } from "../../../../../convex/_generated/dataModel"

export default function KbShell({
    children,
}: {
    children: React.ReactNode
}) {
    const t = useTranslations("knowledge_base")
    const params = useParams()
    const pathname = usePathname()
    const router = useRouter()
    const activeId = params.kbId as string
    const { activeProject } = useProject()
    const isAdmin = activeProject?.userRole === "org:admin"

    const knowledgeBases = useQuery(
        api.knowledgeBases.list,
        activeProject ? { projectId: activeProject._id } : "skip"
    )

    const createKb = useMutation(api.knowledgeBases.create)
    const removeKb = useMutation(api.knowledgeBases.remove)

    const [open, setOpen] = useState(false)
    const [name, setName] = useState("")
    const [description, setDescription] = useState("")
    const [isDefault, setIsDefault] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)

    const [deleteTarget, setDeleteTarget] = useState<Id<"knowledge_bases"> | null>(null)
    const [isDeleting, setIsDeleting] = useState(false)

    const kbToDelete = (knowledgeBases ?? []).find((k: { _id: Id<"knowledge_bases"> }) => k._id === deleteTarget)

    const openDeleteDialog = (kb: { _id: Id<"knowledge_bases"> }) => {
        setDeleteTarget(kb._id)
    }

    const handleDelete = async () => {
        if (!deleteTarget) return

        setIsDeleting(true)
        try {
            await removeKb({ kbId: deleteTarget })
            toast.success("Knowledge base deleted")
            setDeleteTarget(null)
            if (activeId === deleteTarget) {
                router.push("/dashboard/kb/default")
            }
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : "Failed to delete knowledge base";
            toast.error(errorMessage)
        } finally {
            setIsDeleting(false)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!activeProject || !name.trim()) return

        setIsSubmitting(true)
        try {
            await createKb({
                projectId: activeProject._id,
                name: name.trim(),
                description: description.trim() || undefined,
                isDefault
            })
            
            toast.success("Knowledge base created")
            setOpen(false)
            setName("")
            setDescription("")
            setIsDefault(false)
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : "Failed to create knowledge base";
            toast.error(errorMessage)
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="flex h-[calc(100vh-60px)] flex-col md:flex-row">
            {/* Sidebar */}
            <div className="w-full md:w-64 border-r bg-muted/10 flex flex-col">
                <div className="p-4 border-b flex items-center justify-between">
                    <h2 className="font-semibold text-sm">{t("title")}</h2>
                    {isAdmin && (
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setOpen(true)}>
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
                                            openDeleteDialog(kb)
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

            {/* Main Content */}
            <AppErrorBoundary>
                <div className="flex-1 overflow-auto">
                    {children}
                </div>
            </AppErrorBoundary>

            {/* Create Dialog */}
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Create Knowledge Base</DialogTitle>
                        <DialogDescription>
                            Add a new knowledge base to organize your project&apos;s data.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Name</Label>
                            <Input
                                id="name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="e.g. Product Documentation"
                                required
                                disabled={isSubmitting}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                                id="description"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Optional description"
                                className="resize-none"
                                rows={3}
                                disabled={isSubmitting}
                            />
                        </div>
                        <div className="flex items-center space-x-2">
                            <Checkbox 
                                id="isDefault" 
                                checked={isDefault} 
                                onCheckedChange={(checked) => setIsDefault(checked === true)}
                                disabled={isSubmitting}
                            />
                            <Label htmlFor="isDefault" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer">
                                Set as default knowledge base
                            </Label>
                        </div>
                        <DialogFooter className="pt-4">
                            <Button 
                                type="button" 
                                variant="outline" 
                                onClick={() => setOpen(false)}
                                disabled={isSubmitting}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isSubmitting || !name.trim()}>
                                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Create
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
            {/* Delete Confirmation */}
            <AlertDialog open={deleteTarget !== null} onOpenChange={(open) => { if (!open) setDeleteTarget(null) }}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete knowledge base?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently delete {kbToDelete?.name} and all its sources. This cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={(e) => {
                                e.preventDefault()
                                handleDelete()
                            }}
                            className="bg-destructive text-white hover:bg-destructive/90"
                            disabled={isDeleting}
                        >
                            {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}
