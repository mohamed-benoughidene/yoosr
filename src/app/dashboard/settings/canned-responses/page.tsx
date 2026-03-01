"use client"

import { useProject } from "@/context/ProjectContext"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { useState, useRef } from "react"
import { toast } from "sonner"
import {
    Plus,
    Trash2,
    MessageSquare,
    Search,
    Zap,
    User,
    Hash,
    Mail,
    Building2,
    Pencil,
} from "lucide-react"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useQuery, useMutation } from "convex/react"
import { api } from "../../../../../convex/_generated/api"
import { useUser } from "@clerk/nextjs"

const placeholders = [
    { label: "User Name", value: "{{user_name}}", icon: User },
    { label: "User Email", value: "{{user_email}}", icon: Mail },
    { label: "Project Name", value: "{{project_name}}", icon: Building2 },
    { label: "Ticket ID", value: "{{ticket_id}}", icon: Hash },
]

export default function CannedResponsesPage() {
    const { activeProject } = useProject()
    const { user } = useUser()
    const [createOpen, setCreateOpen] = useState(false)
    const [newTitle, setNewTitle] = useState("")
    const [newMessage, setNewMessage] = useState("")
    const [searchQuery, setSearchQuery] = useState("")
    const messageRef = useRef<HTMLTextAreaElement>(null)

    const [editingId, setEditingId] = useState<typeof responses[number]["_id"] | null>(null)
    const [editTitle, setEditTitle] = useState("")
    const [editMessage, setEditMessage] = useState("")
    const editMessageRef = useRef<HTMLTextAreaElement>(null)

    const responses = useQuery(
        api.settings.listCannedResponses,
        activeProject ? { projectId: activeProject._id } : "skip"
    ) ?? []

    const createCannedResponse = useMutation(api.settings.createCannedResponse)
    const updateCannedResponse = useMutation(api.settings.updateCannedResponse)
    const removeCannedResponse = useMutation(api.settings.removeCannedResponse)

    const handleCreate = async () => {
        if (!activeProject || !newTitle || !newMessage) return

        try {
            await createCannedResponse({
                projectId: activeProject._id,
                trigger: newTitle,
                message: newMessage,
            })
            toast.success("Canned response created")
            setNewTitle("")
            setNewMessage("")
            setCreateOpen(false)
        } catch {
            toast.error("Failed to create canned response")
        }
    }

    const handleDelete = async (id: typeof responses[number]["_id"]) => {
        try {
            await removeCannedResponse({ id })
            toast.success("Response deleted")
        } catch {
            toast.error("Failed to delete response")
        }
    }

    const handleEditSubmit = async () => {
        if (!editingId || !editTitle || !editMessage) return

        try {
            await updateCannedResponse({
                id: editingId,
                trigger: editTitle,
                message: editMessage,
            })
            toast.success("Canned response updated")
            setEditingId(null)
        } catch {
            toast.error("Failed to update canned response")
        }
    }

    const insertPlaceholder = (value: string) => {
        const textarea = messageRef.current
        if (!textarea) {
            setNewMessage((prev) => prev + value)
            return
        }
        const start = textarea.selectionStart
        const end = textarea.selectionEnd
        const text = newMessage
        setNewMessage(text.substring(0, start) + value + text.substring(end))
        setTimeout(() => {
            textarea.focus()
            textarea.setSelectionRange(start + value.length, start + value.length)
        }, 0)
    }

    const insertEditPlaceholder = (value: string) => {
        const textarea = editMessageRef.current
        if (!textarea) {
            setEditMessage((prev) => prev + value)
            return
        }
        const start = textarea.selectionStart
        const end = textarea.selectionEnd
        const text = editMessage
        setEditMessage(text.substring(0, start) + value + text.substring(end))
        setTimeout(() => {
            textarea.focus()
            textarea.setSelectionRange(start + value.length, start + value.length)
        }, 0)
    }

    const filteredResponses = responses.filter(
        (r) =>
            r.trigger.toLowerCase().includes(searchQuery.toLowerCase()) ||
            r.message.toLowerCase().includes(searchQuery.toLowerCase())
    )

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-medium">Canned Responses</h3>
                    <p className="text-sm text-muted-foreground">
                        Create quick replies for your agents. Use <code className="text-xs bg-muted px-1 py-0.5 rounded">/</code> in chat to access them.
                    </p>
                </div>
                <Dialog
                    open={createOpen}
                    onOpenChange={(open) => {
                        setCreateOpen(open)
                        if (!open) {
                            setNewTitle("")
                            setNewMessage("")
                        }
                    }}
                >
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            Add Response
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-lg">
                        <DialogHeader>
                            <DialogTitle>Create Canned Response</DialogTitle>
                            <DialogDescription>
                                Define a title and the message to be sent to visitors.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-5 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="title">Title</Label>
                                <Input
                                    id="title"
                                    value={newTitle}
                                    onChange={(e) => setNewTitle(e.target.value)}
                                    placeholder="e.g., greeting, closing, refund-policy"
                                />
                                <p className="text-xs text-muted-foreground">
                                    Internal shortcut name. Use <code className="bg-muted px-1 rounded">/title</code> to access in chat.
                                </p>
                            </div>
                            <div className="grid gap-2">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="message">Message</Label>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-7 gap-1 text-xs"
                                            >
                                                <Zap className="h-3 w-3" />
                                                Personalize
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            {placeholders.map((p) => (
                                                <DropdownMenuItem
                                                    key={p.value}
                                                    onClick={() => insertPlaceholder(p.value)}
                                                >
                                                    <p.icon className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
                                                    {p.label}
                                                    <span className="ml-auto text-xs text-muted-foreground font-mono">
                                                        {p.value}
                                                    </span>
                                                </DropdownMenuItem>
                                            ))}
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                                <Textarea
                                    ref={messageRef}
                                    id="message"
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    placeholder="Hello {{user_name}}, thanks for reaching out! How can I help you today?"
                                    rows={4}
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button
                                variant="outline"
                                onClick={() => setCreateOpen(false)}
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handleCreate}
                                disabled={!newTitle || !newMessage}
                            >
                                Create Response
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
            <Separator />

            {/* Search */}
            {responses.length > 0 && (
                <div className="relative max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search responses..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9"
                    />
                </div>
            )}

            <Card>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[180px]">Title</TableHead>
                            <TableHead>Message</TableHead>
                            <TableHead className="w-[140px]">Created By</TableHead>
                            <TableHead className="text-right w-[80px]">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredResponses.length === 0 ? (
                            <TableRow>
                                <TableCell
                                    colSpan={4}
                                    className="text-center py-12"
                                >
                                    <div className="flex flex-col items-center gap-3 text-muted-foreground">
                                        <MessageSquare className="h-10 w-10 opacity-30" />
                                        <div>
                                            <p className="font-medium text-sm">
                                                {searchQuery
                                                    ? "No matching responses"
                                                    : "No canned responses yet"}
                                            </p>
                                            <p className="text-xs mt-1">
                                                {searchQuery
                                                    ? "Try a different search term."
                                                    : "Create your first response and use it in chat with the / shortcut."}
                                            </p>
                                        </div>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredResponses.map((res) => (
                                <TableRow key={res._id}>
                                    <TableCell>
                                        <span className="font-mono text-xs bg-muted px-2 py-1 rounded">
                                            /{res.trigger}
                                        </span>
                                    </TableCell>
                                    <TableCell
                                        className="max-w-[300px] truncate text-sm"
                                        title={res.message}
                                    >
                                        {res.message}
                                    </TableCell>
                                    <TableCell className="text-sm text-muted-foreground">
                                        {user?.fullName || "You"}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 text-muted-foreground mr-1"
                                            onClick={() => {
                                                setEditingId(res._id)
                                                setEditTitle(res.trigger)
                                                setEditMessage(res.message)
                                            }}
                                        >
                                            <Pencil className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="text-destructive h-8 w-8"
                                            onClick={() => handleDelete(res._id)}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </Card>

            {/* Edit Dialog */}
            <Dialog
                open={!!editingId}
                onOpenChange={(open) => {
                    if (!open) {
                        setEditingId(null)
                        setEditTitle("")
                        setEditMessage("")
                    }
                }}
            >
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle>Edit Canned Response</DialogTitle>
                        <DialogDescription>
                            Update the title and message for this response.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-5 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="edit-title">Title</Label>
                            <Input
                                id="edit-title"
                                value={editTitle}
                                onChange={(e) => setEditTitle(e.target.value)}
                                placeholder="e.g., greeting, closing, refund-policy"
                            />
                            <p className="text-xs text-muted-foreground">
                                Internal shortcut name. Use <code className="bg-muted px-1 rounded">/title</code> to access in chat.
                            </p>
                        </div>
                        <div className="grid gap-2">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="edit-message">Message</Label>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-7 gap-1 text-xs"
                                        >
                                            <Zap className="h-3 w-3" />
                                            Personalize
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        {placeholders.map((p) => (
                                            <DropdownMenuItem
                                                key={p.value}
                                                onClick={() => insertEditPlaceholder(p.value)}
                                            >
                                                <p.icon className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
                                                {p.label}
                                                <span className="ml-auto text-xs text-muted-foreground font-mono">
                                                    {p.value}
                                                </span>
                                            </DropdownMenuItem>
                                        ))}
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                            <Textarea
                                ref={editMessageRef}
                                id="edit-message"
                                value={editMessage}
                                onChange={(e) => setEditMessage(e.target.value)}
                                placeholder="Hello {{user_name}}, thanks for reaching out! How can I help you today?"
                                rows={4}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => {
                                setEditingId(null)
                                setEditTitle("")
                                setEditMessage("")
                            }}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleEditSubmit}
                            disabled={!editTitle || !editMessage}
                        >
                            Save Changes
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
