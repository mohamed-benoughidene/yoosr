/**
 * Custom MDX components for the documentation site.
 *
 * These components override default markdown rendering for specific elements
 * and provide custom blocks like <Callout>, <Step>, <Snippet>, etc.
 */

import React from "react"
import Link from "next/link"
import Image from "next/image"
import { cn } from "@/lib/utils"
import {
  AlertCircle,
  Lightbulb,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react"
import { CopyButton } from "@/components/docs/CopyButton"

// -- Base typography overrides --

const h1 = ({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
  <h1
    className={cn(
      "mt-2 scroll-m-20 text-3xl font-bold tracking-tight text-foreground",
      className
    )}
    {...props}
  />
)

const h2 = ({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
  <h2
    className={cn(
      "mt-10 scroll-m-20 border-b pb-2 text-2xl font-semibold tracking-tight text-foreground first:mt-0",
      className
    )}
    {...props}
  />
)

const h3 = ({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
  <h3
    className={cn(
      "mt-8 scroll-m-20 text-lg font-semibold tracking-tight text-foreground",
      className
    )}
    {...props}
  />
)

const h4 = ({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
  <h4
    className={cn(
      "mt-8 scroll-m-20 text-base font-semibold tracking-tight text-foreground",
      className
    )}
    {...props}
  />
)

const p = ({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) => (
  <p
    className={cn("leading-7 text-muted-foreground [&:not(:first-child)]:mt-4", className)}
    {...props}
  />
)

const ul = ({ className, ...props }: React.HTMLAttributes<HTMLUListElement>) => (
  <ul className={cn("my-4 ml-6 list-disc text-muted-foreground", className)} {...props} />
)

const ol = ({ className, ...props }: React.HTMLAttributes<HTMLOListElement>) => (
  <ol
    className={cn("my-4 ml-6 list-decimal text-muted-foreground", className)}
    {...props}
  />
)

const li = ({ className, ...props }: React.HTMLAttributes<HTMLLIElement>) => (
  <li className={cn("mt-2", className)} {...props} />
)

const blockquote = ({ className, ...props }: React.HTMLAttributes<HTMLElement>) => (
  <blockquote
    className={cn("mt-4 border-l-2 border-primary pl-4 italic text-muted-foreground", className)}
    {...props}
  />
)

const hr = ({ className, ...props }: React.HTMLAttributes<HTMLHRElement>) => (
  <hr className={cn("my-8 border-border", className)} {...props} />
)

const a = ({ className, ...props }: React.AnchorHTMLAttributes<HTMLAnchorElement>) => {
  const href = props.href
  if (href && href.startsWith("/")) {
    return (
      <Link
        href={href}
        className={cn(
          "font-medium text-primary underline underline-offset-4 decoration-1 transition-colors duration-200 hover:decoration-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-sm",
          className
        )}
        {...props}
      />
    )
  }
  return (
    <a
      className={cn(
        "font-medium text-primary underline underline-offset-4 decoration-1 transition-colors duration-200 hover:decoration-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-sm",
        className
      )}
      {...props}
    />
  )
}

const table = ({ className, ...props }: React.HTMLAttributes<HTMLTableElement>) => (
  <div className="my-6 w-full overflow-y-auto rounded-lg border">
    <table className={cn("w-full text-sm", className)} {...props} />
  </div>
)

const th = ({ className, ...props }: React.HTMLAttributes<HTMLTableCellElement>) => (
  <th
    className={cn(
      "border-border px-4 py-2 text-left font-semibold bg-muted/50",
      className
    )}
    {...props}
  />
)

const td = ({ className, ...props }: React.HTMLAttributes<HTMLTableCellElement>) => (
  <td className={cn("border-border px-4 py-2", className)} {...props} />
)

// -- Code blocks --

function CodeBlock({ children, className }: { children: string; className?: string }) {
  return (
    <div className="relative group my-6 rounded-lg border border-zinc-800 bg-[#09090b] overflow-hidden">
      <div className="absolute right-2 top-2 z-10 opacity-0 transition-opacity duration-200 group-hover:opacity-100 focus-within:opacity-100">
        <CopyButton text={children} />
      </div>
      {className && (
        <div className="px-4 py-2 flex items-center pr-12 border-b border-zinc-800">
          <span className="text-xs text-zinc-500 font-mono">{className.replace("language-", "")}</span>
        </div>
      )}
      <pre className="p-4 overflow-x-auto text-sm text-zinc-100">
        <code className={className}>{children}</code>
      </pre>
    </div>
  )
}

const code = ({ className, children, ...props }: React.HTMLAttributes<HTMLElement>) => {
  // Block-level code (from fenced code blocks rendered as <pre><code>)
  const childStr = String(children)
  if (childStr.includes("\n")) {
    return <CodeBlock className={className}>{childStr.replace(/\n$/, "")}</CodeBlock>
  }
  // Inline code
  return (
    <code
      className={cn(
        "relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold",
        className
      )}
      {...props}
    >
      {children}
    </code>
  )
}

// -- Custom callout blocks --

const CALLOUT_VARIANTS = {
  info: {
    icon: AlertCircle,
    className: "border-blue-200 bg-blue-50 text-blue-800 dark:border-blue-800 dark:bg-blue-950/50 dark:text-blue-200",
  },
  tip: {
    icon: Lightbulb,
    className: "border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-800 dark:bg-amber-950/50 dark:text-amber-200",
  },
  warning: {
    icon: AlertTriangle,
    className: "border-orange-200 bg-orange-50 text-orange-800 dark:border-orange-800 dark:bg-orange-950/50 dark:text-orange-200",
  },
  success: {
    icon: CheckCircle2,
    className: "border-green-200 bg-green-50 text-green-800 dark:border-green-800 dark:bg-green-950/50 dark:text-green-200",
  },
} as const

interface CalloutProps {
  variant?: keyof typeof CALLOUT_VARIANTS
  title?: string
  children: React.ReactNode
}

export function Callout({
  variant = "info",
  title,
  children,
}: CalloutProps) {
  const { icon: Icon, className } = CALLOUT_VARIANTS[variant]
  return (
    <div className={cn("flex gap-3 rounded-lg border p-4 my-6", className)}>
      <Icon className="h-5 w-5 shrink-0 mt-0.5" />
      <div className="space-y-1">
        {title && <p className="font-semibold">{title}</p>}
        <div className="text-sm [&>p]:mt-0 [&>p:last-child]:mb-0">{children}</div>
      </div>
    </div>
  )
}

// -- Step component --

interface StepProps {
  number: number
  title: string
  children: React.ReactNode
}

export function Step({ number, title, children }: StepProps) {
  return (
    <div className="flex gap-4 my-6">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
        {number}
      </div>
      <div className="space-y-2 flex-1">
        <h3 className="font-semibold text-foreground">{title}</h3>
        <div className="text-muted-foreground text-sm">{children}</div>
      </div>
    </div>
  )
}

// -- Snippet component (pre-formatted code with copy) --

interface SnippetProps {
  code: string
  lang?: string
}

export function Snippet({ code, lang = "text" }: SnippetProps) {
  return (
    <div className="relative group my-6 rounded-lg border border-zinc-800 bg-[#09090b] overflow-hidden">
      <div className="absolute right-2 top-2 z-10 opacity-0 transition-opacity duration-200 group-hover:opacity-100 focus-within:opacity-100">
        <CopyButton text={code} />
      </div>
      <div className="px-4 py-2 flex items-center pr-12 border-b border-zinc-800">
        <span className="text-xs text-zinc-500 font-mono">{lang}</span>
      </div>
      <pre className="p-4 overflow-x-auto text-sm text-zinc-100">
        <code className={`language-${lang}`}>{code}</code>
      </pre>
    </div>
  )
}

// -- Image with caption --

interface CaptionedImageProps {
  src: string
  alt: string
  caption: string
  width?: number
  height?: number
}

export function CaptionedImage({ src, alt, caption, width = 800, height }: CaptionedImageProps) {
  return (
    <figure className="my-8">
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        className="rounded-lg border shadow-sm"
      />
      <figcaption className="mt-2 text-center text-sm text-muted-foreground">
        {caption}
      </figcaption>
    </figure>
  )
}

// -- Export all as MDX components --

export const mdxComponents = {
  h1,
  h2,
  h3,
  h4,
  p,
  ul,
  ol,
  li,
  blockquote,
  hr,
  a,
  table,
  th,
  td,
  code,
  img: (props: React.ImgHTMLAttributes<HTMLImageElement>) => (
    <Image
      src={props.src as string || ""}
      alt={props.alt || ""}
      width={800}
      height={500}
      className="rounded-lg border my-6"
    />
  ),
  Callout,
  Step,
  Snippet,
  CaptionedImage,
}
