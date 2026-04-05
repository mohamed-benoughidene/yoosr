"use client"

import { useTranslations } from "next-intl"
import { useProject } from "@/context/ProjectContext"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { useState } from "react"
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
import { useQuery, useMutation } from "convex/react"
import { api } from "../../../../../../convex/_generated/api"
import { Id, Doc } from "../../../../../../convex/_generated/dataModel"
import { useUser } from "@clerk/nextjs"

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

let nextTempId = 0;

export default function LabelsPage() {
    const t = useTranslations("settings.labels")
    const { activeProject } = useProject()
    const { user } = useUser()
    const [newName, setNewName] = useState("")
    const [newColor, setNewColor] = useState("blue")
    const [creating, setCreating] = useState(false)

    const labels = useQuery(
        api.labels.listLabels,
        activeProject ? { projectId: activeProject._id } : "skip"
    ) ?? []

    const createLabel = useMutation(api.settings.createLabel).withOptimisticUpdate(
        (localStore, args) => {
            const existing = localStore.getQuery(api.labels.listLabels, { projectId: args.projectId });
            if (existing) {
                const id = `temp_${(nextTempId++).toString(36)}`;
                localStore.setQuery(api.labels.listLabels, { projectId: args.projectId }, [
                    ...existing,
                    {
                        _id: id as Id<"labels">,
                        _creationTime: 0,
                        projectId: args.projectId,
                        name: args.name,
                        color: args.color,
                        createdBy: args.projectId,
                    },
                ]);
            }
        }
    );
    const removeLabel = useMutation(api.settings.removeLabel).withOptimisticUpdate(
        (localStore, args) => {
            const allQueries = localStore.getAllQueries(api.labels.listLabels);
            for (const q of allQueries) {
                if (q.value) {
                    localStore.setQuery(
                        api.labels.listLabels,
                        q.args,
                        (q.value as Doc<"labels">[]).filter((l) => l._id !== args.id)
                    );
                }
            }
        }
    );

    const handleCreate = async () => {
        if (!activeProject || !newName.trim()) return
        setCreating(true)

        try {
            await createLabel({
                projectId: activeProject._id,
                name: newName.trim(),
                color: newColor,
            })
            toast.success(t("label_created"))
            setNewName("")
            setNewColor("blue")
        } catch {
            toast.error(t("label_create_failed"))
        }
        setCreating(false)
    }

    const handleDelete = async (id: typeof labels[number]["_id"]) => {
        try {
            await removeLabel({ id })
            toast.success(t("label_deleted"))
        } catch {
            toast.error(t("label_delete_failed"))
        }
    }

    const formatDate = (timestamp: number) => {
        return new Date(timestamp).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
        })
    }

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-medium">{t("title")}</h3>
                <p className="text-sm text-muted-foreground">
                    {t("description")}
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
                            placeholder={t("label_placeholder")}
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
                        {t("add_btn")}
                    </Button>
                </div>
            </Card>

            {/* Labels table */}
            <Card>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>{t("table_tag_name")}</TableHead>
                            <TableHead className="w-[140px]">{t("table_created_by")}</TableHead>
                            <TableHead className="w-[130px]">{t("table_date")}</TableHead>
                            <TableHead className="text-right w-[80px]">{t("table_actions")}</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {labels.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={4} className="text-center py-12">
                                    <div className="flex flex-col items-center gap-3 text-muted-foreground">
                                        <Tag className="h-10 w-10 opacity-30" />
                                        <div>
                                            <p className="font-medium text-sm">{t("no_labels")}</p>
                                            <p className="text-xs mt-1">
                                                {t("create_first_label")}
                                            </p>
                                        </div>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : (
                            labels.map((label) => {
                                const cc = getColorConfig(label.color)
                                return (
                                    <TableRow key={label._id}>
                                        <TableCell>
                                            <span
                                                className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${cc.light} ${cc.text}`}
                                            >
                                                <span className={`h-2 w-2 rounded-full ${cc.bg}`} />
                                                {label.name}
                                            </span>
                                        </TableCell>
                                        <TableCell className="text-sm text-muted-foreground">
                                            {user?.fullName || t("you")}
                                        </TableCell>
                                        <TableCell className="text-sm text-muted-foreground">
                                            {formatDate(label._creationTime)}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="text-destructive h-8 w-8"
                                                onClick={() => handleDelete(label._id)}
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
