import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Conversation } from "./conversation-list"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Mail, Clock, Building, Globe, Laptop, ExternalLink, MapPin, Plus, X, MessageCircle, Facebook, User, Hash, CircleDot } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { useMutation, useQuery } from "convex/react"
import { api } from "../../../../convex/_generated/api"
import { Id } from "../../../../convex/_generated/dataModel"
import { useProject } from "@/context/ProjectContext"
import { useState } from "react"

interface ContactInfoProps {
    conversation: Conversation | null
}

const getChannelIcon = (channel: string) => {
    switch (channel?.toLowerCase()) {
        case "whatsapp": return <MessageCircle className="h-4 w-4" />
        case "facebook": return <Facebook className="h-4 w-4" />
        case "email": return <Mail className="h-4 w-4" />
        default: return <Globe className="h-4 w-4" />
    }
}

export function ContactInfo({ conversation }: ContactInfoProps) {
    const { activeProject } = useProject()
    const projectId = activeProject?._id

    const labels = useQuery(
        api.labels.listLabels,
        projectId ? { projectId } : "skip"
    )

    const assignTag = useMutation(api.tags.assignTagToConversation)
    const removeTag = useMutation(api.tags.removeTagFromConversation)

    const [isAdding, setIsAdding] = useState(false)
    const [isRemoving, setIsRemoving] = useState(false)

    const handleAddTag = async (tagName: string) => {
        if (!conversation) return
        setIsAdding(true)
        try {
            await assignTag({
                conversationId: conversation.id as Id<"conversations">,
                tagName
            })
        } catch (error) {
            console.error("Failed to add tag", error)
        } finally {
            setIsAdding(false)
        }
    }

    const handleRemoveTag = async (tagName: string) => {
        if (!conversation) return
        setIsRemoving(true)
        try {
            await removeTag({
                conversationId: conversation.id as Id<"conversations">,
                tagName
            })
        } catch (error) {
            console.error("Failed to remove tag", error)
        } finally {
            setIsRemoving(false)
        }
    }

    if (!conversation) {
        return (
            <div className="flex h-full items-center justify-center p-4 text-center text-muted-foreground">
                Select a conversation to view details
            </div>
        )
    }

    const details = (conversation as any).details || {}

    const dateObj = new Date(conversation.timestamp);
    const formattedTime = `${dateObj.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })} · ${dateObj.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: false })}`;

    return (
        <div className="h-full flex flex-col overflow-y-auto bg-white">
            <div className="p-6 flex flex-col items-center gap-3">
                <Avatar className="h-20 w-20">
                    <AvatarImage src={conversation.user.avatar} />
                    <AvatarFallback className="text-xl bg-primary/10 text-primary">{conversation.user.initials}</AvatarFallback>
                </Avatar>
                <div className="text-center">
                    <h2 className="text-lg font-semibold">{conversation.user.name}</h2>
                    <a href={`mailto:${conversation.user.email}`} className="text-sm text-muted-foreground hover:underline">
                        {conversation.user.email}
                    </a>
                </div>
            </div>

            <Separator />

            <div className="p-4 space-y-6">
                {/* Contact Details */}
                <div>
                    <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Contact Details</h4>
                    <div className="flex flex-col gap-3 text-sm">
                        <div className="flex items-center gap-3">
                            <User className="h-4 w-4 text-muted-foreground shrink-0" />
                            <span>{conversation.user.name}</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
                            <a href={`mailto:${conversation.user.email}`} className="hover:underline truncate">{conversation.user.email}</a>
                        </div>
                        <div className="flex items-center gap-3">
                            <Hash className="h-4 w-4 text-muted-foreground shrink-0" />
                            <span className="flex items-center gap-1.5 capitalize">
                                {getChannelIcon(conversation.channel || "web")}
                                {conversation.channel || "Web"}
                            </span>
                        </div>
                        <div className="flex items-center gap-3">
                            <CircleDot className="h-4 w-4 text-muted-foreground shrink-0" />
                            <span className="flex items-center gap-1.5">
                                {conversation.status === 1000 ? (
                                    <><div className="h-2 w-2 rounded-full bg-slate-400" /> Closed</>
                                ) : conversation.status === 200 ? (
                                    <><div className="h-2 w-2 rounded-full bg-blue-500" /> Assigned</>
                                ) : (
                                    <><div className="h-2 w-2 rounded-full bg-green-500" /> Open</>
                                )}
                            </span>
                        </div>
                        <div className="flex items-center gap-3">
                            <Building className="h-4 w-4 text-muted-foreground shrink-0" />
                            <span>{details.department || "General"}</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <MapPin className="h-4 w-4 text-muted-foreground shrink-0" />
                            <span>{details.location || "Unknown"}</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <User className="h-4 w-4 text-muted-foreground shrink-0" />
                            <span className="text-muted-foreground">Assigned to: </span>
                            {conversation.assignedAgent ? (
                                <div className="flex items-center gap-2">
                                    <Avatar className="h-5 w-5">
                                        <AvatarImage src={conversation.assignedAgent.avatarUrl} />
                                        <AvatarFallback>{conversation.assignedAgent.name.charAt(0).toUpperCase()}</AvatarFallback>
                                    </Avatar>
                                    <span className="truncate">{conversation.assignedAgent.name}</span>
                                </div>
                            ) : (
                                <span>Unassigned</span>
                            )}
                        </div>
                    </div>
                </div>

                <Separator />

                {/* Tags */}
                <div>
                    <div className="flex items-center justify-between mb-3">
                        <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Tags</h4>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-6 w-6">
                                    <Plus className="h-4 w-4" />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-[200px] p-2" align="end">
                                <div className="flex flex-col gap-1">
                                    <div className="text-xs font-medium text-muted-foreground mb-1 px-2">Add a tag</div>
                                    {labels?.filter(l => !conversation.tags.includes(l.name)).map((label) => (
                                        <Button
                                            key={label._id}
                                            variant="ghost"
                                            size="sm"
                                            className="justify-start font-normal h-8 flex items-center gap-2"
                                            onClick={() => handleAddTag(label.name)}
                                            disabled={isAdding}
                                        >
                                            <div
                                                className="w-2 h-2 rounded-full shrink-0"
                                                style={{ backgroundColor: label.color }}
                                            />
                                            <span className="truncate">{label.name}</span>
                                        </Button>
                                    ))}
                                    {labels && labels.filter(l => !conversation.tags.includes(l.name)).length === 0 && (
                                        <div className="text-xs text-muted-foreground p-2 text-center">
                                            No more tags available
                                        </div>
                                    )}
                                </div>
                            </PopoverContent>
                        </Popover>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {conversation.tags.map(tag => (
                            <span key={tag} className="flex items-center gap-1 bg-slate-100 text-slate-700 px-2.5 py-1 rounded-full text-xs font-medium border border-slate-200 group">
                                {tag}
                                <button
                                    onClick={() => handleRemoveTag(tag)}
                                    disabled={isRemoving}
                                    className="opacity-50 hover:opacity-100 transition-opacity ml-1 -mr-1 rounded-full hover:bg-slate-200 p-0.5"
                                >
                                    <X className="h-3 w-3" />
                                </button>
                            </span>
                        ))}
                        {conversation.tags.length === 0 && (
                            <span className="text-xs text-muted-foreground italic">No tags added</span>
                        )}
                    </div>
                </div>

                {/* More Info Accordion */}
                <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="more-info" className="border-0">
                        <AccordionTrigger className="text-xs font-semibold text-muted-foreground uppercase tracking-wider py-2 hover:no-underline rounded -mx-2 px-2 hover:bg-slate-50">
                            More Info
                        </AccordionTrigger>
                        <AccordionContent className="pt-3 pb-0">
                            <div className="flex flex-col gap-3 text-sm">
                                <div className="flex items-center gap-3">
                                    <Clock className="h-4 w-4 text-muted-foreground shrink-0" />
                                    <span>Created {formattedTime}</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Globe className="h-4 w-4 text-muted-foreground shrink-0" />
                                    <span>Language: {details.language || "Unknown"}</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Laptop className="h-4 w-4 text-muted-foreground shrink-0" />
                                    <span>OS: {details.os || "Unknown"}</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Globe className="h-4 w-4 text-muted-foreground shrink-0" />
                                    <span>Browser: {details.browser || "Unknown"}</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <ExternalLink className="h-4 w-4 text-muted-foreground shrink-0" />
                                    <span className="flex items-center gap-1 truncate text-muted-foreground">Source:
                                        {details.sourcePage ? (
                                            <a href={details.sourcePage} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline inline-block truncate ml-1">
                                                {details.sourcePage}
                                            </a>
                                        ) : "Unknown"}
                                    </span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Laptop className="h-4 w-4 text-muted-foreground shrink-0" />
                                    <span className="font-mono text-xs">{details.ip || "Unknown IP"}</span>
                                </div>
                            </div>
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
            </div>
        </div>
    )
}
