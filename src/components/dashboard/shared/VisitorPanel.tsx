"use client"

import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    MoreHorizontal,
    MoreVertical,
    Clock,
    Globe,
    Building,
    MessageCircle,
    Hash,
    User,
    AlertCircle,
    Laptop,
    Check,
    X,
    ExternalLink,
    Facebook,
    Mail,
    UserCircle,
    Phone,
    MapPin,
    StickyNote,
    Edit2,
    Save,
    UserPlus,
    RefreshCw,
    Plus,
    Tag,
    Loader2,
    ShoppingBag,
    Send,
    Instagram,
    Pencil,
    CircleDot
} from "lucide-react"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { useQuery, useMutation } from "convex/react"
import { api } from "../../../../convex/_generated/api"
import { Id } from "../../../../convex/_generated/dataModel"
import { useState, useEffect, useCallback, KeyboardEvent } from "react"
import { useProject } from "@/context/ProjectContext"
import { toast } from "sonner"

type EditableField = "visitorName" | "visitorEmail" | "visitorPhone" | "visitorAddress" | "visitorNote"

interface FieldConfig {
    key: EditableField
    label: string
    placeholder: string
    icon: React.ElementType
    multiline?: boolean
}

const FIELDS: FieldConfig[] = [
    { key: "visitorName", label: "Name", placeholder: "Name", icon: User },
    { key: "visitorEmail", label: "Email", placeholder: "Email", icon: Mail },
    { key: "visitorPhone", label: "Phone", placeholder: "Phone number", icon: Phone },
    { key: "visitorAddress", label: "Address", placeholder: "Address", icon: MapPin },
    { key: "visitorNote", label: "Note", placeholder: "Add a note...", icon: StickyNote, multiline: true },
]

function InlineEditField({
    value,
    placeholder,
    icon: Icon,
    multiline,
    onSave,
}: {
    value: string
    placeholder: string
    icon: React.ElementType
    multiline?: boolean
    onSave: (value: string) => void
}) {
    const [editing, setEditing] = useState(false)
    const [draft, setDraft] = useState("")

    const handleStartEdit = () => {
        setDraft(value)
        setEditing(true)
    }

    const handleSave = useCallback(() => {
        setEditing(false)
        if (draft !== value) {
            onSave(draft)
        }
    }, [draft, value, onSave])

    const handleCancel = useCallback(() => {
        setEditing(false)
    }, [])

    const handleBlur = () => {
        handleSave()
    }

    if (editing) {
        return (
            <div className="flex items-start gap-3 text-sm group">
                <Icon className="h-4 w-4 text-muted-foreground mt-2.5 shrink-0" />
                <div className="flex-1 flex items-start gap-1">
                    {multiline ? (
                        <Textarea
                            value={draft}
                            onChange={(e) => setDraft(e.target.value)}
                            placeholder={placeholder}
                            className="min-h-[60px] text-sm"
                            autoFocus
                            onBlur={handleBlur}
                            onKeyDown={(e: KeyboardEvent<HTMLTextAreaElement>) => {
                                if (e.key === "Enter" && !e.shiftKey) {
                                    e.preventDefault()
                                    handleSave()
                                }
                                if (e.key === "Escape") handleCancel()
                            }}
                        />
                    ) : (
                        <Input
                            value={draft}
                            onChange={(e) => setDraft(e.target.value)}
                            placeholder={placeholder}
                            className="h-8 text-sm"
                            autoFocus
                            onBlur={handleBlur}
                            onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => {
                                if (e.key === "Enter") handleSave()
                                if (e.key === "Escape") handleCancel()
                            }}
                        />
                    )}
                    <button
                        onMouseDown={(e) => { e.preventDefault(); handleSave() }}
                        className="p-1 text-green-600 hover:bg-green-500/10 rounded transition-colors"
                    >
                        <Check className="h-3.5 w-3.5" />
                    </button>
                    <button
                        onMouseDown={(e) => { e.preventDefault(); handleCancel() }}
                        className="p-1 text-muted-foreground hover:bg-muted rounded transition-colors"
                    >
                        <X className="h-3.5 w-3.5" />
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div
            className="flex items-center gap-3 text-sm group cursor-pointer hover:bg-muted/50 rounded-md px-1 py-1.5 -mx-1 transition-colors"
            onClick={handleStartEdit}
        >
            <Icon className="h-4 w-4 text-muted-foreground shrink-0" />
            <span className={value ? "truncate whitespace-pre-wrap" : "text-muted-foreground truncate"}>
                {value || placeholder}
            </span>
            <Pencil className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 ml-auto transition-opacity shrink-0" />
        </div>
    )
}

