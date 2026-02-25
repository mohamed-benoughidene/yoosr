"use client"

import { useQuery, useMutation } from "convex/react"
import { api } from "../../../convex/_generated/api"
import { toast } from "sonner"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { UserPlus, Check, X, ChevronDown, ChevronUp } from "lucide-react"
import type { Id } from "../../../convex/_generated/dataModel"

const ROLE_LABELS: Record<string, string> = {
    owner: "Owner",
    administrator: "Administrator",
    agent: "Agent",
}

export function InvitationBanner() {
    const invites = useQuery(api.members.getMyPendingInvites, {})
    const accept = useMutation(api.members.accept)
    const reject = useMutation(api.members.reject)
    const [expanded, setExpanded] = useState(true)
    const [processingId, setProcessingId] = useState<string | null>(null)

    if (!invites || invites.length === 0) return null

    const handleAccept = async (inviteId: Id<"project_members">, projectName: string) => {
        setProcessingId(inviteId)
        try {
            await accept({ inviteId })
            toast.success(`You joined "${projectName}" — welcome to the team!`)
            // Force a page refresh so the sidebar picks up the new project
            window.location.reload()
        } catch {
            toast.error("Failed to accept invitation")
        }
        setProcessingId(null)
    }

    const handleReject = async (inviteId: Id<"project_members">, projectName: string) => {
        setProcessingId(inviteId)
        try {
            await reject({ inviteId })
            toast.info(`Invitation to "${projectName}" declined.`)
        } catch {
            toast.error("Failed to decline invitation")
        }
        setProcessingId(null)
    }

    return (
        <div className="bg-blue-50 border-b border-blue-200 dark:bg-blue-950/30 dark:border-blue-800">
            <div className="px-4 py-2">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm font-medium text-blue-800 dark:text-blue-200">
                        <UserPlus className="h-4 w-4 shrink-0" />
                        <span>
                            You have {invites.length} pending workspace invitation{invites.length > 1 ? "s" : ""}
                        </span>
                    </div>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 text-blue-600 hover:text-blue-800 hover:bg-blue-100"
                        onClick={() => setExpanded(!expanded)}
                    >
                        {expanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                    </Button>
                </div>

                {expanded && (
                    <div className="mt-2 space-y-2">
                        {invites.map((invite) => {
                            const isProcessing = processingId === invite._id
                            return (
                                <div
                                    key={invite._id}
                                    className="flex flex-col sm:flex-row sm:items-center gap-3 rounded-lg bg-white/80 dark:bg-blue-900/30 border border-blue-100 dark:border-blue-800 px-3 py-2.5"
                                >
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-semibold text-foreground truncate">
                                            {invite.projectName}
                                        </p>
                                        <p className="text-xs text-muted-foreground mt-0.5">
                                            You&apos;re invited to join as a{" "}
                                            <Badge variant="secondary" className="text-[11px] px-1.5 h-[18px] align-middle">
                                                {ROLE_LABELS[invite.role] ?? invite.role}
                                            </Badge>
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2 shrink-0">
                                        <Button
                                            size="sm"
                                            className="h-7 text-xs gap-1.5 bg-green-600 hover:bg-green-700 text-white"
                                            disabled={isProcessing}
                                            onClick={() => handleAccept(invite._id as Id<"project_members">, invite.projectName)}
                                        >
                                            <Check className="h-3.5 w-3.5" />
                                            Accept
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            className="h-7 text-xs gap-1.5 text-destructive border-destructive/40 hover:bg-destructive/10"
                                            disabled={isProcessing}
                                            onClick={() => handleReject(invite._id as Id<"project_members">, invite.projectName)}
                                        >
                                            <X className="h-3.5 w-3.5" />
                                            Decline
                                        </Button>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )}
            </div>
        </div>
    )
}
