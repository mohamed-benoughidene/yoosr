"use client"

import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Search, Bot, Zap, LayoutTemplate, MoreHorizontal, Copy, Trash, Play, Pause } from "lucide-react"
import { useState } from "react"
import { useRouter } from "@/i18n/navigation"
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
import { api } from "../../../../../convex/_generated/api"
import { Id, Doc } from "../../../../../convex/_generated/dataModel"

let nextTempId = 0;

export default function BotsPage() {
    const t = useTranslations("bots")
    const { activeProject } = useProject()
    const router = useRouter()
    const isAdmin = activeProject?.userRole === "org:admin"
    const [filter, setFilter] = useState<'all' | 'chatbot' | 'automation'>('all')
    const [search, setSearch] = useState("")
    const [botPendingDelete, setBotPendingDelete] = useState<Id<"bots"> | null>(null)

    const bots = useQuery(
        api.bots.list,
        activeProject ? { projectId: activeProject._id } : "skip"
    ) ?? []

    const createBot = useMutation(api.bots.create).withOptimisticUpdate(
        (localStore, args) => {
            const existing = localStore.getQuery(api.bots.list, { projectId: args.projectId });
            if (existing) {
                const id = `temp_${(nextTempId++).toString(36)}`;
                localStore.setQuery(api.bots.list, { projectId: args.projectId }, [
                    ...existing,
                    {
                        _id: id as Id<"bots">,
                        _creationTime: 0,
                        projectId: args.projectId,
                        name: args.name,
                        description: args.description,
                        type: args.type,
                    },
                ]);
            }
        }
    );
    const updateBot = useMutation(api.bots.update).withOptimisticUpdate(
        (localStore, args) => {
            const allQueries = localStore.getAllQueries(api.bots.list);
            for (const q of allQueries) {
                if (q.value) {
                    localStore.setQuery(
                        api.bots.list,
                        q.args,
                        (q.value as Doc<"bots">[]).map((b) =>
                            b._id === args.id
                                ? { ...b, name: args.name ?? b.name, description: args.description ?? b.description }
                                : b
                        )
                    );
                }
            }
        }
    );
    const removeBot = useMutation(api.bots.remove).withOptimisticUpdate(
        (localStore, args) => {
            const allQueries = localStore.getAllQueries(api.bots.list);
            for (const q of allQueries) {
                if (q.value) {
                    localStore.setQuery(
                        api.bots.list,
                        q.args,
                        (q.value as Doc<"bots">[]).filter((b) => b._id !== args.id)
                    );
                }
            }
        }
    );

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
                    <h2 className="font-semibold mb-2 px-2">{t("flows")}</h2>
                    <div className="space-y-1">
                        <Button
                            variant={filter === 'all' ? "secondary" : "ghost"}
                            className="w-full justify-start"
                            onClick={() => setFilter('all')}
                        >
                            <LayoutTemplate className="mr-2 h-4 w-4" />
                            {t("filter_all")}
                        </Button>
                        <Button
                            variant={filter === 'chatbot' ? "secondary" : "ghost"}
                            className="w-full justify-start"
                            onClick={() => setFilter('chatbot')}
                        >
                            <Bot className="mr-2 h-4 w-4" />
                            {t("filter_agents")}
                        </Button>
                        <Button
                            variant={filter === 'automation' ? "secondary" : "ghost"}
                            className="w-full justify-start"
                            onClick={() => setFilter('automation')}
                        >
                            <Zap className="mr-2 h-4 w-4" />
                            {t("filter_automations")}
                        </Button>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 p-6 space-y-6 overflow-auto">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">{t("title")}</h1>
                        <p className="text-muted-foreground">
                            {t("description")}
                        </p>
                    </div>
                    <div className="flex flex-wrap gap-2 shrink-0">
                        <Button variant="outline">
                            <LayoutTemplate className="mr-2 h-4 w-4" />
                            {t("templates")}
                        </Button>
                        {isAdmin && <CreateBotDialog onCreate={handleCreateBot} />}
                    </div>
                </div>

                <div className="flex items-center gap-2 max-w-sm">
                    <Search className="h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder={t("search_placeholder")}
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="bg-background"
                    />
                </div>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {filteredBots.length === 0 ? (
                        <div className="col-span-full text-center p-12 border border-dashed rounded-lg">
                            <p className="text-muted-foreground mb-4">{t("no_flows_found")}</p>
                            {isAdmin && (
                                <div className="flex justify-center gap-4">
                                    <Card className="w-64 cursor-pointer hover:border-primary transition-colors" onClick={() => handleCreateBot(t("default_agent_name"), '', 'chatbot')}>
                                        <CardHeader>
                                            <Bot className="h-8 w-8 text-primary mb-2" />
                                            <CardTitle className="text-base">{t("new_ai_agent")}</CardTitle>
                                            <CardDescription>{t("new_ai_agent_desc")}</CardDescription>
                                        </CardHeader>
                                    </Card>
                                    <Card className="w-64 cursor-pointer hover:border-primary transition-colors" onClick={() => handleCreateBot(t("default_automation_name"), '', 'automation')}>
                                        <CardHeader>
                                            <Zap className="h-8 w-8 text-orange-500 mb-2" />
                                            <CardTitle className="text-base">{t("new_automation")}</CardTitle>
                                            <CardDescription>{t("new_automation_desc")}</CardDescription>
                                        </CardHeader>
                                    </Card>
                                </div>
                            )}
                        </div>
                    ) : (
                        filteredBots.map((bot) => (
                            <Card
                                key={bot._id}
                                className={cn(
                                    "transition-all",
                                    isAdmin ? "cursor-pointer hover:shadow-md" : "cursor-default"
                                )}
                                onClick={isAdmin ? () => router.push(`/design-studio/${bot._id}?project=${activeProject?._id}`) : undefined}
                            >
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <div className={`p-2 rounded-full ${bot.type === 'chatbot' ? 'bg-primary/10 text-primary' : 'bg-orange-500/10 text-orange-500'}`}>
                                        {bot.type === 'chatbot' ? <Bot className="h-4 w-4" /> : <Zap className="h-4 w-4" />}
                                    </div>
                                    {isAdmin && (
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
                                                <DropdownMenuLabel>{t("actions_label")}</DropdownMenuLabel>
                                                <DropdownMenuItem onClick={(e) => {
                                                    e.stopPropagation();
                                                    router.push(`/design-studio/${bot._id}?project=${activeProject?._id}`);
                                                }}>
                                                    <LayoutTemplate className="mr-2 h-4 w-4" />
                                                    {t("action_open_canvas")}
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
                                                            {t("action_deactivate")}
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Play className="mr-2 h-4 w-4" />
                                                            {t("action_activate")}
                                                        </>
                                                    )}
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
                                                    <Copy className="mr-2 h-4 w-4" />
                                                    {t("action_duplicate")}
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem className="text-destructive" onClick={(e) => {
                                                    e.stopPropagation();
                                                    setBotPendingDelete(bot._id);
                                                }}>
                                                    <Trash className="mr-2 h-4 w-4" />
                                                    {t("action_delete")}
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    )}
                                </CardHeader>
                                <CardContent className="pt-4">
                                    <CardTitle className="text-base mb-1">{bot.name}</CardTitle>
                                    <CardDescription className="line-clamp-2 h-10 mb-4">
                                        {bot.description || t("no_description")}
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
                        <AlertDialogTitle>{t("delete_bot_title")}</AlertDialogTitle>
                        <AlertDialogDescription>
                            {t("delete_bot_desc")}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
                        <AlertDialogAction
                            className="bg-destructive text-white hover:bg-destructive/90"
                            onClick={async () => {
                                if (botPendingDelete) {
                                    await removeBot({ id: botPendingDelete })
                                    setBotPendingDelete(null)
                                }
                            }}
                        >
                            {t("delete")}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}
