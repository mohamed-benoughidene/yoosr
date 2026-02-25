"use client"

import { useState } from "react"
import { useMutation } from "convex/react"
import { api } from "../../../convex/_generated/api"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Check, X, UserPlus, Lock } from "lucide-react"
import type { Id } from "../../../convex/_generated/dataModel"

interface PendingInvite {
    _id: Id<"project_members">
    projectId: Id<"projects">
    projectName: string
    role: string
    invitedAt?: number
}

const ROLE_LABELS: Record<string, string> = {
    owner: "Owner",
    administrator: "Admin",
    agent: "Agent",
}

interface InviteProjectCardProps {
    invite: PendingInvite
}

export function InviteProjectCard({ invite }: InviteProjectCardProps) {
    const accept = useMutation(api.members.accept)
    const reject = useMutation(api.members.reject)
    const [processing, setProcessing] = useState(false)

    const handleAccept = async () => {
        setProcessing(true)
        try {
            await accept({ inviteId: invite._id })
            toast.success(`You joined "${invite.projectName}" — welcome to the team!`)
            window.location.reload()
        } catch {
            toast.error("Failed to accept invitation")
            setProcessing(false)
        }
    }

    const handleReject = async () => {
        setProcessing(true)
        try {
            await reject({ inviteId: invite._id })
            toast.info(`Invitation to "${invite.projectName}" declined.`)
            // No reload needed — the query will reactively remove the card
        } catch {
            toast.error("Failed to decline invitation")
            setProcessing(false)
        }
    }

    // Deterministic gradient from project name for visual personality
    const colors = [
        "from-slate-400 to-slate-500",
        "from-violet-400 to-purple-500",
        "from-rose-400 to-pink-500",
        "from-amber-400 to-orange-500",
        "from-teal-400 to-cyan-500",
    ]
    const colorIndex = invite.projectName.charCodeAt(0) % colors.length

    return (
        <Card className="relative border-dashed border-2 border-blue-300 bg-blue-50/30 dark:bg-blue-950/10 dark:border-blue-800 transition-all duration-300 overflow-hidden group hover:shadow-lg hover:border-blue-400">
            {/* Ghost shimmer overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-blue-50/40 to-transparent dark:from-blue-950/20 pointer-events-none" />

            {/* Invitation badge in top-right */}
            <div className="absolute top-3 right-3 z-10">
                <Badge className="bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900 dark:text-blue-200 dark:border-blue-700 text-[11px] gap-1 shadow-sm">
                    <UserPlus className="h-3 w-3" />
                    Invited
                </Badge>
            </div>

            <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                    {/* Avatar with ghost effect */}
                    <div
                        className={`h-12 w-12 rounded-lg bg-gradient-to-br ${colors[colorIndex]} text-white flex items-center justify-center font-bold text-xl shadow-md uppercase opacity-60`}
                    >
                        {invite.projectName.charAt(0)}
                    </div>
                </div>
                <CardTitle className="mt-4 text-xl truncate text-gray-600 dark:text-gray-300" title={invite.projectName}>
                    {invite.projectName}
                </CardTitle>
                <CardDescription className="flex items-center gap-1.5 text-blue-500 text-xs font-medium">
                    <Lock className="h-3 w-3" />
                    Pending invitation · You&apos;ll join as{" "}
                    <Badge variant="outline" className="text-[11px] h-[18px] px-1.5 border-blue-300 text-blue-600">
                        {ROLE_LABELS[invite.role] ?? invite.role}
                    </Badge>
                </CardDescription>
            </CardHeader>

            <CardContent className="pb-3">
                <p className="text-xs text-gray-400 dark:text-gray-500 italic">
                    You were invited to collaborate on this workspace. Accept to gain access.
                </p>
            </CardContent>

            <CardFooter className="pt-3 border-t border-dashed border-blue-200 dark:border-blue-800 flex justify-end items-center gap-2">
                <Button
                    size="sm"
                    variant="outline"
                    className="text-destructive border-destructive/40 hover:bg-destructive/10 h-8 text-xs gap-1.5"
                    onClick={handleReject}
                    disabled={processing}
                >
                    <X className="h-3.5 w-3.5" />
                    Decline
                </Button>
                <Button
                    size="sm"
                    className="h-8 text-xs gap-1.5 bg-green-600 hover:bg-green-700 text-white shadow-sm"
                    onClick={handleAccept}
                    disabled={processing}
                >
                    <Check className="h-3.5 w-3.5" />
                    Accept
                </Button>
            </CardFooter>
        </Card>
    )
}
