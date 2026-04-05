# Part 10: Layout & Structural Components - Findings

## 📊 Visual Map

```
src/app/ (Next.js App Router Layout Hierarchy)
├── layout.tsx                      → Root: fonts, viewport, SEO metadata
├── [locale]/
│   ├── layout.tsx                  → Locale: NextIntlClientProvider, RTL, JSON-LD
│   ├── (marketing)/
│   │   └── layout.tsx              → Marketing: MarketingProviders, LandingHeaderNoAuth, LandingFooter
│   ├── dashboard/
│   │   ├── layout.tsx              → Dashboard: Providers, DashboardAuthGuard, PushNotificationInit
│   │   ├── DashboardShell.tsx      → SidebarProvider → AppSidebar → SidebarInset → SiteHeader → AppErrorBoundary
│   │   ├── chat/
│   │   │   ├── layout.tsx          → Chat: locale set
│   │   │   └── ChatShell.tsx       → ThreePanelLayout (desktop) / mobile single-panel toggle
│   │   ├── kb/
│   │   │   ├── layout.tsx          → KB: locale set
│   │   │   └── KbShell.tsx         → Two-panel: list sidebar + main content
│   │   └── settings/
│   │       ├── layout.tsx          → Settings: locale set
│   │       └── SettingsShell.tsx   → Space-y layout with SettingsSidebar
│   ├── design-studio/
│   │   ├── layout.tsx              → Design Studio: Providers, DesignStudioShell
│   │   └── DesignStudioShell.tsx   → Full-screen canvas, admin-only
│   ├── onboarding/
│   │   ├── layout.tsx              → Onboarding: Providers only (bare)
│   ├── test-widget/
│   │   └── layout.tsx              → Test Widget: Providers only (bare)
│   └── ...page routes
├── widget/
│   └── layout.tsx                  → Widget: transparent, h-full w-full, no providers

src/components/layout/ (Reusable Layout Components)
├── ThreePanelLayout.tsx            → Generic 3-panel resizable layout (desktop only)
├── LandingFooter.tsx               → Marketing page footer with brand/legal links + language switcher
└── LandingHeaderNoAuth.tsx         → Marketing page header (logo, Login, CTA) — desktop only

src/components/ (Structural Components)
├── providers.tsx                   → App providers: DirectionProvider → ConvexClientProvider → ProjectProvider
├── MarketingProviders.tsx          → Lightweight providers: DirectionProvider only
├── error-boundary.tsx              → AppErrorBoundary (react-error-boundary wrapper)
├── auth/
│   └── DashboardAuthGuard.tsx      → Client-side auth gate (Clerk useAuth + orgId check)
├── dashboard/
│   ├── AppSidebar.tsx              → Main nav sidebar (org switcher, nav groups, user menu)
│   ├── SiteHeader.tsx              → Top bar (sidebar toggle, page title, project switcher, notifications, availability)
│   └── DashboardAuthGuard.tsx      → Auth guard component
└── settings/
    └── SettingsSidebar.tsx         → Settings-specific sidebar navigation
```

## 📁 File Inventory

| File/Directory | Purpose | Type |
|----------------|---------|------|
| `src/app/layout.tsx` | Root layout — fonts, viewport, SEO metadata | Server component |
| `src/app/[locale]/layout.tsx` | Locale layout — i18n, RTL, JSON-LD | Server component (async) |
| `src/app/[locale]/(marketing)/layout.tsx` | Marketing pages — lightweight providers, header, footer | Server component |
| `src/app/[locale]/dashboard/layout.tsx` | Dashboard root — providers, auth guard, push init | Server component |
| `src/app/[locale]/dashboard/DashboardShell.tsx` | Dashboard shell — sidebar + header + content composition | Client component |
| `src/app/[locale]/dashboard/chat/layout.tsx` | Chat layout — locale propagation | Server component |
| `src/app/[locale]/dashboard/chat/ChatShell.tsx` | Chat shell — three-panel or mobile single-panel | Client component |
| `src/app/[locale]/dashboard/kb/layout.tsx` | KB layout — locale propagation | Server component |
| `src/app/[locale]/dashboard/kb/KbShell.tsx` | KB shell — two-panel list + content | Client component |
| `src/app/[locale]/dashboard/settings/layout.tsx` | Settings layout — locale propagation | Server component |
| `src/app/[locale]/dashboard/settings/SettingsShell.tsx` | Settings shell — sidebar + content | Client component |
| `src/app/[locale]/design-studio/layout.tsx` | Design studio — providers, full-screen shell, admin-only | Server component |
| `src/app/[locale]/design-studio/DesignStudioShell.tsx` | Design studio shell — full-screen canvas | Client component |
| `src/app/[locale]/onboarding/layout.tsx` | Onboarding — bare providers | Server component |
| `src/app/[locale]/test-widget/layout.tsx` | Test widget — bare providers | Server component |
| `src/app/widget/layout.tsx` | Widget — transparent, no providers | Client component |
| `src/components/layout/ThreePanelLayout.tsx` | Generic 3-panel resizable layout | Client component |
| `src/components/layout/LandingFooter.tsx` | Marketing footer | Client component |
| `src/components/layout/LandingHeaderNoAuth.tsx` | Marketing header | Client component |
| `src/components/providers.tsx` | App-wide providers composition | Client component |
| `src/components/MarketingProviders.tsx` | Marketing-only providers | Client component |
| `src/components/error-boundary.tsx` | Error boundary wrapper | Client component |
| `src/components/auth/DashboardAuthGuard.tsx` | Auth gate for dashboard | Client component |
| `src/components/dashboard/AppSidebar.tsx` | Main navigation sidebar | Client component |
| `src/components/dashboard/SiteHeader.tsx` | Dashboard top bar | Client component |
| `src/components/settings/SettingsSidebar.tsx` | Settings navigation sidebar | Client component |

