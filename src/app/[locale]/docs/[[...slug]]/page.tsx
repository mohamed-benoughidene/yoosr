import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { DocsBreadcrumbs } from "@/components/docs/DocsBreadcrumbs"
import { DocsToc } from "@/components/docs/DocsToc"
import { DocsPrevNext } from "@/components/docs/DocsPrevNext"
import { getDocsNav, type DocsNavSection, type DocsNavItem } from "@/lib/docs.client"
import { type DocsPageMeta } from "@/lib/docs"
import { BookOpen, Rocket, MessageSquare, Bot, Workflow, Shield, LifeBuoy } from "lucide-react"
import Link from "next/link"
import fs from "fs"
import path from "path"
import { setRequestLocale as unstable_setRequestLocale } from "next-intl/server"
import { compileMDX } from "next-mdx-remote/rsc"
import { mdxComponents } from "@/components/docs/MDXComponents"
import { getTranslations } from "next-intl/server"
import { ComingSoonBanner } from "@/components/docs/ComingSoonBanner"

const VALID_LOCALES = ["en", "ar", "fr"] as const
const CONTENT_BASE = path.join(process.cwd(), "content", "docs")

/**
 * Generate static params for all docs pages.
 */
export function generateStaticParams() {
  const params: { locale: string; slug?: string[] }[] = []

  for (const locale of VALID_LOCALES) {
    // Add the root docs page (no slug)
    params.push({ locale })

    const localeDir = path.join(CONTENT_BASE, locale)
    if (!fs.existsSync(localeDir)) continue

    // Find all MDX files
    function findFiles(dir: string, prefix: string): string[] {
      const results: string[] = []
      const entries = fs.readdirSync(dir, { withFileTypes: true })
      for (const entry of entries) {
        const full = path.join(dir, entry.name)
        if (entry.isDirectory()) {
          results.push(...findFiles(full, `${prefix}${entry.name}/`))
        } else if (entry.name.endsWith(".mdx")) {
          const slug = entry.name === "index.mdx"
            ? prefix.replace(/\/$/, "")
            : `${prefix}${entry.name.replace(/\.mdx$/, "")}`
          const slugParts = slug.split("/").filter(Boolean)
          params.push({ locale, slug: slugParts.length ? slugParts : undefined })
        }
      }
      return results
    }
    findFiles(localeDir, "")
  }

  return params
}

/**
 * Generate metadata for the docs page.
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug?: string[] }>
}): Promise<Metadata> {
  const { locale, slug } = await params
  const meta = getDocMeta(locale, slug)
  
  const siteUrl = process.env.NEXT_PUBLIC_CONVEX_SITE_URL || "https://yoosr.com"
  const urlPath = slug?.join("/") || ""
  const localePrefix = locale === "en" ? "" : `/${locale}`
  const canonicalUrl = `${siteUrl}${localePrefix}/docs${urlPath ? `/${urlPath}` : ""}`

  if (!meta) return { 
    title: "Documentation | Yoosr",
    alternates: { canonical: canonicalUrl }
  }

  const title = `${meta.title} | Yoosr Docs`
  return {
    title,
    description: meta.description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title,
      description: meta.description,
      url: canonicalUrl,
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: meta.description,
    }
  }
}

/**
 * Parse YAML frontmatter from an MDX file.
 */
function parseYamlFrontmatter(raw: string): Record<string, unknown> | null {
  const match = raw.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/)
  if (!match) return null

  const meta: Record<string, unknown> = {}
  match[1].split("\n").forEach((line) => {
    const colonIdx = line.indexOf(":")
    if (colonIdx === -1) return
    const key = line.slice(0, colonIdx).trim()
    let value: unknown = line.slice(colonIdx + 1).trim()

    // Parse arrays like: ["getting started", "yoosr"]
    if (typeof value === "string" && value.startsWith("[") && value.endsWith("]")) {
      try {
        value = JSON.parse(value)
      } catch {
        // Keep as string if JSON parse fails
      }
    }

    // Remove surrounding quotes
    if (typeof value === "string" && ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'")))) {
      value = value.slice(1, -1)
    }

    meta[key] = value
  })
  return meta
}

/**
 * Helper to find the correct MDX file path, falling back to English if needed.
 */
