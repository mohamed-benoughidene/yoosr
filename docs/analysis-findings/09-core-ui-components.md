# Part 09: Core UI Components — Analysis Findings

## 📊 Visual Map

```
src/components/
├── ui/                              → 32 shadcn/ui base components
│   ├── button.tsx                   → CVA variants (default/destructive/outline/secondary/ghost/link × sm/default/lg/icon)
│   ├── input.tsx                    → Simple forwardRef wrapper, no variants
│   ├── textarea.tsx                 → Simple forwardRef wrapper, no variants
│   ├── label.tsx                    → CVA variants, wraps @radix-ui/react-label
│   ├── checkbox.tsx                 → Radix checkbox with Lucide Check icon
│   ├── switch.tsx                   → Radix switch, RTL-aware thumb translation
│   ├── radio-group.tsx              → Radix radio group with Lucide Circle indicator
│   ├── select.tsx                   → Full Radix select with scroll buttons, Lucide icons
│   ├── dialog.tsx                   → Radix dialog with Cross2Icon from @radix-ui/react-icons
│   ├── alert-dialog.tsx             → Radix alert dialog, composes buttonVariants from button.tsx
│   ├── sheet.tsx                    → CVA side variants (top/bottom/left/right), Radix dialog primitive
│   ├── popover.tsx                  → Simple Radix popover
│   ├── accordion.tsx                → Radix accordion with Lucide ChevronDown
│   ├── tabs.tsx                     → Radix tabs primitive
│   ├── tooltip.tsx                  → Radix tooltip primitive
│   ├── badge.tsx                    → CVA variants (default/secondary/destructive/outline)
│   ├── alert.tsx                    → CVA variants (default/destructive), role="alert"
│   ├── card.tsx                     → Compound components (Card/Header/Title/Description/Content/Footer)
│   ├── avatar.tsx                   → Radix avatar with Image/Fallback
│   ├── table.tsx                    → Compound table components (Header/Body/Footer/Row/Head/Cell/Caption)
│   ├── dropdown-menu.tsx            → Full Radix dropdown with sub-menus, checkbox/radio items, shortcuts
│   ├── navigation-menu.tsx          → Radix nav menu with CVA trigger style, viewport, indicator
│   ├── scroll-area.tsx              → Radix scroll area with custom ScrollBar
│   ├── separator.tsx                → Radix separator, horizontal/vertical
│   ├── progress.tsx                 → ⚠️ CUSTOM: added indicatorClassName prop for dynamic color (UsageCard)
│   ├── toggle.tsx                   → CVA variants (default/outline × sm/default/lg)
│   ├── toggle-group.tsx             → Context-based variant/size sharing, reuses toggleVariants
│   ├── calendar.tsx                 → react-day-picker wrapper, integrates Button component, full RTL support
│   ├── resizable.tsx                → react-resizable-panels wrapper with Lucide GripVertical handle
│   ├── sidebar.tsx                  → ⚠️ HEAVY: full sidebar system with context, cookie, keyboard shortcut, mobile sheet
│   └── skeleton.tsx                 → Simple pulse animation div
│
├── activities/                      → 2 files (data table + columns)
├── analytics/                       → 5 files (charts, CSAT, quotas)
├── auth/                            → 1 file (DashboardAuthGuard)
├── chat/                            → 2 files (ChatArea, ConversationList)
├── dashboard/                       → 14 files (sidebar, header, bots, contacts, kb, monitor)
├── design-studio/                   → 26 files (flow editor, 18 node types, panels)
├── feedback/                        → 1 file (FeedbackModal)
├── landing/                         → 13 files (hero, features, pricing teaser, etc.)
├── layout/                          → 2 files (LandingFooter, LandingHeaderNoAuth)
├── pricing/                         → 1 file (PricingTable)
├── seo/                             → 1 file (JsonLd)
├── settings/                        → 3 files (OpenRouterCard, SettingsSidebar, UsageCard)
└── (root)                           → 9 files (providers, language switchers, etc.)
```

## 📁 File Inventory