## ✅ Analysis Checklist

### [x] What's the layout hierarchy? (root → group → page)
**Four-level hierarchy:**

1. **Root** (`/app/layout.tsx`): Purely structural — Inter + Playfair Display + IBM Plex Mono fonts, viewport, SEO metadata (OpenGraph, Twitter cards, alternates for en/ar/fr). CSS variables applied to `body` via font class. `suppressHydrationWarning` on `html` and `body`. No providers, no auth.

2. **Locale** (`[locale]/layout.tsx`): i18n boundary — `NextIntlClientProvider`, `HtmlDirSetter` (RTL/LTR), `JsonLd` structured data (Organization, WebSite, SoftwareApplication, FAQPage schemas). `unstable_setRequestLocale(locale)` + `generateStaticParams()` for en/ar/fr. `dynamic = "force-dynamic"` overrides static generation. Server component — fetches messages via `getMessages()`.

3. **Route group layouts**: Each route group adds its own provider shell and chrome:
   - **(marketing)**: `MarketingProviders` → `LandingHeaderNoAuth` → `{children}` → `LandingFooter`
   - **dashboard**: `Providers` → `DashboardAuthGuard` → `DashboardShell` → `{children}` + `PushNotificationInit`
   - **design-studio**: `Providers` → `DesignStudioShell` → `{children}`
   - **onboarding/test-widget**: `Providers` → `{children}` (bare)
   - **widget**: No providers, transparent background

4. **Feature sub-layouts**: Chat, KB, Settings nest their own shells for domain-specific layouts within the dashboard.

### [x] How are layouts composed? (header, sidebar, main, footer)
**Dashboard composition** (`DashboardShell.tsx`):
```
SidebarProvider (cookie: sidebar_state, 7-day expiry, Cmd/Ctrl+B shortcut)
  ├── AppSidebar (left sidebar)
  │   ├── SidebarHeader → OrgSwitcher (Clerk org switcher)
  │   ├── SidebarContent → 3 nav groups: Main, AI, Data
  │   └── SidebarFooter → NavUser (avatar, settings, language, feedback, logout)
  └── SidebarInset (main content area)
      ├── SiteHeader (top bar)
      │   ├── SidebarTrigger (toggle)
      │   ├── Page title (from PAGE_LABELS mapping + useTranslations)
      │   └── Right: ProjectSwitcher, NotificationBell, Availability Switch
      └── AppErrorBoundary
          └── {children}
```

**Marketing composition** (`(marketing)/layout.tsx`):
```
MarketingProviders (DirectionProvider + Toaster)
  ├── LandingHeaderNoAuth (fixed top bar: logo, Login, CTA)
  ├── {children} (flex-1)
  └── LandingFooter (brand info, legal links, language switcher)
```

**Widget composition** (`/widget/layout.tsx`):
```
<div className="h-full w-full overflow-hidden bg-transparent">
  {children}
</div>
```

### [x] Are layouts using Next.js App Router layout conventions?
**Yes, fully:**

1. **Server component layouts**: All route-level `layout.tsx` files are server components (async where needed).

