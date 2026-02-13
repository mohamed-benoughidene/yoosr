import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Conversation } from "./data"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Mail, Clock, Building, Globe, Laptop, ExternalLink, MapPin } from "lucide-react"

interface ContactInfoProps {
    conversation: Conversation | null
}

export function ContactInfo({ conversation }: ContactInfoProps) {
    if (!conversation) {
        return (
            <div className="flex h-full items-center justify-center p-4 text-center text-muted-foreground">
                Select a conversation to view details
            </div>
        )
    }

    const details = (conversation as any).details || {}

    return (
        <div className="h-full flex flex-col overflow-y-auto">
            <div className="p-6 flex flex-col items-center gap-4 bg-slate-50/50">
                <Avatar className="h-24 w-24 border-4 border-white shadow-sm">
                    <AvatarImage src={conversation.user.avatar} />
                    <AvatarFallback className="text-2xl bg-primary/10 text-primary">{conversation.user.initials}</AvatarFallback>
                </Avatar>
                <div className="text-center">
                    <h2 className="text-xl font-bold">{conversation.user.name}</h2>
                    <div className="flex items-center justify-center gap-2 mt-1 text-sm text-muted-foreground">
                        <Mail className="h-3 w-3" />
                        <a href={`mailto:${conversation.user.email}`} className="hover:underline">{conversation.user.email}</a>
                    </div>
                </div>
            </div>

            <Separator />

            <div className="p-4 space-y-6">
                {/* Key Info */}
                <div className="grid gap-3 text-sm">
                    <div className="flex items-center justify-between">
                        <span className="flex items-center gap-2 text-muted-foreground"><Clock className="h-4 w-4" /> Created</span>
                        <span>{conversation.timestamp}</span>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="flex items-center gap-2 text-muted-foreground"><Building className="h-4 w-4" /> Department</span>
                        <span className="font-medium">{details.department || "General"}</span>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="flex items-center gap-2 text-muted-foreground"><MapPin className="h-4 w-4" /> Location</span>
                        <span>{details.location || "Unknown"}</span>
                    </div>
                </div>

                <Separator />

                {/* Tags */}
                <div>
                    <h4 className="text-sm font-medium mb-3">Tags</h4>
                    <div className="flex flex-wrap gap-2">
                        {conversation.tags.map(tag => (
                            <span key={tag} className="bg-slate-100 text-slate-700 hover:bg-slate-200 px-2.5 py-1 rounded-full text-xs font-medium transition-colors cursor-pointer border border-slate-200">
                                {tag}
                            </span>
                        ))}
                    </div>
                </div>

                {/* More Info Accordion */}
                <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="more-info" className="border-0">
                        <AccordionTrigger className="text-sm font-medium py-2 hover:no-underline hover:bg-slate-50 rounded px-2 -mx-2">
                            More Info
                        </AccordionTrigger>
                        <AccordionContent className="pt-2 pb-0">
                            <div className="grid gap-3 text-sm pl-2 border-l-2 border-slate-100 ml-1">
                                <div className="flex flex-col gap-1">
                                    <span className="text-xs text-muted-foreground flex items-center gap-1"><Globe className="h-3 w-3" /> Language</span>
                                    <span>{details.language === 'en' ? 'English' : 'Spanish'} ({details.language})</span>
                                </div>
                                <div className="flex flex-col gap-1">
                                    <span className="text-xs text-muted-foreground flex items-center gap-1"><Laptop className="h-3 w-3" /> OS</span>
                                    <span>{details.os}</span>
                                </div>
                                <div className="flex flex-col gap-1">
                                    <span className="text-xs text-muted-foreground flex items-center gap-1"><Globe className="h-3 w-3" /> Browser</span>
                                    <span>{details.browser}</span>
                                </div>
                                <div className="flex flex-col gap-1">
                                    <span className="text-xs text-muted-foreground flex items-center gap-1"><ExternalLink className="h-3 w-3" /> Source Page</span>
                                    <a href={details.sourcePage} target="_blank" rel="noreferrer" className="text-blue-600 truncate hover:underline block max-w-[200px]">
                                        {details.sourcePage}
                                    </a>
                                </div>
                                <div className="flex flex-col gap-1">
                                    <span className="text-xs text-muted-foreground flex items-center gap-1">IP Address</span>
                                    <span className="font-mono text-xs">{details.ip}</span>
                                </div>
                            </div>
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
            </div>
        </div>
    )
}
