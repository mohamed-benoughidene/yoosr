"use client"

import { useProject } from "@/context/ProjectContext"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { useState } from "react"
import { toast } from "sonner"
import { UserPlus, Trash2, Circle, Shield, Crown, Headset } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useQuery, useMutation } from "convex/react"
import { api } from "../../../../../convex/_generated/api"
import { useUser } from "@clerk/nextjs"
import type { Id } from "../../../../../convex/_generated/dataModel"

const roleConfig: Record<string, { label: string; icon: typeof Crown; variant: "default" | "secondary" | "outline" }> = {
    owner: { label: "Owner", icon: Crown, variant: "default" },
    administrator: { label: "Admin", icon: Shield, variant: "secondary" },
    agent: { label: "Agent", icon: Headset, variant: "outline" },
}

export default function TeammatesPage() {
    const { activeProject } = useProject()
    const { user } = useUser()
    const [inviteOpen, setInviteOpen] = useState(false)
    const [inviteEmail, setInviteEmail] = useState("")
    const [inviteRole, setInviteRole] = useState("agent")

    const members = useQuery(api.members.list, activeProject ? { projectId: activeProject._id } : "skip")
    const inviteMember = useMutation(api.members.invite)
    const updateMember = useMutation(api.members.update)
    const removeMember = useMutation(api.members.remove)

    const handleInvite = async () => {
        if (!activeProject || !inviteEmail) return
        try {
            await inviteMember({ projectId: activeProject._id, invitedEmail: inviteEmail, role: inviteRole })
            toast.success(`Invitation sent to ${inviteEmail}`)
            setInviteEmail(""); setInviteRole("agent"); setInviteOpen(false)
        } catch { toast.error("Failed to invite teammate") }
    }

    const handleStatusChange = async (id: Id<"project_members">, status: string) => {
        try { await updateMember({ id, status }); toast.success(`Status → ${status}`) }
        catch { toast.error("Failed to update status") }
    }

    const handleRoleChange = async (id: Id<"project_members">, role: string) => {
        try { await updateMember({ id, role }); toast.success(`Role → ${role}`) }
        catch { toast.error("Failed to update role") }
    }

    const handleRemove = async (id: Id<"project_members">) => {
        try { await removeMember({ id }); toast.success("Member removed") }
        catch { toast.error("Failed to remove member") }
    }

    const getInitials = (name: string | null | undefined) => {
        if (!name) return "?"
        return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)
    }

    const loading = members === undefined

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-medium">Teammates</h3>
                    <p className="text-sm text-muted-foreground">Manage who has access to this project.</p>
                </div>
                <Dialog open={inviteOpen} onOpenChange={(o) => { setInviteOpen(o); if (!o) { setInviteEmail(""); setInviteRole("agent") } }}>
                    <DialogTrigger asChild>
                        <Button><UserPlus className="mr-2 h-4 w-4" />Invite Teammate</Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md">
                        <DialogHeader>
                            <DialogTitle>Invite Teammate</DialogTitle>
                            <DialogDescription>Send an invitation to add a new team member.</DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-6 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="email">Email Address</Label>
                                <Input id="email" type="email" value={inviteEmail} onChange={e => setInviteEmail(e.target.value)} placeholder="teammate@company.com" />
                            </div>
                            <div className="grid gap-2">
                                <Label>Role</Label>
                                <Select value={inviteRole} onValueChange={setInviteRole}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="agent"><div className="flex items-center gap-2"><Headset className="h-3.5 w-3.5" />Agent</div></SelectItem>
                                        <SelectItem value="administrator"><div className="flex items-center gap-2"><Shield className="h-3.5 w-3.5" />Admin</div></SelectItem>
                                        <SelectItem value="owner"><div className="flex items-center gap-2"><Crown className="h-3.5 w-3.5" />Owner</div></SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setInviteOpen(false)}>Cancel</Button>
                            <Button onClick={handleInvite} disabled={!inviteEmail}>Send Invitation</Button>
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
                            <TableRow><TableCell colSpan={4} className="text-center py-8">Loading...</TableCell></TableRow>
                        ) : (members ?? []).length === 0 ? (
                            <TableRow><TableCell colSpan={4} className="text-center py-8 text-muted-foreground">No team members yet.</TableCell></TableRow>
                        ) : (members ?? []).map(member => {
                            const isPending = !member.userId
                            const isOwner = member.role === "owner"
                            const isCurrentUser = member.userId === user?.id
                            const name = isPending ? member.invitedEmail : (user?.fullName || member.invitedEmail || "Member")
                            const rc = roleConfig[member.role] || roleConfig.agent
                            const RoleIcon = rc.icon
                            return (
                                <TableRow key={member._id}>
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <Avatar className="h-8 w-8"><AvatarFallback className="text-xs">{getInitials(name)}</AvatarFallback></Avatar>
                                            <div>
                                                <div className="font-medium text-sm flex items-center gap-2">
                                                    {name}
                                                    {isPending && <Badge variant="outline" className="text-xs text-amber-600 border-amber-300">Pending</Badge>}
                                                    {isCurrentUser && <span className="text-xs text-muted-foreground">(You)</span>}
                                                </div>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        {isPending ? <span className="text-xs text-muted-foreground">—</span> : (
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="sm" className="gap-2 h-7 px-2">
                                                        <Circle className={`h-2 w-2 fill-current ${member.status === "available" ? "text-green-500" : "text-gray-400"}`} />
                                                        <span className="capitalize text-xs">{member.status}</span>
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="start">
                                                    <DropdownMenuItem onClick={() => handleStatusChange(member._id, "available")}><Circle className="h-2 w-2 fill-green-500 text-green-500 mr-2" />Available</DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => handleStatusChange(member._id, "unavailable")}><Circle className="h-2 w-2 fill-gray-400 text-gray-400 mr-2" />Unavailable</DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        {isOwner || isPending ? (
                                            <Badge variant={rc.variant} className="gap-1"><RoleIcon className="h-3 w-3" />{rc.label}</Badge>
                                        ) : (
                                            <Select value={member.role} onValueChange={v => handleRoleChange(member._id, v)}>
                                                <SelectTrigger className="h-7 w-[130px] text-xs"><SelectValue /></SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="agent">Agent</SelectItem>
                                                    <SelectItem value="administrator">Admin</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        {!isOwner && !isCurrentUser && (
                                            <Button variant="ghost" size="icon" className="text-destructive h-8 w-8" onClick={() => handleRemove(member._id)}>
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        )}
                                    </TableCell>
                                </TableRow>
                            )
                        })}
                    </TableBody>
                </Table>
            </Card>
        </div>
    )
}
