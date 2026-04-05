# Part 02: Build Tooling Configuration — Analysis Findings

## 📊 Visual Map

```
Configuration Files (6 files)
├── next.config.ts              → Next.js 16 configuration
│   ├── next-intl plugin        → Internationalization (./src/i18n/request.ts)
│   ├── turbopack config        → root: __dirname (for monorepo compat)
│   └── images.remotePatterns   → convex.cloud, img.clerk.com allowed
│
├── tsconfig.json               → TypeScript 5 compiler options
│   ├── target: ES2017          → Modern JS output
│   ├── strict: true            → Full type checking
│   ├── paths: @/* → ./src/*   → Path alias for cleaner imports
│   └── jsx: react-jsx          → Automatic JSX runtime
│
├── eslint.config.mjs           → ESLint 9 flat config format
│   ├── eslint-config-next/core-web-vitals  → Next.js best practices
│   ├── eslint-config-next/typescript       → TS-specific rules
│   └── globalIgnores           → .next, out, build, convex/_generated
│
├── postcss.config.mjs          → PostCSS processing
│   └── @tailwindcss/postcss    → Tailwind v4 plugin
│
├── components.json             → shadcn/ui generator config
│   ├── style: default          → shadcn default style
│   ├── rsc: true               → React Server Components enabled
│   ├── tsx: true               → TypeScript components
│   ├── tailwind.cssVariables: true → CSS variables for theming
│   ├── iconLibrary: lucide     → Lucide React icons
│   └── aliases: @/components, @/lib, @/hooks, @/ui
│
└── vercel.json                 → Vercel deployment settings
    ├── Security headers         → CSP, X-Frame, HSTS, etc.
    ├── Font caching             → 1 year immutable for /fonts/*
    └── No custom redirects/rewrites → uses Next.js defaults
```

## 📁 File Inventory

| File | Purpose | Size/Complexity |
|------|---------|----------------|
| `next.config.ts` | Next.js config with next-intl plugin, TurboPack root, image patterns | 17 lines, minimal |
| `tsconfig.json` | TypeScript strict mode, ES2017 target, `@/*` path alias | 35 lines, standard |
| `eslint.config.mjs` | ESLint 9 flat config with Next.js rules | 17 lines, simple |
| `postcss.config.mjs` | PostCSS with @tailwindcss/postcss v4 plugin | 5 lines, minimal |
| `components.json` | shadcn/ui generator config with RSC support | 22 lines, complete |
| `vercel.json` | Security headers + font cache policy | 45 lines, comprehensive |

## ✅ Analysis Checklist

- [x] **What Next.js features are enabled?**
  - **App Router**: Yes — project uses `src/app/` directory structure with React Server Components
  - **SSR**: Yes — Next.js 16 with `next start` for production SSR
  - **ISR**: Not explicitly configured; would use `revalidate` in page-level config
  - **Turbopack**: Configured (`turbopack.root` set to `__dirname`) for development speed
  - **Image Optimization**: Configured with `remotePatterns` for `*.convex.cloud` and `img.clerk.com`
  - **Internationalization**: Enabled via `next-intl` plugin pointing to `./src/i18n/request.ts`

- [x] **Are there custom webpack configurations or plugins?**
  Only the `next-intl` plugin is used. No custom webpack overrides, no additional plugins. The config is intentionally minimal.

- [x] **What TypeScript compiler options are set?**
  - `target`: ES2017 — modern JS (async/await, optional chaining, etc.)
  - `lib`: dom, dom.iterable, esnext — browser + latest JS
  - `strict`: true — full strict mode (noImplicitAny, strictNullChecks, etc.)
  - `allowJs`: true — JavaScript files allowed alongside TypeScript
  - `skipLibCheck`: true — skip type checking of .d.ts files in node_modules
  - `noEmit`: true — TypeScript only for type checking, not compilation (Next.js handles this)
  - `module`: esnext — ES module output
  - `moduleResolution`: bundler — optimized for bundlers (Turbopack/Vercel)
  - `resolveJsonModule`: true — import JSON files
  - `isolatedModules`: true — each file is a separate module (required by Next.js)
  - `jsx`: react-jsx — automatic JSX transform
  - `incremental`: true — faster subsequent builds via `.next/tsconfig.tsbuildinfo`
  - `plugins`: [{ name: "next" }] — Next.js TS plugin for better type inference

- [x] **Are path aliases configured for cleaner imports?**
  Yes: `"@/*": ["./src/*"]` — maps `@/` to `src/`. Used throughout the codebase (e.g., `@/components`, `@/lib`, `@/hooks`). This is also reflected in `components.json` aliases.

- [x] **What ESLint rules and plugins are active?**
  ESLint 9 using **flat config** format (`eslint.config.mjs`):
  - `eslint-config-next/core-web-vitals` — Next.js performance and best practice rules
  - `eslint-config-next/typescript` — TypeScript-specific linting
  - Custom ignores: `.next/**`, `out/**`, `build/**`, `next-env.d.ts`, `convex/_generated/**`
  - No custom rules defined beyond the Next.js presets — relies on defaults

