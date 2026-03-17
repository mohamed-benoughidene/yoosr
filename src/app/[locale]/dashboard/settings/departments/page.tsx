"use client"

import { useTranslations } from "next-intl"
import { useProject } from "@/context/ProjectContext"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { useReducer } from "react"
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
import { api } from "../../../../../../convex/_generated/api"
import type { Id } from "../../../../../../convex/_generated/dataModel"
import { useOrganization } from "@clerk/nextjs"


interface DraftDept {
    newDeptName: string;
    newDesc: string;
    routingMode: "assigned" | "pooled";
    useBot: boolean;
    botId: string | undefined;
    tags: string[];
    tagInput: string;
}

interface UiState {
    createOpen: boolean;
    editingDeptId: Id<"departments"> | null;
    deptPendingDelete: Id<"departments"> | null;
}

interface DepartmentsState {
    draftDept: DraftDept;
    uiState: UiState;
}

type DepartmentsAction =
    | { type: "SET_CREATE_OPEN"; payload: boolean }
    | { type: "SET_NEW_DEPT_NAME"; payload: string }
    | { type: "SET_NEW_DESC"; payload: string }
    | { type: "SET_ROUTING_MODE"; payload: "assigned" | "pooled" }
    | { type: "SET_USE_BOT"; payload: boolean }
    | { type: "SET_BOT_ID"; payload: string | undefined }
    | { type: "SET_TAGS"; payload: string[] }
    | { type: "SET_TAG_INPUT"; payload: string }
    | { type: "SET_EDITING_DEPT_ID"; payload: Id<"departments"> | null }
    | { type: "SET_DEPT_PENDING_DELETE"; payload: Id<"departments"> | null }
    | { type: "RESET_DRAFT" }
    | { type: "START_EDIT"; payload: any }
    | { type: "ADD_TAG"; payload: string }
    | { type: "REMOVE_TAG"; payload: string }

const initialState: DepartmentsState = {
    draftDept: {
        newDeptName: "",
        newDesc: "",
        routingMode: "pooled",
        useBot: false,
        botId: undefined,
        tags: [],
        tagInput: "",
    },
    uiState: {
        createOpen: false,
        editingDeptId: null,
        deptPendingDelete: null,
    }
}

function departmentsReducer(state: DepartmentsState, action: DepartmentsAction): DepartmentsState {
    switch (action.type) {
        case "SET_CREATE_OPEN": return { ...state, uiState: { ...state.uiState, createOpen: action.payload } }
        case "SET_NEW_DEPT_NAME": return { ...state, draftDept: { ...state.draftDept, newDeptName: action.payload } }
        case "SET_NEW_DESC": return { ...state, draftDept: { ...state.draftDept, newDesc: action.payload } }
        case "SET_ROUTING_MODE": return { ...state, draftDept: { ...state.draftDept, routingMode: action.payload } }
        case "SET_USE_BOT": return { ...state, draftDept: { ...state.draftDept, useBot: action.payload } }
        case "SET_BOT_ID": return { ...state, draftDept: { ...state.draftDept, botId: action.payload } }
        case "SET_TAGS": return { ...state, draftDept: { ...state.draftDept, tags: action.payload } }
        case "SET_TAG_INPUT": return { ...state, draftDept: { ...state.draftDept, tagInput: action.payload } }
        case "SET_EDITING_DEPT_ID": return { ...state, uiState: { ...state.uiState, editingDeptId: action.payload } }
        case "SET_DEPT_PENDING_DELETE": return { ...state, uiState: { ...state.uiState, deptPendingDelete: action.payload } }
        case "RESET_DRAFT": return {
            ...state,
            draftDept: initialState.draftDept,
            uiState: { ...state.uiState, editingDeptId: null, createOpen: false }
        }
        case "START_EDIT": return {
            ...state,
            draftDept: {
                newDeptName: action.payload.name,
                newDesc: action.payload.description || "",
                routingMode: action.payload.routingMode || "pooled",
                useBot: !!action.payload.botId,
                botId: action.payload.botId,
                tags: action.payload.tags || [],
                tagInput: "",
            },
            uiState: {
                ...state.uiState,
                editingDeptId: action.payload._id,
                createOpen: true,
            }
        }
        case "ADD_TAG": return {
            ...state,
            draftDept: {
                ...state.draftDept,
                tags: [...state.draftDept.tags, action.payload],
                tagInput: ""
            }
        }
        case "REMOVE_TAG": return {
            ...state,
            draftDept: {
                ...state.draftDept,
                tags: state.draftDept.tags.filter(t => t !== action.payload)
            }
        }
        default: return state;
    }
}

