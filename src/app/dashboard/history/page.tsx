"use client"

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
import { Search, Download, Calendar as CalendarIcon } from "lucide-react"
import { useState } from "react"
import { useProject } from "@/context/ProjectContext"
import { formatDistanceToNow, format } from "date-fns"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { cn } from "@/lib/utils"
import { useQuery } from "convex/react"
import { api } from "../../../../convex/_generated/api"

export default function HistoryPage() {
    const { activeProject } = useProject()
    const [search, setSearch] = useState("")
    const [date, setDate] = useState<Date | undefined>(undefined)

    // Real-time conversation list
    const allConversations = useQuery(
        api.conversations.list,
        activeProject ? { projectId: activeProject._id } : "skip"
    ) ?? []

    // Filter for closed/archived/solved conversations
    const conversations = allConversations.filter(c =>
        ['closed', 'archived', 'solved'].includes(c.status ?? '')
    )

    const filteredConversations = conversations.filter(convo =>
        convo.visitorName?.toLowerCase().includes(search.toLowerCase()) ||
        convo.lastMessage?.toLowerCase().includes(search.toLowerCase())
    )

    const exportToCSV = () => {
        const headers = ["ID", "Visitor", "Last Message", "Status", "Date"]
        const csvRows = [headers.join(",")]

        filteredConversations.forEach(c => {
            csvRows.push([
                c._id,
                `"${c.visitorName || 'Anonymous'}"`,
                `"${(c.lastMessage || '').replace(/"/g, '""')}"`,
                c.status,
                c.updatedAt ? new Date(c.updatedAt).toISOString() : ''
            ].join(","))
        })

        const blob = new Blob([csvRows.join("\n")], { type: 'text/csv' })
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `history_export_${format(new Date(), 'yyyy-MM-dd')}.csv`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
    }

    const isLoading = allConversations === undefined

    return (
        <div className="flex flex-col gap-6 p-6 h-[calc(100vh-60px)] overflow-hidden">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Conversation History</h1>
                    <p className="text-muted-foreground">
                        Archive of closed and solved conversations.
                    </p>
                </div>
                <Button variant="outline" onClick={exportToCSV}>
                    <Download className="mr-2 h-4 w-4" />
                    Export CSV
                </Button>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                <div className="flex items-center gap-2 w-full max-w-sm">
                    <Search className="h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search history..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="bg-background"
                    />
                </div>

                <div className="flex gap-2">
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                variant={"outline"}
                                className={cn(
                                    "w-[240px] justify-start text-left font-normal",
                                    !date && "text-muted-foreground"
                                )}
                            >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {date ? format(date, "PPP") : <span>Filter by date</span>}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="end">
                            <Calendar
                                mode="single"
                                selected={date}
                                onSelect={setDate}
                                initialFocus
                            />
                        </PopoverContent>
                    </Popover>
                    {date && (
                        <Button variant="ghost" onClick={() => setDate(undefined)}>
                            Clear Date
                        </Button>
                    )}
                </div>
            </div>

            <div className="border rounded-md flex-1 overflow-auto">
                <Table>
                    <TableHeader className="sticky top-0 bg-background z-10">
                        <TableRow>
                            <TableHead>Visitor</TableHead>
                            <TableHead>Last Message</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Closed At</TableHead>
                            <TableHead></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                                    Loading history...
                                </TableCell>
                            </TableRow>
                        ) : filteredConversations.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                                    No closed conversations found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredConversations.map((convo) => (
                                <TableRow key={convo._id} className="cursor-pointer hover:bg-muted/50">
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <Avatar className="h-8 w-8">
                                                <AvatarFallback>{convo.visitorName?.substring(0, 2).toUpperCase() || "VI"}</AvatarFallback>
                                            </Avatar>
                                            <div className="font-medium">{convo.visitorName || "Anonymous Visitor"}</div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="truncate max-w-[300px] text-muted-foreground">
                                            {convo.lastMessage || "No messages"}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="secondary">
                                            {convo.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-muted-foreground text-sm">
                                        {convo.updatedAt && formatDistanceToNow(new Date(convo.updatedAt), { addSuffix: true })}
                                    </TableCell>
                                    <TableCell>
                                        <Button variant="ghost" size="sm" onClick={() => window.location.href = `/dashboard/chat?conversationId=${convo._id}`}>
                                            View
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
