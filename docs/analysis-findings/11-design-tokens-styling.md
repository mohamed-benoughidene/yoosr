# Part 11: Design Tokens & Styling - Findings

## 📊 Visual Map

```
Styling Configuration
├── postcss.config.mjs          → PostCSS with @tailwindcss/postcss plugin (v4)
├── src/app/globals.css         → ALL design tokens, Tailwind v4 @theme, animations, utilities
├── src/components/landing/     → Landing-specific CSS (landing.css)
│   └── landing.css             → Landing page component styles (hero, design studio, channels)
├── components.json             → shadcn/ui config: default style, slate base, CSS vars enabled
│
├── Design Tokens (DUAL SYSTEM)
│   ├── System A: shadcn/ui (OKLCH, light+dark)
│   │   ├── --background, --foreground, --primary, --secondary, --muted, --accent, --destructive
│   │   ├── --card, --popover, --border, --input, --ring
│   │   ├── --chart-1..5, --sidebar-* (full set)
│   │   ├── --gradient-1..3, --error, --success, --info, --warning
│   │   └── --color-1..5 (MagicUI)
│   │
│   ├── System B: Landing Page (hex/RGBA, dark-first)
│   │   ├── --lp-bg, --lp-surface, --lp-surface-2, --lp-border
│   │   ├── --lp-gold (actually blue #3B82F6), --lp-gold-glow
│   │   ├── --lp-violet, --lp-violet-glow
│   │   └── --lp-text, --lp-text-secondary, --lp-text-muted
│   │
│   ├── Typography
│   │   ├── --font-sans: Inter (default)
│   │   ├── --font-mono: IBM Plex Mono
│   │   ├── --font-serif: Playfair Display
│   │   ├── --font-display: Inter (headings h1-h6)
│   │   ├── --font-cabinet-grotesk: Cabinet Grotesk (600-800, landing headlines)
│   │   ├── --font-noto-naskh-arabic: Arabic support
│   │   └── --font-handwriting: Caveat
│   │
│   ├── Spacing
│   │   └── Standard Tailwind spacing scale (no custom scale defined)
│   │
│   ├── Borders
│   │   └── --radius: 8px (base)
│   │       ├── --radius-xs: 2px (--radius - 6px)
│   │       ├── --radius-sm: 4px (--radius - 4px)
│   │       ├── --radius-md: 6px (--radius - 2px)
│   │       ├── --radius-lg: 8px (--radius)
│   │       └── --radius-xl: 12px (--radius + 4px)
│   │
│   └── Shadows (8-level scale)
│       ├── --shadow-2xs: 0 1px 3px 0px (0.05 alpha)
│       ├── --shadow-xs: 0 1px 3px 0px (0.05 alpha)
│       ├── --shadow-sm: 0 1px 3px + 0 1px 2px (0.10 alpha)
│       ├── --shadow: 0 1px 3px + 0 1px 2px (0.10 alpha)
│       ├── --shadow-md: 0 1px 3px + 0 2px 4px (0.10 alpha)
│       ├── --shadow-lg: 0 1px 3px + 0 4px 6px (0.10 alpha)
│       ├── --shadow-xl: 0 1px 3px + 0 8px 10px (0.10 alpha)
│       └── --shadow-2xl: 0 1px 3px (0.25 alpha)
│
└── Styling Approach
    ├── Tailwind CSS v4         → CSS-based config via @theme inline
    ├── shadcn/ui themes        → 32 UI components, OKLCH tokens
    ├── CSS variables           → Extensive (200+ custom properties)
    ├── CSS Animations          → 35+ @keyframes in globals.css + landing.css
    └── framer-motion           → ONLY in VideoPlayer.tsx (clipPath animation)
```

## 📁 File Inventory

| File | Purpose |
|------|---------|
| `postcss.config.mjs` | PostCSS config with `@tailwindcss/postcss` plugin |
| `src/app/globals.css` | **Central design system** - 600+ lines: tokens, @theme, keyframes, utilities |
| `components.json` | shadcn/ui configuration (default style, slate base, CSS variables) |
| `src/components/landing/landing.css` | Landing page specific styles (hero, design studio, channels sections) |
| `public/fonts/cabinet-grotesk/cabinet-grotesk.css` | Self-hosted Cabinet Grotesk @font-face (woff2, weights 600-800) |
| `src/lib/utils.ts` | `cn()` utility using clsx + tailwind-merge |

## ✅ Analysis Checklist

- [x] **What Tailwind CSS version?** Tailwind CSS v4 (`^4` in package.json). Uses `@tailwindcss/postcss` and CSS-based configuration via `@theme inline` block. No `tailwind.config.*` file exists.

- [x] **How is Tailwind configured?** Via CSS in `globals.css` using `@theme inline { }` block (lines 154-484). Imports: `@import "tailwindcss"`, `@plugin "@tailwindcss/typography"`, `@import "tw-animate-css"`. PostCSS plugin: `@tailwindcss/postcss` in `postcss.config.mjs`.

