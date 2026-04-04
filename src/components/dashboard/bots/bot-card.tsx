"use client"

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Bot, Zap, MoreHorizontal, Pencil, Trash2 } from "lucide-react"
import { useTranslations } from "next-intl"
import { formatDistanceToNow } from "date-fns"
import { useState } from "react"
import { cn } from "@/lib/utils"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export type BotStatus = "online" | "offline" | "learning"
export type BotType = "chatbot" | "automation"

export interface BotCardProps {
  id: string
  name: string
  description?: string
  status: BotStatus
  type: BotType
  lastActivity: Date
  onEdit?: () => void
  onDelete?: () => void
}

const statusColor: Record<BotStatus, string> = {
  online: "bg-green-500",
  offline: "bg-gray-400",
  learning: "bg-yellow-500",
}

const statusLabel: Record<BotStatus, string> = {
  online: "Online",
  offline: "Offline",
  learning: "Learning",
}

export function BotCard({
  id,
  name,
  description,
  status,
  type,
  lastActivity,
  onEdit,
  onDelete,
}: BotCardProps) {
  const t = useTranslations("bots")
  const [showActions, setShowActions] = useState(false)

  const timeAgo = formatDistanceToNow(lastActivity, { addSuffix: true })

  return (
    <Card
      className={cn("transition-all", showActions && "shadow-md")}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
      data-testid={`bot-card-${id}`}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex items-center gap-2">
          <div
            className={cn(
              "p-2 rounded-full",
              type === "chatbot"
                ? "bg-primary/10 text-primary"
                : "bg-orange-500/10 text-orange-500"
            )}
            data-testid="bot-type-icon"
          >
            {type === "chatbot" ? (
              <Bot className="h-4 w-4" />
            ) : (
              <Zap className="h-4 w-4" />
            )}
          </div>
          <div
            className={cn("h-2 w-2 rounded-full", statusColor[status])}
            data-testid="status-dot"
            aria-label={`Status: ${statusLabel[status]}`}
          />
        </div>

        <div className={cn("flex items-center gap-1", !showActions && "opacity-0 pointer-events-none")}>
          {onEdit && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={(e) => {
                e.stopPropagation()
                onEdit()
              }}
              data-testid="edit-button"
              aria-label="Edit bot"
            >
              <Pencil className="h-4 w-4" />
            </Button>
          )}
          {onDelete && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-destructive"
              onClick={(e) => {
                e.stopPropagation()
                onDelete()
              }}
              data-testid="delete-button"
              aria-label="Delete bot"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        <CardTitle className="text-base mb-1" data-testid="bot-name">
          {name}
        </CardTitle>
        <CardDescription className="line-clamp-2 h-10 mb-4">
          {description || t("no_description")}
        </CardDescription>
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span data-testid="bot-status">
            {statusLabel[status]}
          </span>
          <span data-testid="last-activity">{timeAgo}</span>
        </div>
      </CardContent>
    </Card>
  )
}