2. **Nested layouts**: Child layouts wrap `{children}` — e.g., `dashboard/chat/layout.tsx` wraps `ChatShell` around its page children.

3. **Route groups**: `(marketing)` is a route group — affects URL structure but not file paths.

4. **Dynamic rendering**: `export const dynamic = "force-dynamic"` on dashboard and locale layouts — never statically pre-rendered.

5. **Locale handling**: `generateStaticParams()` declares en/ar/fr, `unstable_setRequestLocale(locale)` sets request locale per render.

6. **Metadata**: Root layout exports `metadata` object (SEO, OpenGraph, Twitter). No per-route metadata overrides observed.

### [x] Is there responsive design for different screen sizes?
**Yes, with varying coverage:**

| Layout | Mobile Behavior | Desktop Behavior |
|--------|----------------|------------------|
| **Dashboard sidebar** | Collapses to `Sheet` drawer via `useIsMobile` hook | Fixed sidebar with collapsible modes |
| **Three-panel chat** | Single-panel toggle view via `mobileView` state (list | chat | contact) | Three resizable panels (20%/55%/25%) |
| **KB layout** | `flex-col` stacked | `flex-row` at `md:` breakpoint |
| **Settings** | `flex-col` stacked | `lg:flex-row` with fixed `lg:w-48` sidebar |
| **Marketing footer** | `flex-col` stacked | `md:flex-row` space-between |
| **Marketing header** | ❌ No responsive adaptation | Fixed 56px top bar, inline styles |
| **ThreePanelLayout** | ❌ Desktop only (`hidden lg:flex`) | Three resizable panels |
| **Design studio** | Full-screen (no responsive needed) | Full-screen |

**Tailwind breakpoints used:** `md:` (768px), `lg:` (1024px)

### [x] How is navigation structured?
**Primary navigation** (`AppSidebar.tsx`):
- Three nav groups:
  - **Group 1** (no title): Dashboard, Monitor, Chat, Requests, Orders
  - **Group 2** (AI): Bots, Knowledge Base
  - **Group 3** (Data): Analytics (hidden for non-admins), Activities, History, Contacts
- `side={locale === "ar" ? "right" : "left"}` — RTL support
- Org switcher in header (Clerk organization switcher)
- User menu in footer (avatar, settings, language switcher, feedback modal, logout)

**Secondary navigation** (`SettingsSidebar.tsx`):
- Vertical stack: Project Settings, Widget Setup, Departments, Canned Responses, Labels, Operating Hours, Webhooks, Integrations

**Top bar** (`SiteHeader.tsx`):
- Sidebar toggle, page title, ProjectSwitcher, NotificationBell, Availability Switch

**Marketing navigation** (`LandingHeaderNoAuth.tsx`):
- Minimal: Logo (pushes to `/`), Login button, Get Early Access button
- No nav links, no hamburger menu

**No breadcrumb system** anywhere in the codebase.

### [x] Are there persistent layouts across routes?
**Yes:**

1. **Dashboard layout** persists across all `/dashboard/*` routes — sidebar state (collapsed/expanded) persists via cookie (`sidebar_state`, 7-day expiry).

2. **Layout state persistence**: `ThreePanelLayout` uses `autoSaveId="dashboard-chat-layout"` for panel size persistence. `ResizablePanelGroup` from `react-resizable-panels` handles this.

3. **Locale persists** across all `[locale]/*` routes via `NextIntlClientProvider`.

### [x] How is layout state managed? (collapsible sidebar, etc.)
**Three state management patterns:**

1. **Cookie-based** (sidebar state):
   - `SidebarProvider` manages `open`/`openMobile`/`state`/`isMobile`
   - Cookie: `sidebar_state`, 7-day max-age
   - Keyboard shortcut: `Cmd/Ctrl + B`
   - CSS custom properties: `--sidebar-width` (16rem), `--sidebar-width-icon` (3rem), `--sidebar-width-mobile` (18rem)

2. **Local state** (mobile view, dialogs):
   - `ChatShell.tsx`: `useState` for `mobileView` ('list' | 'chat' | 'contact')
   - `KbShell.tsx`: `useState` for create/delete dialog open state
   - Settings shell: no local state — delegates to page components

3. **Context-based** (project, auth, direction):
   - `ProjectProvider`: Context for active project
   - `DirectionProvider`: Context for RTL/LTR direction
   - `SidebarProvider`: Context for sidebar state

**Online presence**: `DashboardShell` calls `updateHeartbeat` mutation on mount + every 30s interval.

