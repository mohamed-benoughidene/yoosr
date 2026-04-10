# Part 02: Build Tooling Configuration

## 📊 Visual Map

```
Configuration Files
├── next.config.ts           → Next.js framework configuration (TypeScript)
│   ├── next-intl plugin      → wraps config via createNextIntlPlugin("./src/i18n/request.ts")
│   ├── turbopack.root        → __dirname (Turbopack bundler enabled)
│   └── images.remotePatterns → **.convex.cloud, img.clerk.com
│
├── tsconfig.json            → TypeScript compiler options
│   ├── target: ES2017, module: esnext, strict: true
│   ├── moduleResolution: bundler
│   ├── paths: @/* → ./src/*
│   ├── incremental: true (with tsconfig.tsbuildinfo)
│   └── plugins: [{ name: "next" }]
│
├── eslint.config.mjs        → ESLint flat config (v9+)
│   ├── extends: eslint-config-next/core-web-vitals
│   ├── extends: eslint-config-next/typescript
│   └── globalIgnores: .next/**, out/**, build/**, convex/_generated/**
│
├── postcss.config.mjs       → PostCSS pipeline
│   └── plugins: { "@tailwindcss/postcss": {} }  (Tailwind v4 native)
│
├── components.json          → shadcn/ui configuration
│   ├── style: default, rsc: true, tsx: true
│   ├── tailwind.css: src/app/globals.css, baseColor: slate
│   ├── iconLibrary: lucide
│   ├── aliases: @/components, @/lib/utils, @/components/ui, @/lib, @/hooks
│   └── registries: @shadcnblocks → https://shadcnblocks.com/r/{name}.json
│
├── vercel.json              → Vercel deployment settings
│   ├── Security headers: X-Frame-Options, CSP, COOP, etc.
│   └── Font caching: Cache-Control immutable for /fonts/*
│
├── vitest.config.ts         → Vitest test runner configuration
│   ├── environment: jsdom, globals: true
│   ├── setupFiles: ./vitest.setup.ts
│   ├── coverage: v8 provider, text/json/html reporters
│   └── alias: @ → ./src
│
└── vitest.setup.ts          → Test setup: imports @testing-library/jest-dom/vitest
```

## 📁 File Inventory

| File | Purpose | Exists? | Size |
|------|---------|---------|------|
| `next.config.ts` | Next.js framework configuration, i18n plugin, image domains | ✅ Yes | 517 bytes (27 lines) |
| `tsconfig.json` | TypeScript compiler options, path aliases, strictness | ✅ Yes | 779 bytes (44 lines) |
| `eslint.config.mjs` | ESLint flat config for code linting and quality | ✅ Yes | 523 bytes (21 lines) |
| `postcss.config.mjs` | PostCSS configuration for Tailwind CSS v4 processing | ✅ Yes | 94 bytes (8 lines) |
| `components.json` | shadcn/ui component generator configuration | ✅ Yes | 513 bytes (25 lines) |
| `vercel.json` | Vercel deployment configuration, security headers | ✅ Yes | 1,693 bytes (50 lines) |
| `vitest.config.ts` | Vitest test runner configuration (not in template) | ✅ Yes | 622 bytes (29 lines) |
| `vitest.setup.ts` | Vitest setup file (not in template) | ✅ Yes | 43 bytes (1 line) |
| `next-env.d.ts` | Next.js generated type declarations | ✅ Yes | 247 bytes (auto-generated) |
| `tsconfig.tsbuildinfo` | TypeScript incremental build cache | ✅ Yes | 554,203 bytes (should be .gitignored) |

## ✅ Analysis Checklist

- [x] **What Next.js features are enabled? (App Router, SSR, ISR, etc.)**
  - **App Router**: Yes, the project uses the `app/` directory pattern (confirmed by `src/app/` structure and RSC support in `components.json`).
  - **Turbopack**: Enabled via `turbopack: { root: __dirname }` in `next.config.ts`. This is the default bundler in Next.js 16.
  - **next-intl Plugin**: Internationalization is integrated at the framework level via `createNextIntlPlugin("./src/i18n/request.ts")`, supporting `en`, `ar`, `fr` locales.
  - **React Server Components**: Enabled (`"rsc": true` in `components.json`).
  - **No ISR/SSG explicitly configured**: No `revalidate` or `generateStaticParams` patterns visible in config. SSR is the default mode.
  - **No custom webpack config**: The project relies on Turbopack exclusively. No `webpack()` function in `next.config.ts`.
  - **No `experimental` features**: No experimental Next.js features are enabled.

