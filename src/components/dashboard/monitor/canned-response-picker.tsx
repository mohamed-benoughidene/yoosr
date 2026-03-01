"use client"

import { useEffect, useRef, useState } from "react"
import { Card } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"

export interface CannedResponseItem {
    _id: string
    trigger: string
    message: string
}

interface CannedResponsePickerProps {
    responses: CannedResponseItem[]
    query: string
    onSelect: (message: string) => void
    onClose: () => void
}

export function CannedResponsePicker({
    responses,
    query,
    onSelect,
    onClose,
}: CannedResponsePickerProps) {
    const [selectedIndex, setSelectedIndex] = useState(0)
    const listRef = useRef<HTMLDivElement>(null)

    const filteredResponses = responses.filter((r) =>
        r.trigger.toLowerCase().includes(query.toLowerCase())
    )

    useEffect(() => {
        setSelectedIndex(0)
    }, [query])

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "ArrowDown") {
                e.preventDefault()
                setSelectedIndex((prev) =>
                    prev < filteredResponses.length - 1 ? prev + 1 : prev
                )
            } else if (e.key === "ArrowUp") {
                e.preventDefault()
                setSelectedIndex((prev) => (prev > 0 ? prev - 1 : prev))
            } else if (e.key === "Enter") {
                e.preventDefault()
                if (filteredResponses.length > 0) {
                    onSelect(filteredResponses[selectedIndex].message)
                }
            } else if (e.key === "Escape") {
                e.preventDefault()
                onClose()
            }
        }

        document.addEventListener("keydown", handleKeyDown)
        return () => document.removeEventListener("keydown", handleKeyDown)
    }, [filteredResponses, selectedIndex, onSelect, onClose])

    useEffect(() => {
        // Scroll the selected item into view if needed
        if (listRef.current) {
            const selectedElement = listRef.current.children[selectedIndex] as HTMLElement
            if (selectedElement) {
                selectedElement.scrollIntoView({
                    block: "nearest",
                    behavior: "smooth",
                })
            }
        }
    }, [selectedIndex])


    return (
        <Card className="absolute bottom-full left-0 mb-2 w-[350px] shadow-lg border bg-popover text-popover-foreground rounded-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <ScrollArea className="max-h-[250px] py-1">
                {filteredResponses.length === 0 ? (
                    <div className="p-3 text-sm text-center text-muted-foreground">
                        No responses found
                    </div>
                ) : (
                    <div ref={listRef} className="flex flex-col">
                        {filteredResponses.map((res, idx) => (
                            <button
                                key={res._id}
                                onClick={() => onSelect(res.message)}
                                onMouseEnter={() => setSelectedIndex(idx)}
                                className={cn(
                                    "flex flex-col items-start gap-1 p-2 text-left w-full text-sm outline-none transition-colors",
                                    selectedIndex === idx
                                        ? "bg-accent text-accent-foreground"
                                        : "hover:bg-accent/50"
                                )}
                            >
                                <span className="font-semibold text-xs text-muted-foreground font-mono">
                                    /{res.trigger}
                                </span>
                                <span className="w-full truncate text-sm">
                                    {res.message.length > 60
                                        ? `${res.message.substring(0, 60)}...`
                                        : res.message}
                                </span>
                            </button>
                        ))}
                    </div>
                )}
            </ScrollArea>
        </Card>
    )
}