- [x] **What's the color palette?** DUAL system:
  - **System A (shadcn/ui)**: OKLCH color space. Light mode: `--background: oklch(1 0 0)` (white), `--foreground: oklch(0.141 0.005 285.823)`, `--primary: oklch(0.21 0.006 285.885)` (dark slate), `--destructive: oklch(0.577 0.245 27.325)` (red). Dark mode: inverted OKLCH values. Base color: slate.
  - **System B (Landing)**: Hex/RGBA. `--lp-bg: #0C0B0F`, `--lp-surface: #161420`, `--lp-border: rgba(255,255,255,0.08)`, `--lp-gold: #3B82F6` (actually blue, not gold), `--lp-violet: #6C63FF`, `--lp-text: #F2EFE9` (warm white).

- [x] **Are CSS custom properties used for theming?** Extensively. 200+ custom properties defined in `globals.css`. shadcn tokens mapped to Tailwind via `@theme inline` (e.g., `--color-background: var(--background)`). Landing page uses `var(--lp-*)` directly without Tailwind mapping.

- [x] **Is dark mode supported? How is it toggled?** YES. Library: `next-themes` v0.4.6. CSS: `@custom-variant dark (&:where(.dark, .dark *))` (line 6). Triggered by `.dark` class on `<html>`. Complete dark mode overrides in `.dark` block (lines 101-151) for all shadcn tokens. Theme color meta tags in `layout.tsx` (lines 31-34). **No visible ThemeToggle component found in codebase** - dark mode toggle may not be implemented in the UI yet. Landing page tokens (`--lp-*`) do NOT have dark mode overrides - landing is dark-first by design.

- [x] **What typography setup?** `@tailwindcss/typography` plugin loaded via `@plugin` in globals.css. Font stack via `next/font`:
  - Inter → `--font-sans` (default body text)
  - Playfair Display → `--font-serif`
  - IBM Plex Mono → `--font-mono` (weights 400, 600)
  - Cabinet Grotesk → self-hosted (weights 600-700, 800), used for landing headlines
  - Noto Naskh Arabic → referenced for Arabic support
  - Caveat → handwriting font (referenced but not loaded in root layout)
  - `h1-h6` → `font-display` (Inter), all text → `font-text` (Inter)

- [x] **Are there custom Tailwind utilities?** YES:
  - `@utility container` (lines 497-500): `margin-inline: auto; padding-inline: 2rem;`
  - `.scrollbar-thin` (lines 486-489): Custom 4px scrollbar
  - 3D transform helpers: `.perspective-distant`, `.transform-3d`, `.backface-hidden`, `.rotate-y-180`
  - `.lp-section`, `.lp-label` (landing page section utilities)
  - Custom variants: `data-active`, `data-checked`, `data-unchecked`

- [x] **What's the spacing scale?** Standard Tailwind v4 spacing scale used. No custom spacing scale defined in `@theme inline`. Uses Tailwind's default (0, 1px, 2px, 4px, 8px, 12px, 16px, 24px, 32px, 40px, 48px, 56px, 64px, 80px, 96px, etc.).

- [x] **How are animations handled?** Primarily CSS `@keyframes` (35+ defined). Only 1 file uses framer-motion (`VideoPlayer.tsx` - clipPath animation).
  - **globals.css** defines: `accordion-down/up`, `fade-in-out`, `fade-in`, `progress`, `infinite-slider`, `shadow-ping`, `flip-btn`, `rotate-btn`, `marquee`, `shimmer-slide`, `shine`, `ripple`, `orbit`, `meteor`, `line-shadow`, `aurora`, `slideDown/up/left/right`, `rainbow`
  - **landing.css** defines: `drawEdge`, `nodeAppear`, `badgeEnter`, `wordFade`
  - `tailwindcss-animate` and `tw-animate-css` packages provide additional animation utilities
  - All animations mapped to Tailwind via `--animate-*` in `@theme inline`

- [x] **Are there responsive breakpoints defined?** YES, in `@theme inline`:
  - `sm: 640px`, `md: 768px`, `lg: 1024px`, `xl: 1280px`, `2xl: 1560px`

- [x] **Is there a consistent border radius system?** YES, 5-level scale based on `--radius: 8px`:
  - `--radius-xs: 2px`, `--radius-sm: 4px`, `--radius-md: 6px`, `--radius-lg: 8px`, `--radius-xl: 12px`

- [x] **How are shadows/elevation handled?** 8-level shadow scale (`--shadow-2xs` through `--shadow-2xl`). Uses `hsl(0 0% 0% / alpha)` syntax. Light mode: 0.05-0.10 alpha, dark mode: lower alpha values for subtler shadows. No box-shadow elevation system (e.g., no `--elevation-*` tokens), but shadow scale serves similar purpose.

- [x] **Are design tokens documented?** NO dedicated design system documentation file. Tokens are defined in `globals.css` but not documented externally. No `design-system/` directory exists.

- [x] **Is there a design system file?** NO. The design system is distributed across:
  - `globals.css` (tokens, animations, base styles)
  - `components.json` (shadcn/ui config)
  - `src/components/ui/` (32 shadcn/ui components)
  - `landing.css` (landing page specific tokens and styles)

