"use client"

import { useProject } from "@/context/ProjectContext"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { createClient } from "@/lib/supabase/client"
import { useState, useEffect } from "react"
import { toast } from "sonner"
import {
    UserPlus,
    Trash2,
    Circle,
    Shield,
    Crown,
    Headset,
} from "lucide-react"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
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
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface Member {
    id: string
    user_id: string | null
    role: string
    status: string
    invited_email: string | null
    invited_at: string | null
    created_at: string
    profile: {
        full_name: string | null
        avatar_url: string | null
    } | null
    user_email?: string
}

const roleConfig: Record<string, { label: string; icon: typeof Crown; variant: "default" | "secondary" | "outline" }> = {
    owner: { label: "Owner", icon: Crown, variant: "default" },
    administrator: { label: "Admin", icon: Shield, variant: "secondary" },
    agent: { label: "Agent", icon: Headset, variant: "outline" },
}

export default function TeammatesPage() {
    const { activeProject } = useProject()
    const [members, setMembers] = useState<Member[]>([])
    const [loading, setLoading] = useState(true)
    const [inviteOpen, setInviteOpen] = useState(false)
    const [inviteEmail, setInviteEmail] = useState("")
    const [inviteRole, setInviteRole] = useState<string>("agent")
    const [currentUserId, setCurrentUserId] = useState<string | null>(null)

    const fetchMembers = async () => {
        if (!activeProject) return
        const supabase = createClient()

        const { data: { user } } = await supabase.auth.getUser()
        if (user) setCurrentUserId(user.id)

        // Fetch members
        const { data, error } = await supabase
            .from("project_members")
            .select("*")
            .eq("project_id", activeProject.id)
            .order("created_at", { ascending: true })

        let membersList: any[] = data || []

        if (error) {
            console.warn("Could not fetch members:", error.message)
            membersList = []
        }

        // Check if current user is in the list
        const currentUserInList = user && membersList.some((m: any) => m.user_id === user.id)

        // If current user is project owner but not in member list, add them virtually
        // and try to persist in background (fire-and-forget)
        if (user && !currentUserInList) {
            // Add virtual owner row for display
            membersList = [
                {
                    id: "virtual-owner",
                    project_id: activeProject.id,
                    user_id: user.id,
                    role: "owner",
                    status: "available",
                    invited_email: null,
                    invited_at: null,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                },
                ...membersList,
            ]

            // Try to persist owner row in background (don't await or re-fetch)
            supabase.from("project_members").upsert(
                {
                    project_id: activeProject.id,
                    user_id: user.id,
                    role: "owner",
                    status: "available",
                },
                { onConflict: "project_id,user_id" }
            ).then(({ error: upsertErr }) => {
                if (upsertErr) console.warn("Could not persist owner membership:", upsertErr.message)
            })
        }

        // Fetch profiles for members with user_ids
        const userIds = membersList.filter((m: any) => m.user_id).map((m: any) => m.user_id)
        let profilesMap: Record<string, { full_name: string | null; avatar_url: string | null }> = {}

        if (userIds.length > 0) {
            const { data: profiles } = await supabase
                .from("profiles")
                .select("id, full_name, avatar_url")
                .in("id", userIds)

            if (profiles) {
                profilesMap = Object.fromEntries(profiles.map((p: any) => [p.id, p]))
            }
        }

        const enriched = membersList.map((m: any) => ({
            ...m,
            profile: profilesMap[m.user_id] || null,
            user_email: m.user_id === user?.id ? user?.email : m.invited_email || "—",
        }))
        setMembers(enriched)
        setLoading(false)
    }

    useEffect(() => {
        fetchMembers()
    }, [activeProject])

    const handleInvite = async () => {
        if (!activeProject || !inviteEmail) return
        const supabase = createClient()

        const { error } = await supabase.from("project_members").insert({
            project_id: activeProject.id,
            role: inviteRole,
            invited_email: inviteEmail,
            invited_at: new Date().toISOString(),
        })

        if (error) {
            toast.error("Failed to invite teammate")
            console.error(error)
        } else {
            toast.success(`Invitation sent to ${inviteEmail}`)
            setInviteEmail("")
            setInviteRole("agent")
            setInviteOpen(false)
            fetchMembers()
        }
    }

    const handleStatusChange = async (memberId: string, newStatus: string) => {
        const supabase = createClient()
        const { error } = await supabase
            .from("project_members")
            .update({ status: newStatus, updated_at: new Date().toISOString() })
            .eq("id", memberId)

        if (error) {
            toast.error("Failed to update status")
        } else {
            toast.success(`Status changed to ${newStatus}`)
            fetchMembers()
        }
    }

    const handleRoleChange = async (memberId: string, newRole: string) => {
        const supabase = createClient()
        const { error } = await supabase
            .from("project_members")
            .update({ role: newRole, updated_at: new Date().toISOString() })
            .eq("id", memberId)

        if (error) {
            toast.error("Failed to update role")
        } else {
            toast.success(`Role changed to ${newRole}`)
            fetchMembers()
        }
    }

    const handleRemove = async (memberId: string) => {
        const supabase = createClient()
        const { error } = await supabase
            .from("project_members")
            .delete()
            .eq("id", memberId)

        if (error) {
            toast.error("Failed to remove member")
        } else {
            toast.success("Member removed")
            fetchMembers()
        }
    }

    const getInitials = (name: string | null | undefined) => {
        if (!name) return "?"
        return name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2)
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-medium">Teammates</h3>
                    <p className="text-sm text-muted-foreground">
                        Manage who has access to this project.
                    </p>
                </div>
                <Dialog
                    open={inviteOpen}
                    onOpenChange={(open) => {
                        setInviteOpen(open)
                        if (!open) {
                            setInviteEmail("")
                            setInviteRole("agent")
                        }
                    }}
                >
                    <DialogTrigger asChild>
                        <Button>
                            <UserPlus className="mr-2 h-4 w-4" />
                            Invite Teammate
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md">
                        <DialogHeader>
                            <DialogTitle>Invite Teammate</DialogTitle>
                            <DialogDescription>
                                Send an invitation to add a new team member.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-6 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="email">Email Address</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={inviteEmail}
                                    onChange={(e) => setInviteEmail(e.target.value)}
                                    placeholder="teammate@company.com"
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label>Role</Label>
                                <Select value={inviteRole} onValueChange={setInviteRole}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="agent">
                                            <div className="flex items-center gap-2">
                                                <Headset className="h-3.5 w-3.5" />
                                                Agent — Handle conversations
                                            </div>
                                        </SelectItem>
                                        <SelectItem value="administrator">
                                            <div className="flex items-center gap-2">
                                                <Shield className="h-3.5 w-3.5" />
                                                Admin — Manage settings & users
                                            </div>
                                        </SelectItem>
                                        <SelectItem value="owner">
                                            <div className="flex items-center gap-2">
                                                <Crown className="h-3.5 w-3.5" />
                                                Owner — Full access
                                            </div>
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setInviteOpen(false)}>
                                Cancel
                            </Button>
                            <Button onClick={handleInvite} disabled={!inviteEmail}>
                                Send Invitation
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
            <Separator />

            <Card>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Member</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Role</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={4} className="text-center py-8">
                                    Loading...
                                </TableCell>
                            </TableRow>
                        ) : members.length === 0 ? (
                            <TableRow>
                                <TableCell
                                    colSpan={4}
                                    className="text-center py-8 text-muted-foreground"
                                >
                                    No team members yet.
                                </TableCell>
                            </TableRow>
                        ) : (
                            members.map((member) => {
                                const isPending = !member.user_id
                                const isOwner = member.role === "owner"
                                const isCurrentUser = member.user_id === currentUserId
                                const name = isPending
                                    ? member.invited_email
                                    : member.profile?.full_name || member.user_email
                                const rc = roleConfig[member.role] || roleConfig.agent
                                const RoleIcon = rc.icon

                                return (
                                    <TableRow key={member.id}>
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <Avatar className="h-8 w-8">
                                                    <AvatarImage
                                                        src={member.profile?.avatar_url || ""}
                                                    />
                                                    <AvatarFallback className="text-xs">
                                                        {getInitials(name)}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <div className="font-medium text-sm flex items-center gap-2">
                                                        {name}
                                                        {isPending && (
                                                            <Badge
                                                                variant="outline"
                                                                className="text-xs text-amber-600 border-amber-300"
                                                            >
                                                                Pending
                                                            </Badge>
                                                        )}
                                                        {isCurrentUser && (
                                                            <span className="text-xs text-muted-foreground">
                                                                (You)
                                                            </span>
                                                        )}
                                                    </div>
                                                    {!isPending && member.user_email && (
                                                        <div className="text-xs text-muted-foreground">
                                                            {member.user_email}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {isPending ? (
                                                <span className="text-xs text-muted-foreground">—</span>
                                            ) : (
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="gap-2 h-7 px-2"
                                                        >
                                                            <Circle
                                                                className={`h-2 w-2 fill-current ${member.status === "available"
                                                                    ? "text-green-500"
                                                                    : "text-gray-400"
                                                                    }`}
                                                            />
                                                            <span className="capitalize text-xs">
                                                                {member.status}
                                                            </span>
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="start">
                                                        <DropdownMenuItem
                                                            onClick={() =>
                                                                handleStatusChange(member.id, "available")
                                                            }
                                                        >
                                                            <Circle className="h-2 w-2 fill-green-500 text-green-500 mr-2" />
                                                            Available
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem
                                                            onClick={() =>
                                                                handleStatusChange(
                                                                    member.id,
                                                                    "unavailable"
                                                                )
                                                            }
                                                        >
                                                            <Circle className="h-2 w-2 fill-gray-400 text-gray-400 mr-2" />
                                                            Unavailable
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            {isOwner || isPending ? (
                                                <Badge variant={rc.variant} className="gap-1">
                                                    <RoleIcon className="h-3 w-3" />
                                                    {rc.label}
                                                </Badge>
                                            ) : (
                                                <Select
                                                    value={member.role}
                                                    onValueChange={(v) =>
                                                        handleRoleChange(member.id, v)
                                                    }
                                                >
                                                    <SelectTrigger className="h-7 w-[130px] text-xs">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="agent">Agent</SelectItem>
                                                        <SelectItem value="administrator">
                                                            Admin
                                                        </SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            {!isOwner && !isCurrentUser && (
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="text-destructive h-8 w-8"
                                                    onClick={() => handleRemove(member.id)}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                )
                            })
                        )}
                    </TableBody>
                </Table>
            </Card>
        </div>
    )
}