### [x] Are there layout variants? (authenticated vs public)
**Yes, distinct variants:**

| Aspect | Authenticated (Dashboard) | Public (Marketing) |
|--------|--------------------------|-------------------|
| Providers | Convex + ProjectContext + DirectionProvider | DirectionProvider only |
| Header | SiteHeader (sidebar toggle, project switcher, notifications, availability) | LandingHeaderNoAuth (logo, Login, CTA) |
| Sidebar | AppSidebar (full nav, org switcher, user menu) | None |
| Footer | None | LandingFooter (brand, legal, language switcher) |
| Auth guard | DashboardAuthGuard | None |
| Font strategy | Inter + Playfair + IBM Plex Mono | Cabinet Grotesk + Noto Naskh Arabic |
| Theme | shadcn/ui CSS variables | Custom `--lp-*` CSS variables |
| RTL | Full support | Partial (font class conditional) |
| `dynamic` | `force-dynamic` | Not set (can be static) |

**Other variants:**
- **Design studio**: Full-screen, no sidebar/header, admin-only with redirect
- **Onboarding/test-widget**: Bare providers, no chrome
- **Widget**: Transparent, no providers, no i18n

### [x] How are breadcrumbs handled? (if present)
**No breadcrumb system exists.** Deep nesting (e.g., dashboard/settings/widget) has no visual navigation hierarchy beyond the settings sidebar active state. Page context is communicated via the `SiteHeader` page title label (derived from `PAGE_LABELS` mapping).

### [x] Is there a consistent page wrapper?
**Within each shell, yes — but shells differ:**

1. **Dashboard**: `div.flex-1 flex-col gap-4 p-4 pt-0` inside `AppErrorBoundary`
2. **Settings**: `div.space-y-6` → title + description → separator → sidebar + content
3. **Chat**: Full-height panels, no padding
4. **KB**: `h-[calc(100vh-60px)]`, no padding
5. **Design studio**: `h-screen w-full bg-background`, no padding

**No unified page wrapper component** — each shell defines its own padding/spacing.

### [x] How are layout components tested?
**No test files found** for any layout component. No `.test.tsx`, `.spec.tsx`, or Playwright E2E tests observed for layout rendering, responsive breakpoints, or navigation behavior.

### [x] Are layout components reusable or route-specific?
**Mixed:**

1. **Reusable**:
   - `ThreePanelLayout.tsx` — generic, used by chat and potentially other features
   - `AppErrorBoundary` — used in dashboard, settings, and other shells
   - `LandingFooter.tsx` — used only in marketing layout, but designed as standalone
   - `LandingHeaderNoAuth.tsx` — same

2. **Route-specific**:
   - `DashboardShell.tsx` — only for dashboard
   - `ChatShell.tsx` — only for chat
   - `KbShell.tsx` — only for KB
   - `SettingsShell.tsx` — only for settings
   - `DesignStudioShell.tsx` — only for design studio
   - `AppSidebar.tsx` — only for dashboard
   - `SiteHeader.tsx` — only for dashboard

**Shell pattern consistency**: Each feature shell follows a consistent pattern (state management + error boundary + children), making new feature layouts predictable to implement.

## 📝 Agent Findings

### Layout Hierarchy Philosophy
Clean layered approach where each level adds exactly what it needs:
1. Root = fonts + metadata (structural only)
2. Locale = i18n + RTL (cultural boundary)
3. Route group = providers + chrome (functional boundary)
4. Feature shell = domain-specific layout (feature boundary)

This creates clear separation of concerns. No layout file is bloated with concerns from other layers.

### Provider Architecture
Two provider trees with intentional separation:
- **Authenticated**: `DirectionProvider(dir)` → `ConvexClientProvider` → `ProjectProvider` → `{children}` + `AppToaster`
- **Marketing**: `DirectionProvider(dir)` → `{children}` + `MarketingToaster`

The separation means marketing pages don't load Convex (performance optimization) but also means shared providers must be duplicated.

### Font Strategy
Three font strategies coexist:
1. **Dashboard/authenticated**: Inter + Playfair Display + IBM Plex Mono (loaded in root layout)
2. **Marketing**: Cabinet Grotesk (local font files) + Noto Naskh Arabic (conditional on `locale === "ar"`)
3. **Widget**: No custom fonts — inherits system fonts

Marketing fonts are loaded in `(marketing)/layout.tsx` via `next/font/local` and `next/font/google`.

