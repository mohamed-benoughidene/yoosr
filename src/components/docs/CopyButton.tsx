"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Check, ClipboardCopy } from "lucide-react"

export function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Clipboard API may not be available
    }
  }
  return (
    <Button
      type="button"
      size="icon"
      variant="ghost"
      className="h-7 w-7 text-zinc-500 hover:text-zinc-100 hover:bg-zinc-800"
      onClick={copy}
    >
      {copied ? (
        <Check className="h-3.5 w-3.5 text-emerald-500" />
      ) : (
        <ClipboardCopy className="h-3.5 w-3.5" />
      )}
    </Button>
  )
}
