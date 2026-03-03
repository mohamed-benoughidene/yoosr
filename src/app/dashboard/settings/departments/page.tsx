"use client"

import { useProject } from "@/context/ProjectContext"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { useState } from "react"
import { toast } from "sonner"
import { Plus, Trash2, Building2, Bot, Pencil, X, Users, UserPlus } from "lucide-react"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Switch } from "@/components/ui/switch"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { useQuery, useMutation } from "convex/react"
import { api } from "../../../../../convex/_generated/api"
import type { Id } from "../../../../../convex/_generated/dataModel"
import { useOrganization } from "@clerk/nextjs"

export default function DepartmentsPage() {
    const { activeProject } = useProject()
    const [createOpen, setCreateOpen] = useState(false)

    // Form State
    const [newDeptName, setNewDeptName] = useState("")
    const [newDesc, setNewDesc] = useState("")
    const [routingMode, setRoutingMode] = useState<"assigned" | "pooled">("pooled")
    const [useBot, setUseBot] = useState(false)
    const [botId, setBotId] = useState<string | undefined>()
    const [tags, setTags] = useState<string[]>([])
    const [tagInput, setTagInput] = useState("")
    const [editingDeptId, setEditingDeptId] = useState<Id<"departments"> | null>(null)

    const departments = useQuery(
        api.settings.listDepartments,
        activeProject ? { projectId: activeProject._id } : "skip"
    ) ?? []

    const bots = useQuery(
        api.bots.list,
        activeProject ? { projectId: activeProject._id } : "skip"
    ) ?? []

    const { memberships } = useOrganization({ memberships: { infinite: true, pageSize: 50 } })
    const members = (memberships?.data ?? []).map(m => ({
        userId: m.publicUserData?.userId ?? "",
        fullName: `${m.publicUserData?.firstName ?? ''} ${m.publicUserData?.lastName ?? ''}`.trim() || m.publicUserData?.identifier || "",
        imageUrl: m.publicUserData?.imageUrl ?? "",
        role: m.role,
    }))

    const createDepartment = useMutation(api.settings.createDepartment)
    const addMemberToDepartment = useMutation(api.settings.addMemberToDepartment)
    const removeMemberFromDepartment = useMutation(api.settings.removeMemberFromDepartment)
    const updateDepartment = useMutation(api.settings.updateDepartment)
    const removeDepartment = useMutation(api.settings.removeDepartment)

    const handleSave = async () => {
        if (!activeProject || !newDeptName) return

        try {
            if (editingDeptId) {
                await updateDepartment({
                    id: editingDeptId,
                    name: newDeptName,
                    description: newDesc || undefined,
                    botId: useBot ? botId : undefined,
                    tags: tags.length > 0 ? tags : undefined,
                })
                toast.success("Department updated")
            } else {
                await createDepartment({
                    projectId: activeProject._id,
                    name: newDeptName,
                    description: newDesc || undefined,
                    routingMode,
                    botId: useBot ? botId : undefined,
                    tags: tags.length > 0 ? tags : undefined,
                })
                toast.success("Department created")
            }
            resetForm()
        } catch {
            toast.error(editingDeptId ? "Failed to update department" : "Failed to create department")
        }
    }

    const handleDelete = async (id: typeof departments[number]["_id"]) => {
        try {
            await removeDepartment({ id })
            toast.success("Department deleted")
        } catch {
            toast.error("Failed to delete department")
        }
    }

    const resetForm = () => {
        setNewDeptName("")
        setNewDesc("")
        setRoutingMode("pooled")
        setUseBot(false)
        setBotId(undefined)
        setTags([])
        setTagInput("")
        setEditingDeptId(null)
        setCreateOpen(false)
    }

    const handleEdit = (dept: any) => {
        setEditingDeptId(dept._id)
        setNewDeptName(dept.name)
        setNewDesc(dept.description || "")
        setRoutingMode(dept.routingMode || "pooled")
        setUseBot(!!dept.botId)
        setBotId(dept.botId)
        setTags(dept.tags || [])
        setCreateOpen(true)
    }

    const addTag = () => {
        const trimmed = tagInput.trim().toLowerCase()
        if (trimmed && !tags.includes(trimmed)) {
            setTags([...tags, trimmed])
        }
        setTagInput("")
    }

    const removeTag = (tagToRemove: string) => {
        setTags(tags.filter(t => t !== tagToRemove))
    }

    const handleAssignMember = async (clerkUserId: string, departmentId: Id<"departments">) => {
        try {
            await addMemberToDepartment({ clerkUserId, departmentId })
            toast.success("Agent assigned to department")
        } catch {
            toast.error("Failed to assign agent")
        }
    }

    const handleRemoveMember = async (clerkUserId: string, departmentId: Id<"departments">) => {
        try {
            await removeMemberFromDepartment({ clerkUserId, departmentId })
            toast.success("Agent removed from department")
        } catch {
            toast.error("Failed to remove agent")
        }
    }

    const getInitials = (name: string | null | undefined) => {
        if (!name) return "?"
        return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)
    }

    return (
        <TooltipProvider>
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-lg font-medium">Departments</h3>
                        <p className="text-sm text-muted-foreground">
                            Organize your team into groups (e.g., Sales, Support).
                        </p>
                    </div>
                    <Dialog open={createOpen} onOpenChange={(open) => {
                        setCreateOpen(open)
                        if (!open) resetForm()
                    }}>
                        <DialogTrigger asChild>
                            <Button>
                                <Plus className="mr-2 h-4 w-4" />
                                Add Department
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-md">
                            <DialogHeader>
                                <DialogTitle>{editingDeptId ? "Edit Department" : "Create Department"}</DialogTitle>
                                <DialogDescription>
                                    {editingDeptId ? "Update department details." : "Add a new department to your project."}
                                </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-6 py-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="name">Name</Label>
                                    <Input
                                        id="name"
                                        value={newDeptName}
                                        onChange={(e) => setNewDeptName(e.target.value)}
                                        placeholder="e.g. Customer Support"
                                    />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="desc">Description</Label>
                                    <Input
                                        id="desc"
                                        value={newDesc}
                                        onChange={(e) => setNewDesc(e.target.value)}
                                        placeholder="Handles general inquiries"
                                    />
                                </div>

                                <Separator />

                                <div className="grid gap-4">
                                    <div className="flex items-center justify-between">
                                        <Label htmlFor="ai-toggle" className="flex flex-col gap-1">
                                            <span>AI Integration</span>
                                            <span className="font-normal text-xs text-muted-foreground">Assign a chatbot to this department</span>
                                        </Label>
                                        <Switch
                                            id="ai-toggle"
                                            checked={useBot}
                                            onCheckedChange={setUseBot}
                                        />
                                    </div>

                                    {useBot && (
                                        <div className="grid gap-2 pl-2">
                                            <Label htmlFor="bot-select" className="text-xs">Selected Bot</Label>
                                            <Select value={botId} onValueChange={setBotId}>
                                                <SelectTrigger id="bot-select">
                                                    <SelectValue placeholder="Choose a bot" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {bots.filter(b => b.status === "active").length === 0 ? (
                                                        <SelectItem value="none" disabled>No active bots found</SelectItem>
                                                    ) : (
                                                        bots.filter(b => b.status === "active").map((bot) => (
                                                            <SelectItem key={bot._id} value={bot._id}>
                                                                <div className="flex items-center gap-2">
                                                                    <Bot className="h-4 w-4" />
                                                                    {bot.name}
                                                                </div>
                                                            </SelectItem>
                                                        ))
                                                    )}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    )}
                                </div>

                                <Separator />

                                <div className="grid gap-3">
                                    <Label>Routing Rules</Label>
                                    <RadioGroup value={routingMode} onValueChange={(v: "assigned" | "pooled") => setRoutingMode(v)}>
                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem value="pooled" id="r-pooled" />
                                            <Label htmlFor="r-pooled" className="font-normal">Pooled (Agents pick from Unassigned)</Label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem value="assigned" id="r-assigned" />
                                            <Label htmlFor="r-assigned" className="font-normal">Assigned (Round Robin)</Label>
                                        </div>
                                    </RadioGroup>
                                </div>

                                <Separator />

                                <div className="grid gap-2">
                                    <Label>Tags</Label>
                                    <div className="flex flex-wrap gap-1.5 mb-2">
                                        {tags.map(tag => (
                                            <Badge key={tag} className="gap-1 pr-1 cursor-default">
                                                {tag}
                                                <button onClick={() => removeTag(tag)} className="hover:bg-black/10 rounded-full transition-colors">
                                                    <X className="h-3 w-3" />
                                                </button>
                                            </Badge>
                                        ))}
                                    </div>
                                    <div className="flex gap-2">
                                        <Input
                                            value={tagInput}
                                            onChange={(e) => setTagInput(e.target.value)}
                                            onKeyDown={(e) => {
                                                if (e.key === "Enter") {
                                                    e.preventDefault()
                                                    addTag()
                                                }
                                            }}
                                            placeholder="Add tag (e.g. arabic, support)"
                                        />
                                        <Button type="button" variant="secondary" onClick={addTag}>Add</Button>
                                    </div>
                                    <p className="text-[10px] text-muted-foreground">Press Enter or click Add to save a tag</p>
                                </div>
                            </div>
                            <DialogFooter>
                                <Button variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button>
                                <Button onClick={handleSave}>{editingDeptId ? "Update Department" : "Create Department"}</Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
                <Separator />

                <Card>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Members</TableHead>
                                <TableHead>Routing</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {departments.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={3} className="text-center py-8 text-muted-foreground">No departments found.</TableCell>
                                </TableRow>
                            ) : (
                                departments.map((dept) => (
                                    <TableRow key={dept._id}>
                                        <TableCell>
                                            <div className="flex items-center gap-2 font-medium">
                                                <Building2 className="h-4 w-4 text-muted-foreground" />
                                                {dept.name}
                                                {dept.isDefault && <Badge variant="secondary" className="ml-2">Default</Badge>}
                                            </div>
                                            {dept.description && (
                                                <div className="text-xs text-muted-foreground ml-6 mt-1">{dept.description}</div>
                                            )}
                                            {dept.tags && dept.tags.length > 0 && (
                                                <div className="flex flex-wrap gap-1 ml-6 mt-2">
                                                    {dept.tags.map(tag => (
                                                        <Badge key={tag} variant="secondary" className="text-[10px] py-0 px-1.5 font-normal">
                                                            {tag}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                {(!dept.memberIds || dept.memberIds.length === 0) ? (
                                                    <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                                                        <Users className="h-3.5 w-3.5" /> No agents assigned
                                                    </span>
                                                ) : (
                                                    <div className="flex flex-wrap gap-1.5 mr-2">
                                                        {dept.memberIds.map((memberId: string) => {
                                                            const memberDetails = members.find(m => m.userId === memberId);
                                                            if (!memberDetails) return null;
                                                            return (
                                                                <Badge key={memberId} variant="secondary" className="pl-1 pr-1.5 py-1 gap-1.5 flex items-center font-normal">
                                                                    <Avatar className="h-4 w-4 border border-background">
                                                                        <AvatarImage src={memberDetails.imageUrl} />
                                                                        <AvatarFallback className="text-[8px]">{getInitials(memberDetails.fullName)}</AvatarFallback>
                                                                    </Avatar>
                                                                    <span className="text-xs">{memberDetails.fullName}</span>
                                                                    <button
                                                                        onClick={() => handleRemoveMember(memberId, dept._id)}
                                                                        className="ml-0.5 rounded-full hover:bg-black/10 transition-colors"
                                                                        title="Remove member"
                                                                    >
                                                                        <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                                                                    </button>
                                                                </Badge>
                                                            );
                                                        })}
                                                    </div>
                                                )}

                                                <Popover>
                                                    <PopoverTrigger asChild>
                                                        <Button variant="outline" size="icon" className="h-7 w-7 rounded-full shrink-0 border-dashed">
                                                            <Plus className="h-3.5 w-3.5 text-muted-foreground" />
                                                        </Button>
                                                    </PopoverTrigger>
                                                    <PopoverContent className="w-64 p-2" align="start">
                                                        <div className="space-y-2">
                                                            <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider px-2">Add Member</h4>
                                                            <div className="space-y-1">
                                                                {members.filter(m => m.userId && !dept.memberIds?.includes(m.userId)).length === 0 ? (
                                                                    <p className="text-xs text-center text-muted-foreground py-3">All members are in this department.</p>
                                                                ) : (
                                                                    members
                                                                        .filter(m => m.userId && !dept.memberIds?.includes(m.userId))
                                                                        .map(m => (
                                                                            <Button
                                                                                key={m.userId}
                                                                                variant="ghost"
                                                                                className="w-full justify-start text-xs h-9"
                                                                                onClick={(e) => {
                                                                                    // The popover trigger automatically handles state, we just dispatch the action
                                                                                    handleAssignMember(m.userId, dept._id)
                                                                                    // Clicking a portal item will close it if not intercepted
                                                                                }}
                                                                            >
                                                                                <Avatar className="h-5 w-5 mr-2">
                                                                                    <AvatarImage src={m.imageUrl} />
                                                                                    <AvatarFallback>{getInitials(m.fullName)}</AvatarFallback>
                                                                                </Avatar>
                                                                                <span className="truncate">{m.fullName}</span>
                                                                            </Button>
                                                                        ))
                                                                )}
                                                            </div>
                                                        </div>
                                                    </PopoverContent>
                                                </Popover>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className="capitalize">
                                                {dept.routingMode || 'pooled'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right flex items-center justify-end gap-1">
                                            <Button variant="ghost" size="icon" onClick={() => handleEdit(dept)}>
                                                <Pencil className="h-4 w-4" />
                                            </Button>
                                            {!dept.isDefault && (
                                                <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDelete(dept._id)}>
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </Card>
            </div>
        </TooltipProvider>
    )
}
