"use client"

import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
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
    Mail,
    Phone,
    MapPin,
    StickyNote,
    UserPlus,
    RefreshCw,
    Plus,
    Loader2,
    ShoppingBag,
    Send,
    Instagram,
    Pencil,
    CircleDot,
    ChevronLeft,
    Bot,
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
import { useState, useCallback, KeyboardEvent } from "react"
import { useProject } from "@/context/ProjectContext"
import { toast } from "sonner"
import { useTranslations, useLocale } from "next-intl"
import { CONVERSATION_STATUS } from "@/lib/constants"

type EditableField = "visitorName" | "visitorEmail" | "visitorPhone" | "visitorAddress" | "visitorNote"

interface FieldConfig {
    key: EditableField
    label: string
    placeholder: string
    icon: React.ElementType
    multiline?: boolean
}



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
        <button
            type="button"
            className="flex items-center gap-3 text-sm group cursor-pointer hover:bg-muted/50 rounded-md px-1 py-1.5 -mx-1 transition-colors w-full text-left"
            onClick={handleStartEdit}
        >
            <Icon className="h-4 w-4 text-muted-foreground shrink-0" />
            <span className={value ? "truncate whitespace-pre-wrap" : "text-muted-foreground truncate"}>
                {value || placeholder}
            </span>
            <Pencil className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 ml-auto transition-opacity shrink-0" />
        </button>
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

