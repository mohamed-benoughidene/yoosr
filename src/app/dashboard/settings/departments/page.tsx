"use client"

import { useProject } from "@/context/ProjectContext"
import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { createClient } from "@/lib/supabase/client"
import { useState, useEffect } from "react"
import { toast } from "sonner"
import { Loader2, Plus, Trash2, Building2, Bot, Users } from "lucide-react"
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

export default function DepartmentsPage() {
    const { activeProject } = useProject()
    const [departments, setDepartments] = useState<any[]>([])
    const [bots, setBots] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [createOpen, setCreateOpen] = useState(false)

    // Form State
    const [newDeptName, setNewDeptName] = useState("")
    const [newDesc, setNewDesc] = useState("")
    const [routingMode, setRoutingMode] = useState<"assigned" | "pooled">("pooled")
    const [useBot, setUseBot] = useState(false)
    const [selectedBotId, setSelectedBotId] = useState<string>("")

    const fetchData = async () => {
        if (!activeProject) return
        const supabase = createClient()

        // Fetch Departments
        const { data: deptsData } = await supabase
            .from('departments')
            .select(`
                *,
                bot:bots(id, name)
            `)
            .eq('project_id', activeProject.id)
            .order('created_at', { ascending: true })

        // Fetch Active Bots
        const { data: botsData } = await supabase
            .from('bots')
            .select('id, name')
            .eq('project_id', activeProject.id)
            .eq('status', 'active')
            .eq('type', 'chatbot')

        if (deptsData) setDepartments(deptsData)
        if (botsData) setBots(botsData)
        setLoading(false)
    }

    useEffect(() => {
        fetchData()
    }, [activeProject])

    const handleCreate = async () => {
        if (!activeProject || !newDeptName) return
        const supabase = createClient()

        const payload: any = {
            project_id: activeProject.id,
            name: newDeptName,
            description: newDesc,
            routing_mode: routingMode,
            bot_id: useBot && selectedBotId ? selectedBotId : null
        }

        const { error } = await supabase
            .from('departments')
            .insert(payload)

        if (error) {
            toast.error("Failed to create department")
            console.error(error)
        } else {
            toast.success("Department created")
            resetForm()
            fetchData()
        }
    }

    const resetForm = () => {
        setNewDeptName("")
        setNewDesc("")
        setRoutingMode("pooled")
        setUseBot(false)
        setSelectedBotId("")
        setCreateOpen(false)
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
                            <DialogTitle>Create Department</DialogTitle>
                            <DialogDescription>
                                Add a new department to your project.
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
                                    <div className="grid gap-2">
                                        <Label>Select Chatbot</Label>
                                        <Select value={selectedBotId} onValueChange={setSelectedBotId}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select a bot..." />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {bots.map(bot => (
                                                    <SelectItem key={bot.id} value={bot.id}>
                                                        {bot.name}
                                                    </SelectItem>
                                                ))}
                                                {bots.length === 0 && (
                                                    <div className="p-2 text-xs text-muted-foreground text-center">
                                                        No active chatbots found.
                                                    </div>
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
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button>
                            <Button onClick={handleCreate}>Create Department</Button>
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
                            <TableHead>AI Agent</TableHead>
                            <TableHead>Routing</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={4} className="text-center">Loading...</TableCell>
                            </TableRow>
                        ) : departments.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">No departments found.</TableCell>
                            </TableRow>
                        ) : (
                            departments.map((dept) => (
                                <TableRow key={dept.id}>
                                    <TableCell>
                                        <div className="flex items-center gap-2 font-medium">
                                            <Building2 className="h-4 w-4 text-muted-foreground" />
                                            {dept.name}
                                            {dept.is_default && <Badge variant="secondary" className="ml-2">Default</Badge>}
                                        </div>
                                        {dept.description && (
                                            <div className="text-xs text-muted-foreground ml-6 mt-1">{dept.description}</div>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        {dept.bot ? (
                                            <div className="flex items-center gap-2 text-sm">
                                                <Bot className="h-3 w-3 text-purple-500" />
                                                {dept.bot.name}
                                            </div>
                                        ) : (
                                            <span className="text-muted-foreground text-xs">-</span>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className="capitalize">
                                            {dept.routing_mode || 'pooled'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        {!dept.is_default && (
                                            <Button variant="ghost" size="icon" className="text-destructive">
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
