"use client"

import { useProject } from "@/context/ProjectContext"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { useState } from "react"
import { toast } from "sonner"
import { Plus, Trash2, Building2, Bot, Pencil, X } from "lucide-react"
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
import { Switch } from "@/components/ui/switch"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useQuery, useMutation } from "convex/react"
import { api } from "../../../../../convex/_generated/api"
import type { Id } from "../../../../../convex/_generated/dataModel"

export default function DepartmentsPage() {
    const { activeProject } = useProject()
    const [createOpen, setCreateOpen] = useState(false)

    // Form State
    const [newDeptName, setNewDeptName] = useState("")
    const [newDesc, setNewDesc] = useState("")
    const [routingMode, setRoutingMode] = useState<"assigned" | "pooled">("pooled")
    const [useBot, setUseBot] = useState(false)
    const [tags, setTags] = useState<string[]>([])
    const [tagInput, setTagInput] = useState("")
    const [editingDeptId, setEditingDeptId] = useState<Id<"departments"> | null>(null)

    const departments = useQuery(
        api.settings.listDepartments,
        activeProject ? { projectId: activeProject._id } : "skip"
    ) ?? []

    const createDepartment = useMutation(api.settings.createDepartment)
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
                    tags: tags.length > 0 ? tags : undefined,
                })
                toast.success("Department updated")
            } else {
                await createDepartment({
                    projectId: activeProject._id,
                    name: newDeptName,
                    description: newDesc || undefined,
                    routingMode,
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

    return (
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
    )
}
