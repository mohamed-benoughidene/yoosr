"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Loader2 } from "lucide-react"
import { useMutation } from "convex/react"
import { api } from "../../../../../../convex/_generated/api"
import { useProject } from "@/context/ProjectContext"
import { toast } from "sonner"

interface KbCreateDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function KbCreateDialog({ open, onOpenChange }: KbCreateDialogProps) {
    const [name, setName] = useState("")
    const [description, setDescription] = useState("")
    const [isDefault, setIsDefault] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)

    const { activeProject } = useProject()
    const createKb = useMutation(api.knowledgeBases.create).withOptimisticUpdate(
        (localStore, args) => {
            const existing = localStore.getQuery(api.knowledgeBases.list, { projectId: args.projectId });
            if (existing) {
                localStore.setQuery(api.knowledgeBases.list, { projectId: args.projectId }, [
                    ...existing,
                    {
                        _id: `temp_${Date.now()}` as any,
                        _creationTime: Date.now(),
                        projectId: args.projectId,
                        name: args.name,
                        description: args.description,
                        isDefault: args.isDefault,
                    },
                ]);
            }
        }
    );

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
            onOpenChange(false)
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

    const handleOpenChange = (open: boolean) => {
        if (!open) {
            setName("")
            setDescription("")
            setIsDefault(false)
        }
        onOpenChange(open)
    }

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
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
                            onClick={() => handleOpenChange(false)}
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
    )
}
