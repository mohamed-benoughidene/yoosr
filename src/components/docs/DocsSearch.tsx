"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Search, FileText, Command } from "lucide-react"
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command"
import type { DocsPageMeta } from "@/lib/docs.client"

interface DocsSearchProps {
  pages: DocsPageMeta[]
  locale: string
}

export function DocsSearch({ pages }: DocsSearchProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)

  // Cmd+K / Ctrl+K to open
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((o) => !o)
      }
    }
    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [])

  const handleSelect = useCallback(
    (href: string) => {
      setOpen(false)
      router.push(href)
    },
    [router]
  )

  // Group pages by section for display
  const sections = pages.reduce<Record<string, DocsPageMeta[]>>((acc, page) => {
    const section = page.section || "Other"
    if (!acc[section]) acc[section] = []
    acc[section].push(page)
    return acc
  }, {})

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 rounded-lg border bg-muted/50 px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground w-56 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1"
      >
        <Search className="h-3.5 w-3.5" />
        <span className="flex-1 text-left">Search docs…</span>
        <kbd className="pointer-events-none inline-flex h-4 select-none items-center gap-0.5 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
          <Command className="h-2.5 w-2.5" />K
        </kbd>
      </button>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Type to search docs…" />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          {Object.entries(sections).map(([section, items]) => (
            <div key={section}>
              <CommandGroup heading={section}>
                {items.map((page) => (
                  <CommandItem
                    key={page.href}
                    value={`${page.title} ${page.description} ${page.body}`}
                    onSelect={() => handleSelect(page.href)}
                  >
                    <FileText className="mr-2 h-4 w-4 text-muted-foreground" />
                    <div className="flex flex-col">
                      <span className="font-medium">{page.title}</span>
                      {page.description && (
                        <span className="text-xs text-muted-foreground truncate max-w-xs">
                          {page.description}
                        </span>
                      )}
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
              <CommandSeparator />
            </div>
          ))}
        </CommandList>
      </CommandDialog>
    </>
  )
}
