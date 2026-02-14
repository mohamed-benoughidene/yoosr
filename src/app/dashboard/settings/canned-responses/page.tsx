"use client"

import { useProject } from "@/context/ProjectContext"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { createClient } from "@/lib/supabase/client"
import { useState, useEffect, useRef } from "react"
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

const placeholders = [
    { label: "User Name", value: "{{user_name}}", icon: User },
    { label: "User Email", value: "{{user_email}}", icon: Mail },
    { label: "Project Name", value: "{{project_name}}", icon: Building2 },
    { label: "Ticket ID", value: "{{ticket_id}}", icon: Hash },
]

export default function CannedResponsesPage() {
    const { activeProject } = useProject()
    const [responses, setResponses] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [createOpen, setCreateOpen] = useState(false)
    const [newTitle, setNewTitle] = useState("")
    const [newMessage, setNewMessage] = useState("")
    const [searchQuery, setSearchQuery] = useState("")
    const [currentUserName, setCurrentUserName] = useState<string | null>(null)
    const messageRef = useRef<HTMLTextAreaElement>(null)

    const fetchResponses = async () => {
        if (!activeProject) return
        const supabase = createClient()

        const { data: { user } } = await supabase.auth.getUser()

        // Get profile name for display
        if (user) {
            const { data: profile } = await supabase
                .from("profiles")
                .select("full_name")
                .eq("id", user.id)
                .single()
            if (profile) setCurrentUserName(profile.full_name)
        }

        const { data } = await supabase
            .from("canned_responses")
            .select("*")
            .eq("project_id", activeProject.id)
            .order("created_at", { ascending: false })

        if (data) setResponses(data)
        setLoading(false)
    }

    useEffect(() => {
        fetchResponses()
    }, [activeProject])

    const handleCreate = async () => {
        if (!activeProject || !newTitle || !newMessage) return
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()

        const { error } = await supabase.from("canned_responses").insert({
            project_id: activeProject.id,
            trigger: newTitle,
            message: newMessage,
            created_by: user?.id || null,
        })

        if (error) {
            toast.error("Failed to create canned response")
            console.error(error)
        } else {
            toast.success("Canned response created")
            setNewTitle("")
            setNewMessage("")
            setCreateOpen(false)
            fetchResponses()
        }
    }

    const handleDelete = async (id: string) => {
        const supabase = createClient()
        const { error } = await supabase
            .from("canned_responses")
            .delete()
            .eq("id", id)

        if (error) {
            toast.error("Failed to delete response")
        } else {
            toast.success("Response deleted")
            fetchResponses()
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
        // Set cursor position after placeholder
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
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={4} className="text-center py-8">
                                    Loading...
                                </TableCell>
                            </TableRow>
                        ) : filteredResponses.length === 0 ? (
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
                                <TableRow key={res.id}>
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
                                        {currentUserName || "You"}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="text-destructive h-8 w-8"
                                            onClick={() => handleDelete(res.id)}
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
        </div>
    )
}
