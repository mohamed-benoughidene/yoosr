import Link from "next/link"
import { Id } from "../../../convex/_generated/dataModel"
import {
    Bell,
    CircleUser,
    Home,
    LineChart,
    Menu,
    Package,
    Package2,
    Search,
    ShoppingCart,
    Users,
    MessageSquare,
    Volume2,
    VolumeX
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"

import { useProject } from "@/context/ProjectContext"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { useQuery, useMutation } from "convex/react"
import { api } from "../../../convex/_generated/api"

const SOUND_STORAGE_KEY = "yoosr-sound-enabled"

export function DashboardHeader() {
    const { activeProject, projects, selectProject } = useProject()
    const router = useRouter()
    const [soundEnabled, setSoundEnabled] = useState(() => {
        if (typeof window !== "undefined") {
            return localStorage.getItem(SOUND_STORAGE_KEY) !== "false"
        }
        return true
    })

    const currentMember = useQuery(api.members.current, activeProject ? { projectId: activeProject._id } : "skip")
    const updateMember = useMutation(api.members.update)
    const isAvailable = currentMember?.status === "available"

    const toggleAvailability = async (checked: boolean) => {
        if (currentMember) {
            await updateMember({
                id: currentMember._id,
                status: checked ? "available" : "unavailable"
            })
        }
    }

    useEffect(() => {
        localStorage.setItem(SOUND_STORAGE_KEY, String(soundEnabled))
    }, [soundEnabled])

    const handleProjectSwitch = (projectId: Id<"projects">) => {
        selectProject(projectId)
        router.push(`/dashboard?project=${projectId}`)
    }

    const handleSimulateVisitor = () => {
        // Open chat in a new window or navigate to chat page
        // For now, let's navigate to the chat page with a flag
        router.push(`/dashboard/chat?mode=simulate&project=${activeProject?._id}`)
    }

    return (
        <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-4 lg:h-[60px] lg:px-6">
            <Sheet>
                <SheetTrigger asChild>
                    <Button
                        variant="outline"
                        size="icon"
                        className="shrink-0 md:hidden"
                    >
                        <Menu className="h-5 w-5" />
                        <span className="sr-only">Toggle navigation menu</span>
                    </Button>
                </SheetTrigger>
                <SheetContent side="left" className="flex flex-col">
                    <nav className="grid gap-2 text-lg font-medium">
                        <Link
                            href="/projects"
                            className="flex items-center gap-2 text-lg font-semibold"
                        >
                            <Package2 className="h-6 w-6" />
                            <span className="sr-only">Yoosr</span>
                        </Link>
                        {/* Mobile menu items would go here */}
                    </nav>
                </SheetContent>
            </Sheet>
            <div className="w-full flex-1 flex items-center gap-4">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="w-[200px] justify-between truncate">
                            {activeProject ? (
                                <span className="truncate flex items-center gap-2">
                                    <div className="h-5 w-5 rounded bg-blue-600 text-white flex items-center justify-center text-[10px] uppercase font-bold">
                                        {activeProject.name.charAt(0)}
                                    </div>
                                    {activeProject.name}
                                </span>
                            ) : (
                                "Select Project"
                            )}
                            <Package className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-[200px]">
                        <DropdownMenuLabel>Switch Project</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        {projects.map((project) => (
                            <DropdownMenuItem
                                key={project._id}
                                onSelect={() => handleProjectSwitch(project._id)}
                                className={activeProject?._id === project._id ? "bg-accent" : ""}
                            >
                                <span className="truncate">{project.name}</span>
                            </DropdownMenuItem>
                        ))}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                            <Link href="/projects" className="flex items-center cursor-pointer">
                                <Home className="mr-2 h-4 w-4" />
                                All Projects
                            </Link>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>

                {/* Quick Actions */}
                <div className="flex items-center gap-4 ml-4">
                    {activeProject && currentMember && (
                        <div className="flex items-center space-x-2 border-r pr-4 mr-2">
                            <Switch
                                id="availability-mode"
                                checked={isAvailable}
                                onCheckedChange={toggleAvailability}
                            />
                            <Label htmlFor="availability-mode" className="text-sm font-medium">
                                {isAvailable ? (
                                    <span className="text-green-600 dark:text-green-500">Available</span>
                                ) : (
                                    <span className="text-muted-foreground">Unavailable</span>
                                )}
                            </Label>
                        </div>
                    )}

                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button variant="ghost" size="icon" onClick={handleSimulateVisitor}>
                                    <MessageSquare className="h-5 w-5 text-muted-foreground" />
                                    <span className="sr-only">Simulate Visitor</span>
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>Simulate Visitor</TooltipContent>
                        </Tooltip>
                    </TooltipProvider>

                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button variant="ghost" size="icon" onClick={() => setSoundEnabled(!soundEnabled)}>
                                    {soundEnabled ? (
                                        <Volume2 className="h-5 w-5 text-muted-foreground" />
                                    ) : (
                                        <VolumeX className="h-5 w-5 text-muted-foreground" />
                                    )}
                                    <span className="sr-only">Toggle Sound</span>
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>Toggle Sound</TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </div>

                <form className="flex-1 hidden md:block ml-auto">
                    <div className="relative">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            type="search"
                            placeholder="Search..."
                            className="w-full appearance-none bg-background pl-8 shadow-none md:w-2/3 lg:w-1/3 ml-auto"
                        />
                    </div>
                </form>
            </div>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="secondary" size="icon" className="rounded-full">
                        <CircleUser className="h-5 w-5" />
                        <span className="sr-only">Toggle user menu</span>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuLabel>My Account</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>Settings</DropdownMenuItem>
                    <DropdownMenuItem>Support</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>Logout</DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </header>
    )
}
