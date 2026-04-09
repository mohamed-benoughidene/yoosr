# Part 10: Layout & Structural Components

## 📊 Visual Map

```
src/app/
├── layout.tsx             → Root layout (Sets global HTML attributes, Meta, Viewport, Web Manifest)
└── [locale]/
    ├── layout.tsx         → Locale-aware layout wrapper (NextIntl, HtmlDirSetter, JsonLd)
    ├── (marketing)/
    │   └── layout.tsx     → Marketing site layout (Headers, Footers, SEO)
    └── dashboard/
        ├── layout.tsx     → Authenticated wrap layer (DashboardAuthGuard, PushNotificationInit)
        └── DashboardShell.tsx → Application shell mapping (SidebarProvider, AppSidebar, SiteHeader)

src/components/
├── layout/
│   ├── LandingHeaderNoAuth.tsx  → Public marketing header (sticky top nav, locale switch trigger)
│   ├── LandingFooter.tsx        → Public marketing footer
│   └── ThreePanelLayout.tsx     → Resizable 3-pane layout powered by ResizablePanelGroup
└── dashboard/
    ├── SiteHeader.tsx           → Dashboard top nav (ProjectSwitcher, NotificationBell, Availability Switch)
    └── AppSidebar.tsx           → Dashboard side nav (Dynamic grouping, OrgSwitcher, Language/User actions)
```

## 📁 File Inventory

| File/Directory | Purpose |
|----------------|---------|
| `src/app/layout.tsx` | High-level HTML structure, metadata logic, Inter font loading, global styling |
| `src/app/[locale]/layout.tsx` | Root localization entry, `NextIntlClientProvider` mapping, directional rendering |
| `src/app/[locale]/(marketing)/layout.tsx` | Lightweight marketing layout containing `LandingHeaderNoAuth`, `main` section, `LandingFooter` |
| `src/app/[locale]/dashboard/layout.tsx` | Dashboard-specific secure context loading provider boundaries, preventing unauth viewing |
| `src/app/[locale]/dashboard/DashboardShell.tsx` | Structuring `SidebarProvider` next to `SidebarInset` rendering `AppSidebar` and `SiteHeader` |
| `src/components/layout/ThreePanelLayout.tsx` | Extensible 3-panel component leveraging generic resizing handlers. Includes generic component Fallbacks |
| `src/components/dashboard/SiteHeader.tsx` | Authenticated dynamic App Header for the active sub-routes with `Switch` controls |
| `src/components/dashboard/AppSidebar.tsx` | Specialized AppSidebar using Shadcn UI definitions, parsing dynamic pathnames to update active states |

## ✅ Analysis Checklist

- [x] What's the layout hierarchy? (root → group → page)
  - Layout executes globally (`app/layout.tsx`), cascades into `[locale]`, then forks down to `/(marketing)` (for public visitors) and `/dashboard` (for secured project activity).
- [x] How are layouts composed? (header, sidebar, main, footer)
  - Public paths are purely top-to-bottom structures via flexbox (`header`, `main`, `footer`).
  - Authenticated paths (Dashboard) deploy the `SidebarProvider` to create classic SaaS sidebar/header splits with `SidebarInset`.
- [x] Are layouts using Next.js App Router layout conventions?
  - Yes. Heavily reliant on nested layout compositions using children passing.
- [x] Is there responsive design for different screen sizes?
  - Yes. Dashboard elements like `AppSidebar` are intrinsically bound to responsive behaviors (e.g. collapsing on mobile utilizing shadcn's Sidebar generic API).
- [x] How is navigation structured?
  - Defined in `AppSidebar.tsx` using an Array map technique grouping categories (`group_ai`, `group_data`) and conditionally rendering UI parts based on user roles (`isAdmin`).
- [x] Are there persistent layouts across routes?
  - Yes, the DashboardShell ensures Sidebar and Header states remain persistent while individual tabs re-render within `<main> / children`.
- [x] How is layout state managed? (collapsible sidebar, etc.)
  - Managed by Context (Shadcn `SidebarProvider`). `ThreePanelLayout` maintains local layout state via `autoSaveId={autoSaveId}` to allow browser persistence between refreshes.
- [x] Are there layout variants? (authenticated vs public)
  - Very obvious separation. `(marketing)` layout and `dashboard` layout handle highly distinct variants of components.
- [x] How are breadcrumbs handled? (if present)
  - A quasi-breadcrumb is evaluated in `SiteHeader.tsx` via `getPageLabel(pathname)`. Actual `<nav>` breadcrumbs are not in active layout use.
- [x] Is there a consistent page wrapper?
  - Yes. Dashboard renders inside `<div className="flex flex-1 flex-col gap-4 p-4 pt-0">`.
- [x] How are layout components tested?
  - Not explicitly noted testing architectures inside the component definitions.
- [x] Are layout components reusable or route-specific?
  - Many are route-specific (e.g. `LandingHeaderNoAuth` strictly targets marketing). Some are abstract layout providers (e.g., `ThreePanelLayout.tsx`) designed to be generalized templates across multiple authenticated pages.

## 📝 Agent Findings

### NextIntl Handling
The NextIntl provider wraps at the root of `[locale]/layout.tsx` enforcing client/server hydration boundaries effectively before Next.js parses its dashboard or marketing specific layouts.

### Right-to-Left Capability
There is a custom `<HtmlDirSetter>` invoked inside Locale structures and `AppSidebar` inherently adjusts orientation properties (`side` value adjusts if locale is Arabic) giving the Layout robust international styling out-of-the-box.

### `ThreePanelLayout` Abstraction
Rather than explicitly building the HelpDesk panels manually, the app correctly implements a generic `ThreePanelLayout` component combining React Suspense boundaries, `<ResizablePanelGroup>`, and standardized error boundary wrapping.

## 🔍 Key Patterns to Identify
- **RTL Adaptive Interfaces:** The layout infrastructure utilizes language-sensing to auto-configure components (e.g., switching sidebars and font weights/styles to Arabic specifically when detected).
- **Localized Path Mapping:** Navigation within sidebars handles prefix paths for localization properly (`pathname?.startsWith(item.href + "/")`).
- **Separation of Authorization Logic:** The marketing site deliberately uses static components (like `LandingHeaderNoAuth`) rather than fetching complex Clerk instances for state where not required. Dashboard layouts run through wrappers to ensure auth.

## ⚠️ Potential Concerns to Watch For
- **LOW:** The component `<SiteHeader>` uses a local string lookup map for Breadcrumbs (`PAGE_LABELS`). If developers add new routes to Sidebar but forget to append them to the specific `PAGE_LABELS` variable, the SiteHeader route title will incorrectly default to "Dashboard".
- **LOW:** In NextJS 15, `params` objects are awaited promises. The layout files correctly `.then`/`await` these objects for Locale variables, maintaining compatibility with React 19 methodologies. No explicit concern, but requires discipline when building further.
