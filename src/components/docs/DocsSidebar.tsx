"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { ChevronDown, ChevronRight, FileText } from "lucide-react"
import { useState } from "react"
import { getDocsNav, type DocsNavSection } from "@/lib/docs.client"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"

interface DocsSidebarProps {
  locale: string
  className?: string
}

export function DocsSidebar({ locale, className }: DocsSidebarProps) {
  const pathname = usePathname()
  const nav = getDocsNav(locale)

  return (
    <nav className={cn("space-y-6 py-4 pe-4", className)}>
      {nav.map((section) => (
        <DocsNavSection key={section.title} section={section} pathname={pathname} />
      ))}
    </nav>
  )
}

function DocsNavSection({
  section,
  pathname,
}: {
  section: DocsNavSection
  pathname: string
}) {
  const [open, setOpen] = useState(
    section.items.some((item) => pathname.startsWith(item.href))
  )

  const isActive = section.items.some((item) => pathname === item.href)

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <CollapsibleTrigger className="flex w-full items-center justify-between gap-2 rounded-md px-2 py-1.5 text-sm font-medium text-foreground hover:text-foreground transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1">
        <span className={cn(isActive && "text-primary")}>{section.title}</span>
        {open ? (
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        ) : (
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        )}
      </CollapsibleTrigger>
      <CollapsibleContent className="space-y-0.5 pt-1">
        {section.items.map((item) => {
          const active = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-2 rounded-md px-3 py-1.5 text-sm transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1",
                active
                  ? "bg-primary/10 font-medium text-primary"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
              )}
            >
              <FileText className="h-3.5 w-3.5 shrink-0" />
              {item.title}
            </Link>
          )
        })}
      </CollapsibleContent>
    </Collapsible>
  )
}