- [x] **Are there custom webpack configurations or plugins?**
  - **No**. The only plugin is `next-intl` which wraps the config via `withNextIntl()`. There is no custom `webpack()` configuration. The project uses **Turbopack** as the bundler, which doesn't support custom webpack configs anyway.

- [x] **What TypeScript compiler options are set? (strict mode, path aliases)**
  - **Target**: `ES2017` — appropriate for the `browserslist` config.
  - **Strict mode**: `true` ✅ — full TypeScript strictness enabled.
  - **Module**: `esnext` with `moduleResolution: "bundler"` — correct for Next.js 16+ with Turbopack.
  - **JSX**: `react-jsx` — uses the automatic JSX runtime (no need for `import React`).
  - **Incremental**: `true` — enables faster rebuilds via `tsconfig.tsbuildinfo`.
  - **No emit**: `true` — TypeScript is used for type-checking only; Turbopack handles compilation.
  - **Other flags**: `allowJs`, `skipLibCheck`, `esModuleInterop`, `resolveJsonModule`, `isolatedModules` — all standard for Next.js.
  - **Next.js plugin**: `{ "name": "next" }` — provides Next.js-specific type enhancements.

- [x] **Are path aliases configured for cleaner imports?**
  - **Yes**: `@/*` maps to `./src/*` in `tsconfig.json` (line 25–29).
  - This alias is also registered in:
    - `components.json`: `aliases.components = "@/components"`, `aliases.ui = "@/components/ui"`, `aliases.lib = "@/lib"`, `aliases.hooks = "@/hooks"`, `aliases.utils = "@/lib/utils"`
    - `vitest.config.ts`: `resolve.alias: { "@": path.resolve(__dirname, "./src") }` — ensures tests can use the same `@/` imports.
  - **Consistency**: ✅ All three configurations agree on the `@/` → `./src/` mapping.

- [x] **What ESLint rules and plugins are active?**
  - **Core configs extended**:
    - `eslint-config-next/core-web-vitals` — Next.js recommended rules + Core Web Vitals rules
    - `eslint-config-next/typescript` — TypeScript-specific linting rules
  - **Custom rules**: None. The config is minimal and relies entirely on the Next.js presets.
  - **Global ignores**:
    - `.next/**`, `out/**`, `build/**`, `next-env.d.ts` — standard Next.js ignores
    - `convex/_generated/**` — Convex auto-generated files (correct to ignore)
  - **No additional plugins**: No `eslint-plugin-import`, `eslint-plugin-react-hooks` (already included via next config), `eslint-plugin-jsx-a11y`, or custom rules.

- [x] **Is ESLint config using the new flat config format?**
  - **Yes**: Uses `defineConfig()` from `"eslint/config"` and `globalIgnores()` helper. This is the ESLint v9+ flat config format. File uses `.mjs` extension (ES modules).

