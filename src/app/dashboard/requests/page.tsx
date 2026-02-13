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
import { Search, User, MessageSquare, Clock, Filter, Play } from "lucide-react"
import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { useProject } from "@/context/ProjectContext"
import { formatDistanceToNow } from "date-fns"

type RequestFilter = 'all' | 'unassigned' | 'mine'

export default function RequestsPage() {
    const { activeProject } = useProject()
    const supabase = createClient()
    const [requests, setRequests] = useState<any[]>([])
    const [filter, setFilter] = useState<RequestFilter>('all')
    const [search, setSearch] = useState("")
    const [loading, setLoading] = useState(true)
    const [currentUser, setCurrentUser] = useState<any>(null)

    useEffect(() => {
        const getUser = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            setCurrentUser(user)
        }
        getUser()
    }, [])

    const fetchRequests = async () => {
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
                .order('updated_at', { ascending: false })

            if (filter === 'unassigned') {
                query = query.is('assigned_to', null)
            } else if (filter === 'mine' && currentUser) {
                query = query.eq('assigned_to', currentUser.id)
            }

            const { data, error } = await query

            if (data) {
                setRequests(data)
            }
        } catch (error) {
            console.error("Error fetching requests:", error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchRequests()
    }, [activeProject, filter, currentUser])

    const filteredRequests = requests.filter(req =>
        req.visitor_name?.toLowerCase().includes(search.toLowerCase()) ||
        req.last_message?.toLowerCase().includes(search.toLowerCase())
    )

    return (
        <div className="flex h-[calc(100vh-60px)] flex-col md:flex-row">
            {/* Sidebar Filters */}
            <div className="w-full md:w-64 border-r bg-muted/10 p-4 space-y-4">
                <div>
                    <h2 className="font-semibold mb-2 px-2">Requests</h2>
                    <div className="space-y-1">
                        <Button
                            variant={filter === 'all' ? "secondary" : "ghost"}
                            className="w-full justify-start"
                            onClick={() => setFilter('all')}
                        >
                            <MessageSquare className="mr-2 h-4 w-4" />
                            All Requests
                        </Button>
                        <Button
                            variant={filter === 'unassigned' ? "secondary" : "ghost"}
                            className="w-full justify-start"
                            onClick={() => setFilter('unassigned')}
                        >
                            <User className="mr-2 h-4 w-4" />
                            Unassigned
                        </Button>
                        <Button
                            variant={filter === 'mine' ? "secondary" : "ghost"}
                            className="w-full justify-start"
                            onClick={() => setFilter('mine')}
                        >
                            <User className="mr-2 h-4 w-4" />
                            Assigned to me
                        </Button>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 p-6 space-y-6 overflow-auto">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Requests</h1>
                        <p className="text-muted-foreground">
                            Manage and respond to customer support tickets.
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={() => window.open('/dashboard/chat', '_blank')}>
                            <Play className="mr-2 h-4 w-4" />
                            Simulate Visitor
                        </Button>
                    </div>
                </div>

                <div className="flex items-center gap-2 max-w-sm">
                    <Search className="h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search requests..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="bg-background"
                    />
                </div>

                <div className="border rounded-md">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>User / Visitor</TableHead>
                                <TableHead>Message</TableHead>
                                <TableHead>Agent</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Time</TableHead>
                                <TableHead></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                        Loading requests...
                                    </TableCell>
                                </TableRow>
                            ) : filteredRequests.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                        No requests found.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredRequests.map((req) => (
                                    <TableRow key={req.id} className="cursor-pointer hover:bg-muted/50">
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <Avatar className="h-8 w-8">
                                                    <AvatarFallback>{req.visitor_name?.substring(0, 2).toUpperCase() || "VI"}</AvatarFallback>
                                                </Avatar>
                                                <div className="font-medium">{req.visitor_name || "Anonymous Visitor"}</div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="truncate max-w-[300px] text-muted-foreground">
                                                {req.last_message || "No messages yet"}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {req.profiles ? (
                                                <div className="flex items-center gap-2">
                                                    <Avatar className="h-6 w-6">
                                                        <AvatarImage src={req.profiles.avatar_url} />
                                                        <AvatarFallback>{req.profiles.full_name?.substring(0, 2).toUpperCase() || "??"}</AvatarFallback>
                                                    </Avatar>
                                                    <span className="text-sm">{req.profiles.full_name}</span>
                                                </div>
                                            ) : (
                                                <span className="text-sm text-muted-foreground italic">Unassigned</span>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={req.status === 'open' ? 'default' : 'secondary'}>
                                                {req.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-muted-foreground text-sm">
                                            {formatDistanceToNow(new Date(req.updated_at), { addSuffix: true })}
                                        </TableCell>
                                        <TableCell>
                                            <Button variant="ghost" size="sm" onClick={() => window.location.href = `/dashboard/chat?conversationId=${req.id}`}>
                                                Open
                                            </Button>
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
