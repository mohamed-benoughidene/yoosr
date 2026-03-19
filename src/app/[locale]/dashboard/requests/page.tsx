"use client"

import { useTranslations } from "next-intl"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Bot, Search, User, UserCheck, Loader2, CheckCircle } from "lucide-react"
import { useState } from "react"
import { useProject } from "@/context/ProjectContext"
import { formatDistanceToNow } from "date-fns"
import { useQuery, useMutation } from "convex/react"
import { api } from "../../../../../convex/_generated/api"
import { useUser } from "@clerk/nextjs"
import { useRouter } from "next/navigation"
import { Id } from "../../../../../convex/_generated/dataModel"
import { toast } from "sonner"

type RequestFilter = "unassigned" | "mine" | "bot_escalated"

export default function RequestsPage() {
    const t = useTranslations("requests")
    const { activeProject } = useProject()
    const { user } = useUser()
    const router = useRouter()
    const [filter, setFilter] = useState<RequestFilter>("unassigned")
    const [search, setSearch] = useState("")
    const [assigningId, setAssigningId] = useState<string | null>(null)
    const [resolvingId, setResolvingId] = useState<string | null>(null)

    const updateConversation = useMutation(api.conversations.update)
    const resolveConversation = useMutation(api.conversations.resolve)

    const myDepartments = useQuery(
        api.settings.getMyDepartments,
        activeProject ? { projectId: activeProject._id } : "skip"
    )

    // Real-time conversations
    const rawConversations = useQuery(
        api.conversations.list,
        activeProject ? {
            projectId: activeProject._id,
        } : "skip"
    )
    const allConversations = rawConversations ?? []

    // Filter based on selection
    const requests = allConversations.filter((req) => {
        // Exclude resolved/closed conversations
        if (req.status === 1000) return false

        if (filter === "bot_escalated") return (req as any).handoffSource === "bot"
        if (filter === "unassigned") return !req.assignedTo
        if (filter === "mine" && user) return req.assignedTo === user.id
        return true
    })

    // Sort: Bot-escalated surfaced first within any view
    const filteredRequests = requests
        .slice()
        .sort((a, b) => {
            const aEsc = (a as any).handoffSource === "bot" ? 0 : 1
            const bEsc = (b as any).handoffSource === "bot" ? 0 : 1
            if (aEsc !== bEsc) return aEsc - bEsc
            return 0
        })
        .filter(
            (req) =>
                req.visitorName?.toLowerCase().includes(search.toLowerCase()) ||
                req.lastMessage?.toLowerCase().includes(search.toLowerCase())
        )

    const unassignedCount = allConversations.filter((c) => !c.assignedTo && c.status !== 1000).length
    const myCount = allConversations.filter((c) => c.assignedTo === user?.id && c.status !== 1000).length
    const botEscalatedCount = allConversations.filter((c) => (c as any).handoffSource === "bot" && c.status !== 1000).length

    const handleAssignToMe = async (id: Id<"conversations">) => {
        if (!user) return
        setAssigningId(id)
        try {
            await updateConversation({
                id,
                assignedTo: user.id,
            })
            // Navigate to chat after assignment
            router.push(`/dashboard/chat?conversationId=${id}`)
        } catch (error) {
            console.error("Error assigning conversation:", error)
            toast.error("Failed to assign conversation")
        } finally {
            setAssigningId(null)
        }
    }

    const handleResolve = async (id: Id<"conversations">) => {
        setResolvingId(id)
        try {
            await resolveConversation({ id })
        } catch (error) {
            console.error("Error resolving conversation:", error)
            toast.error("Failed to resolve conversation")
        } finally {
            setResolvingId(null)
        }
    }

    const isLoading = rawConversations === undefined

    return (
        <div className="flex h-[calc(100vh-60px)] flex-col md:flex-row">
            {/* Sidebar Filters */}
            <div className="w-full md:w-64 border-r bg-muted/10 p-4 space-y-4">
                <div>
                    <h2 className="font-semibold mb-2 px-2">{t("title")}</h2>
                    <div className="space-y-1">
                        <Button
                            variant={filter === "unassigned" ? "secondary" : "ghost"}
                            className="w-full justify-start"
                            onClick={() => setFilter("unassigned")}
                        >
                            <User className="mr-2 h-4 w-4" />
                            {t("unassigned")}
                            {unassignedCount > 0 && (
                                <Badge
                                    variant="secondary"
                                    className="ml-auto h-5 min-w-[20px] px-1.5 bg-blue-600 text-white text-[10px] font-bold"
                                >
                                    {unassignedCount}
                                </Badge>
                            )}
                        </Button>
                        <Button
                            variant={filter === "mine" ? "secondary" : "ghost"}
                            className="w-full justify-start"
                            onClick={() => setFilter("mine")}
                        >
                            <UserCheck className="mr-2 h-4 w-4" />
                            {t("assigned_to_me")}
                            {myCount > 0 && (
                                <Badge
                                    variant="secondary"
                                    className="ml-auto h-5 min-w-[20px] px-1.5 bg-muted-foreground/20 text-foreground text-[10px] font-bold"
                                >
                                    {myCount}
                                </Badge>
                            )}
                        </Button>
                        <Button
                            variant={filter === "bot_escalated" ? "secondary" : "ghost"}
                            className="w-full justify-start"
                            onClick={() => setFilter("bot_escalated")}
                        >
                            <Bot className="mr-2 h-4 w-4 text-orange-500" />
                            {t("bot_escalated")}
                            {botEscalatedCount > 0 && (
                                <Badge
                                    variant="secondary"
                                    className="ml-auto h-5 min-w-[20px] px-1.5 bg-orange-500 text-white text-[10px] font-bold animate-pulse"
                                >
                                    {botEscalatedCount}
                                </Badge>
                            )}
                        </Button>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 p-6 space-y-6 overflow-auto">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">{t("title")}</h1>
                    <p className="text-muted-foreground">
                        {t("subtitle")}
                    </p>
                </div>

                <div className="flex items-center gap-2 max-w-sm">
                    <Search className="h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder={t("search")}
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="bg-background"
                    />
                </div>

                <div className="border rounded-md">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>{t("visitor")}</TableHead>
                                <TableHead>{t("last_message")}</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>{t("waiting_time")}</TableHead>
                                <TableHead></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                <TableRow>
                                    <TableCell
                                        colSpan={5}
                                        className="text-center py-8 text-muted-foreground"
                                    >
                                        Loading requests...
                                    </TableCell>
                                </TableRow>
                            ) : filteredRequests.length === 0 ? (
                                <TableRow>
                                    <TableCell
                                        colSpan={5}
                                        className="text-center py-8 text-muted-foreground"
                                    >
                                        {t("no_requests")}
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredRequests.map((req) => (
                                    <TableRow
                                        key={req._id}
                                        className="cursor-pointer hover:bg-muted/50"
                                        onClick={() =>
                                            router.push(
                                                `/dashboard/chat?conversationId=${req._id}`
                                            )
                                        }
                                    >
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <Avatar className="h-8 w-8">
                                                    <AvatarFallback>
                                                        {req.visitorName
                                                            ?.substring(0, 2)
                                                            .toUpperCase() || "VI"}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div className="font-medium">
                                                    {req.visitorName || "Anonymous Visitor"}
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="truncate max-w-[300px] text-muted-foreground">
                                                {req.lastMessage || "No messages yet"}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {(req as any).handoffSource === "bot" ? (
                                                <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-100 border-orange-200">
                                                    {t("bot_escalated")}
                                                </Badge>
                                            ) : req.status === 200 || req.assignedTo ? (
                                                <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 border-blue-200">
                                                    Ongoing
                                                </Badge>
                                            ) : (
                                                <Badge variant="secondary">{t("unassigned")}</Badge>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-muted-foreground text-sm">
                                            {req.updatedAt &&
                                                formatDistanceToNow(
                                                    new Date(req.updatedAt),
                                                    { addSuffix: true }
                                                )}
                                        </TableCell>
                                        <TableCell>
                                            {!req.assignedTo && (
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    disabled={assigningId === req._id}
                                                    onClick={(e) => {
                                                        e.stopPropagation()
                                                        handleAssignToMe(req._id)
                                                    }}
                                                >
                                                    {assigningId === req._id ? (
                                                        <Loader2 className="mr-1.5 h-3 w-3 animate-spin" />
                                                    ) : (
                                                        <UserCheck className="mr-1.5 h-3 w-3" />
                                                    )}
                                                    {t("assign_to_me")}
                                                </Button>
                                            )}
                                            {req.assignedTo === user?.id && req.status !== 1000 && (
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    disabled={resolvingId === req._id}
                                                    onClick={(e) => {
                                                        e.stopPropagation()
                                                        handleResolve(req._id)
                                                    }}
                                                    className="text-green-600 border-green-500/30 hover:bg-green-500/10"
                                                >
                                                    {resolvingId === req._id ? (
                                                        <Loader2 className="mr-1.5 h-3 w-3 animate-spin" />
                                                    ) : (
                                                        <CheckCircle className="mr-1.5 h-3 w-3" />
                                                    )}
                                                    {t("resolve")}
                                                </Button>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </div>
    )
}
