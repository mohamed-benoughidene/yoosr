"use client"

import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"

interface DocsTocProps {
  content: string
  className?: string
}

import GithubSlugger from "github-slugger"

interface Heading {
  id: string
  text: string
  level: number
}

function extractHeadings(md: string): Heading[] {
  const slugger = new GithubSlugger()
  const headingRegex = /^(#{2,3})\s+(.+)$/gm
  const headings: Heading[] = []
  let match

  while ((match = headingRegex.exec(md)) !== null) {
    const level = match[1].length
    const text = match[2].trim()
    const id = slugger.slug(text)
    headings.push({ id, text, level })
  }

  return headings
}

export function DocsToc({ content, className }: DocsTocProps) {
  const [headings, setHeadings] = useState<Heading[]>([])
  const [activeId, setActiveId] = useState<string>("")

  useEffect(() => {
    setHeadings(extractHeadings(content))
  }, [content])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id)
          }
        })
      },
      { rootMargin: "0px 0px -80% 0px" }
    )

    headings.forEach((heading) => {
      const el = document.getElementById(heading.id)
      if (el) observer.observe(el)
    })

    return () => observer.disconnect()
  }, [headings])

  if (headings.length === 0) return null

  return (
    <nav className={cn("space-y-1 text-sm", className)} aria-label="Table of contents">
      <p className="mb-2 font-medium text-foreground">On this page</p>
      {headings.map((heading) => (
        <a
          key={heading.id}
          href={`#${heading.id}`}
          className={cn(
            "block py-1 transition-colors hover:text-foreground",
            heading.level === 3 && "ml-4",
            activeId === heading.id
              ? "text-primary font-medium"
              : "text-muted-foreground"
          )}
        >
          {heading.text}
        </a>
      ))}
    </nav>
  )
}