| Directory | Purpose | File Count |
|-----------|---------|------------|
| `src/components/ui/` | shadcn/ui base components (32 components) | 32 |
| `src/components/activities/` | Activity data table | 2 |
| `src/components/analytics/` | Analytics charts and metrics | 5 |
| `src/components/auth/` | Auth guard for dashboard | 1 |
| `src/components/chat/` | Chat area and conversation list | 2 |
| `src/components/dashboard/` | Dashboard layout, bots, contacts, kb, monitor | 14 |
| `src/components/design-studio/` | Flow editor with 18 node types | 26 |
| `src/components/feedback/` | Feedback modal | 1 |
| `src/components/landing/` | Landing page sections | 13 |
| `src/components/layout/` | Landing footer and header | 2 |
| `src/components/pricing/` | Pricing table | 1 |
| `src/components/seo/` | JSON-LD structured data | 1 |
| `src/components/settings/` | Settings UI cards and sidebar | 3 |
| `src/components/` (root) | Providers, language switchers, push init | 9 |
| `design-system/yoosr/MASTER.md` | Design system documentation | 1 |
| `components.json` | shadcn/ui configuration | 1 |

**Total: 113 component files** (32 UI + 81 custom)

## ✅ Analysis Checklist

### What shadcn/ui components are installed?

**32 shadcn/ui components installed.** Complete inventory:

| Category | Components |
|----------|-----------|
| **Buttons/Actions** | `button`, `toggle`, `toggle-group` |
| **Inputs** | `input`, `textarea`, `label`, `checkbox`, `switch`, `radio-group`, `select` |
| **Overlays** | `dialog`, `alert-dialog`, `sheet`, `popover`, `tooltip`, `dropdown-menu` |
| **Navigation** | `tabs`, `navigation-menu`, `sidebar`, `scroll-area` |
| **Layout** | `card`, `separator`, `resizable`, `accordion` |
| **Data Display** | `table`, `badge`, `avatar`, `progress`, `alert`, `skeleton` |
| **Date/Time** | `calendar` |

All components use the shadcn/ui `"default"` style (not `"new-york"`) as configured in `components.json`. Icon library is **Lucide** (`"iconLibrary": "lucide"`).

### Are components customized or default?

**Mostly default shadcn/ui patterns with strategic customizations:**

1. **`progress.tsx`** — The ONLY component with a documented custom modification. Added `indicatorClassName` prop to allow dynamic color support (used by `UsageCard` in settings). File header explicitly warns: *"Do not overwrite with npx shadcn without re-applying this change."*

2. **`sidebar.tsx`** — Standard shadcn sidebar (generated), but notably includes:
   - Cookie-based state persistence (`sidebar_state` cookie, 7-day max-age)
   - Keyboard shortcut (`Ctrl/Cmd + B`) for toggle
   - `SKELETON_WIDTH` uses `Math.random()` at module load (potential SSR hydration issue)
   - RTL support via `useIsMobile` hook and `data-side` attributes
   - Extensive `data-sidebar="*"` attributes for styling hooks

3. **All other UI components** — Use stock shadcn/ui patterns with Tailwind CSS utility class customization via `cn()` and CVA variants. No structural changes detected.

4. **Tailwind config** — Uses `tailwind.config.ts` with CSS variables (`cssVariables: true`), `slate` base color, and Tailwind v4 (`"tailwindcss": "^4"` in package.json).

### What's the component customization strategy?

**Strategy: CVA (class-variance-authority) + `cn()` utility**

- All variant-based components (`button`, `badge`, `toggle`, `alert`, `label`, `sheet`) use **CVA** (`cva()`) to define variant and size scales
- The `cn()` utility (`src/lib/utils.ts`) merges `clsx()` + `twMerge()` for conflict-free Tailwind class composition
- Customization is done via the `className` prop on every component, merged with internal classes via `cn(internalClasses, className)`
- Components accept `React.ComponentProps<"element">` or `React.ComponentPropsWithoutRef<typeof RadixPrimitive>` for full prop transparency
- No HOC patterns, no render props — purely composition through props and CVA variants

