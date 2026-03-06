"use client"

import { Button } from "@/components/ui/button"
import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Plus, Search, Bot, Zap, LayoutTemplate, MoreHorizontal, Copy, Trash, Play, Pause } from "lucide-react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
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
import { CreateBotDialog } from "@/components/dashboard/bots/create-bot-dialog"
import { useProject } from "@/context/ProjectContext"
import { useQuery, useMutation } from "convex/react"
import { api } from "../../../../convex/_generated/api"
import { Id } from "../../../../convex/_generated/dataModel"

export default function BotsPage() {
    const { activeProject } = useProject()
    const router = useRouter()
    const [filter, setFilter] = useState<'all' | 'chatbot' | 'automation'>('all')
    const [search, setSearch] = useState("")
    const [botPendingDelete, setBotPendingDelete] = useState<Id<"bots"> | null>(null)

    const bots = useQuery(
        api.bots.list,
        activeProject ? { projectId: activeProject._id } : "skip"
    ) ?? []

    const createBot = useMutation(api.bots.create)
    const updateBot = useMutation(api.bots.update)
    const removeBot = useMutation(api.bots.remove)

    const handleCreateBot = async (name: string, description: string, type: 'chatbot' | 'automation') => {
        if (!activeProject) return

        await createBot({
            projectId: activeProject._id,
            name,
            description,
            type,
        })
    }

    const filteredBots = bots
        .filter(bot => filter === 'all' || bot.type === filter)
        .filter(bot =>
            bot.name.toLowerCase().includes(search.toLowerCase()) ||
            bot.description?.toLowerCase().includes(search.toLowerCase())
        )

    return (
        <div className="flex h-[calc(100vh-60px)] flex-col md:flex-row">
            {/* Sidebar Filters */}
            <div className="w-full md:w-64 border-r bg-muted/10 p-4 space-y-4">
                <div>
                    <h2 className="font-semibold mb-2 px-2">Flows</h2>
                    <div className="space-y-1">
                        <Button
                            variant={filter === 'all' ? "secondary" : "ghost"}
                            className="w-full justify-start"
                            onClick={() => setFilter('all')}
                        >
                            <LayoutTemplate className="mr-2 h-4 w-4" />
                            All Flows
                        </Button>
                        <Button
                            variant={filter === 'chatbot' ? "secondary" : "ghost"}
                            className="w-full justify-start"
                            onClick={() => setFilter('chatbot')}
                        >
                            <Bot className="mr-2 h-4 w-4" />
                            AI Agents
                        </Button>
                        <Button
                            variant={filter === 'automation' ? "secondary" : "ghost"}
                            className="w-full justify-start"
                            onClick={() => setFilter('automation')}
                        >
                            <Zap className="mr-2 h-4 w-4" />
                            Automations
                        </Button>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 p-6 space-y-6 overflow-auto">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Flows</h1>
                        <p className="text-muted-foreground">
                            Design and manage your conversational flows.
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline">
                            <LayoutTemplate className="mr-2 h-4 w-4" />
                            Templates
                        </Button>
                        <CreateBotDialog onCreate={handleCreateBot} />
                    </div>
                </div>

                <div className="flex items-center gap-2 max-w-sm">
                    <Search className="h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search flows..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="bg-background"
                    />
                </div>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {filteredBots.length === 0 ? (
                        <div className="col-span-full text-center p-12 border border-dashed rounded-lg">
                            <p className="text-muted-foreground mb-4">No flows found.</p>
                            <div className="flex justify-center gap-4">
                                <Card className="w-64 cursor-pointer hover:border-primary transition-colors" onClick={() => handleCreateBot('My New Agent', '', 'chatbot')}>
                                    <CardHeader>
                                        <Bot className="h-8 w-8 text-primary mb-2" />
                                        <CardTitle className="text-base">New AI Agent</CardTitle>
                                        <CardDescription>Build an AI-powered assistant.</CardDescription>
                                    </CardHeader>
                                </Card>
                                <Card className="w-64 cursor-pointer hover:border-primary transition-colors" onClick={() => handleCreateBot('My New automation', '', 'automation')}>
                                    <CardHeader>
                                        <Zap className="h-8 w-8 text-orange-500 mb-2" />
                                        <CardTitle className="text-base">New Automation</CardTitle>
                                        <CardDescription>Create a rule-based workflow.</CardDescription>
                                    </CardHeader>
                                </Card>
                            </div>
                        </div>
                    ) : (
                        filteredBots.map((bot) => (
                            <Card key={bot._id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => router.push(`/design-studio/${bot._id}?project=${activeProject?._id}`)}>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <div className={`p-2 rounded-full ${bot.type === 'chatbot' ? 'bg-primary/10 text-primary' : 'bg-orange-500/10 text-orange-500'}`}>
                                        {bot.type === 'chatbot' ? <Bot className="h-4 w-4" /> : <Zap className="h-4 w-4" />}
                                    </div>
                                    <DropdownMenu modal={false}>
                                        <DropdownMenuTrigger asChild>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8"
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                }}

                                            >
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                            <DropdownMenuItem onClick={(e) => {
                                                e.stopPropagation();
                                                router.push(`/design-studio/${bot._id}?project=${activeProject?._id}`);
                                            }}>
                                                <LayoutTemplate className="mr-2 h-4 w-4" />
                                                Open Canvas
                                            </DropdownMenuItem>

                                            <DropdownMenuItem onClick={async (e) => {
                                                e.stopPropagation();
                                                await updateBot({
                                                    id: bot._id,
                                                    status: bot.status === 'active' ? 'draft' : 'active'
                                                });
                                            }}>
                                                {bot.status === 'active' ? (
                                                    <>
                                                        <Pause className="mr-2 h-4 w-4" />
                                                        Deactivate
                                                    </>
                                                ) : (
                                                    <>
                                                        <Play className="mr-2 h-4 w-4" />
                                                        Activate
                                                    </>
                                                )}
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
                                                <Copy className="mr-2 h-4 w-4" />
                                                Duplicate
                                            </DropdownMenuItem>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem className="text-destructive" onClick={(e) => {
                                                e.stopPropagation();
                                                setBotPendingDelete(bot._id);
                                            }}>
                                                <Trash className="mr-2 h-4 w-4" />
                                                Delete
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </CardHeader>
                                <CardContent className="pt-4">
                                    <CardTitle className="text-base mb-1">{bot.name}</CardTitle>
                                    <CardDescription className="line-clamp-2 h-10 mb-4">
                                        {bot.description || "No description provided."}
                                    </CardDescription>
                                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                                        <div className="flex items-center gap-1">
                                            <div className={`h-2 w-2 rounded-full ${bot.status === 'active' ? 'bg-green-500' : 'bg-gray-300'}`} />
                                            <span className="capitalize">{bot.status}</span>
                                        </div>
                                        <span>{new Date(bot._creationTime).toLocaleDateString()}</span>
                                    </div>
                                </CardContent>
                            </Card>
                        ))
                    )}
                </div>
            </div>

            {/* Delete Bot Confirmation Dialog */}
            <AlertDialog open={botPendingDelete !== null} onOpenChange={(open) => { if (!open) setBotPendingDelete(null) }}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Bot</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. The bot and all of its flow design will be permanently deleted.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            className="bg-destructive text-white hover:bg-destructive/90"
                            onClick={async () => {
                                if (botPendingDelete) {
                                    await removeBot({ id: botPendingDelete })
                                    setBotPendingDelete(null)
                                }
                            }}
                        >
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}