function findDocPath(locale: string, slug: string[] | undefined): { filePath: string; isFallback: boolean } | null {
  const slugPath = slug ? slug.join("/") : "index"
  
  // 1. Check EXACT file in requested locale
  const filePath1 = path.join(CONTENT_BASE, locale, `${slugPath}.mdx`)
  if (fs.existsSync(filePath1)) return { filePath: filePath1, isFallback: false }

  // 2. Check index.mdx in requested locale
  const indexPath1 = path.join(CONTENT_BASE, locale, slugPath, "index.mdx")
  if (fs.existsSync(indexPath1)) return { filePath: indexPath1, isFallback: false }

  // 3. If not English, check English version
  if (locale !== "en") {
    const filePathEn = path.join(CONTENT_BASE, "en", `${slugPath}.mdx`)
    if (fs.existsSync(filePathEn)) return { filePath: filePathEn, isFallback: true }

    const indexPathEn = path.join(CONTENT_BASE, "en", slugPath, "index.mdx")
    if (fs.existsSync(indexPathEn)) return { filePath: indexPathEn, isFallback: true }
  }

  return null
}

/**
 * Get doc metadata for a specific slug.
 */
function getDocMeta(locale: string, slug: string[] | undefined): (DocsPageMeta & { isFallback: boolean }) | null {
  const resolved = findDocPath(locale, slug)
  if (!resolved) return null

  const raw = fs.readFileSync(resolved.filePath, "utf-8")
  const frontmatter = parseYamlFrontmatter(raw)
  if (!frontmatter) return null

  const body = raw.replace(/^---\n[\s\S]*?\n---\n?/, "").replace(/^#\s+.+\n/, "").slice(0, 500)

  return {
    title: (frontmatter.title as string) || slug?.join(" ") || "Documentation",
    description: (frontmatter.description as string) || "",
    section: (frontmatter.section as string) || "",
    href: `/docs/${slug?.join("/") || ""}`,
    filePath: resolved.filePath,
    isFallback: resolved.isFallback,
    body,
  }
}

/**
 * Get the raw MDX content for a specific slug.
 */
function getDocContent(locale: string, slug: string[] | undefined): { raw: string; meta: Record<string, unknown>; isFallback: boolean } | null {
  const resolved = findDocPath(locale, slug)
  if (!resolved) return null

  const raw = fs.readFileSync(resolved.filePath, "utf-8")
  const frontmatter = parseYamlFrontmatter(raw)

  return { raw, meta: frontmatter || {}, isFallback: resolved.isFallback }
}

/**
 * Find prev/next pages based on current slug, using the nav tree.
 */
function getPrevNext(nav: DocsNavSection[], currentHref: string): {
  prev?: { title: string; href: string }
  next?: { title: string; href: string }
} {
  const allItems: { title: string; href: string }[] = []
  function flatten(items: DocsNavItem[]) {
    for (const item of items) {
      allItems.push({ title: item.title, href: item.href })
      if (item.items) flatten(item.items)
    }
  }
  for (const section of nav) flatten(section.items)

  const idx = allItems.findIndex((item) => item.href === currentHref)
  return {
    prev: idx > 0 ? allItems[idx - 1] : undefined,
    next: idx >= 0 && idx < allItems.length - 1 ? allItems[idx + 1] : undefined,
  }
}

export default async function DocsPage({
  params,
}: {
  params: Promise<{ locale: string; slug?: string[] }>
}) {
  const { locale, slug } = await params
  if (!VALID_LOCALES.includes(locale as (typeof VALID_LOCALES)[number])) {
    notFound()
  }
  unstable_setRequestLocale(locale)

  const doc = getDocContent(locale, slug)

  // Root docs page — render landing page
  if (!doc && (!slug || slug.length === 0)) {
    return <DocsLanding />
  }

  if (!doc) {
    notFound()
  }

  // Remove the YAML frontmatter for MDX processing
  const markdownSource = doc.raw.replace(/^---\n[\s\S]*?\n---\n?/, "")

  // Compile MDX with custom components
  const { content: mdxContent } = await compileMDX<{ title: string }>({
    source: markdownSource,
    components: mdxComponents,
    options: {
      parseFrontmatter: false,
    },
  })

  const navTree = getDocsNav(locale)

  const currentHref = `/docs/${slug?.join("/") || ""}`
  const { prev: prevPage, next: nextPage } = getPrevNext(navTree, currentHref)

  // Build breadcrumbs from slug
  const breadcrumbs = (slug || []).map((segment, i) => {
    const href = `/docs/${slug!.slice(0, i + 1).join("/")}`
    return { label: segment.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()), href }
  })

  const siteUrl = process.env.NEXT_PUBLIC_CONVEX_SITE_URL || "https://yoosr.com"
  const localePrefix = locale === "en" ? "" : `/${locale}`
  const pageUrl = `${siteUrl}${localePrefix}${currentHref}`

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "TechArticle",
    "headline": (doc.meta.title as string) || "Yoosr Documentation",
    "description": (doc.meta.description as string) || "",
    "url": pageUrl,
    "author": {
      "@type": "Organization",
      "name": "Yoosr"
    }
  }

  return (
    <div className="relative">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* Breadcrumbs */}
      <DocsBreadcrumbs segments={breadcrumbs} className="mb-6" />

      <div className="flex gap-12">
        {/* Main content */}
        <article className="min-w-0 flex-1">
          {doc.isFallback && <ComingSoonBanner locale={locale} />}
          <div className="prose prose-zinc max-w-none dark:prose-invert docs-content">
            {mdxContent}
          </div>
          <DocsPrevNext prev={prevPage} next={nextPage} />
        </article>

        {/* TOC sidebar — desktop only */}
        <aside className="hidden xl:block w-64 shrink-0">
          <div className="sticky top-24 max-h-[calc(100vh-8rem)] overflow-y-auto pe-4 scrollbar-thin scrollbar-thumb-muted-foreground/20 hover:scrollbar-thumb-muted-foreground/40">
            <DocsToc content={markdownSource} />
          </div>
        </aside>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Docs Landing Page