**CVA-powered components (6 total):**
1. `button.tsx` — `buttonVariants` (4 variants × 4 sizes)
2. `badge.tsx` — `badgeVariants` (4 variants)
3. `toggle.tsx` — `toggleVariants` (2 variants × 3 sizes)
4. `alert.tsx` — `alertVariants` (2 variants)
5. `label.tsx` — `labelVariants` (1 base style)
6. `sheet.tsx` — `sheetVariants` (4 side variants)

### Are there custom components beyond shadcn/ui?

**Yes, 81 custom application components** organized by feature domain:

| Feature Directory | Count | Description |
|-------------------|-------|-------------|
| `design-studio/` | 26 | Flow editor (6 panels + 18 node types + 2 shared) |
| `dashboard/` | 14 | App sidebar, header, notification, bots, contacts, KB, monitor |
| `landing/` | 13 | Hero, features, pricing teaser, social proof, etc. |
| `analytics/` | 5 | Charts (recharts), CSAT, quotas, unanswered queries |
| `settings/` | 3 | OpenRouterCard, SettingsSidebar, UsageCard |
| `activities/` | 2 | TanStack Table data table + column definitions |
| `chat/` | 2 | ChatArea, ConversationList |
| `layout/` | 2 | LandingFooter, LandingHeaderNoAuth |
| `feedback/` | 1 | FeedbackModal |
| `auth/` | 1 | DashboardAuthGuard |
| `pricing/` | 1 | PricingTable |
| `seo/` | 1 | JsonLd |
| Root components | 9 | Providers, language switchers, push notification init |

**Notable non-shadcn dependencies used in custom components:**
- `@xyflow/react` — Flow node rendering in design-studio
- `recharts` — Analytics charts
- `@tanstack/react-table` — Activities data table
- `sonner` — Toast notifications (`Toaster` in providers)
- `framer-motion` — Animations (likely in landing components)

### How are component props typed?

**Three distinct typing patterns:**

1. **`React.forwardRef` with native element props** (most common in `ui/`):
   ```ts
   const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>
   const Card = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>
   ```

2. **Radix primitive props with `ComponentPropsWithoutRef`** (for Radix-wrapped components):
   ```ts
   const Checkbox = React.forwardRef<
     React.ElementRef<typeof CheckboxPrimitive.Root>,
     React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>
   >
   ```

3. **CVA `VariantProps` intersection** (for variant-based components):
   ```ts
   function Button({
     className, variant, size, asChild = false, ...props
   }: React.ComponentProps<"button"> & VariantProps<typeof buttonVariants> & { asChild?: boolean })
   ```

4. **Custom interface extensions** (in feature components):
   ```ts
   interface ErrorFallbackProps {
       message?: string
       reset: () => void
       homeHref: string
   }
   ```

5. **Generic types for form components** (`form.tsx`):
   ```ts
   type FormFieldContextValue<TFieldValues extends FieldValues, TName extends FieldPath<TFieldValues>>
   const FormField = <TFieldValues extends FieldValues, TName extends FieldPath<TFieldValues>>({...})
   ```

**Type safety level:** High. All components use TypeScript with explicit generic types, forwardRef patterns, and proper Radix type inheritance.

### Is there consistent use of Radix primitives?

**Yes, very consistent.** 22 Radix packages are installed and used:

| Radix Package | UI Component |
|---------------|-------------|
| `@radix-ui/react-accordion` | `accordion.tsx` |
| `@radix-ui/react-alert-dialog` | `alert-dialog.tsx` |
| `@radix-ui/react-avatar` | `avatar.tsx` |
| `@radix-ui/react-checkbox` | `checkbox.tsx` |
| `@radix-ui/react-collapsible` | (dependency, used in sidebar) |
| `@radix-ui/react-dialog` | `dialog.tsx`, `sheet.tsx`, `alert-dialog.tsx` |
| `@radix-ui/react-direction` | `providers.tsx` (RTL support) |
| `@radix-ui/react-dropdown-menu` | `dropdown-menu.tsx` |
| `@radix-ui/react-icons` | `dialog.tsx` (Cross2Icon) |
| `@radix-ui/react-label` | `label.tsx`, `form.tsx` |
| `@radix-ui/react-navigation-menu` | `navigation-menu.tsx` |
| `@radix-ui/react-popover` | `popover.tsx` |
| `@radix-ui/react-progress` | `progress.tsx` |
| `@radix-ui/react-radio-group` | `radio-group.tsx` |
| `@radix-ui/react-scroll-area` | `scroll-area.tsx` |
| `@radix-ui/react-select` | `select.tsx` |
| `@radix-ui/react-separator` | `separator.tsx` |
| `@radix-ui/react-slot` | `button.tsx`, `sidebar.tsx` (asChild pattern) |
| `@radix-ui/react-switch` | `switch.tsx` |
| `@radix-ui/react-tabs` | `tabs.tsx` |
| `@radix-ui/react-toggle` | `toggle.tsx` |
| `@radix-ui/react-toggle-group` | `toggle-group.tsx` |
| `@radix-ui/react-tooltip` | `tooltip.tsx`, `sidebar.tsx` |

