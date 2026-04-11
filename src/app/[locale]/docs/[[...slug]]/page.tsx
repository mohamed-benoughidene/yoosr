import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { DocsBreadcrumbs } from "@/components/docs/DocsBreadcrumbs"
import { DocsToc } from "@/components/docs/DocsToc"
import { DocsPrevNext } from "@/components/docs/DocsPrevNext"
import { getDocsNav, type DocsNavSection, type DocsNavItem } from "@/lib/docs.client"
import { parseDocsFrontmatter, type DocsPageMeta } from "@/lib/docs"
import { BookOpen, Rocket, MessageSquare, Bot, Workflow, Shield, Webhook, LifeBuoy } from "lucide-react"
import Link from "next/link"
import fs from "fs"
import path from "path"
import { setRequestLocale as unstable_setRequestLocale } from "next-intl/server"
import { unified } from "unified"
import remarkParse from "remark-parse"
import remarkGfm from "remark-gfm"
import remarkRehype from "remark-rehype"
import rehypeStringify from "rehype-stringify"
import rehypeSanitize, { defaultSchema } from "rehype-sanitize"
import rehypeSlug from "rehype-slug"
import { getTranslations } from "next-intl/server"

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
 * Get doc metadata for a specific slug.
 */
function getDocMeta(locale: string, slug: string[] | undefined): DocsPageMeta | null {
  const slugPath = slug ? slug.join("/") : "index"
  let filePath = path.join(CONTENT_BASE, locale, `${slugPath}.mdx`)

  // Also check for index.mdx inside a directory
  if (!fs.existsSync(filePath)) {
    const indexPath = path.join(CONTENT_BASE, locale, slugPath, "index.mdx")
    if (fs.existsSync(indexPath)) filePath = indexPath
    else return null
  }

  const raw = fs.readFileSync(filePath, "utf-8")
  const metaMatch = raw.match(/export const meta = \{([\s\S]*?)\}/)
  if (!metaMatch) return null

  const meta: Record<string, string> = {}
  metaMatch[1].split("\n").forEach((line) => {
    const kv = line.match(/(\w+):\s*['"`](.*?)['"`]/)
    if (kv) meta[kv[1]] = kv[2]
  })

  return {
    title: meta.title || slug?.join(" ") || "Documentation",
    description: meta.description || "",
    section: meta.section || "",
    href: `/docs/${slug?.join("/") || ""}`,
    filePath,
    body: raw.replace(/export const meta = \{[\s\S]*?\}\n?/, "").replace(/^#\s+.+\n/, "").slice(0, 500),
  }
}

/**
 * Get the raw MDX content for a specific slug.
 */
function getDocContent(locale: string, slug: string[] | undefined): { raw: string; meta: Record<string, string> } | null {
  const slugPath = slug ? slug.join("/") : "index"
  let filePath = path.join(CONTENT_BASE, locale, `${slugPath}.mdx`)

  // Also check for index.mdx inside a directory
  if (!fs.existsSync(filePath)) {
    const indexPath = path.join(CONTENT_BASE, locale, slugPath, "index.mdx")
    if (fs.existsSync(indexPath)) filePath = indexPath
    else return null
  }

  const raw = fs.readFileSync(filePath, "utf-8")
  const metaMatch = raw.match(/export const meta = \{([\s\S]*?)\}/)
  const meta: Record<string, string> = {}
  if (metaMatch) {
    metaMatch[1].split("\n").forEach((line) => {
      const kv = line.match(/(\w+):\s*['"`](.*?)['"`]/)
      if (kv) meta[kv[1]] = kv[2]
    })
  }

  return { raw, meta }
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
    return <DocsLanding locale={locale} />
  }

  if (!doc) {
    notFound()
  }

  // Remove the frontmatter export for markdown processing
  const markdownSource = doc.raw.replace(/export const meta = \{[\s\S]*?\}\n?/, "")

  // Convert markdown to HTML using remark/rehype
  const html = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkRehype, { allowDangerousHtml: false })
    .use(rehypeSlug)
    .use(rehypeSanitize, {
      ...defaultSchema,
      clobberPrefix: '',
      attributes: {
        ...defaultSchema.attributes,
        // Allow className on all elements (needed for Tailwind styling)
        "*": [...(defaultSchema.attributes?.["*"] || []), "className"],
        // Allow id on headings for anchor links
        h1: ["id"], h2: ["id"], h3: ["id"], h4: ["id"], h5: ["id"], h6: ["id"],
      },
    })
    .use(rehypeStringify)
    .process(markdownSource)

  const renderedHtml = String(html)

  const navTree = getDocsNav(locale)
  const allPages = parseDocsFrontmatter(locale)
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
    "headline": doc.meta.title || "Yoosr Documentation",
    "description": doc.meta.description || "",
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
          <div
            className="prose prose-zinc max-w-none dark:prose-invert docs-content"
            dangerouslySetInnerHTML={{ __html: renderedHtml }}
          />
          <DocsPrevNext prev={prevPage} next={nextPage} />
        </article>

        {/* TOC sidebar — desktop only */}
        <aside className="hidden xl:block w-64 shrink-0">
          <div className="sticky top-24 max-h-[calc(100vh-8rem)] overflow-y-auto pr-4 scrollbar-thin scrollbar-thumb-muted-foreground/20 hover:scrollbar-thumb-muted-foreground/40">
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
    icon: MessageSquare,
    title: "Widget",
    description: "Installation guides for every platform, theming, and behavior configuration.",
    href: "/docs/widget/installation",
  },
  {
    icon: Bot,
    title: "AI Chatbots",
    description: "Configure LLM models, build knowledge bases with RAG, and craft system prompts.",
    href: "/docs/ai-chatbots",
  },
  {
    icon: Workflow,
    title: "Bot Flows",
    description: "Visual flow designer — build conversation automation without code.",
    href: "/docs/bot-flows",
  },
  {
    icon: Shield,
    title: "Agent Dashboard",
    description: "Manage conversations, assign agents, departments, and canned responses.",
    href: "/docs/agent-dashboard",
  },
  {
    icon: Webhook,
    title: "Webhooks & API",
    description: "REST API reference, inbound/outbound webhooks, and signature verification.",
    href: "/docs/api",
  },
  {
    icon: LifeBuoy,
    title: "Troubleshooting",
    description: "Common issues, error codes, rate limits, and frequently asked questions.",
    href: "/docs/troubleshooting",
  },
]

function DocsLanding({ locale }: { locale: string }) {
  // We use the same getTranslations promise resolution for async components, but
  // since DocsLanding is called as a regular component in a server component tree
  // that's already awaited, we should make it async. Wait, a functional
  // async component returning JSX is completely valid in Next.js Server Components.
  return <DocsLandingAsync locale={locale} />;
}

async function DocsLandingAsync({ locale }: { locale: string }) {
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