export function VisitorPanel({ conversationId, onBack }: { conversationId: Id<"conversations">, onBack?: () => void }) {
    const t = useTranslations("visitor")
    const tChat = useTranslations("chat")
    const locale = useLocale()
    const { activeProject } = useProject()

    const FIELDS: FieldConfig[] = [
        { key: "visitorName", label: t("field_name"), placeholder: t("field_name"), icon: User },
        { key: "visitorEmail", label: t("field_email"), placeholder: t("field_email"), icon: Mail },
        { key: "visitorPhone", label: t("field_phone"), placeholder: t("field_phone"), icon: Phone },
        { key: "visitorAddress", label: t("field_address"), placeholder: t("field_address"), icon: MapPin },
        { key: "visitorNote", label: t("field_note"), placeholder: t("field_note"), icon: StickyNote, multiline: true },
    ]

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
    const conversationEvents = useQuery(
        api.conversations.getConversationEvents,
        conversationId ? { conversationId } : "skip"
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
            toast.error(t("toast_contact_required"))
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
            toast.success(t("toast_order_saved"))
            setIsOrderFormOpen(false)
            setOrderForm({
                contactName: conversation?.visitorName || "",
                phone: conversation?.visitorPhone || "",
                product: "",
                notes: "",
                status: "new"
            })
        } catch {
            toast.error(t("toast_order_failed"))
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
                    name: conversation.visitorName || t("name_fallback"),
                    email: conversation.visitorEmail || undefined,
                    phone: conversation.visitorPhone || undefined,
                    address: conversation.visitorAddress || undefined,
                    note: conversation.visitorNote || undefined,
                })
                toast.success(t("toast_contact_updated"))
            } else {
                await createContact({
                    projectId: activeProject._id,
                    name: conversation.visitorName || t("name_fallback"),
                    email: conversation.visitorEmail || undefined,
                    phone: conversation.visitorPhone || undefined,
                    address: conversation.visitorAddress || undefined,
                    note: conversation.visitorNote || undefined,
                    conversationId,
                })
                toast.success(t("toast_contact_added"))
            }
        } catch {
            toast.error(t("toast_contact_failed"))
        } finally {
            setContactSaving(false)
        }
    }

    const handleAssignTag = async (tagName: string) => {
        if (!conversationId) return;
        try {
            await assignTag({ conversationId, tagName });
            setTagPopoverOpen(false);
            toast.success(t("toast_tag_added"));
        } catch {
            toast.error(t("toast_tag_add_failed"));
        }
    }

    const handleRemoveTag = async (tagName: string) => {
        if (!conversationId) return;
        try {
            await removeTag({ conversationId, tagName });
            toast.success(t("toast_tag_removed"));
        } catch {
            toast.error(tChat("error_remove_tag"));
        }
    }

    if (!conversation) {
        return (
            <div className="flex flex-col h-full bg-background border-l p-4 items-center justify-center text-muted-foreground text-sm">
                <Loader2 className="h-6 w-6 animate-spin mb-2" />
                {t("loading")}
            </div>
        )
    }

    const initials = (conversation.visitorName ?? "V").substring(0, 2).toUpperCase()
    const attributes = conversation.attributes || {}
    const tags = conversation.tags || []

    const dateObj = new Date(conversation._creationTime);
    const formattedTime = `${dateObj.toLocaleDateString(locale, { month: "short", day: "numeric", year: "numeric" })} · ${dateObj.toLocaleTimeString(locale, { hour: "numeric", minute: "2-digit", hour12: false })}`;

    return (
        <div className="flex flex-col h-full bg-background border-l p-4 space-y-6 overflow-y-auto w-full">
            {onBack && (
                <div className="flex items-center -mt-2 -ml-2 mb-2 lg:hidden">
                    <Button variant="ghost" size="icon" onClick={onBack}>
                        <ChevronLeft className="h-6 w-6" />
                    </Button>
                </div>
            )}
            <div className="flex flex-col items-center gap-2 text-center pt-2">
                <Avatar className="h-20 w-20">
                    <AvatarFallback className="text-xl bg-primary/10 text-primary">{initials}</AvatarFallback>
                </Avatar>
                <div>
                    <h2 className="text-xl font-semibold">{conversation.visitorName || t("name_fallback")}</h2>
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
                        {t("section_info")}
                    </AccordionTrigger>
                    <AccordionContent className="pt-1 pb-3 px-2">
                        <div className="space-y-1">
                            {FIELDS.map((field) => (
                                <InlineEditField
                                    key={field.key}
                                    value={((conversation as Record<string, unknown>)?.[field.key] as string) ?? ""}
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
                        {t("section_conversation")}
                    </AccordionTrigger>
                    <AccordionContent className="pt-1 pb-3 px-2">
                        <div className="flex flex-col gap-3 text-sm px-1">
                            <div className="flex items-center gap-3">
                                <Hash className="h-4 w-4 text-muted-foreground shrink-0" />
                                <span className="flex items-center gap-1.5 capitalize">
                                    {getChannelIcon(attributes.channel || "web")}
                                    {attributes.channel || t("channel_web")}
                                </span>
                            </div>
                            <div className="flex items-center gap-3">
                                <CircleDot className="h-4 w-4 text-muted-foreground shrink-0" />
                                <span className="text-muted-foreground">{t("status_label")}: </span>
                                <span className="flex items-center gap-1.5 w-full">
                                    {conversation.status === CONVERSATION_STATUS.CLOSED ? (
                                        <><div className="h-2 w-2 rounded-full bg-green-500" /> {t("status_resolved")}</>
                                    ) : conversation.status === CONVERSATION_STATUS.ASSIGNED && conversation.assignedTo ? (
                                        <><div className="h-2 w-2 rounded-full bg-blue-500" /> {t("status_assigned")}</>
                                    ) : conversation.status === CONVERSATION_STATUS.ASSIGNED && !conversation.assignedTo && conversation.botId ? (
                                        <><div className="h-2 w-2 rounded-full bg-purple-500" /> {t("status_bot")}</>
                                    ) : (
                                        <><div className="h-2 w-2 rounded-full bg-yellow-500" /> {t("status_open")}</>
                                    )}
                                </span>
                            </div>
                            <div className="flex items-center gap-3">
                                <Building className="h-4 w-4 text-muted-foreground shrink-0" />
                                <span>{attributes.department || t("dept_fallback")}</span>
                            </div>
                            <div className="flex items-center gap-3 group">
                                <AlertCircle className="h-4 w-4 text-muted-foreground shrink-0" />
                                <span className="text-muted-foreground min-w-[60px]">{t("priority_label")}: </span>
                                <Select
                                    value={conversation.priority || "normal"}
                                    onValueChange={(val: "low" | "normal" | "high" | "urgent") => {
                                        updateConversation({
                                            id: conversationId,
                                            priority: val
                                        }).catch(() => toast.error(tChat("error_update_priority")))
                                    }}
                                >
                                    <SelectTrigger className="h-7 w-auto border-none p-0 focus:ring-0 shadow-none bg-transparent hover:bg-muted/50 rounded-md px-1 transition-colors">
                                        <div className="flex items-center gap-2">
                                            {conversation.priority === "urgent" && (
                                                <Badge className="bg-red-600 hover:bg-red-600 border-none uppercase text-[10px] font-bold">{t("priority_urgent")}</Badge>
                                            )}
                                            {conversation.priority === "high" && (
                                                <Badge className="bg-orange-500 hover:bg-orange-500 border-none uppercase text-[10px] font-bold">{t("priority_high")}</Badge>
                                            )}
                                            {conversation.priority === "low" && (
                                                <Badge variant="secondary" className="bg-slate-200 text-slate-700 hover:bg-slate-200 border-none uppercase text-[10px] font-bold">{t("priority_low")}</Badge>
                                            )}
                                            {(!conversation.priority || conversation.priority === "normal") && (
                                                <Badge variant="secondary" className="bg-gray-200 text-gray-700 hover:bg-gray-200 border-none uppercase text-[10px] font-bold">{t("priority_normal")}</Badge>
                                            )}
                                        </div>
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="low">{t("priority_low")}</SelectItem>
                                        <SelectItem value="normal">{t("priority_normal")}</SelectItem>
                                        <SelectItem value="high">{t("priority_high")}</SelectItem>
                                        <SelectItem value="urgent">{t("priority_urgent")}</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="flex items-center gap-3">
                                <User className="h-4 w-4 text-muted-foreground shrink-0" />
                                <span className="text-muted-foreground">{t("assigned_label")}: </span>
                                {conversation.assignedTo ? (
                                    assignedProfile === undefined ? (
                                        <span className="text-muted-foreground animate-pulse text-xs">{t("loading")}</span>
                                    ) : (
                                        <span className="truncate font-medium">{assignedProfile?.fullName || assignedProfile?.email || t("tech_unknown")}</span>
                                    )
                                ) : conversation.botId ? (
                                    <span className="truncate font-medium">{t("assigned_bot")}</span>
                                ) : (
                                    <span>{t("assigned_none")}</span>
                                )}
                            </div>
                        </div>
                    </AccordionContent>
                </AccordionItem>

                {/* 3. Technical Info (collapsible accordion, read-only) */}
                <AccordionItem value="technical-info" className="border-b">
                    <AccordionTrigger className="text-xs font-semibold text-muted-foreground uppercase tracking-wider py-3 hover:no-underline rounded px-2 hover:bg-slate-50">
                        {t("tech_section")}
                    </AccordionTrigger>
                    <AccordionContent className="pt-1 pb-3 px-2">
                        <div className="flex flex-col gap-3 text-sm">
                            <div className="flex items-center gap-3">
                                <Clock className="h-4 w-4 text-muted-foreground shrink-0" />
                                <span>{t("tech_created_at_label")} {formattedTime}</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <Globe className="h-4 w-4 text-muted-foreground shrink-0" />
                                <span>{t("tech_language")}: {attributes.language || t("tech_unknown")}</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <Laptop className="h-4 w-4 text-muted-foreground shrink-0" />
                                <span>{t("tech_os")}: {attributes.os || t("tech_unknown")}</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <Globe className="h-4 w-4 text-muted-foreground shrink-0" />
                                <span>{t("tech_browser")}: {attributes.browser || t("tech_unknown")}</span>
                            </div>
                            <div className="flex flex-col gap-1 items-start w-full">
                                <div className="flex items-center gap-3 w-full">
                                    <ExternalLink className="h-4 w-4 text-muted-foreground shrink-0" />
                                    <span className="truncate text-muted-foreground">{t("tech_source")}:</span>
                                </div>
                                {attributes.sourcePage ? (
                                    <a href={attributes.sourcePage} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline inline-block truncate ml-7 w-[200px]">
                                        {attributes.sourcePage}
                                    </a>
                                ) : <span className="ml-7 text-muted-foreground">{t("tech_unknown")}</span>}
                            </div>
                            <div className="flex items-center gap-3">
                                <Laptop className="h-4 w-4 text-muted-foreground shrink-0" />
                                <span className="font-mono text-xs">{attributes.ip || t("tech_unknown_ip")}</span>
                            </div>
                        </div>
                    </AccordionContent>
                </AccordionItem>

                {/* 4. Tags */}
                <AccordionItem value="tags" className="border-0">
                    <AccordionTrigger className="text-xs font-semibold text-muted-foreground uppercase tracking-wider py-3 hover:no-underline rounded px-2 hover:bg-slate-50">
                        {t("tags_label")}
                    </AccordionTrigger>
                    <AccordionContent className="pt-1 pb-3 px-2">
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="text-xs text-muted-foreground">{t("tags_manage")}</span>
                                <Popover open={tagPopoverOpen} onOpenChange={setTagPopoverOpen}>
                                    <PopoverTrigger asChild>
                                        <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full hover:bg-muted">
                                            <Plus className="h-4 w-4 text-muted-foreground" />
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-[200px] p-2" align="end">
                                        <div className="flex flex-col gap-1">
                                            <div className="text-xs font-medium text-muted-foreground mb-1 px-2">{t("tags_add")}</div>
                                            {labels === undefined ? (
                                                <div className="text-xs text-muted-foreground p-2 text-center">{t("loading")}</div>
                                            ) : labels.length === 0 ? (
                                                <div className="text-xs text-muted-foreground p-2 text-center">{t("tags_none_configured")}</div>
                                            ) : (
                                                labels.map((label: { _id?: string; name: string; color?: string }) => {
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
                                    <span className="text-xs text-muted-foreground italic">{t("tags_none_added")}</span>
                                ) : (
                                    tags.map((tag: string) => {
                                        const labelInfo = labels?.find((l: { name: string }) => l.name === tag);
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
                            {t("orders_label")}
                        </div>
                    </AccordionTrigger>
                    <AccordionContent className="pt-1 pb-3 px-2">
                        <div className="space-y-4">
                            {/* Orders List */}
                            {orders === undefined ? (
                                <div className="text-xs text-muted-foreground p-2 text-center flex items-center justify-center gap-2">
                                    <Loader2 className="h-3 w-3 animate-spin" /> {t("orders_loading")}
                                </div>
                            ) : conversationOrders && conversationOrders.length === 0 ? (
                                <p className="text-xs text-muted-foreground italic pl-1">{t("orders_none")}</p>
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
                                                    {order.status === "new" && <Badge className="bg-blue-500 hover:bg-blue-600 outline-none border-none uppercase text-[9px] font-bold px-1.5 py-0 h-4">{t("order_status_new")}</Badge>}
                                                    {order.status === "confirmed" && <Badge className="bg-green-500 hover:bg-green-600 outline-none border-none uppercase text-[9px] font-bold px-1.5 py-0 h-4">{t("order_status_confirmed")}</Badge>}
                                                    {order.status === "cancelled" && <Badge className="bg-red-500 hover:bg-red-600 outline-none border-none uppercase text-[9px] font-bold px-1.5 py-0 h-4">{t("order_status_cancelled")}</Badge>}
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
                                                        {t("order_mark_new")}
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => updateOrderStatus({ orderId: order._id, status: "confirmed" })} className="cursor-pointer">
                                                        {t("order_mark_confirmed")}
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => updateOrderStatus({ orderId: order._id, status: "cancelled" })} className="cursor-pointer">
                                                        {t("order_mark_cancelled")}
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
                                    {t("order_form_title")}
                                </Button>
                            ) : (
                                <div className="border rounded-md bg-muted/10 p-3 space-y-3 shadow-inner">
                                    <div className="space-y-1.5">
                                        <label htmlFor="order-contact-name" className="text-xs font-medium flex items-center gap-1.5">
                                            <User className="h-3 w-3 text-muted-foreground" /> {t("order_form_contact")} <span className="text-red-500">*</span>
                                        </label>
                                        <Input
                                            id="order-contact-name"
                                            value={orderForm.contactName}
                                            onChange={(e) => setOrderForm(p => ({ ...p, contactName: e.target.value }))}
                                            placeholder={t("order_form_contact_placeholder")}
                                            className="h-8 text-xs bg-background"
                                        />
                                    </div>

                                    <div className="space-y-1.5">
                                        <label htmlFor="order-phone" className="text-xs font-medium flex items-center gap-1.5">
                                            <Phone className="h-3 w-3 text-muted-foreground" /> {t("order_form_phone")}
                                        </label>
                                        <Input
                                            id="order-phone"
                                            value={orderForm.phone}
                                            onChange={(e) => setOrderForm(p => ({ ...p, phone: e.target.value }))}
                                            placeholder={t("order_form_phone_placeholder")}
                                            className="h-8 text-xs bg-background"
                                        />
                                    </div>

                                    <div className="space-y-1.5">
                                        <label htmlFor="order-product" className="text-xs font-medium flex items-center gap-1.5">
                                            <ShoppingBag className="h-3 w-3 text-muted-foreground" /> {t("order_form_product")} <span className="text-red-500">*</span>
                                        </label>
                                        <Input
                                            id="order-product"
                                            value={orderForm.product}
                                            onChange={(e) => setOrderForm(p => ({ ...p, product: e.target.value }))}
                                            placeholder={t("order_form_product_placeholder")}
                                            className="h-8 text-xs bg-yellow-50/50 focus-visible:ring-offset-0 focus-visible:ring-1 focus-visible:bg-yellow-50"
                                        />
                                    </div>

                                    <div className="space-y-1.5">
                                        <label htmlFor="order-notes" className="text-xs font-medium flex items-center gap-1.5">
                                            <StickyNote className="h-3 w-3 text-muted-foreground" /> {t("order_form_notes")}
                                        </label>
                                        <Textarea
                                            id="order-notes"
                                            value={orderForm.notes}
                                            onChange={(e) => setOrderForm(p => ({ ...p, notes: e.target.value }))}
                                            placeholder={t("order_form_notes_placeholder")}
                                            className="min-h-[60px] text-xs resize-none bg-background"
                                        />
                                    </div>

                                    <div className="space-y-1.5">
                                        <label htmlFor="order-status" className="text-xs font-medium flex items-center gap-1.5">
                                            <CircleDot className="h-3 w-3 text-muted-foreground" /> {t("order_form_status")}
                                        </label>
                                        <Select
                                            value={orderForm.status}
                                            onValueChange={(v: "new" | "confirmed" | "cancelled") => setOrderForm(p => ({ ...p, status: v }))}
                                        >
                                            <SelectTrigger id="order-status" className="h-8 text-xs bg-background">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="new"><span className="text-blue-600 font-medium">{t("order_status_new")}</span></SelectItem>
                                                <SelectItem value="confirmed"><span className="text-green-600 font-medium">{t("order_status_confirmed")}</span></SelectItem>
                                                <SelectItem value="cancelled"><span className="text-red-600 font-medium">{t("order_status_cancelled")}</span></SelectItem>
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
                                            {t("btn_cancel")}
                                        </Button>
                                        <Button
                                            size="sm"
                                            onClick={handleCreateOrder}
                                            disabled={orderFormSaving || !orderForm.product.trim() || !orderForm.contactName.trim()}
                                            className="h-8 text-xs flex-1 transition-all"
                                        >
                                            {orderFormSaving ? (
                                                <><Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" /> {t("btn_saving")}</>
                                            ) : (
                                                <><Check className="h-3.5 w-3.5 mr-1" /> {t("btn_save_order")}</>
                                            )}
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </AccordionContent>
                </AccordionItem>
            </Accordion>

            {/* 6. Activity History */}
            {conversationEvents && conversationEvents.length > 0 && (
                <div className="space-y-3 px-2">
                    <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        {t("section_activity") || "Activity"}
                    </h3>
                    <div className="space-y-3">
                        {conversationEvents.map((event) => {
                            const eventDate = new Date(event.createdAt);
                            const timeStr = eventDate.toLocaleDateString(locale, {
                                month: "short",
                                day: "numeric",
                                hour: "numeric",
                                minute: "2-digit",
                                hour12: false
                            });

                            let label = "";
                            if (event.handledBy === "bot") {
                                label = event.closed ? (t("event_resolved_bot") || "Resolved by bot") : (t("event_handoff_bot") || "Handed off to agent");
                            } else {
                                label = event.closed ? (t("event_resolved_agent") || "Resolved by agent") : (t("event_active_agent") || "Active with agent");
                            }

                            return (
                                <div key={`event-${event.createdAt}`} className="flex items-start gap-3 text-sm group">
                                    <div className="mt-0.5 p-1 rounded-full bg-muted/50 text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                                        {event.handledBy === "bot" ? (
                                            <Bot className="h-3 w-3" />
                                        ) : (
                                            <User className="h-3 w-3" />
                                        )}
                                    </div>
                                    <div className="flex flex-col min-w-0">
                                        <span className="font-medium text-foreground leading-none mb-1">{label}</span>
                                        <span className="text-[11px] text-muted-foreground">{timeStr}</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

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
                    {existingContact ? t("btn_update_contact") : t("btn_save_contact")}
                </Button>
            </div>
        </div>
    )
}
