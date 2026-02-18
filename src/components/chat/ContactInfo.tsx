"use client"

import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { User, Mail, Phone, MapPin, StickyNote, Pencil, Check, X, UserPlus, RefreshCw, Loader2 } from "lucide-react"
import { useSearchParams } from "next/navigation"
import { useQuery, useMutation } from "convex/react"
import { api } from "../../../convex/_generated/api"
import { Id } from "../../../convex/_generated/dataModel"
import { useState, useEffect, useCallback } from "react"
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
    const [draft, setDraft] = useState(value)

    useEffect(() => {
        setDraft(value)
    }, [value])

    const handleSave = useCallback(() => {
        setEditing(false)
        if (draft !== value) {
            onSave(draft)
        }
    }, [draft, value, onSave])

    const handleCancel = useCallback(() => {
        setEditing(false)
        setDraft(value)
    }, [value])

    if (editing) {
        return (
            <div className="flex items-start gap-3 text-sm group">
                <Icon className="h-4 w-4 text-muted-foreground mt-2.5" />
                <div className="flex-1 flex items-start gap-1">
                    {multiline ? (
                        <Textarea
                            value={draft}
                            onChange={(e) => setDraft(e.target.value)}
                            placeholder={placeholder}
                            className="min-h-[60px] text-sm"
                            autoFocus
                            onKeyDown={(e) => {
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
                            onKeyDown={(e) => {
                                if (e.key === "Enter") handleSave()
                                if (e.key === "Escape") handleCancel()
                            }}
                        />
                    )}
                    <button
                        onClick={handleSave}
                        className="p-1 text-green-600 hover:bg-green-500/10 rounded transition-colors"
                    >
                        <Check className="h-3.5 w-3.5" />
                    </button>
                    <button
                        onClick={handleCancel}
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
            onClick={() => setEditing(true)}
        >
            <Icon className="h-4 w-4 text-muted-foreground" />
            <span className={value ? "truncate" : "text-muted-foreground truncate"}>
                {value || placeholder}
            </span>
            <Pencil className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 ml-auto transition-opacity" />
        </div>
    )
}

export function ContactInfo() {
    const searchParams = useSearchParams()
    const conversationId = searchParams.get("conversationId") as Id<"conversations"> | null

    const conversation = useQuery(
        api.conversations.get,
        conversationId ? { id: conversationId } : "skip"
    )

    const updateVisitorInfo = useMutation(api.conversations.updateVisitorInfo)
    const createContact = useMutation(api.contacts.create)
    const updateContact = useMutation(api.contacts.update)
    const { activeProject } = useProject()
    const [contactSaving, setContactSaving] = useState(false)

    // Check if contact already exists for this conversation
    const existingContact = useQuery(
        api.contacts.findByConversation,
        conversationId ? { conversationId } : "skip"
    )

    const handleSave = useCallback(
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
                    email: (conversation as any).visitorEmail || undefined,
                    phone: (conversation as any).visitorPhone || undefined,
                    address: (conversation as any).visitorAddress || undefined,
                    note: (conversation as any).visitorNote || undefined,
                })
                toast.success("Contact updated")
            } else {
                await createContact({
                    projectId: activeProject._id,
                    name: conversation.visitorName || "Visitor",
                    email: (conversation as any).visitorEmail || undefined,
                    phone: (conversation as any).visitorPhone || undefined,
                    address: (conversation as any).visitorAddress || undefined,
                    note: (conversation as any).visitorNote || undefined,
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

    if (!conversationId) {
        return (
            <div className="flex flex-col h-full bg-background border-l p-4 items-center justify-center text-muted-foreground text-sm">
                Select a conversation to see contact info
            </div>
        )
    }

    if (!conversation) {
        return (
            <div className="flex flex-col h-full bg-background border-l p-4 items-center justify-center text-muted-foreground text-sm">
                Loading...
            </div>
        )
    }

    const initials = (conversation.visitorName ?? "V").substring(0, 2).toUpperCase()

    return (
        <div className="flex flex-col h-full bg-background border-l p-4 space-y-6">
            <div className="flex flex-col items-center gap-2 text-center">
                <Avatar className="h-20 w-20">
                    <AvatarFallback className="text-lg">{initials}</AvatarFallback>
                </Avatar>
                <div>
                    <h2 className="text-xl font-semibold">{conversation.visitorName || "Visitor"}</h2>
                    {conversation.visitorEmail && (
                        <p className="text-sm text-muted-foreground">{conversation.visitorEmail}</p>
                    )}
                </div>
            </div>

            <Separator />

            <div className="space-y-1">
                <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wider mb-3">
                    Contact Details
                </h3>

                {FIELDS.map((field) => (
                    <InlineEditField
                        key={field.key}
                        value={(conversation as any)[field.key] ?? ""}
                        placeholder={field.placeholder}
                        icon={field.icon}
                        multiline={field.multiline}
                        onSave={(val) => handleSave(field.key, val)}
                    />
                ))}
            </div>

            <Separator />

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
                {existingContact ? "Update Contact" : "Add Contact"}
            </Button>
        </div>
    )
}