- [x] **How are component variants styled?** CVA (class-variance-authority) used in **8 UI components**:
  - `button.tsx`: 6 variants (default, destructive, outline, secondary, ghost, link) × 4 sizes
  - `badge.tsx`: 4 variants (default, secondary, destructive, outline)
  - `alert.tsx`: 2 variants (default, destructive)
  - `sheet.tsx`: 4 side variants (top, bottom, left, right)
  - `toggle.tsx`: 2 variants × 3 sizes
  - `sidebar.tsx`: 2 variants × 3 sizes
  - `label.tsx`: no variants (base classes only)
  - `navigation-menu.tsx`: no variants (base classes only)
  - All use `cn()` utility (clsx + tailwind-merge) from `@/lib/utils`

## 📝 Agent Findings

### Dual Design Token System
The project has TWO parallel design token systems that are NOT integrated:
1. **shadcn/ui system**: OKLCH-based, full light/dark support, Tailwind-integrated via `@theme inline`, used by all `src/components/ui/*` components
2. **Landing page system**: Hex/RGBA, dark-first design (no dark mode toggle), used via `var(--lp-*)` directly, NOT mapped to Tailwind

This means landing pages and app pages use completely different color systems with no easy way to unify them.

### Extensive Animation Library
35+ CSS `@keyframes` animations defined across `globals.css` and `landing.css`, all mapped to Tailwind via `--animate-*`. However, framer-motion is included as a dependency but only used in ONE file (`VideoPlayer.tsx`) for a clipPath reveal animation. This suggests either:
- framer-motion was planned for more use but abandoned in favor of CSS animations
- VideoPlayer was a prototype that hasn't been extended to other components

### Typography Hierarchy
- 6 font families configured (Inter, Playfair, IBM Plex Mono, Cabinet Grotesk, Noto Naskh Arabic, Caveat)
- h1-h6 all use `font-display` (Inter) via `@layer base` rule
- Landing page uses Cabinet Grotesk for headlines (800 weight for hero, 700 for sections)
- Arabic support referenced but implementation unclear if actually functional

### shadcn/ui Component Library
32 shadcn/ui components installed, using "default" style variant with "slate" base color. CSS variables enabled. Uses Lucide React for icons. Additional registry: shadcnblocks.com.

### Landing Page CSS
`landing.css` contains 171+ CSS class references across components, with its own animation keyframes (`drawEdge`, `nodeAppear`, `badgeEnter`, `wordFade`) and staggered animation delays for SVG flow diagram visualization.

### Custom Variants
Three custom data-state variants defined: `data-active`, `data-checked`, `data-unchecked` - used for form components that need state-based styling.

### Scroll Lock Fix
Custom override for `body[data-scroll-locked]` to prevent layout shift when modals/sheets open (sets `margin-right: 0px !important`).

## 🔍 Key Patterns to Identify

- **Dual token system**: shadcn/ui (OKLCH, Tailwind-mapped) vs Landing page (hex, direct var() usage)
- **CSS-first animations**: 35+ @keyframes, minimal framer-motion usage (1 file)
- **Tailwind v4 CSS config**: `@theme inline` replaces traditional `tailwind.config.js`
- **CVA for variants**: Consistent pattern across 8 UI components
- **Dark mode via next-themes**: Class-based, but no visible toggle in codebase
- **OKLCH color space**: Modern perceptually-uniform colors for shadcn tokens

## ⚠️ Potential Concerns

| Severity | Concern |
|----------|---------|
| **HIGH** | **Dual token system** - Landing pages (`--lp-*`) and app (`--background`, `--primary`, etc.) use completely separate color systems. No mapping between them makes theming inconsistent and hard to maintain. |
| **HIGH** | **No design system documentation** - 200+ CSS custom properties, 35+ animations, 6 font families, 8-level shadow scale - all undocumented except as raw CSS. No single source of truth for design tokens. |
| **MEDIUM** | **Dark mode toggle missing** - `next-themes` is installed and configured but no ThemeToggle component found in the codebase. Users may not be able to switch themes. |
| **MEDIUM** | **framer-motion underutilized** - Package installed but used in only 1 file. If CSS animations are the chosen approach, framer-motion could be removed to reduce bundle size. If framer-motion was intended, it should be used more broadly. |
| **MEDIUM** | **Landing page has no dark mode** - `--lp-*` variables are dark-first with no light mode override block. If light mode landing page is needed, a full `.dark` inverse system would need to be built. |
| **LOW** | **`--lp-gold` is actually blue** - Variable named `--lp-gold` has value `#3B82F6` (Tailwind blue-500), not gold. Misleading naming. |
| **LOW** | **No custom spacing scale** - Using standard Tailwind spacing, which may not align with the 8px base radius system for consistent design tokens. |
| **LOW** | **Caveat font referenced but not loaded** - `--font-handwriting: "Caveat"` defined in globals.css but not imported via `next/font` in layout.tsx. |