**Consistency score: 100%** — Every interactive UI component that has a Radix equivalent uses it. No custom dropdowns, modals, or dialogs built from scratch.

### Are components accessible (a11y)?

**Strong accessibility foundation:**

1. **Radix primitives** — All Radix components ship with built-in ARIA attributes, keyboard navigation, and focus management
2. **Screen reader support:**
   - `dialog.tsx`: `<span className="sr-only">Close</span>` on close button
   - `sheet.tsx`: `<span className="sr-only">Close</span>` on close button
   - `sidebar.tsx`: `<span className="sr-only">Toggle Sidebar</span>` on trigger, `<SheetHeader className="sr-only">` for mobile sidebar
   - `alert.tsx`: `role="alert"` on root element
3. **Focus management:**
   - All interactive components have `focus-visible:ring-2` or `focus-visible:ring-[3px]` styles
   - `focus:outline-none` paired with `focus-visible:ring` for visible focus indicators
   - `aria-invalid` handling on button and form components
4. **Disabled states:**
   - `disabled:pointer-events-none disabled:opacity-50` across buttons, inputs, toggles
   - `disabled:cursor-not-allowed` on inputs, switches, checkboxes
5. **Keyboard support:**
   - Sidebar has `Ctrl/Cmd + B` keyboard shortcut
   - Radix components provide native keyboard navigation (arrow keys, Escape, Tab)
6. **RTL support:**
   - `switch.tsx`: `rtl:data-[state=checked]:-translate-x-5`
   - `dropdown-menu.tsx`: `rtl:rotate-180` on ChevronRight
   - `calendar.tsx`: `rtl:**:[.rdp-button_next>svg]:rotate-180`
   - `DirectionProvider` in `providers.tsx` with dynamic `dir` based on locale
   - `HtmlDirSetter.tsx` updates `<html>` dir/lang attributes
7. **Semantic HTML:**
   - `form.tsx`: Proper `aria-describedby` and `aria-invalid` on FormControl
   - `table.tsx`: Uses proper `thead`, `tbody`, `tfoot`, `th`, `caption` elements
   - `alert.tsx`: `role="alert"`

**Gaps identified:**
- No `aria-label` on most input fields (relies on associated `<Label>` via `htmlFor`)
- `FooterLanguageSwitcher` uses custom CSS variables that may not meet 4.5:1 contrast ratio (not verified)
- `Calendar` component's `SKELETON_WIDTH` random value could cause SSR hydration mismatch

### What's the composition pattern?

**Primary patterns observed:**

