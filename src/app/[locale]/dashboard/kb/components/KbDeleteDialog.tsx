"use client"

import { useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { useMutation } from "convex/react"
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
import { Loader2 } from "lucide-react"
import { api } from "../../../../../../convex/_generated/api"
import { Id } from "../../../../../../convex/_generated/dataModel"
import { toast } from "sonner"

interface KbDeleteDialogProps {
    kbId: Id<"knowledge_bases"> | null
    kbName?: string
    onOpenChange: (open: boolean) => void
}

export function KbDeleteDialog({ kbId, kbName, onOpenChange }: KbDeleteDialogProps) {
    const [isDeleting, setIsDeleting] = useState(false)
    const router = useRouter()
    const params = useParams()
    const activeId = params.kbId as string
    const removeKb = useMutation(api.knowledgeBases.remove)

    const handleDelete = async () => {
        if (!kbId) return

        setIsDeleting(true)
        try {
            await removeKb({ kbId })
            toast.success("Knowledge base deleted")
            onOpenChange(false)
            if (activeId === kbId) {
                router.push("/dashboard/kb/default")
            }
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : "Failed to delete knowledge base";
            toast.error(errorMessage)
        } finally {
            setIsDeleting(false)
        }
    }

    return (
        <AlertDialog open={kbId !== null} onOpenChange={onOpenChange}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Delete knowledge base?</AlertDialogTitle>
                    <AlertDialogDescription>
                        This will permanently delete {kbName && <strong>{kbName}</strong>} and all its sources. This cannot be undone.
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
    )
}
