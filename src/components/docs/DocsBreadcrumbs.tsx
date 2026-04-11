import Link from "next/link"
import { ChevronRight, BookOpen } from "lucide-react"
import { cn } from "@/lib/utils"

interface DocsBreadcrumbsProps {
  segments: { label: string; href?: string }[]
  className?: string
}

export function DocsBreadcrumbs({ segments, className }: DocsBreadcrumbsProps) {
  return (
    <nav className={cn("flex items-center gap-1 text-sm text-muted-foreground", className)} aria-label="Breadcrumb">
      <Link href="/docs" className="flex items-center gap-1 hover:text-foreground transition-colors">
        <BookOpen className="h-3.5 w-3.5" />
        <span>Docs</span>
      </Link>
      {segments.map((seg, i) => (
        <span key={i} className="flex items-center gap-1">
          <ChevronRight className="h-3 w-3" />
          {seg.href ? (
            <Link href={seg.href} className="hover:text-foreground transition-colors">
              {seg.label}
            </Link>
          ) : (
            <span className="text-foreground font-medium">{seg.label}</span>
          )}
        </span>
      ))}
    </nav>
  )
}
