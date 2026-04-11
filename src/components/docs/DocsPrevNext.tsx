import Link from "next/link"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

interface DocsPrevNextProps {
  prev?: { title: string; href: string }
  next?: { title: string; href: string }
  className?: string
}

export function DocsPrevNext({ prev, next, className }: DocsPrevNextProps) {
  if (!prev && !next) return null

  return (
    <div className={cn("flex items-center justify-between border-t pt-8 mt-12", className)}>
      {prev ? (
        <Link
          href={prev.href}
          className="group flex flex-col gap-1 text-left max-w-[50%]"
        >
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <ChevronLeft className="h-3 w-3 transition-transform group-hover:-translate-x-0.5" />
            Previous
          </span>
          <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
            {prev.title}
          </span>
        </Link>
      ) : (
        <div />
      )}
      {next ? (
        <Link
          href={next.href}
          className="group flex flex-col gap-1 text-right max-w-[50%]"
        >
          <span className="flex items-center gap-1 text-xs text-muted-foreground justify-end">
            Next
            <ChevronRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
          </span>
          <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
            {next.title}
          </span>
        </Link>
      ) : (
        <div />
      )}
    </div>
  )
}
