"use client"

import { useProject } from "@/context/ProjectContext"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { createClient } from "@/lib/supabase/client"
import { useState, useEffect } from "react"
import { toast } from "sonner"
import { Plus, Trash2, Tag } from "lucide-react"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

const colorOptions = [
    { value: "red", label: "Red", bg: "bg-red-500", text: "text-red-700", light: "bg-red-100" },
    { value: "orange", label: "Orange", bg: "bg-orange-500", text: "text-orange-700", light: "bg-orange-100" },
    { value: "yellow", label: "Yellow", bg: "bg-yellow-500", text: "text-yellow-700", light: "bg-yellow-100" },
    { value: "green", label: "Green", bg: "bg-green-500", text: "text-green-700", light: "bg-green-100" },
    { value: "blue", label: "Blue", bg: "bg-blue-500", text: "text-blue-700", light: "bg-blue-100" },
    { value: "violet", label: "Violet", bg: "bg-violet-500", text: "text-violet-700", light: "bg-violet-100" },
]

function getColorConfig(color: string) {
    return colorOptions.find((c) => c.value === color) || colorOptions[4]
}

export default function LabelsPage() {
    const { activeProject } = useProject()
    const [labels, setLabels] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [newName, setNewName] = useState("")
    const [newColor, setNewColor] = useState("blue")
    const [creating, setCreating] = useState(false)
    const [currentUserName, setCurrentUserName] = useState<string | null>(null)

    const fetchLabels = async () => {
        if (!activeProject) return
        const supabase = createClient()

        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
            const { data: profile } = await supabase
                .from("profiles")
                .select("full_name")
                .eq("id", user.id)
                .single()
            if (profile) setCurrentUserName(profile.full_name)
        }

        const { data } = await supabase
            .from("labels")
            .select("*")
            .eq("project_id", activeProject.id)
            .order("created_at", { ascending: false })

        if (data) setLabels(data)
        setLoading(false)
    }

    useEffect(() => {
        fetchLabels()
    }, [activeProject])

    const handleCreate = async () => {
        if (!activeProject || !newName.trim()) return
        setCreating(true)
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()

        const { error } = await supabase.from("labels").insert({
            project_id: activeProject.id,
            name: newName.trim(),
            color: newColor,
            created_by: user?.id || null,
        })

        if (error) {
            toast.error("Failed to create label")
            console.error(error)
        } else {
            toast.success("Label created")
            setNewName("")
            setNewColor("blue")
            fetchLabels()
        }
        setCreating(false)
    }

    const handleDelete = async (id: string) => {
        const supabase = createClient()
        const { error } = await supabase.from("labels").delete().eq("id", id)

        if (error) {
            toast.error("Failed to delete label")
        } else {
            toast.success("Label deleted")
            fetchLabels()
        }
    }

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
        })
    }

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-medium">Labels</h3>
                <p className="text-sm text-muted-foreground">
                    Create tags to categorize and filter conversations.
                </p>
            </div>
            <Separator />

            {/* Inline creation form */}
            <Card className="p-4">
                <div className="flex items-end gap-3">
                    <div className="flex-shrink-0">
                        <Select value={newColor} onValueChange={setNewColor}>
                            <SelectTrigger className="w-[120px] h-9">
                                <div className="flex items-center gap-2">
                                    <span
                                        className={`h-3 w-3 rounded-full ${getColorConfig(newColor).bg}`}
                                    />
                                    <SelectValue />
                                </div>
                            </SelectTrigger>
                            <SelectContent>
                                {colorOptions.map((c) => (
                                    <SelectItem key={c.value} value={c.value}>
                                        <div className="flex items-center gap-2">
                                            <span
                                                className={`h-3 w-3 rounded-full ${c.bg}`}
                                            />
                                            {c.label}
                                        </div>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="flex-1">
                        <Input
                            value={newName}
                            onChange={(e) => setNewName(e.target.value)}
                            placeholder="Label name (e.g., bug, feature-request, urgent)"
                            className="h-9"
                            onKeyDown={(e) => {
                                if (e.key === "Enter") handleCreate()
                            }}
                        />
                    </div>
                    <Button
                        size="sm"
                        onClick={handleCreate}
                        disabled={!newName.trim() || creating}
                    >
                        <Plus className="mr-1 h-4 w-4" />
                        Add
                    </Button>
                </div>
            </Card>

            {/* Labels table */}
            <Card>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Tag Name</TableHead>
                            <TableHead className="w-[140px]">Created By</TableHead>
                            <TableHead className="w-[130px]">Date</TableHead>
                            <TableHead className="text-right w-[80px]">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={4} className="text-center py-8">
                                    Loading...
                                </TableCell>
                            </TableRow>
                        ) : labels.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={4} className="text-center py-12">
                                    <div className="flex flex-col items-center gap-3 text-muted-foreground">
                                        <Tag className="h-10 w-10 opacity-30" />
                                        <div>
                                            <p className="font-medium text-sm">No labels yet</p>
                                            <p className="text-xs mt-1">
                                                Create your first label above to start categorizing conversations.
                                            </p>
                                        </div>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : (
                            labels.map((label) => {
                                const cc = getColorConfig(label.color)
                                return (
                                    <TableRow key={label.id}>
                                        <TableCell>
                                            <span
                                                className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${cc.light} ${cc.text}`}
                                            >
                                                <span className={`h-2 w-2 rounded-full ${cc.bg}`} />
                                                {label.name}
                                            </span>
                                        </TableCell>
                                        <TableCell className="text-sm text-muted-foreground">
                                            {currentUserName || "You"}
                                        </TableCell>
                                        <TableCell className="text-sm text-muted-foreground">
                                            {formatDate(label.created_at)}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="text-destructive h-8 w-8"
                                                onClick={() => handleDelete(label.id)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
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