- [x] **Is ESLint config using the new flat config format?**
  **Yes.** The file uses `eslint.config.mjs` (`.mjs` extension + flat config API with `defineConfig()` and array-based config). This is the new ESLint 9 flat config format, not the legacy `.eslintrc` format.

- [x] **How is PostCSS configured?**
  Minimal: Only the `@tailwindcss/postcss` plugin is registered. This is the Tailwind v4 approach — Tailwind now handles its own PostCSS processing via the dedicated plugin rather than requiring `tailwindcss` + `autoprefixer` manually.

- [x] **What does components.json configure for shadcn/ui?**
  - Style: default (not New York)
  - RSC: true (React Server Components compatible)
  - TSX: true (TypeScript components)
  - Tailwind: CSS variables enabled, base color `slate`, no prefix
  - Icon library: Lucide React
  - Aliases: `@/components`, `@/lib/utils`, `@/components/ui`, `@/lib`, `@/hooks`
  - Registry: shadcnblocks.com for additional components

- [x] **Are there any build optimizations or custom configurations?**
  - **TurboPack root** configured for development speed
  - **Incremental TypeScript** compilation enabled
  - **Image remotePatterns** limited to specific domains (security)
  - No explicit bundle splitting, no custom chunking strategy
  - No `experimental` features enabled in Next.js config

- [x] **What Vercel-specific settings are defined?**
  `vercel.json` defines **security headers** (not deployment config):
  - `X-Frame-Options: SAMEORIGIN` — clickjacking protection
  - `X-Content-Type-Options: nosniff` — MIME sniffing protection
  - `X-XSS-Protection: 1; mode=block` — XSS filter
  - `Referrer-Policy: strict-origin-when-cross-origin`
  - `Cross-Origin-Opener-Policy: same-origin`
  - `Cross-Origin-Embedder-Policy: require-corp`
  - `Permissions-Policy: camera=(), microphone=(), geolocation=(), interest-cohort=()`
  - `Content-Security-Policy`: Comprehensive CSP allowing self, Clerk, Convex, OpenRouter, Google Fonts
  - Font caching: 1 year immutable for `/fonts/*`

- [x] **Are environment variables configured at build time?**
  Not in these config files. Environment variables are handled at:
  - Convex level: `npx convex env set` (validated via `convex/lib/env.ts` `requireEnv()`)
  - Vercel level: Project settings in Vercel dashboard
  - No `.env` validation at Next.js build time (no `@vercel/otel` or similar)

- [x] **Any image optimization settings in Next.js?**
  Yes — `remotePatterns` in `next.config.ts`:
  - `*.convex.cloud` — Convex file storage (wildcard subdomain)
  - `img.clerk.com` — Clerk user avatars
  - No custom `deviceSizes`, `imageSizes`, or `formats` — uses Next.js defaults

## 📝 Agent Findings

### Configuration Philosophy
The project follows a **minimal-by-default** approach. All 6 config files are intentionally simple — no complex overrides, no experimental features, no custom webpack. This suggests a preference for framework defaults and maintainability over customization.

### Next.js 16 Adoption
Using Next.js 16.1.6 (pinned), which is the latest major version. The config is compatible with the new App Router paradigm and React Server Components.

### ESLint Flat Config Migration
Already migrated to ESLint 9's flat config format (`eslint.config.mjs`), showing proactive maintenance of tooling.

### Security-First Vercel Config
The `vercel.json` is the most complex config file, with 8 security headers including a comprehensive CSP. This shows production-readiness thinking.

### Tailwind v4
Using Tailwind v4 with the new `@tailwindcss/postcss` plugin approach (no longer needs `tailwind.config.js`).

## 🔍 Key Patterns to Identify

- **Framework defaults over customization**: All configs are minimal, preferring defaults
- **ESLint 9 flat config**: Already on the new format
- **Tailwind v4**: Using latest Tailwind with dedicated PostCSS plugin
- **shadcn/ui standard setup**: Default style, RSC enabled, CSS variables for theming
- **Security headers in vercel.json**: CSP, CORS, and permission policies enforced at edge

## ⚠️ Potential Concerns

| Concern | Severity | Details |
|---------|----------|---------|
| **No TypeScript build-time env validation** | LOW | `vercel.json` doesn't validate env vars at build time. Convex has `requireEnv()` but Next.js actions/SSR code accessing `process.env` could fail silently. |
| **No experimental features enabled** | INFO | Could benefit from `serverActions`, `typedRoutes`, or other Next.js experimentals, but not a concern for stability. |
| **No custom bundle optimization** | LOW | No `experimental.instrumentationHook`, no manual chunk splitting. For a moderate-sized app this is fine, but could be optimized for larger apps. |
| **CSP includes `'unsafe-inline'` for styles** | LOW | `style-src 'self' 'unsafe-inline' https://fonts.googleapis.com` — allows inline styles, which weakens CSP. Acceptable for Tailwind's runtime but technically a minor security reduction. |
| **CSP allows `script-src 'unsafe-inline'` for Clerk** | MEDIUM | `script-src 'self' 'unsafe-inline' https://*.clerk.accounts.dev` — inline scripts allowed from Clerk domain. This is required for Clerk's widget but reduces CSP effectiveness. |
