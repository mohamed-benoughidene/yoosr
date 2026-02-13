"use client"

import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Search, Download, Calendar as CalendarIcon, Filter } from "lucide-react"
import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { useProject } from "@/context/ProjectContext"
import { formatDistanceToNow, format } from "date-fns"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { cn } from "@/lib/utils"

export default function HistoryPage() {
    const { activeProject } = useProject()
    const supabase = createClient()
    const [conversations, setConversations] = useState<any[]>([])
    const [search, setSearch] = useState("")
    const [loading, setLoading] = useState(true)
    const [date, setDate] = useState<Date | undefined>(undefined)

    const fetchHistory = async () => {
        if (!activeProject) return
        setLoading(true)

        try {
            let query = supabase
                .from('conversations')
                .select(`
                    *,
                    profiles:assigned_to (
                        full_name,
                        avatar_url,
                        email
                    )
                `)
                .eq('project_id', activeProject.id)
                .in('status', ['closed', 'archived', 'solved']) // Include all terminal states
                .order('updated_at', { ascending: false })

            if (date) {
                // Filter by date (approximate for MVP, finding items updated on that day)
                const startOfDay = new Date(date)
                startOfDay.setHours(0, 0, 0, 0)
                const endOfDay = new Date(date)
                endOfDay.setHours(23, 59, 59, 999)

                query = query.gte('updated_at', startOfDay.toISOString()).lte('updated_at', endOfDay.toISOString())
            }

            const { data, error } = await query

            if (data) {
                setConversations(data)
            }
        } catch (error) {
            console.error("Error fetching history:", error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchHistory()
    }, [activeProject, date])

    const filteredConversations = conversations.filter(convo =>
        convo.visitor_name?.toLowerCase().includes(search.toLowerCase()) ||
        convo.last_message?.toLowerCase().includes(search.toLowerCase())
    )

    const exportToCSV = () => {
        const headers = ["ID", "Visitor", "Agent", "Last Message", "Status", "Date"]
        const csvRows = [headers.join(",")]

        filteredConversations.forEach(c => {
            csvRows.push([
                c.id,
                `"${c.visitor_name || 'Anonymous'}"`,
                `"${c.profiles?.full_name || 'Unassigned'}"`,
                `"${(c.last_message || '').replace(/"/g, '""')}"`,
                c.status,
                c.updated_at
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
                            <TableHead>Agent</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Closed At</TableHead>
                            <TableHead></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                    Loading history...
                                </TableCell>
                            </TableRow>
                        ) : filteredConversations.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                    No closed conversations found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredConversations.map((convo) => (
                                <TableRow key={convo.id} className="cursor-pointer hover:bg-muted/50">
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <Avatar className="h-8 w-8">
                                                <AvatarFallback>{convo.visitor_name?.substring(0, 2).toUpperCase() || "VI"}</AvatarFallback>
                                            </Avatar>
                                            <div className="font-medium">{convo.visitor_name || "Anonymous Visitor"}</div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="truncate max-w-[300px] text-muted-foreground">
                                            {convo.last_message || "No messages"}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        {convo.profiles ? (
                                            <div className="flex items-center gap-2">
                                                <Avatar className="h-6 w-6">
                                                    <AvatarImage src={convo.profiles.avatar_url} />
                                                    <AvatarFallback>{convo.profiles.full_name?.substring(0, 2).toUpperCase() || "??"}</AvatarFallback>
                                                </Avatar>
                                                <span className="text-sm">{convo.profiles.full_name}</span>
                                            </div>
                                        ) : (
                                            <span className="text-sm text-muted-foreground italic">Bot / Unassigned</span>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="secondary">
                                            {convo.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-muted-foreground text-sm">
                                        {formatDistanceToNow(new Date(convo.updated_at), { addSuffix: true })}
                                    </TableCell>
                                    <TableCell>
                                        <Button variant="ghost" size="sm" onClick={() => window.location.href = `/dashboard/chat?conversationId=${convo.id}`}>
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
