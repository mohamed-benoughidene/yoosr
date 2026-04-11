/**
 * DocsPageTemplate — wraps every docs MDX page with:
 * - Breadcrumbs (auto-generated from URL segments)
 * - Table of Contents sidebar (right side, desktop only)
 * - Previous/Next page navigation
 * - MDX rendering with custom components
 */

import { DocsBreadcrumbs } from "@/components/docs/DocsBreadcrumbs"
import { DocsToc } from "@/components/docs/DocsToc"
import { DocsPrevNext } from "@/components/docs/DocsPrevNext"
import { mdxComponents } from "@/components/docs/MDXComponents"
import { getDocsNav } from "@/lib/docs.client"

interface DocsPageTemplateProps {
  children: React.ReactNode
  /** Raw MDX content string for TOC extraction */
  rawContent?: string
  /** Breadcrumb segments beyond "Docs" */
  breadcrumbs: { label: string; href?: string }[]
  /** Previous page in navigation order */
  prevPage?: { title: string; href: string }
  /** Next page in navigation order */
  nextPage?: { title: string; href: string }
  /** Page title (shown as h1 if no h1 in MDX) */
  title: string
}

export function DocsPageTemplate({
  children,
  rawContent,
  breadcrumbs,
  prevPage,
  nextPage,
  title,
}: DocsPageTemplateProps) {
  // Merge custom MDX components with the page children
  return (
    <div className="relative">
      {/* Breadcrumbs */}
      <DocsBreadcrumbs segments={breadcrumbs} className="mb-6" />

      <div className="flex gap-12">
        {/* Main content */}
        <article className="min-w-0 flex-1">
          <div className="prose prose-zinc max-w-none dark:prose-invert">
            {children}
          </div>
          <DocsPrevNext prev={prevPage} next={nextPage} />
        </article>

        {/* TOC sidebar — desktop only */}
        {rawContent && (
          <aside className="hidden xl:block w-64 shrink-0">
            <div className="sticky top-24 max-h-[calc(100vh-8rem)] overflow-y-auto pr-4 scrollbar-thin scrollbar-thumb-muted-foreground/20 hover:scrollbar-thumb-muted-foreground/40">
              <DocsToc content={rawContent} />
            </div>
          </aside>
        )}
      </div>
    </div>
  )
}