export default function DepartmentsPage() {
    const t = useTranslations("settings.departments")
    const { activeProject } = useProject()
    
    const [state, dispatch] = useReducer(departmentsReducer, initialState)
    const { draftDept, uiState } = state
    const { newDeptName, newDesc, routingMode, useBot, botId, tags, tagInput } = draftDept
    const { createOpen, editingDeptId, deptPendingDelete } = uiState

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
                toast.success(t("department_updated"))
            } else {
                await createDepartment({
                    projectId: activeProject._id,
                    name: newDeptName,
                    description: newDesc || undefined,
                    routingMode,
                    botId: useBot ? botId : undefined,
                    tags: tags.length > 0 ? tags : undefined,
                })
                toast.success(t("department_created"))
            }
            resetForm()
        } catch (error: any) {
            const errorMessage = error.data?.message || error.message || (editingDeptId ? t("department_update_failed") : t("department_create_failed"))
            toast.error(errorMessage)
        }
    }

    const handleDelete = async (id: typeof departments[number]["_id"]) => {
        try {
            await removeDepartment({ id })
            toast.success(t("department_deleted"))
        } catch (error: any) {
            const errorMessage = error.data?.message || error.message || t("department_delete_failed")
            toast.error(errorMessage)
        }
    }

    const resetForm = () => {
        dispatch({ type: "RESET_DRAFT" })
    }

    const handleEdit = (dept: any) => {
        dispatch({ type: "START_EDIT", payload: dept })
    }

    const addTag = () => {
        const trimmed = tagInput.trim().toLowerCase()
        if (trimmed && !tags.includes(trimmed)) {
            dispatch({ type: "ADD_TAG", payload: trimmed })
        } else {
            dispatch({ type: "SET_TAG_INPUT", payload: "" })
        }
    }

    const removeTag = (tagToRemove: string) => {
        dispatch({ type: "REMOVE_TAG", payload: tagToRemove })
    }

    const handleAssignMember = async (clerkUserId: string, departmentId: Id<"departments">) => {
        try {
            await addMemberToDepartment({ clerkUserId, departmentId })
            toast.success(t("agent_assigned"))
        } catch {
            toast.error(t("assign_failed"))
        }
    }

    const handleRemoveMember = async (clerkUserId: string, departmentId: Id<"departments">) => {
        try {
            await removeMemberFromDepartment({ clerkUserId, departmentId })
            toast.success(t("agent_removed"))
        } catch {
            toast.error(t("remove_failed"))
        }
    }

    const getInitials = (name: string | null | undefined) => {
        if (!name) return "?"
        return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)
    }

    return (
        <TooltipProvider>
            <div className="space-y-6">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                        <h3 className="text-lg font-medium">{t("title")}</h3>
                        <p className="text-sm text-muted-foreground">
                            {t("description")}
                        </p>
                    </div>
                    <div className="flex flex-wrap gap-2 shrink-0">
                        <Dialog open={createOpen} onOpenChange={(open) => {
                            dispatch({ type: "SET_CREATE_OPEN", payload: open })
                            if (!open) resetForm()
                        }}>
                            <DialogTrigger asChild>
                                <Button>
                                    <Plus className="mr-2 h-4 w-4" />
                                    {t("add_department")}
                                </Button>
                            </DialogTrigger>
                        <DialogContent className="max-w-md">
                            <DialogHeader>
                                <DialogTitle>{editingDeptId ? t("edit_department") : t("add_department")}</DialogTitle>
                                <DialogDescription>
                                    {editingDeptId ? t("edit_dialog_desc") : t("add_dialog_desc")}
                                </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-6 py-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="name">{t("field_name")}</Label>
                                    <Input
                                        id="name"
                                        value={newDeptName}
                                        onChange={(e) => dispatch({ type: "SET_NEW_DEPT_NAME", payload: e.target.value })}
                                        placeholder={t("field_name_placeholder")}
                                    />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="desc">{t("field_description")}</Label>
                                    <Input
                                        id="desc"
                                        value={newDesc}
                                        onChange={(e) => dispatch({ type: "SET_NEW_DESC", payload: e.target.value })}
                                        placeholder={t("field_description_placeholder")}
                                    />
                                </div>

                                <Separator />

                                <div className="grid gap-4">
                                    <div className="flex items-center justify-between">
                                        <Label htmlFor="ai-toggle" className="flex flex-col gap-1">
                                            <span>{t("ai_integration")}</span>
                                            <span className="font-normal text-xs text-muted-foreground">{t("ai_integration_desc")}</span>
                                        </Label>
                                        <Switch
                                            id="ai-toggle"
                                            checked={useBot}
                                            onCheckedChange={(v) => dispatch({ type: "SET_USE_BOT", payload: v })}
                                        />
                                    </div>

                                    {useBot && (
                                        <div className="grid gap-2 pl-2">
                                            <Label htmlFor="bot-select" className="text-xs">{t("selected_bot")}</Label>
                                            <Select value={botId} onValueChange={(v) => dispatch({ type: "SET_BOT_ID", payload: v })}>
                                                <SelectTrigger id="bot-select">
                                                    <SelectValue placeholder={t("select_bot_placeholder")} />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {bots.filter(b => b.status === "active").length === 0 ? (
                                                        <SelectItem value="none" disabled>{t("no_active_bots")}</SelectItem>
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
                                    <Label>{t("routing_rules")}</Label>
                                    <RadioGroup value={routingMode} onValueChange={(v: "assigned" | "pooled") => dispatch({ type: "SET_ROUTING_MODE", payload: v })}>
                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem value="pooled" id="r-pooled" />
                                            <Label htmlFor="r-pooled" className="font-normal">{t("mode_pooled")}</Label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem value="assigned" id="r-assigned" />
                                            <Label htmlFor="r-assigned" className="font-normal">{t("mode_assigned")}</Label>
                                        </div>
                                    </RadioGroup>
                                </div>

                                <Separator />

                                <div className="grid gap-2">
                                    <Label>{t("tags")}</Label>
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
                                            onChange={(e) => dispatch({ type: "SET_TAG_INPUT", payload: e.target.value })}
                                            onKeyDown={(e) => {
                                                if (e.key === "Enter") {
                                                    e.preventDefault()
                                                    addTag()
                                                }
                                            }}
                                            placeholder={t("tag_placeholder")}
                                        />
                                        <Button type="button" variant="secondary" onClick={addTag}>{t("add_btn")}</Button>
                                    </div>
                                    <p className="text-[10px] text-muted-foreground">{t("tag_desc")}</p>
                                </div>
                            </div>
                            <DialogFooter>
                                <Button variant="outline" onClick={() => dispatch({ type: "SET_CREATE_OPEN", payload: false })}>{t("cancel")}</Button>
                                <Button onClick={handleSave}>{editingDeptId ? t("update_department") : t("create_department")}</Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>
                <Separator />

                <Card>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>{t("table_name")}</TableHead>
                                <TableHead>{t("table_members")}</TableHead>
                                <TableHead>{t("table_routing")}</TableHead>
                                <TableHead className="text-right">{t("table_actions")}</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {departments.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={3} className="text-center py-8 text-muted-foreground">{t("no_departments")}</TableCell>
                                </TableRow>
                            ) : (
                                departments.map((dept) => (
                                    <TableRow key={dept._id}>
                                        <TableCell>
                                            <div className="flex items-center gap-2 font-medium">
                                                <Building2 className="h-4 w-4 text-muted-foreground" />
                                                {dept.name}
                                                {dept.isDefault && <Badge variant="secondary" className="ml-2">{t("default_badge")}</Badge>}
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
                                                        <Users className="h-3.5 w-3.5" /> {t("no_agents_assigned")}
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
                                                                        title={t("remove_member")}
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
                                                            <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider px-2">{t("add_member")}</h4>
                                                            <div className="space-y-1">
                                                                {members.filter(m => m.userId && !dept.memberIds?.includes(m.userId)).length === 0 ? (
                                                                    <p className="text-xs text-center text-muted-foreground py-3">{t("all_members_in_dept")}</p>
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
                                                {dept.routingMode || t("routing_mode_pooled")}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right flex items-center justify-end gap-1">
                                            <Button variant="ghost" size="icon" onClick={() => handleEdit(dept)}>
                                                <Pencil className="h-4 w-4" />
                                            </Button>
                                            {!dept.isDefault && (
                                                <Button variant="ghost" size="icon" className="text-destructive" onClick={() => dispatch({ type: "SET_DEPT_PENDING_DELETE", payload: dept._id })}>
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

                {/* Delete Department Confirmation */}
                <AlertDialog open={deptPendingDelete !== null} onOpenChange={(open) => { if (!open) dispatch({ type: "SET_DEPT_PENDING_DELETE", payload: null }) }}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>{t("delete_dialog_title")}</AlertDialogTitle>
                            <AlertDialogDescription>
                                {t("delete_dialog_desc")}
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
                            <AlertDialogAction
                                className="bg-destructive text-white hover:bg-destructive/90"
                                onClick={async () => {
                                    if (deptPendingDelete) {
                                        await handleDelete(deptPendingDelete)
                                        dispatch({ type: "SET_DEPT_PENDING_DELETE", payload: null })
                                    }
                                }}
                            >
                                {t("delete_btn")}
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>
        </TooltipProvider>
    )
}