// ---------------------------------------------------------------------------

const DOCS_FEATURES = [
  {
    icon: Rocket,
    title: "Getting Started",
    description: "Create your account, set up your first project, and embed a widget in minutes.",
    href: "/docs/getting-started",
  },
  {
    icon: Bot,
    title: "Bot Flows",
    description: "Visual flow designer — build conversation automation with 18+ block types, no code required.",
    href: "/docs/bot-flows",
  },
  {
    icon: MessageSquare,
    title: "Knowledge Base",
    description: "Upload documents and FAQs. Your bot searches them automatically with semantic search.",
    href: "/docs/knowledge-base",
  },
  {
    icon: Workflow,
    title: "Channels",
    description: "Connect WhatsApp, Telegram, Messenger, and Instagram. Every message in one inbox.",
    href: "/docs/channels",
  },
  {
    icon: Shield,
    title: "Monitor & Routing",
    description: "Manage live conversations, assign agents, departments, and configure routing.",
    href: "/docs/monitor",
  },
  {
    icon: BookOpen,
    title: "Agent Dashboard",
    description: "Labels, canned responses, departments, contacts, and team management tools.",
    href: "/docs/agent-dashboard",
  },
  {
    icon: LifeBuoy,
    title: "Analytics & History",
    description: "CSAT scores, token usage, activity logs, and conversation archive.",
    href: "/docs/analytics",
  },
]

function DocsLanding() {
  // We use the same getTranslations promise resolution for async components, but
  // since DocsLanding is called as a regular component in a server component tree
  // that's already awaited, we should make it async. Wait, a functional
  // async component returning JSX is completely valid in Next.js Server Components.
  return <DocsLandingAsync />;
}

async function DocsLandingAsync() {
  const t = await getTranslations("docs");

  return (
    <div className="space-y-12">
      <div className="space-y-4">
        <div className="flex items-center gap-3 text-primary">
          <BookOpen className="h-8 w-8" />
          <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
        </div>
        <p className="text-lg text-muted-foreground max-w-2xl">
          {t("description")}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {DOCS_FEATURES.map((f) => (
          <Link
            key={f.href}
            href={f.href}
            className="group flex flex-col gap-3 rounded-xl border p-6 transition-colors duration-200 hover:border-primary/50 hover:bg-accent/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:border-transparent"
          >
            <f.icon className="h-6 w-6 text-muted-foreground group-hover:text-primary transition-colors" />
            <h2 className="text-lg font-semibold group-hover:text-primary transition-colors">
              {f.title}
            </h2>
            <p className="text-sm text-muted-foreground">{f.description}</p>
          </Link>
        ))}
      </div>
    </div>
  )
}