const getChannelIcon = (channel?: string) => {
    switch (channel?.toLowerCase()) {
        case "messenger": return <MessageCircle className="h-4 w-4 text-indigo-500" />
        case "instagram": return <Instagram className="h-4 w-4 text-pink-500" />
        case "telegram": return <Send className="h-4 w-4 text-sky-500" />
        case "whatsapp": return <MessageCircle className="h-4 w-4 text-green-500" />
        case "email": return <Mail className="h-4 w-4 text-orange-500" />
        default: return <Globe className="h-4 w-4 text-muted-foreground" />
    }
}

export function VisitorPanel({ conversationId }: { conversationId: Id<"conversations"> }) {
    const { activeProject } = useProject()

    const conversation = useQuery(api.conversations.get, { id: conversationId })
    const existingContact = useQuery(
        api.contacts.findByConversation,
        { conversationId }
    )
    const labels = useQuery(
        api.labels.listLabels,
        activeProject ? { projectId: activeProject._id } : "skip"
    )
    const assignedProfile = useQuery(
        api.profiles.getByUserId,
        conversation?.assignedTo ? { userId: conversation.assignedTo } : "skip"
    )

    const updateVisitorInfo = useMutation(api.conversations.updateVisitorInfo)
    const updateConversation = useMutation(api.conversations.update)
    const createContact = useMutation(api.contacts.create)
    const updateContact = useMutation(api.contacts.update)
    const assignTag = useMutation(api.tags.assignTagToConversation)
    const removeTag = useMutation(api.tags.removeTagFromConversation)

    const [contactSaving, setContactSaving] = useState(false)
    const [tagPopoverOpen, setTagPopoverOpen] = useState(false)

    // Orders state and queries
    const orders = useQuery(
        api.orders.listOrders,
        activeProject ? { projectId: activeProject._id } : "skip"
    )
    const createOrder = useMutation(api.orders.createOrder)
    const updateOrderStatus = useMutation(api.orders.updateOrderStatus)

    const [isOrderFormOpen, setIsOrderFormOpen] = useState(false)
    const [orderFormSaving, setOrderFormSaving] = useState(false)
    const [orderForm, setOrderForm] = useState({
        contactName: "",
        phone: "",
        product: "",
        notes: "",
        status: "new" as "new" | "confirmed" | "cancelled"
    })


    const conversationOrders = orders?.filter(o => o.conversationId === conversationId)

    const handleCreateOrder = async () => {
        if (!activeProject || !conversationId) return
        if (!orderForm.product.trim() || !orderForm.contactName.trim()) {
            toast.error("Contact Name and Product are required")
            return
        }

        setOrderFormSaving(true)
        try {
            await createOrder({
                projectId: activeProject._id,
                conversationId,
                contactName: orderForm.contactName,
                phone: orderForm.phone || undefined,
                product: orderForm.product,
                notes: orderForm.notes || undefined,
                status: orderForm.status
            })
            toast.success("Order saved")
            setIsOrderFormOpen(false)
            setOrderForm({
                contactName: conversation?.visitorName || "",
                phone: conversation?.visitorPhone || "",
                product: "",
                notes: "",
                status: "new"
            })
        } catch {
            toast.error("Failed to save order")
        } finally {
            setOrderFormSaving(false)
        }
    }

    const handleSaveField = useCallback(
        (field: EditableField, value: string) => {
            if (!conversationId) return
            updateVisitorInfo({
                id: conversationId,
                [field]: value,
            })
        },
        [conversationId, updateVisitorInfo]
    )

    const handleSaveContact = async () => {
        if (!conversationId || !conversation || !activeProject) return
        setContactSaving(true)
        try {
            if (existingContact) {
                await updateContact({
                    id: existingContact._id,
                    name: conversation.visitorName || "Visitor",
                    email: conversation.visitorEmail || undefined,
                    phone: conversation.visitorPhone || undefined,
                    address: conversation.visitorAddress || undefined,
                    note: conversation.visitorNote || undefined,
                })
                toast.success("Contact updated")
            } else {
                await createContact({
                    projectId: activeProject._id,
                    name: conversation.visitorName || "Visitor",
                    email: conversation.visitorEmail || undefined,
                    phone: conversation.visitorPhone || undefined,
                    address: conversation.visitorAddress || undefined,
                    note: conversation.visitorNote || undefined,
                    conversationId,
                })
                toast.success("Contact added")
            }
        } catch {
            toast.error("Failed to save contact")
        } finally {
            setContactSaving(false)
        }
    }

    const handleAssignTag = async (tagName: string) => {
        if (!conversationId) return;
        try {
            await assignTag({ conversationId, tagName });
            setTagPopoverOpen(false);
            toast.success("Tag added");
        } catch {
            toast.error("Failed to add tag");
        }
    }

    const handleRemoveTag = async (tagName: string) => {
        if (!conversationId) return;
        try {
            await removeTag({ conversationId, tagName });
            toast.success("Tag removed");
        } catch {
            toast.error("Failed to remove tag");
        }
    }

    if (!conversation) {
        return (
            <div className="flex flex-col h-full bg-background border-l p-4 items-center justify-center text-muted-foreground text-sm">
                <Loader2 className="h-6 w-6 animate-spin mb-2" />
                Loading...
            </div>
        )
    }

    const initials = (conversation.visitorName ?? "V").substring(0, 2).toUpperCase()
    const attributes = conversation.attributes || {}
    const tags = conversation.tags || []

    const dateObj = new Date(conversation._creationTime);
    const formattedTime = `${dateObj.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })} · ${dateObj.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: false })}`;

    return (
        <div className="flex flex-col h-full bg-background border-l p-4 space-y-6 overflow-y-auto w-full">
            <div className="flex flex-col items-center gap-2 text-center pt-2">
                <Avatar className="h-20 w-20">
                    <AvatarFallback className="text-xl bg-primary/10 text-primary">{initials}</AvatarFallback>
                </Avatar>
                <div>
                    <h2 className="text-xl font-semibold">{conversation.visitorName || "Visitor"}</h2>
                    {conversation.visitorEmail && (
                        <p className="text-sm text-muted-foreground">{conversation.visitorEmail}</p>
                    )}
                </div>
            </div>

            <Separator />

            <Accordion type="multiple" defaultValue={["visitor-info", "conversation-details"]} className="w-full -mx-2 px-2">
                {/* 1. Visitor Info (Inline Editable) */}
                <AccordionItem value="visitor-info" className="border-b">
                    <AccordionTrigger className="text-xs font-semibold text-muted-foreground uppercase tracking-wider py-3 hover:no-underline rounded px-2 hover:bg-slate-50">
                        Visitor Info
                    </AccordionTrigger>
                    <AccordionContent className="pt-1 pb-3 px-2">
                        <div className="space-y-1">
                            {FIELDS.map((field) => (
                                <InlineEditField
                                    key={field.key}
                                    value={(conversation as any)[field.key] ?? ""}
                                    placeholder={field.placeholder}
                                    icon={field.icon}
                                    multiline={field.multiline}
                                    onSave={(val) => handleSaveField(field.key, val)}
                                />
                            ))}
                        </div>
                    </AccordionContent>
                </AccordionItem>

                {/* 2. Conversation Details (read-only) */}
                <AccordionItem value="conversation-details" className="border-b">
                    <AccordionTrigger className="text-xs font-semibold text-muted-foreground uppercase tracking-wider py-3 hover:no-underline rounded px-2 hover:bg-slate-50">
                        Conversation Details
                    </AccordionTrigger>
                    <AccordionContent className="pt-1 pb-3 px-2">
                        <div className="flex flex-col gap-3 text-sm px-1">
                            <div className="flex items-center gap-3">
                                <Hash className="h-4 w-4 text-muted-foreground shrink-0" />
                                <span className="flex items-center gap-1.5 capitalize">
                                    {getChannelIcon(attributes.channel || "web")}
                                    {attributes.channel || "Web"}
                                </span>
                            </div>
                            <div className="flex items-center gap-3">
                                <CircleDot className="h-4 w-4 text-muted-foreground shrink-0" />
                                <span className="text-muted-foreground">Status: </span>
                                <span className="flex items-center gap-1.5 w-full">
                                    {conversation.status === 1000 ? (
                                        <><div className="h-2 w-2 rounded-full bg-green-500" /> Resolved</>
                                    ) : conversation.status === 200 && conversation.assignedTo ? (
                                        <><div className="h-2 w-2 rounded-full bg-blue-500" /> Assigned</>
                                    ) : conversation.status === 200 && !conversation.assignedTo && conversation.botId ? (
                                        <><div className="h-2 w-2 rounded-full bg-purple-500" /> Bot Active</>
                                    ) : (
                                        <><div className="h-2 w-2 rounded-full bg-yellow-500" /> Open</>
                                    )}
                                </span>
                            </div>
                            <div className="flex items-center gap-3">
                                <Building className="h-4 w-4 text-muted-foreground shrink-0" />
                                <span>{attributes.department || "General"}</span>
                            </div>
                            <div className="flex items-center gap-3 group">
                                <AlertCircle className="h-4 w-4 text-muted-foreground shrink-0" />
                                <span className="text-muted-foreground min-w-[60px]">Priority: </span>
                                <Select
                                    value={conversation.priority || "normal"}
                                    onValueChange={(val: any) => {
                                        updateConversation({
                                            id: conversationId,
                                            priority: val
                                        }).catch(() => toast.error("Failed to update priority"))
                                    }}
                                >
                                    <SelectTrigger className="h-7 w-auto border-none p-0 focus:ring-0 shadow-none bg-transparent hover:bg-muted/50 rounded-md px-1 transition-colors">
                                        <div className="flex items-center gap-2">
                                            {conversation.priority === "urgent" && (
                                                <Badge className="bg-red-600 hover:bg-red-600 border-none uppercase text-[10px] font-bold">Urgent</Badge>
                                            )}
                                            {conversation.priority === "high" && (
                                                <Badge className="bg-orange-500 hover:bg-orange-500 border-none uppercase text-[10px] font-bold">High</Badge>
                                            )}
                                            {conversation.priority === "low" && (
                                                <Badge variant="secondary" className="bg-slate-200 text-slate-700 hover:bg-slate-200 border-none uppercase text-[10px] font-bold">Low</Badge>
                                            )}
                                            {(!conversation.priority || conversation.priority === "normal") && (
                                                <Badge variant="secondary" className="bg-gray-200 text-gray-700 hover:bg-gray-200 border-none uppercase text-[10px] font-bold">Normal</Badge>
                                            )}
                                        </div>
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="low">Low</SelectItem>
                                        <SelectItem value="normal">Normal</SelectItem>
                                        <SelectItem value="high">High</SelectItem>
                                        <SelectItem value="urgent">Urgent</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="flex items-center gap-3">
                                <User className="h-4 w-4 text-muted-foreground shrink-0" />
                                <span className="text-muted-foreground">Assigned to: </span>
                                {conversation.assignedTo ? (
                                    assignedProfile === undefined ? (
                                        <span className="text-muted-foreground animate-pulse text-xs">Loading...</span>
                                    ) : (
                                        <span className="truncate font-medium">{assignedProfile?.fullName || assignedProfile?.email || "Unknown Agent"}</span>
                                    )
                                ) : conversation.botId ? (
                                    <span className="truncate font-medium">Bot</span>
                                ) : (
                                    <span>Unassigned</span>
                                )}
                            </div>
                        </div>
                    </AccordionContent>
                </AccordionItem>

                {/* 3. Technical Info (collapsible accordion, read-only) */}
                <AccordionItem value="technical-info" className="border-b">
                    <AccordionTrigger className="text-xs font-semibold text-muted-foreground uppercase tracking-wider py-3 hover:no-underline rounded px-2 hover:bg-slate-50">
                        Technical Info
                    </AccordionTrigger>
                    <AccordionContent className="pt-1 pb-3 px-2">
                        <div className="flex flex-col gap-3 text-sm">
                            <div className="flex items-center gap-3">
                                <Clock className="h-4 w-4 text-muted-foreground shrink-0" />
                                <span>Created {formattedTime}</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <Globe className="h-4 w-4 text-muted-foreground shrink-0" />
                                <span>Language: {attributes.language || "Unknown"}</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <Laptop className="h-4 w-4 text-muted-foreground shrink-0" />
                                <span>OS: {attributes.os || "Unknown"}</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <Globe className="h-4 w-4 text-muted-foreground shrink-0" />
                                <span>Browser: {attributes.browser || "Unknown"}</span>
                            </div>
                            <div className="flex flex-col gap-1 items-start w-full">
                                <div className="flex items-center gap-3 w-full">
                                    <ExternalLink className="h-4 w-4 text-muted-foreground shrink-0" />
                                    <span className="truncate text-muted-foreground">Source Page:</span>
                                </div>
                                {attributes.sourcePage ? (
                                    <a href={attributes.sourcePage} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline inline-block truncate ml-7 w-[200px]">
                                        {attributes.sourcePage}
                                    </a>
                                ) : <span className="ml-7 text-muted-foreground">Unknown</span>}
                            </div>
                            <div className="flex items-center gap-3">
                                <Laptop className="h-4 w-4 text-muted-foreground shrink-0" />
                                <span className="font-mono text-xs">{attributes.ip || "Unknown IP"}</span>
                            </div>
                        </div>
                    </AccordionContent>
                </AccordionItem>

                {/* 4. Tags */}
                <AccordionItem value="tags" className="border-0">
                    <AccordionTrigger className="text-xs font-semibold text-muted-foreground uppercase tracking-wider py-3 hover:no-underline rounded px-2 hover:bg-slate-50">
                        Tags
                    </AccordionTrigger>
                    <AccordionContent className="pt-1 pb-3 px-2">
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="text-xs text-muted-foreground">Manage tags</span>
                                <Popover open={tagPopoverOpen} onOpenChange={setTagPopoverOpen}>
                                    <PopoverTrigger asChild>
                                        <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full hover:bg-muted">
                                            <Plus className="h-4 w-4 text-muted-foreground" />
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-[200px] p-2" align="end">
                                        <div className="flex flex-col gap-1">
                                            <div className="text-xs font-medium text-muted-foreground mb-1 px-2">Add a tag</div>
                                            {labels === undefined ? (
                                                <div className="text-xs text-muted-foreground p-2 text-center">Loading...</div>
                                            ) : labels.length === 0 ? (
                                                <div className="text-xs text-muted-foreground p-2 text-center">No labels configured</div>
                                            ) : (
                                                labels.map((label: any) => {
                                                    if (tags.includes(label.name)) return null;
                                                    return (
                                                        <Button
                                                            key={label._id}
                                                            variant="ghost"
                                                            size="sm"
                                                            className="justify-start font-normal h-8 flex items-center gap-2"
                                                            onClick={() => handleAssignTag(label.name)}
                                                        >
                                                            <div
                                                                className="w-2.5 h-2.5 rounded-full shrink-0"
                                                                style={{ backgroundColor: label.color }}
                                                            />
                                                            <span className="truncate">{label.name}</span>
                                                        </Button>
                                                    )
                                                })
                                            )}
                                        </div>
                                    </PopoverContent>
                                </Popover>
                            </div>

                            <div className="flex flex-wrap gap-1.5">
                                {tags.length === 0 ? (
                                    <span className="text-xs text-muted-foreground italic">No tags added</span>
                                ) : (
                                    tags.map((tag: string) => {
                                        const labelInfo = labels?.find((l: any) => l.name === tag);
                                        return (
                                            <Badge
                                                key={tag}
                                                className="px-2 py-0.5 text-xs font-normal gap-1 rounded-md border"
                                                style={labelInfo ? {
                                                    backgroundColor: `${labelInfo.color}20`,
                                                    color: labelInfo.color,
                                                    borderColor: `${labelInfo.color}40`
                                                } : {}}
                                            >
                                                {tag}
                                                <button
                                                    onClick={() => handleRemoveTag(tag)}
                                                    className="hover:bg-black/10 rounded-full p-0.5 flex items-center justify-center transition-colors ml-1 -mr-1"
                                                >
                                                    <X className="h-2.5 w-2.5" />
                                                </button>
                                            </Badge>
                                        )
                                    })
                                )}
                            </div>
                        </div>
                    </AccordionContent>
                </AccordionItem>

                {/* 5. Orders */}
                <AccordionItem value="orders" className="border-0 border-t">
                    <AccordionTrigger className="text-xs font-semibold text-muted-foreground uppercase tracking-wider py-3 hover:no-underline rounded px-2 hover:bg-slate-50">
                        <div className="flex items-center gap-2">
                            <ShoppingBag className="h-4 w-4 text-muted-foreground shrink-0" />
                            Orders
                        </div>
                    </AccordionTrigger>
                    <AccordionContent className="pt-1 pb-3 px-2">
                        <div className="space-y-4">
                            {/* Orders List */}
                            {orders === undefined ? (
                                <div className="text-xs text-muted-foreground p-2 text-center flex items-center justify-center gap-2">
                                    <Loader2 className="h-3 w-3 animate-spin" /> Loading orders...
                                </div>
                            ) : conversationOrders && conversationOrders.length === 0 ? (
                                <p className="text-xs text-muted-foreground italic pl-1">No orders for this conversation.</p>
                            ) : (
                                <div className="space-y-2">
                                    {conversationOrders?.map((order) => (
                                        <div key={order._id} className="flex items-start justify-between bg-muted/30 border rounded-md p-2 gap-2 text-sm group">
                                            <div className="flex flex-col gap-1 overflow-hidden min-w-0 flex-1">
                                                <div className="flex items-center gap-2 truncate whitespace-nowrap">
                                                    <span className="font-medium truncate block">{order.contactName}</span>
                                                    <span className="text-muted-foreground text-xs shrink-0">—</span>
                                                    <span className="truncate block">{order.product}</span>
                                                </div>
                                                <div className="flex items-center gap-2 mt-0.5">
                                                    {order.status === "new" && <Badge className="bg-blue-500 hover:bg-blue-600 outline-none border-none uppercase text-[9px] font-bold px-1.5 py-0 h-4">New</Badge>}
                                                    {order.status === "confirmed" && <Badge className="bg-green-500 hover:bg-green-600 outline-none border-none uppercase text-[9px] font-bold px-1.5 py-0 h-4">Confirmed</Badge>}
                                                    {order.status === "cancelled" && <Badge className="bg-red-500 hover:bg-red-600 outline-none border-none uppercase text-[9px] font-bold px-1.5 py-0 h-4">Cancelled</Badge>}
                                                </div>
                                            </div>

                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity">
                                                        <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="w-[160px]">
                                                    <DropdownMenuItem onClick={() => updateOrderStatus({ orderId: order._id, status: "new" })} className="cursor-pointer">
                                                        Mark New
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => updateOrderStatus({ orderId: order._id, status: "confirmed" })} className="cursor-pointer">
                                                        Mark Confirmed
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => updateOrderStatus({ orderId: order._id, status: "cancelled" })} className="cursor-pointer">
                                                        Mark Cancelled
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Form Toggle & Content */}
                            {!isOrderFormOpen ? (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="w-full h-8 text-xs font-medium bg-background"
                                    onClick={() => {
                                        setIsOrderFormOpen(true);
                                        setOrderForm(prev => ({
                                            ...prev,
                                            contactName: prev.contactName || conversation?.visitorName || "",
                                            phone: prev.phone || conversation?.visitorPhone || ""
                                        }));
                                    }}
                                >
                                    <Plus className="mr-1.5 h-3.5 w-3.5" />
                                    New Order
                                </Button>
                            ) : (
                                <div className="border rounded-md bg-muted/10 p-3 space-y-3 shadow-inner">
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-medium flex items-center gap-1.5">
                                            <User className="h-3 w-3 text-muted-foreground" /> Contact Name <span className="text-red-500">*</span>
                                        </label>
                                        <Input
                                            value={orderForm.contactName}
                                            onChange={(e) => setOrderForm(p => ({ ...p, contactName: e.target.value }))}
                                            placeholder="John Doe"
                                            className="h-8 text-xs bg-background"
                                        />
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-xs font-medium flex items-center gap-1.5">
                                            <Phone className="h-3 w-3 text-muted-foreground" /> Phone
                                        </label>
                                        <Input
                                            value={orderForm.phone}
                                            onChange={(e) => setOrderForm(p => ({ ...p, phone: e.target.value }))}
                                            placeholder="+1 234 567 890"
                                            className="h-8 text-xs bg-background"
                                        />
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-xs font-medium flex items-center gap-1.5">
                                            <ShoppingBag className="h-3 w-3 text-muted-foreground" /> Product / Item <span className="text-red-500">*</span>
                                        </label>
                                        <Input
                                            value={orderForm.product}
                                            onChange={(e) => setOrderForm(p => ({ ...p, product: e.target.value }))}
                                            placeholder="Product name or description"
                                            className="h-8 text-xs bg-yellow-50/50 focus-visible:ring-offset-0 focus-visible:ring-1 focus-visible:bg-yellow-50"
                                            autoFocus
                                        />
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-xs font-medium flex items-center gap-1.5">
                                            <StickyNote className="h-3 w-3 text-muted-foreground" /> Notes
                                        </label>
                                        <Textarea
                                            value={orderForm.notes}
                                            onChange={(e) => setOrderForm(p => ({ ...p, notes: e.target.value }))}
                                            placeholder="Order notes, specifications..."
                                            className="min-h-[60px] text-xs resize-none bg-background"
                                        />
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-xs font-medium flex items-center gap-1.5">
                                            <CircleDot className="h-3 w-3 text-muted-foreground" /> Status
                                        </label>
                                        <Select
                                            value={orderForm.status}
                                            onValueChange={(v: "new" | "confirmed" | "cancelled") => setOrderForm(p => ({ ...p, status: v }))}
                                        >
                                            <SelectTrigger className="h-8 text-xs bg-background">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="new"><span className="text-blue-600 font-medium">New</span></SelectItem>
                                                <SelectItem value="confirmed"><span className="text-green-600 font-medium">Confirmed</span></SelectItem>
                                                <SelectItem value="cancelled"><span className="text-red-600 font-medium">Cancelled</span></SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="flex items-center gap-2 pt-2 border-t border-dashed mt-3">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => setIsOrderFormOpen(false)}
                                            className="h-8 text-xs flex-1 transition-colors"
                                            disabled={orderFormSaving}
                                        >
                                            Cancel
                                        </Button>
                                        <Button
                                            size="sm"
                                            onClick={handleCreateOrder}
                                            disabled={orderFormSaving || !orderForm.product.trim() || !orderForm.contactName.trim()}
                                            className="h-8 text-xs flex-1 transition-all"
                                        >
                                            {orderFormSaving ? (
                                                <><Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" /> Saving...</>
                                            ) : (
                                                <><Check className="h-3.5 w-3.5 mr-1" /> Save Order</>
                                            )}
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </AccordionContent>
                </AccordionItem>
            </Accordion>

            <div className="flex-1" />

            {/* 5. CRM Sync button */}
            <div className="pt-4 pb-2">
                <Button
                    onClick={handleSaveContact}
                    disabled={contactSaving}
                    variant={existingContact ? "outline" : "default"}
                    className="w-full"
                >
                    {contactSaving ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : existingContact ? (
                        <RefreshCw className="mr-2 h-4 w-4" />
                    ) : (
                        <UserPlus className="mr-2 h-4 w-4" />
                    )}
                    {existingContact ? "Update Contact" : "Save as Contact"}
                </Button>
            </div>
        </div>
    )
}