1. **Compound Components** — Used for complex multi-part components:
   - `Card` → `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, `CardFooter`
   - `Table` → `TableHeader`, `TableBody`, `TableFooter`, `TableRow`, `TableHead`, `TableCell`, `TableCaption`
   - `Dialog` → `DialogTrigger`, `DialogContent`, `DialogHeader`, `DialogFooter`, `DialogTitle`, `DialogDescription`
   - `DropdownMenu` → 15 sub-components including sub-menus, checkbox items, radio items, separators, shortcuts
   - `Sidebar` → 22 sub-components (Provider, Content, Group, Menu, MenuItem, etc.)

2. **`asChild` pattern** (Radix `Slot`) — Used for component composition flexibility:
   - `button.tsx`: `asChild` prop renders `Slot` instead of `button`, allowing polymorphic rendering
   - `sidebar.tsx`: `SidebarGroupLabel`, `SidebarGroupAction`, `SidebarMenuButton`, `SidebarMenuAction`, `SidebarMenuSubButton` all support `asChild`
   - `form.tsx`: `FormControl` uses `Slot` to wrap any form control
   - `LanguageSwitcher.tsx`: `DropdownMenuTrigger asChild` wraps a `Button`

3. **ForwardRef pattern** — All UI components use `React.forwardRef` for ref forwarding, enabling parent component control over DOM nodes

4. **Context Provider pattern** — For shared state:
   - `sidebar.tsx`: `SidebarContext` with `useSidebar()` hook
   - `form.tsx`: `FormFieldContext` and `FormItemContext`
   - `toggle-group.tsx`: `ToggleGroupContext` for variant/size sharing
   - Root `providers.tsx`: `DirectionProvider`, `ConvexClientProvider`, `ProjectProvider`

5. **No render props pattern** — None of the components use render props. All customization is through props and children.

### Are there any component wrapper patterns?

**Yes, several wrapper patterns:**

1. **Provider wrapping** (`providers.tsx`, `ConvexClientProvider.tsx`, `AuthProviders.tsx`, `MarketingProviders.tsx`):
   ```
   DirectionProvider(dir) → ConvexClientProvider → ClerkProvider → ConvexProviderWithClerk → ProjectProvider → Toaster
   ```

2. **UI component wrapping** — Components wrap Radix primitives and add Tailwind classes via `cn()`:
   ```ts
   // Pattern used in every UI component
   <RadixPrimitive.SomeComponent ref={ref} className={cn("base-classes", className)} {...props} />
   ```

3. **Dialog/Sheet composition** — `AlertDialogAction` and `AlertDialogCancel` compose `buttonVariants`:
   ```ts
   const AlertDialogAction = React.forwardRef((...props, ref) => (
     <AlertDialogPrimitive.Action ref={ref} className={cn(buttonVariants(), className)} {...props} />
   ))
   const AlertDialogCancel = React.forwardRef((...props, ref) => (
     <AlertDialogPrimitive.Cancel ref={ref} className={cn(buttonVariants({ variant: "outline" }), "mt-2 sm:mt-0", className)} {...props} />
   ))
   ```

4. **Calendar integration** — `calendar.tsx` wraps `react-day-picker`'s `DayPicker` and composes `Button` + `buttonVariants` for navigation buttons

5. **Language switcher pattern** — Two variants exist:
   - `LanguageSwitcher.tsx` — Uses `DropdownMenuSub` (nested within parent dropdown), requires auth (`useUser()`), updates Clerk user metadata
   - `FooterLanguageSwitcher.tsx` — Uses standalone `DropdownMenu`, no auth required, uses pathname-based routing

### How are icons handled? (Lucide icons)

**Lucide React is the sole icon library** (`"lucide-react": "^0.575.0"` in package.json).

**Usage patterns:**

1. **Direct import from `lucide-react`** — Most common:
   ```ts
   import { Check, ChevronDown, ChevronUp } from "lucide-react"
   import { PanelLeft } from "lucide-react"
   import { X } from "lucide-react"
   import { Languages } from "lucide-react"
   import { AlertCircle, RotateCcw, Home } from "lucide-react"
   ```

2. **Sized via Tailwind classes** — Consistent `h-4 w-4` for standard icons:
   ```tsx
   <Check className="h-4 w-4" />
   <ChevronDown className="h-4 w-4 shrink-0 transition-transform duration-200" />
   <PanelLeft />  // No className, uses default size
   ```

3. **RTL-aware icons** — ChevronRight in dropdown menus:
   ```tsx
   <ChevronRight className="ms-auto rtl:rotate-180" />
   ```

4. **Used within UI components** (16 icons across `ui/` directory):
   - `check`, `chevron-down`, `chevron-up`, `chevron-right`, `circle` (select, dropdown-menu, radio-group)
   - `x` (sheet close button)
   - `panel-left` (sidebar trigger)
   - `grip-vertical` (resizable handle)

5. **Used in custom components** — `error-fallback.tsx`, `LanguageSwitcher.tsx`, `FooterLanguageSwitcher.tsx`, etc.

6. **`@radix-ui/react-icons`** — Only used in `dialog.tsx` for `Cross2Icon` (inconsistent — should use Lucide `X` instead)

**Icon count:** ~20+ unique Lucide icons used across the codebase. No emojis used as icons (complies with design system anti-patterns).

### Are there loading and error states?

**Loading states:**

1. **`Skeleton` component** (`ui/skeleton.tsx`) — Simple pulse animation div, used throughout
2. **`dashboard/loading-skeletons.tsx`** — Dashboard-specific loading skeletons (4 skeleton variants)
3. **`SidebarMenuSkeleton`** (`sidebar.tsx`) — Built-in sidebar menu skeleton with optional icon and randomized text width
4. **`Calendar` loading** — Uses `Skeleton` for date picker loading states

**Error states:**

1. **`ErrorFallback` component** (`error-fallback.tsx`) — Generic error boundary fallback with:
   - Error icon (Lucide `AlertCircle`)
   - Retry button (`reset()` callback)
   - "Go home" link
   - Animated fade-in entrance
2. **`form.tsx`** — `FormMessage` component displays validation errors from `react-hook-form`:
   ```ts
   const body = error ? String(error?.message ?? "") : children
   // Renders in destructive color with aria-describedby linkage
   ```
3. **`PushNotificationInit.tsx`** — Silently catches and logs errors: `console.error("Failed to initialize push notifications", error)`
4. **`ConvexClientProvider.tsx`** — Graceful degradation when Convex URL is unavailable (renders children without Convex)

**Missing:** No global error boundary component detected. Error handling in feature components is not consistently applied.

### Is there component documentation/comments?

**Minimal documentation:**

1. **`progress.tsx`** — Only component with a file-level comment:
   ```ts
   // Custom: indicatorClassName prop added for dynamic color support (UsageCard).
   // Do not overwrite with npx shadcn without re-applying this change.
   ```

2. **`sidebar.tsx`** — Has inline comments explaining implementation decisions (14 comment lines):
   - State management rationale
   - Cookie persistence explanation
   - Keyboard shortcut implementation
   - Mobile hit-area increases

3. **`ConvexClientProvider.tsx`** — Comment explaining graceful degradation during static generation:
   ```ts
   // During static generation (CI build), Convex URL may not be available.
   ```

4. **No JSDoc/TSDoc comments** — No `/** ... */` documentation blocks on any component
5. **No storybook** — No `.stories.tsx` files found
6. **Design system** — `design-system/yoosr/MASTER.md` documents design tokens, color palette, typography, spacing, and component specs (CSS-level) but does not document React component APIs

### Are components reusable or page-specific?

**Two tiers of reusability:**

1. **Base UI components (`src/components/ui/`)** — Fully reusable across the entire application. These are framework-level components used by all feature components.

2. **Feature components** — Organized by domain, but some cross-domain reuse exists:
   - `dashboard/AppSidebar.tsx` — Reuses `ui/sidebar.tsx` primitives
   - `LanguageSwitcher.tsx` — Reused in dashboard header and potentially other locations
   - `FooterLanguageSwitcher.tsx` — Landing-page specific
   - `settings/UsageCard.tsx` — Reuses customized `ui/progress.tsx` (with `indicatorClassName`)
   - `landing/` components — Landing page only, not reused elsewhere
   - `design-studio/` nodes — Exclusively for the flow editor

**Composition hierarchy:**
- Landing pages use: `ui/` + `landing/` + `layout/` + `pricing/`
- Dashboard uses: `ui/` + `dashboard/` + `activities/` + `analytics/` + `settings/`
- Design Studio uses: `ui/` + `design-studio/` (heavy use of `@xyflow/react`)
- Chat/Monitor uses: `ui/` + `dashboard/monitor/` + `chat/`

## 🔍 Key Patterns to Identify

### Component Composition Strategies
- **Compound components** for complex multi-part UIs (Card, Table, Dialog, Dropdown Menu, Sidebar)
- **CVA variants** for design token management (button, badge, toggle, alert, label, sheet)
- **`asChild` polymorphism** via Radix `Slot` for flexible rendering
- **Context providers** for shared state (sidebar, form fields, toggle groups)

### Customization Approach for shadcn/ui
- **Minimal customization** — 31 of 32 components are stock shadcn/ui with only Tailwind class changes
- **`cn()` utility** as the sole customization mechanism
- **One deliberate override** — `progress.tsx` with `indicatorClassName` prop
- **No forked components** — No structural deviations from shadcn/ui patterns

### Accessibility Patterns
- Radix primitives provide baseline a11y (ARIA, keyboard nav, focus management)
- `sr-only` text for icon-only buttons
- Visible focus indicators (`focus-visible:ring`)
- RTL support through `DirectionProvider` and CSS transforms
- Semantic HTML elements throughout

### Props Typing Conventions
- `React.forwardRef` + native element props for base inputs
- `ComponentPropsWithoutRef<typeof RadixPrimitive>` for Radix-wrapped components
- CVA `VariantProps` intersection for variant-based components
- Generic types for form-related components (react-hook-form integration)

### Component Organization Philosophy
- **`ui/` directory** — Framework-level components, zero business logic
- **Feature directories** — Domain-specific components organized by product area
- **Root components** — Cross-cutting concerns (providers, language switching, push notifications)
- **Clear boundaries** — UI components don't import from feature directories; feature components import from `ui/`

## ⚠️ Potential Concerns

### HIGH Severity

1. **`sidebar.tsx` `Math.random()` for skeleton width** (line ~660)
   - `const SKELETON_WIDTH = \`${Math.floor(Math.random() * 40) + 50}%\`` is evaluated at module load
   - Will produce different values on server vs. client, causing React hydration mismatch errors during SSR
   - **Fix:** Use a fixed value or generate per-instance with `useId()`/`useState()`

