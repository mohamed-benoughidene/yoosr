"use client"

import { useTranslations } from "next-intl"
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
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useQuery, useMutation } from "convex/react"
import { api } from "../../../../../../convex/_generated/api"
import { useUser } from "@clerk/nextjs"


export default function CannedResponsesPage() {
    const t = useTranslations("settings.canned_responses")
    const placeholders = [
        { label: t("variable_user_name"), value: "{{user_name}}", icon: User },
        { label: t("variable_user_email"), value: "{{user_email}}", icon: Mail },
        { label: t("variable_project_name"), value: "{{project_name}}", icon: Building2 },
        { label: t("variable_ticket_id"), value: "{{ticket_id}}", icon: Hash },
        { label: t("variable_agent_name"), value: "{{agent_name}}", icon: User },
    ]
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
    const [responsePendingDelete, setResponsePendingDelete] = useState<typeof responses[number]["_id"] | null>(null)

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
            toast.success(t("response_created"))
            setNewTitle("")
            setNewMessage("")
            setCreateOpen(false)
        } catch (error: any) {
            const errorMessage = error.data?.message || error.message || t("response_create_failed")
            toast.error(errorMessage)
        }
    }

    const handleDelete = async (id: typeof responses[number]["_id"]) => {
        try {
            await removeCannedResponse({ id })
            toast.success(t("response_deleted"))
        } catch (error: any) {
            const errorMessage = error.data?.message || error.message || t("response_delete_failed")
            toast.error(errorMessage)
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
            toast.success(t("response_updated"))
            setEditingId(null)
        } catch (error: any) {
            const errorMessage = error.data?.message || error.message || t("response_update_failed")
            toast.error(errorMessage)
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
        (r: any) =>
            r.trigger.toLowerCase().includes(searchQuery.toLowerCase()) ||
            r.message.toLowerCase().includes(searchQuery.toLowerCase())
    )

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                    <h3 className="text-lg font-medium">{t("title")}</h3>
                    <p className="text-sm text-muted-foreground">
                        {t("description")}
                    </p>
                </div>
                <div className="flex flex-wrap gap-2 shrink-0">
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
                            {t("add_response")}
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-lg">
                        <DialogHeader>
                            <DialogTitle>{t("create_response_title")}</DialogTitle>
                            <DialogDescription>
                                {t("create_response_desc")}
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-5 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="title">{t("field_title")}</Label>
                                <Input
                                    id="title"
                                    value={newTitle}
                                    onChange={(e) => setNewTitle(e.target.value)}
                                    placeholder={t("field_title_placeholder")}
                                />
                                <p className="text-xs text-muted-foreground">
                                    {t("field_title_desc")}
                                </p>
                            </div>
                            <div className="grid gap-2">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="message">{t("field_message")}</Label>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-7 gap-1 text-xs"
                                            >
                                                <Zap className="h-3 w-3" />
                                                {t("personalize")}
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
                                    placeholder={t("field_message_placeholder")}
                                    rows={4}
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button
                                variant="outline"
                                onClick={() => setCreateOpen(false)}
                            >
                                {t("cancel")}
                            </Button>
                            <Button
                                onClick={handleCreate}
                                disabled={!newTitle || !newMessage}
                            >
                                {t("create_response_btn")}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </div>
        <Separator />

            {/* Search */}
            {responses.length > 0 && (
                <div className="relative max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder={t("search_placeholder")}
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
                            <TableHead className="w-[180px]">{t("table_title")}</TableHead>
                            <TableHead>{t("table_message")}</TableHead>
                            <TableHead className="w-[140px]">{t("table_created_by")}</TableHead>
                            <TableHead className="text-right w-[80px]">{t("table_actions")}</TableHead>
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
                                                    ? t("no_matching_responses")
                                                    : t("no_canned_responses")}
                                            </p>
                                            <p className="text-xs mt-1">
                                                {searchQuery
                                                    ? t("try_different_search")
                                                    : t("create_first_response")}
                                            </p>
                                        </div>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredResponses.map((res: any) => (
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
                                        {user?.fullName || t("you")}
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
                                            onClick={() => setResponsePendingDelete(res._id)}
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
                        <DialogTitle>{t("edit_response_title")}</DialogTitle>
                        <DialogDescription>
                            {t("edit_response_desc")}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-5 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="edit-title">{t("field_title")}</Label>
                            <Input
                                id="edit-title"
                                value={editTitle}
                                onChange={(e) => setEditTitle(e.target.value)}
                                placeholder={t("field_title_placeholder")}
                            />
                            <p className="text-xs text-muted-foreground">
                                {t("field_title_desc")}
                            </p>
                        </div>
                        <div className="grid gap-2">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="edit-message">{t("message_label")}</Label>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-7 gap-1 text-xs"
                                        >
                                            <Zap className="h-3 w-3" />
                                            {t("personalize")}
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
                                placeholder={t("field_message_placeholder")}
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
                            {t("cancel")}
                        </Button>
                        <Button
                            onClick={handleEditSubmit}
                            disabled={!editTitle || !editMessage}
                        >
                            {t("save_changes")}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Canned Response Confirmation */}
            <AlertDialog open={responsePendingDelete !== null} onOpenChange={(open) => { if (!open) setResponsePendingDelete(null) }}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>{t("delete_dialog_title")}</AlertDialogTitle>
                        <AlertDialogDescription>
                            {t("delete_dialog_desc")}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
                        <AlertDialogAction
                            className="bg-destructive text-white hover:bg-destructive/90"
                            onClick={async () => {
                                if (responsePendingDelete) {
                                    await handleDelete(responsePendingDelete)
                                    setResponsePendingDelete(null)
                                }
                            }}
                        >
                            {t("delete_btn")}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}