- [x] **How is PostCSS configured? (Tailwind integration)**
  - **Minimal config**: Only `@tailwindcss/postcss` plugin is configured (Tailwind CSS v4's native PostCSS integration).
  - **No autoprefixer**: Tailwind CSS v4 includes vendor prefixing built-in, so `autoprefixer` is not needed.
  - **No additional PostCSS plugins**: No `postcss-import`, `postcss-nesting`, etc. Tailwind v4 handles these natively.

- [x] **What does components.json configure for shadcn/ui?**
  - **Style**: `"default"` (not "new-york")
  - **RSC**: `true` — components are generated with React Server Component compatibility
  - **TSX**: `true` — TypeScript JSX
  - **Tailwind**:
    - `css`: `"src/app/globals.css"` — the main CSS entry point
    - `baseColor`: `"slate"` — slate color palette as the base
    - `cssVariables`: `true` — uses CSS custom properties for theming
    - `config`: `""` (empty) — Tailwind v4 doesn't need a separate config file
    - `prefix`: `""` — no class prefix
  - **Icon Library**: `"lucide"` — lucide-react icons
  - **Import Aliases**: Standard `@/components`, `@/components/ui`, `@/lib`, `@/hooks`, `@/lib/utils`
  - **Custom Registry**: `@shadcnblocks` → `https://shadcnblocks.com/r/{name}.json` — third-party component source

- [x] **Are there any build optimizations or custom configurations?**
  - **Turbopack**: Enabled by default in Next.js 16 — significantly faster builds compared to webpack.
  - **TypeScript incremental builds**: `incremental: true` with `tsconfig.tsbuildinfo` (554 KB).
  - **No bundle analyzer**: No `@next/bundle-analyzer` installed or configured.
  - **No custom `next build` wrapper**: The `build` script is plain `next build`.
  - **No `output: "standalone"`**: Not configured for Docker/containerized deployments (standard Vercel deployment assumed).

- [x] **What Vercel-specific settings are defined?**
  - **Security Headers** (applied to all routes `/(.*)`):
    - `X-Frame-Options: SAMEORIGIN` — clickjacking protection
    - `X-Content-Type-Options: nosniff` — MIME type sniffing prevention
    - `X-XSS-Protection: 1; mode=block` — legacy XSS filter (deprecated but harmless)
    - `Referrer-Policy: strict-origin-when-cross-origin` — controls referrer information
    - `Cross-Origin-Opener-Policy: same-origin` — process isolation
    - `Cross-Origin-Embedder-Policy: require-corp` — cross-origin resource loading restriction
    - `Permissions-Policy: camera=(), microphone=(), geolocation=(), interest-cohort=()` — disables sensitive APIs + FLoC
    - `Content-Security-Policy` — comprehensive CSP (detailed below)
  - **Font Caching** (`/fonts/:path*`):
    - `Cache-Control: public, max-age=31536000, immutable` — 1-year cache for font files
  - **No redirects or rewrites**: None defined in `vercel.json`.

  **CSP Breakdown**:
  - `default-src 'self'`
  - `script-src 'self' 'unsafe-inline' 'unsafe-eval' blob:` + Clerk + Convex domains
  - `worker-src 'self' blob:`
  - `style-src 'self' 'unsafe-inline'` + Google Fonts
  - `img-src 'self' data: blob: https:`
  - `font-src 'self'` + Google Fonts
  - `connect-src 'self'` + Clerk, Convex (HTTPS + WSS), OpenRouter, Clerk telemetry
  - `frame-ancestors 'self'`
  - `base-uri 'self'`
  - `form-action 'self'`

- [x] **Are environment variables configured at build time?**
  - **`.env.example`** provides a comprehensive template (84 lines) with:
    - Clerk authentication keys (public + secret)
    - Convex backend URLs
    - OpenRouter AI API keys
    - AI rate limiting config
    - Embedding model configuration
    - Feature flags
    - VAPID push notification keys
    - Encryption key for webhook secrets
    - Site URLs
  - **Build-time env vars**: `NEXT_PUBLIC_*` prefixed variables are inlined at build time:
    - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
    - `NEXT_PUBLIC_CLERK_SIGN_IN_URL` / `NEXT_PUBLIC_CLERK_SIGN_UP_URL`
    - `NEXT_PUBLIC_CONVEX_URL` / `NEXT_PUBLIC_CONVEX_SITE_URL`
    - `NEXT_PUBLIC_VAPID_PUBLIC_KEY`
    - `NEXT_PUBLIC_SITE_URL` / `NEXT_PUBLIC_APP_URL`
  - **No runtime env validation**: No `@t3-oss/env-nextjs` or similar framework for build-time env validation.

- [x] **Any image optimization settings in Next.js?**
  - **Remote patterns** configured for:
    - `https://*.convex.cloud` — Convex file storage (wildcard subdomain)
    - `https://img.clerk.com` — Clerk user avatars
  - **No custom loader**: Uses Next.js default image optimization.
  - **No `unoptimized` flag**: Images are optimized by default.
  - **No `deviceSizes` or `imageSizes` customization**: Uses Next.js defaults.

## 🔗 Dependencies

- **Depends on:** Part 01 (package dependencies — defines what tools are available)
- **Connected to:** Part 03 (project structure), Part 11 (styling — globals.css), Part 17 (deployment — vercel.json)

## 📝 Agent Findings

### Configuration Quality Summary

The build tooling configuration is **clean, minimal, and well-organized**. All config files are small and purposeful, with no unnecessary complexity.

### Tailwind CSS v4 Configuration

The project uses **Tailwind CSS v4**, which is a significant architectural choice:
- No `tailwind.config.js` — Tailwind v4 uses CSS-first configuration
- PostCSS uses `@tailwindcss/postcss` (v4 native plugin)
- All design tokens defined directly in `globals.css` using `@theme inline`
- Using `oklch()` color space for modern, perceptually uniform colors
- Custom `@property --angle` declaration for CSS Houdini animations

### Turbopack Adoption

The project runs Turbopack (Next.js 16 default), confirmed by `turbopack: { root: __dirname }` in config. This means:
- Significantly faster dev server startup and HMR
- No webpack config support (not needed in this project)
- The `root: __dirname` was likely added to resolve path issues with the monorepo-like structure

### Testing Infrastructure (Not in Template)

Two extra configuration files exist that the template didn't mention:
- `vitest.config.ts` — Full test runner configuration with jsdom environment, v8 coverage, and `@/` alias support
- `vitest.setup.ts` — Sets up `@testing-library/jest-dom` matchers for Vitest

This indicates a **vitest-based testing setup** with jsdom (not Playwright/Cypress for e2e).

### Security Header Analysis

The `vercel.json` security headers are comprehensive but have two noteworthy items:
1. **`'unsafe-inline' 'unsafe-eval'` in script-src**: These weaken the CSP significantly. `unsafe-eval` is likely required by Clerk/Convex client-side SDKs. `unsafe-inline` could potentially be replaced with nonce-based CSP in Next.js.
2. **`Cross-Origin-Embedder-Policy: require-corp`**: This is a strict policy that may cause issues with third-party resources (e.g., Google Fonts, external images) unless they include appropriate CORS headers.

### TypeScript Excludes

The `tsconfig.json` excludes two directories not present in the codebase:
- `tiledesk-reference` — suggests the project was inspired by or migrating from Tiledesk (a chatbot platform)
- `tiledesk-dashboard-reference` — same context

These are likely development reference folders that existed at some point but are now removed.

### Build Artifacts in Version Control

- `tsconfig.tsbuildinfo` (554 KB) is present in the project root and .gitignored ✅
- `next-env.d.ts` is .gitignored ✅ (but present in `tsconfig.json` includes, which is correct)

## 🔍 Key Patterns to Identify

- **TypeScript strictness**: ✅ Full strict mode enabled — excellent for type safety
- **ESLint rule philosophy**: Minimal/lenient — relies on Next.js presets only, no custom rules. No accessibility plugin explicitly added (though `core-web-vitals` includes some a11y rules).
- **Next.js configuration complexity**: Very low — only i18n plugin, turbopack root, and image patterns. Deliberately minimal.
- **Build optimization approach**: Relies on Turbopack (default) + TypeScript incremental builds. No custom optimizations needed.
- **No formatter**: Consistent with Part 01 findings — no Prettier/Biome configured. ESLint alone handles code quality.

## ⚠️ Potential Concerns

### HIGH
- **No environment variable validation at build time**: The project has 15+ environment variables with no type-safe validation. A missing or misconfigured env var would only surface at runtime. Consider adding `@t3-oss/env-nextjs` or a Zod-based env validation schema.
- **`'unsafe-eval'` in Content Security Policy**: Required by Clerk/Convex but significantly weakens script execution security. Monitor for opportunities to remove this as SDKs evolve.

### MEDIUM
- **No bundle analysis tooling**: No `@next/bundle-analyzer` is configured. With heavy dependencies like `recharts` (470KB), `exceljs` (~200KB), and `@xyflow/react` (200KB), bundle size monitoring is important.
- **`Cross-Origin-Embedder-Policy: require-corp`**: This strict COEP may block third-party resources. Verify that Google Fonts, Clerk images, and other external resources load correctly in production.
- **Legacy `X-XSS-Protection` header**: This header is deprecated and ignored by modern browsers. While harmless, it adds no security value.
- **Tiledesk references in tsconfig**: `tiledesk-reference` and `tiledesk-dashboard-reference` in the `exclude` array are stale references to directories that no longer exist. Should be cleaned up for clarity.

### LOW
- **No custom ESLint rules**: The project relies entirely on Next.js presets. Consider adding:
  - `eslint-plugin-jsx-a11y` for accessibility (partially covered by core-web-vitals)
  - `eslint-plugin-import` for import ordering
  - Custom rules for project conventions (e.g., no relative imports in certain directories)
- **No `.nvmrc` or `.node-version`**: No Node.js version is pinned for contributors. Bun version is pinned in `package.json`, but Node.js version (needed for some tooling) is not.
- **`components.json` has empty tailwind config path**: `"config": ""` — correct for Tailwind v4 but may confuse contributors unfamiliar with the v4 migration.
- **Missing `NEXT_PUBLIC_` prefix documentation**: The `.env.example` doesn't clearly explain which variables are build-time (client) vs runtime (server-only), beyond the `NEXT_PUBLIC_` naming convention.