### Sidebar Architecture
The sidebar (`AppSidebar.tsx`) is a well-organized composition:
- Nav items organized in 3 groups with clear labels
- RTL support via `side` prop from locale
- Role-based visibility (Analytics hidden for non-admins, Settings menu only for admins)
- Online presence via `useQuery(api.profiles.getMe)` and `useMutation(api.profiles.setAvailability)`
- Locale redirect: if user's `unsafeMetadata.locale` differs from current, redirects

### Shell Component Patterns
Each feature shell follows a consistent pattern:
1. Locale propagation (`setRequestLocale(locale)`)
2. Error boundary wrapping
3. Domain-specific layout (sidebar, panels, spacing)
4. Admin checks where applicable (DesignStudioShell, SettingsShell)

## 🔍 Key Patterns to Identify

### Layout Composition Strategies
- Server component layout files wrap client component shells
- Shells compose shadcn/ui layout primitives (SidebarProvider, ResizablePanelGroup)
- Each shell manages its own state (dialogs, mobile view) or delegates to context

### Responsive Design Approach
- `md:` (768px) for KB, marketing footer
- `lg:` (1024px) for dashboard sidebar collapse, three-panel layout, settings sidebar
- Mobile fallbacks vary: Sheet drawer, single-panel toggle, stacked layout
- Marketing header has NO responsive adaptation

### Navigation Patterns
- Primary: shadcn/ui sidebar with grouped nav items + org switcher + user menu
- Secondary: Settings sidebar for settings subsections
- Top bar: sidebar toggle + page context + project switcher + notifications + availability
- Marketing: minimal header with Login + CTA only

### Layout Hierarchy Philosophy
- Root = structural (fonts, metadata)
- Locale = cultural (i18n, RTL, JSON-LD)
- Route group = functional (providers, chrome)
- Feature shell = domain-specific (layout, state, guards)

### State Management in Layouts
- Cookie: sidebar state (7 days), layout panel sizes
- Local: mobile view, dialog open state
- Context: project, auth, direction, sidebar
- Interval: presence heartbeat (30s)

## ⚠️ Potential Concerns

| # | Concern | Severity | Details |
|---|---------|----------|---------|
| 1 | **No mobile navigation for marketing pages** | MEDIUM | `LandingHeaderNoAuth` has zero responsive adaptation — no hamburger menu, no mobile-friendly navigation. On small screens, users get a fixed 56px bar with no way to access nav links beyond Login and CTA buttons. |
| 2 | **`ThreePanelLayout` is desktop-only** | MEDIUM | Only renders on `lg:` screens (`hidden lg:flex`) with no built-in mobile fallback. Consumers must implement their own mobile handling (as `ChatShell` does). This should either include a mobile pattern or document the requirement clearly. |
| 3 | **Inconsistent header styling** | LOW | `LandingHeaderNoAuth` uses inline styles with CSS variables (`--lp-bg`, `--lp-border`, etc.) and JS hover handlers (`onMouseEnter`/`onMouseLeave`), while everything else uses Tailwind classes. Inconsistent with the rest of the codebase. |
| 4 | **Duplicate providers** | LOW | `Providers` and `MarketingProviders` are similar but separate. If a new shared provider is needed (e.g., analytics, feature flags), it must be added to both. Consider a shared base provider. |
| 5 | **No breadcrumb system** | LOW | Deep nesting has no visual navigation hierarchy. Users in dashboard/settings/webhooks have no way to see their position in the hierarchy beyond the settings sidebar active state. |
| 6 | **Loading states vary across shells** | LOW | Some shells show spinners (DashboardAuthGuard), some show null (ChatShell Suspense), some show skeletons (SettingsShell admin check). No unified loading pattern. |
| 7 | **SettingsShell admin check shows spinner during redirect** | LOW | Non-admins see a loading spinner briefly before being redirected to `/dashboard`. This creates a potential flash. Should redirect immediately or show a "not authorized" message. |
| 8 | **DashboardShell heartbeat logic in layout** | LOW | `updateHeartbeat` mutation on mount + 30s interval is implemented in the layout shell component. This belongs in a hook or provider, not a layout component. Makes the layout harder to test and reuse. |
| 9 | **No layout component tests** | LOW | Zero test coverage for layout rendering, responsive behavior, navigation structure, or auth guard behavior. Layout bugs would only be caught manually. |
| 10 | **Locale redirect in DashboardShell** | LOW | Locale redirect logic (checking `unsafeMetadata.locale` vs current locale) is in a client component shell. This causes a client-side redirect flicker rather than a server-side redirect. Could be moved to middleware. |
