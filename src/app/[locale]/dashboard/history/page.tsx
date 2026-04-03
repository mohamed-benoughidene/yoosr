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
import { Search, Download, Calendar as CalendarIcon, Star } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { useState } from "react"
import { useProject } from "@/context/ProjectContext"
import { formatDistanceToNow, format } from "date-fns"
import { Calendar } from "@/components/ui/calendar"
import { cn } from "@/lib/utils"
import { useQuery, usePaginatedQuery } from "convex/react"
import { api } from "../../../../../convex/_generated/api"

import { DateRange } from "react-day-picker"

export default function HistoryPage() {
    const t = useTranslations("history")
    const { activeProject } = useProject()
    const [search, setSearch] = useState("")
    const [date, setDate] = useState<DateRange | undefined>(undefined)

    const profiles = useQuery(api.profiles.list) ?? []

    // Real-time resolved conversations for history
    const { results: allConversations, status, loadMore } = usePaginatedQuery(
        api.conversations.listResolved,
        activeProject ? { projectId: activeProject._id } : "skip",
        { initialNumItems: 50 }
    )

    const conversations = allConversations

    const filteredConversations = conversations.filter((convo: {
        visitorName?: string;
        lastMessage?: string;
        updatedAt?: number;
    }) => {
        const matchesSearch = convo.visitorName?.toLowerCase().includes(search.toLowerCase()) ||
            convo.lastMessage?.toLowerCase().includes(search.toLowerCase())

        let matchesDate = true
        if (date?.from && convo.updatedAt) {
            const convoDate = new Date(convo.updatedAt)
            // Reset times for accurate date comparison
            const fromDate = new Date(date.from)
            fromDate.setHours(0, 0, 0, 0)

            const toDate = date.to ? new Date(date.to) : new Date(date.from)
            toDate.setHours(23, 59, 59, 999)

            matchesDate = convoDate >= fromDate && convoDate <= toDate
        }

        return matchesSearch && matchesDate
    })

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

    const isLoading = status === "LoadingFirstPage"

    return (
        <div className="flex flex-col gap-6 p-6 h-[calc(100vh-60px)] overflow-hidden">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
                    <p className="text-muted-foreground">
                        {t("subtitle")}
                    </p>
                </div>
                <div className="flex flex-wrap gap-2 shrink-0">
                    <Button variant="outline" onClick={exportToCSV}>
                        <Download className="mr-2 h-4 w-4" />
                        {t("export_csv")}
                    </Button>
                </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                <div className="flex items-center gap-2 w-full max-w-sm">
                    <Search className="h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder={t("search")}
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
                                    "w-[300px] justify-start text-left font-normal",
                                    !date && "text-muted-foreground"
                                )}
                            >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {date?.from ? (
                                    date.to ? (
                                        <>
                                            {format(date.from, "LLL dd, y")} -{" "}
                                            {format(date.to, "LLL dd, y")}
                                        </>
                                    ) : (
                                        format(date.from, "LLL dd, y")
                                    )
                                ) : (
                                    <span>Pick a date range</span>
                                )}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="end">
                            <Calendar
                                initialFocus
                                mode="range"
                                defaultMonth={date?.from}
                                selected={date}
                                onSelect={setDate}
                                numberOfMonths={2}
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
                            <TableHead>{t("visitor")}</TableHead>
                            <TableHead>{t("rating")}</TableHead>
                            <TableHead>{t("resolved_by")}</TableHead>
                            <TableHead>{t("closed_at")}</TableHead>
                            <TableHead></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                                    {t("loading")}
                                </TableCell>
                            </TableRow>
                        ) : filteredConversations.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                                    {t("no_history")}
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
                                            {convo.rating ? (
                                                <div className="flex flex-col gap-1">
                                                    {convo.feedback ? (
                                                        <Popover>
                                                            <PopoverTrigger asChild>
                                                                <button className="flex items-center gap-0.5 hover:opacity-80 transition-opacity cursor-pointer text-left">
                                                                    {[1, 2, 3, 4, 5].map((star) => (
                                                                        <Star
                                                                            key={star}
                                                                            className={`h-3.5 w-3.5 ${star <= convo.rating! ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
                                                                        />
                                                                    ))}
                                                                </button>
                                                            </PopoverTrigger>
                                                            <PopoverContent className="w-80">
                                                                <div className="space-y-2">
                                                                    <div className="flex items-center gap-1 mb-2">
                                                                        {[1, 2, 3, 4, 5].map((star) => (
                                                                            <Star
                                                                                key={star}
                                                                                className={`h-4 w-4 ${star <= convo.rating! ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
                                                                            />
                                                                        ))}
                                                                        <span className="ml-2 text-sm font-medium">{convo.rating}/5</span>
                                                                    </div>
                                                                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                                                                        {convo.feedback}
                                                                    </p>
                                                                </div>
                                                            </PopoverContent>
                                                        </Popover>
                                                    ) : (
                                                        <div className="flex items-center gap-0.5">
                                                            {[1, 2, 3, 4, 5].map((star) => (
                                                                <Star
                                                                    key={star}
                                                                    className={`h-3.5 w-3.5 ${star <= convo.rating! ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
                                                                />
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            ) : (
                                                <span className="text-muted-foreground text-sm italic">{t("not_rated")}</span>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            {convo.resolvedBy ? (() => {
                                                const profile = profiles.find(p => p.userId === convo.resolvedBy);
                                                const displayName = profile?.email || profile?.fullName || "Agent";
                                                return <div className="text-sm">{displayName}</div>;
                                            })()
                                                : convo.lastMessage?.includes("auto-closed") ? (
                                                    <div className="text-sm text-muted-foreground italic">System</div>
                                                ) : (
                                                    <span className="text-muted-foreground text-sm">-</span>
                                                )}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-muted-foreground text-sm">
                                        {convo.updatedAt && formatDistanceToNow(new Date(convo.updatedAt), { addSuffix: true })}
                                    </TableCell>
                                    <TableCell>
                                        <Button variant="ghost" size="sm" onClick={() => window.location.href = `/dashboard/chat?conversationId=${convo._id}`}>
                                            {t("view")}
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
                {status !== "Exhausted" && !isLoading && (
                    <div className="flex justify-center p-4 border-t">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => loadMore(50)}
                            disabled={status === "LoadingMore"}
                        >
                            {status === "LoadingMore" ? (
                                <span className="flex items-center gap-2">
                                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-r-transparent" />
                                    Loading...
                                </span>
                            ) : (
                                "Load more"
                            )}
                        </Button>
                    </div>
                )}
            </div>
        </div>
    )
}
