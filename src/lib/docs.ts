/**
 * Documentation site utilities (server-only).
 *
 * - parseDocsFrontmatter: Reads every MDX file in a locale's content folder and
 *   returns a flat list suitable for search and sidebar generation.
 * - getDocBySlug: Finds a specific MDX file by its slug and returns its content.
 * - generateDocsStaticParams: Helper for generateStaticParams in docs pages.
 *
 * NOTE: This module uses Node.js `fs` and must only be called from
 * Server Components (layout.tsx, page.tsx, generateStaticParams, etc.).
 */

import fs from "fs"
import path from "path"
import type { DocsPageMeta } from "@/lib/docs.client"

export type { DocsPageMeta } from "@/lib/docs.client"

// ---------------------------------------------------------------------------
// MDX Frontmatter Parser
// ---------------------------------------------------------------------------

/**
 * Recursively find every `.mdx` file under `content/docs/<locale>`.
 */
function findMdxFiles(dir: string): string[] {
  const results: string[] = []
  if (!fs.existsSync(dir)) return results
  const entries = fs.readdirSync(dir, { withFileTypes: true })
  for (const entry of entries) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      results.push(...findMdxFiles(full))
    } else if (entry.name.endsWith(".mdx")) {
      results.push(full)
    }
  }
  return results
}

/**
 * Extract frontmatter and body from an MDX file.
 * Supports both YAML frontmatter (---) and JS frontmatter (export const ...).
 */
function parseMdx(
  filePath: string,
): { meta: Record<string, string>; body: string } {
  const raw = fs.readFileSync(filePath, "utf-8")

  // --- YAML frontmatter ---
  const yamlMatch = raw.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/)
  if (yamlMatch) {
    const meta: Record<string, string> = {}
    yamlMatch[1].split("\n").forEach((line) => {
      const colonIdx = line.indexOf(":")
      if (colonIdx === -1) return
      const key = line.slice(0, colonIdx).trim()
      let value = line.slice(colonIdx + 1).trim()

      // Parse arrays
      if (value.startsWith("[") && value.endsWith("]")) {
        try {
          value = JSON.parse(value) as unknown as string
        } catch { /* keep as string */ }
      }

      // Remove surrounding quotes
      if (typeof value === "string" && ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'")))) {
        value = value.slice(1, -1)
      }

      if (key && value) meta[key] = value as string
    })
    return { meta, body: yamlMatch[2] }
  }

  // --- JS frontmatter (export const meta = { ... }) ---
  const jsMetaMatch = raw.match(/export const meta = \{([\s\S]*?)\}/)
  if (jsMetaMatch) {
    const meta: Record<string, string> = {}
    jsMetaMatch[1].split("\n").forEach((line) => {
      const kv = line.match(/(\w+):\s*['"`](.*?)['"`]/)
      if (kv) meta[kv[1]] = kv[2]
    })
    const body = raw.replace(/export const meta = \{[\s\S]*?\}\n?/, "")
    return { meta, body }
  }

  return { meta: {}, body: raw }
}

/**
 * Parse all MDX files for a locale and return a flat list with hrefs.
 */
export function parseDocsFrontmatter(locale: string): DocsPageMeta[] {
  const baseDir = path.join(process.cwd(), "content", "docs", locale)
  const files = findMdxFiles(baseDir)

  return files.map((filePath) => {
    const { meta, body } = parseMdx(filePath)
    const relative = path.relative(baseDir, filePath).replace(/\\/g, "/")
    // "getting-started/index.mdx" → "/docs/getting-started"
    // "widget/installation.mdx"   → "/docs/widget/installation"
    const href = "/docs/" + relative.replace(/\/index\.mdx$/, "").replace(/\.mdx$/, "")

    return {
      title: meta.title || href.split("/").pop() || "",
      description: meta.description || "",
      section: meta.section || href.split("/")[2] || "",
      href,
      filePath,
      body: body.replace(/[#*`_~\[\]()>]/g, "").trim().slice(0, 500), // strip markdown for search
    }
  })
}