2. **Duplicate auth provider logic** — `ConvexClientProvider.tsx` and `AuthProviders.tsx` both define identical `arSAWithPlaceholders` objects and `ClerkProvider` wrapping logic
   - DRY violation — changes to one must be mirrored in the other
   - **Fix:** Extract shared Clerk configuration to a single source of truth

### MEDIUM Severity

3. **Icon library inconsistency** — `dialog.tsx` uses `Cross2Icon` from `@radix-ui/react-icons` while all other components use Lucide icons
   - Adds an extra dependency for a single icon
   - **Fix:** Replace with Lucide `X` (already used in `sheet.tsx`)

4. **No JSDoc/component documentation** — Zero JSDoc comments on any of the 113 component files
   - Makes onboarding harder and reduces IDE autocomplete quality
   - **Fix:** Add JSDoc blocks to exported components, especially feature components

5. **Two language switcher implementations** — `LanguageSwitcher.tsx` (auth-required, Clerk metadata-based) and `FooterLanguageSwitcher.tsx` (path-based, no auth)
   - Different routing strategies could cause locale inconsistency
   - **Fix:** Unify into a single component with auth-aware behavior mode

6. **No global error boundary** — `ErrorFallback` exists but is not wired as a top-level error boundary
   - Unhandled errors in feature components will crash the app without graceful fallback
   - **Fix:** Wrap app routes with React error boundaries using `ErrorFallback`

### LOW Severity

7. **`PushNotificationInit.tsx` silent error swallowing** — `console.error` without reporting to monitoring service
   - Push notification failures will go unnoticed in production

8. **`ConvexClientProvider.tsx` graceful degradation may mask issues** — When Convex URL is missing, it renders children without Convex, which could cause downstream errors in components that depend on Convex data
   - The comment acknowledges this: *"static pages like marketing won't need it; dashboard pages will render empty anyway"*

9. **No component tests** — No `.test.tsx` or `.spec.tsx` files found in any component directory
   - UI components are untested

10. **Design system CSS specs don't match Tailwind implementation** — `MASTER.md` specifies CSS (e.g., `.btn-primary { background: #10B981; }`) but actual components use Tailwind CSS variables (`bg-primary` mapping to `--color-primary`). The design system docs describe the design tokens correctly but the CSS examples are not the actual implementation.
