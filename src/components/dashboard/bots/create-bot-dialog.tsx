"use client"

import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Bot, Zap, Plus } from "lucide-react"
import { useState } from "react"
import { cn } from "@/lib/utils"

type BotType = 'chatbot' | 'automation'

export function CreateBotDialog({ onCreate }: { onCreate: (name: string, description: string, type: BotType) => Promise<void> }) {
    const [open, setOpen] = useState(false)
    const [name, setName] = useState("")
    const [description, setDescription] = useState("")
    const [type, setType] = useState<BotType>('chatbot')
    const [loading, setLoading] = useState(false)

    const handleSubmit = async () => {
        setLoading(true)
        try {
            await onCreate(name, description, type)
            setOpen(false)
            setName("")
            setDescription("")
            setType('chatbot')
        } catch (error) {
            console.error("Error creating bot:", error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    New Flow
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Create New Flow</DialogTitle>
                    <DialogDescription>
                        Start building your automation or AI agent.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div
                            className={cn(
                                "cursor-pointer rounded-lg border-2 p-4 hover:border-primary transition-all",
                                type === 'chatbot' ? "border-primary bg-primary/5" : "border-muted"
                            )}
                            onClick={() => setType('chatbot')}
                        >
                            <Bot className="mb-2 h-6 w-6 text-primary" />
                            <h3 className="font-semibold">AI Agent</h3>
                            <p className="text-xs text-muted-foreground mt-1">
                                LLM-powered chatbot for customer support.
                            </p>
                        </div>
                        <div
                            className={cn(
                                "cursor-pointer rounded-lg border-2 p-4 hover:border-primary transition-all",
                                type === 'automation' ? "border-primary bg-primary/5" : "border-muted"
                            )}
                            onClick={() => setType('automation')}
                        >
                            <Zap className="mb-2 h-6 w-6 text-orange-500" />
                            <h3 className="font-semibold">Automation</h3>
                            <p className="text-xs text-muted-foreground mt-1">
                                Rule-based workflow for specific tasks.
                            </p>
                        </div>
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="name">Name</Label>
                        <Input
                            id="name"
                            placeholder="e.g., Customer Support Bot"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                            id="description"
                            placeholder="What does this flow do?"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        />
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => setOpen(false)} disabled={loading}>
                        Cancel
                    </Button>
                    <Button onClick={handleSubmit} disabled={!name || loading}>
                        {loading ? "Creating..." : "Create Flow"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
