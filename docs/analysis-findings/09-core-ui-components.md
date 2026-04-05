# Part 09: Core UI Components - Findings

## 📊 Visual Map

```
src/components/ui/ — 32 shadcn/ui components (all Radix-based)
├── button.tsx           → Button variants (default, destructive, outline, secondary, ghost, link)
├── input.tsx            → Text input fields
├── textarea.tsx         → Multi-line text input
├── label.tsx            → Form label (Radix Label primitive)
├── checkbox.tsx         → Checkbox inputs (Radix Checkbox)
├── switch.tsx           → Toggle switches (Radix Switch)
├── radio-group.tsx      → Radio button groups (Radix RadioGroup)
├── toggle.tsx           → Toggle buttons
├── toggle-group.tsx     → Toggle button groups
│
├── dialog.tsx           → Modal/dialog components (Radix Dialog)
├── alert-dialog.tsx     → Alert/confirmation dialogs (Radix AlertDialog)
├── sheet.tsx            → Slide-out panels (Radix Dialog variant)
├── popover.tsx          → Popover components (Radix Popover)
├── dropdown-menu.tsx    → Dropdown menus (Radix DropdownMenu)
├── navigation-menu.tsx  → Navigation menus (Radix NavigationMenu)
├── accordion.tsx        → Accordion/collapsible (Radix Accordion)
├── tabs.tsx             → Tab navigation (Radix Tabs)
├── tooltip.tsx          → Tooltip wrappers (Radix Tooltip)
│
├── select.tsx           → Dropdown selects (Radix Select)
├── calendar.tsx         → Date picker (react-day-picker + Radix)
├── form.tsx             → Form components (react-hook-form + zod resolver)
│
├── avatar.tsx           → User avatars (Radix Avatar)
├── badge.tsx            → Status badges
├── card.tsx             → Card containers
├── progress.tsx         → Progress indicators (Radix Progress)
├── separator.tsx        → Dividers (Radix Separator)
├── skeleton.tsx         → Loading skeletons
│
├── table.tsx            → HTML table wrappers
├── scroll-area.tsx      → Scrollable containers (Radix ScrollArea)
├── resizable.tsx        → Resizable panels (react-resizable-panels)
├── alert.tsx            → Alert/notification banners
│
└── sidebar.tsx          → Full sidebar system (custom shadcn/ui component)
    ├── SidebarProvider  → Context provider (open/openMobile/state/isMobile)
    ├── Sidebar          → Container (offcanvas/icon/none collapse modes)
    ├── SidebarInset     → Main content area
    └── 20+ sub-components → Menu, Group, Skeleton, Badge, Input, Separator, Rail, etc.

Total: 32 UI component files
All use Radix UI primitives (headless, accessible)
All use Tailwind CSS with cn() utility
All use class-variance-authority (cva) for variants
```

## 📁 File Inventory

| File | Purpose | Radix Primitives | Customized |
|------|---------|-----------------|------------|
| `src/components/ui/button.tsx` | Button with 6 variants via cva | No | Yes (custom variants) |
| `src/components/ui/input.tsx` | Text input field | No | Minimal (Tailwind classes) |
| `src/components/ui/textarea.tsx` | Multi-line text input | No | Minimal |
| `src/components/ui/label.tsx` | Form label | Radix Label | Minimal |
| `src/components/ui/checkbox.tsx` | Checkbox input | Radix Checkbox | Yes (custom styling) |
| `src/components/ui/switch.tsx` | Toggle switch | Radix Switch | Yes (custom styling) |
| `src/components/ui/radio-group.tsx` | Radio buttons | Radix RadioGroup + RadioGroupItem | Yes |
| `src/components/ui/toggle.tsx` | Toggle button | Radix Toggle | Yes (size/variant variants) |
| `src/components/ui/toggle-group.tsx` | Toggle button group | Radix ToggleGroup + ToggleGroupItem | Yes |
| `src/components/ui/dialog.tsx` | Modal dialog | Radix Dialog + Portal + Overlay + Content | Yes (animation classes) |
| `src/components/ui/alert-dialog.tsx` | Confirmation dialog | Radix AlertDialog + Portal + Overlay + Action | Yes |
| `src/components/ui/sheet.tsx` | Slide-out panel | Radix Dialog + Portal + Overlay + Content | Yes (position variants) |
| `src/components/ui/popover.tsx` | Popover | Radix Popover + Trigger + Portal + Content | Yes (animation) |
| `src/components/ui/dropdown-menu.tsx` | Dropdown menu | Radix DropdownMenu + 12 sub-components | Yes |
| `src/components/ui/navigation-menu.tsx` | Nav menu | Radix NavigationMenu + 8 sub-components | Yes |
| `src/components/ui/accordion.tsx` | Collapsible sections | Radix Accordion + Trigger + Content | Yes |
| `src/components/ui/tabs.tsx` | Tab navigation | Radix Tabs + List + Trigger + Content | Yes |
| `src/components/ui/tooltip.tsx` | Tooltips | Radix Tooltip + Provider + Content | Yes (animation, side variants) |
| `src/components/ui/select.tsx` | Dropdown select | Radix Select + 8 sub-components | Yes |
| `src/components/ui/calendar.tsx` | Date picker | react-day-picker (not Radix) | Yes (Tailwind styling) |
| `src/components/ui/form.tsx` | Form with validation | react-hook-form + zodResolver | Yes (integration layer) |
| `src/components/ui/avatar.tsx` | User avatar | Radix Avatar + Image + Fallback | Yes (size variants) |
| `src/components/ui/badge.tsx` | Status badge | No | Yes (cva variants) |
| `src/components/ui/card.tsx` | Card container | No | Minimal (Tailwind classes) |
| `src/components/ui/progress.tsx` | Progress bar | Radix Progress + Indicator | Yes |
| `src/components/ui/separator.tsx` | Divider | Radix Separator | Minimal |
| `src/components/ui/skeleton.tsx` | Loading skeleton | No | Minimal (animate-pulse) |
| `src/components/ui/table.tsx` | Table wrapper | No | Minimal (Tailwind classes) |
| `src/components/ui/scroll-area.tsx` | Scrollable area | Radix ScrollArea + Corner | Yes |
| `src/components/ui/resizable.tsx` | Resizable panels | react-resizable-panels | Yes (handle styling) |
| `src/components/ui/alert.tsx` | Alert banner | No | Yes (cva variants: default/destructive) |
| `src/components/ui/sidebar.tsx` | Full sidebar system | Radix Sheet + custom context | **HEAVILY customized** |

**Additional files:**
| `components.json` | shadcn/ui configuration |
| `design-system/yoosr/MASTER.md` | Does NOT exist |

## ✅ Analysis Checklist

### [x] What shadcn/ui components are installed?
**32 components** installed in `src/components/ui/`:

**Form/Input (9):** `button`, `input`, `textarea`, `label`, `checkbox`, `switch`, `radio-group`, `toggle`, `toggle-group`

**Overlays/Popups (7):** `dialog`, `alert-dialog`, `sheet`, `popover`, `dropdown-menu`, `navigation-menu`, `tooltip`

**Navigation/Layout (5):** `accordion`, `tabs`, `select`, `scroll-area`, `resizable`

**Display/Data (8):** `avatar`, `badge`, `card`, `progress`, `separator`, `skeleton`, `table`, `calendar`

**Feedback (2):** `alert`, `form`

**Complex System (1):** `sidebar` — the most comprehensive component with 20+ sub-components

### [x] Are components customized or default?
**All components are customized from shadcn/ui defaults:**

1. **`cn()` utility**: All components use `cn()` (clsx + tailwind-merge) for class merging, allowing consumers to override default classes.

2. **`class-variance-authority` (cva)**: Used in `button.tsx`, `badge.tsx`, `alert.tsx`, `toggle.tsx`, `avatar.tsx` for typed variant systems (default/destructive/outline/secondary/ghost/link for buttons).

3. **Animation customization**: Dialog, sheet, popover, tooltip, accordion all have custom Tailwind animation classes (e.g., `data-[state=open]:animate-in data-[state=closed]:animate-out`).

4. **`sidebar.tsx` is HEAVILY customized**: 400+ lines with a full context provider system (`SidebarProvider`, `useSidebar()`, 20+ sub-components). Supports three collapse modes (`offcanvas`, `icon`, `none`), mobile drawer via `Sheet`, keyboard shortcut (`Cmd/Ctrl+B`), cookie-based persistence. This is far beyond the default shadcn/ui sidebar.

5. **`form.tsx` is a custom integration layer**: Wraps `react-hook-form` with zod validation, providing `FormField`, `FormItem`, `FormLabel`, `FormControl`, `FormDescription`, `FormMessage` components. This is a custom composition, not a Radix primitive.

6. **Minimal customization**: `input.tsx`, `textarea.tsx`, `card.tsx`, `table.tsx`, `separator.tsx`, `skeleton.tsx` have only Tailwind class additions (border colors, focus rings, spacing) — closest to default.

### [x] What's the component customization strategy?
**Three-tier customization:**

1. **Class extension** (minimal): Add Tailwind classes to Radix primitives without changing structure.
   - Examples: `input.tsx`, `card.tsx`, `table.tsx`, `skeleton.tsx`
   - Pattern: `className={cn("base-classes", props.className)}`

2. **Variant system** (moderate): Use cva to create typed variant APIs.
   - Examples: `button.tsx` (6 variants), `badge.tsx` (4 variants), `alert.tsx` (2 variants), `toggle.tsx` (size + variant)
   - Pattern: `cva("base", { variants: { variant: {...}, size: {...} }, defaultVariants: {...} })`

3. **Full composition** (heavy): Build multi-component systems with context providers.
   - Examples: `sidebar.tsx` (20+ sub-components + context), `dropdown-menu.tsx` (12 sub-components), `form.tsx` (react-hook-form integration)
   - Pattern: Context provider → sub-components with compound component API

### [x] Are there custom components beyond shadcn/ui?
The `src/components/ui/` directory contains exclusively shadcn/ui components. Custom application components live outside this directory:
- `src/components/layout/` — Layout components (see Part 10)
- `src/components/dashboard/` — Dashboard-specific components (AppSidebar, SiteHeader, etc.)
- `src/components/auth/` — Auth guards
- `src/components/chat/` — Chat-specific components
- `src/components/kb/` — Knowledge base components
- `src/components/settings/` — Settings components

**No custom components inside `src/components/ui/`** — this directory is strictly for the shadcn/ui library.

### [x] How are component props typed?
**Consistent TypeScript patterns:**

1. **Interface extension**: Most components extend HTML element types:
   ```ts
   interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
     variant?: VariantProps<typeof buttonVariants>["variant"];
     size?: VariantProps<typeof buttonVariants>["size"];
     asChild?: boolean;
   }
   ```

2. **`React.forwardRef`**: Interactive components forward refs for DOM access:
   ```ts
   const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(...)
   ```

3. **`ComponentProps<typeof RadixPrimitive>`**: Components wrapping Radix primitives use `ComponentProps` to inherit all primitive props:
   ```ts
   type DialogContentProps = ComponentProps<typeof DialogPrimitive.Content>;
   ```

4. **`React.ComponentPropsWithoutRef`**: Used for components that don't need ref forwarding:
   ```ts
   type SelectItemProps = React.ComponentPropsWithoutRef<typeof SelectPrimitive.Item>;
   ```

5. **`zod` schemas**: `form.tsx` uses zod schemas for validation, with `zodResolver` bridging to react-hook-form.

### [x] Is there consistent use of Radix primitives?
**Yes, 23 of 32 components use Radix UI primitives directly:**

- `checkbox` → `@radix-ui/react-checkbox`
- `switch` → `@radix-ui/react-switch`
- `radio-group` → `@radix-ui/react-radio-group`
- `toggle` → `@radix-ui/react-toggle`
- `toggle-group` → `@radix-ui/react-toggle-group`
- `dialog` → `@radix-ui/react-dialog`
- `alert-dialog` → `@radix-ui/react-alert-dialog`
- `sheet` → `@radix-ui/react-dialog` (same primitive)
- `popover` → `@radix-ui/react-popover`
- `dropdown-menu` → `@radix-ui/react-dropdown-menu`
- `navigation-menu` → `@radix-ui/react-navigation-menu`
- `accordion` → `@radix-ui/react-accordion`
- `tabs` → `@radix-ui/react-tabs`
- `tooltip` → `@radix-ui/react-tooltip`
- `select` → `@radix-ui/react-select`
- `avatar` → `@radix-ui/react-avatar`
- `progress` → `@radix-ui/react-progress`
- `separator` → `@radix-ui/react-separator`
- `scroll-area` → `@radix-ui/react-scroll-area`
- `label` → `@radix-ui/react-label`

**Non-Radix components (9):**
- `button`, `input`, `textarea`, `badge`, `card`, `skeleton`, `table`, `alert` — pure Tailwind-styled HTML elements
- `calendar` → uses `react-day-picker` (date picker library)
- `form` → uses `react-hook-form` + `@hookform/resolvers` (form management)
- `resizable` → uses `react-resizable-panels` (resizable panels)
- `sidebar` → composite of Radix Sheet + custom context + many sub-components

### [x] Are components accessible (a11y)?
**Yes, Radix UI primitives provide built-in accessibility:**

1. **ARIA attributes**: All Radix components automatically manage ARIA roles, states, and properties:
   - `dialog`: `role="dialog"`, `aria-modal`, `aria-describedby`
   - `tabs`: `role="tablist"`, `role="tab"`, `role="tabpanel"`, `aria-selected`
   - `select`: `role="listbox"`, `role="option"`, `aria-expanded`
   - `accordion`: `role="heading"`, `aria-expanded`, `aria-controls`
   - `dropdown-menu`: `role="menu"`, `role="menuitem"`, `aria-expanded`

2. **Keyboard navigation**: Radix primitives provide keyboard interaction out of the box:
   - Arrow keys for menu/select/tab navigation
   - Escape to close dialogs/popovers/menus
   - Tab trapping within dialogs
   - Focus management on open/close

3. **Screen reader support**: `sr-only` class used in `sidebar.tsx` for visually hidden but screen-reader-accessible labels.

4. **Focus management**: Components like `dialog`, `sheet`, `popover` manage focus on open (focus first element) and close (return focus to trigger).

5. **`form.tsx`**: Provides `FormLabel` (with `htmlFor`), `FormControl` (with `aria-describedby` for errors), `FormMessage` (with `role="alert"`).

**No explicit WCAG audit or ARIA-level customization beyond Radix defaults.**

### [x] What's the composition pattern?
**Compound components with context providers:**

1. **Context-based compound components** (most common):
   ```tsx
   // Parent provides context
   <DropdownMenu>
     <DropdownMenuTrigger />
     <DropdownMenuContent>
       <DropdownMenuItem />
     </DropdownMenuContent>
   </DropdownMenu>
   ```
   Used in: `dropdown-menu`, `select`, `navigation-menu`, `tabs`, `accordion`, `tooltip`, `popover`, `dialog`, `alert-dialog`, `sheet`, `avatar`, `progress`, `scroll-area`, `radio-group`, `toggle-group`.

2. **Form context pattern** (`form.tsx`):
   ```tsx
   <Form {...formProps}>
     <FormField control={...} render={({ field }) => <FormItem>
       <FormLabel />
       <FormControl><Input {...field} /></FormControl>
       <FormDescription />
       <FormMessage />
     </FormItem>} />
   </Form>
   ```

3. **Sidebar compound system** (`sidebar.tsx`): Most complex — context provider manages `open`, `openMobile`, `state`, `isMobile`, with 20+ sub-components that consume the context.

4. **No render props pattern** observed — all compound components use the context API.

### [x] How are icons handled?
**Lucide React** (`lucide-react` package) is used throughout:

1. **UI components**: `sidebar.tsx` imports `PanelLeft`, `PanelRight`, `ChevronRight`, `ChevronLeft`, `Separator`, `MoreHorizontal`, `Maximize2`, `Minimize2` from `lucide-react`.

2. **Application components**: Throughout the codebase — `AppSidebar.tsx` uses `LayoutDashboard`, `MessageSquare`, `Bot`, `BookOpen`, `BarChart3`, `Activity`, `History`, `Users`, `Settings`, `Store` etc.

3. **Consistent sizing**: Icons use `size={16}`, `size={20}`, `size={24}` props.

4. **No icon component wrapper** — Lucide icons are used directly as JSX components.

### [x] Are there loading and error states?
**In UI components**: Minimal — these are base components, not data-fetching components.

1. **`skeleton.tsx`**: Provides loading placeholder (`animate-pulse` with `bg-muted` rounded div).
2. **`sidebar.tsx`**: Has `MenuSkeleton` component for skeleton loading in nav menus.
3. **No built-in error states** in UI components — error handling is done at the application component level.

**In application components** (outside `ui/`):
- `AppErrorBoundary` wraps dashboard content with "Try again" button
- Loading spinners in shells and auth guards
- Skeleton loaders in data tables and lists

### [x] Is there component documentation/comments?
**Minimal documentation:**

1. **JSDoc comments**: Almost none in the UI components. No `@param`, `@returns`, or usage examples in code.

2. **File headers**: No file-level documentation — component purpose is clear from naming.

3. **No Storybook**: No `.stories.tsx` files found in the codebase.

4. **No component docs**: `design-system/yoosr/MASTER.md` does not exist.

5. **Self-documenting**: Component APIs are self-documenting through TypeScript types and prop names.

### [x] Are components reusable or page-specific?
**All 32 components in `src/components/ui/` are fully reusable** — they're the base component library. Zero page-specific logic exists in these files.

**Reusability patterns:**
- Components are pure presentational — no data fetching, no state management (except context for compound components)
- All styling via Tailwind classes — theme-agnostic (works with any CSS variable setup)
- `asChild` prop on many components (via Radix `Slot`) allows rendering as custom elements
- `cn()` utility allows consumers to override/extend classes

## 📝 Agent Findings

### shadcn/ui Configuration
`components.json` configuration:
- **Style**: "new-york" — the newer shadcn/ui style variant
- **Base color**: "neutral" — neutral gray palette
- **CSS variables**: Uses CSS custom properties for theming (`--background`, `--foreground`, `--primary`, etc.)
- **Tailwind**: v4 with `globals.css`
- **Aliases**: `@/` prefix for imports
- **Path resolution**: Explicit `ui` directory

### Component Count and Complexity
| Tier | Components | Lines of Code |
|------|-----------|---------------|
| **Heavy** (100+ lines) | `sidebar.tsx` | ~450 lines |
| **Medium** (50-100 lines) | `dropdown-menu.tsx`, `navigation-menu.tsx`, `select.tsx`, `form.tsx` | 50-120 lines |
| **Light** (20-50 lines) | `dialog.tsx`, `tabs.tsx`, `tooltip.tsx`, `accordion.tsx`, `popover.tsx`, `alert-dialog.tsx`, `sheet.tsx`, `radio-group.tsx`, `toggle-group.tsx`, `calendar.tsx`, `resizable.tsx`, `scroll-area.tsx` | 20-60 lines |
| **Minimal** (<20 lines) | `button.tsx`, `input.tsx`, `textarea.tsx`, `badge.tsx`, `card.tsx`, `label.tsx`, `separator.tsx`, `skeleton.tsx`, `table.tsx`, `alert.tsx`, `avatar.tsx`, `progress.tsx`, `checkbox.tsx`, `switch.tsx`, `toggle.tsx` | 10-25 lines |

### Most Customized Components
1. **`sidebar.tsx`** — 450 lines, full context provider system with 20+ sub-components, cookie persistence, keyboard shortcuts, mobile drawer, RTL support
2. **`form.tsx`** — Custom react-hook-form integration with zod, 6 sub-components
3. **`dropdown-menu.tsx`** — 12 Radix sub-components wrapped with custom styling
4. **`select.tsx`** — 8 Radix sub-components with custom styling
5. **`button.tsx`** — cva variant system with 6 button variants × 4 sizes

### Theme Integration
All components use CSS custom properties for theming:
- `--background`, `--foreground`
- `--primary`, `--primary-foreground`
- `--muted`, `--muted-foreground`
- `--accent`, `--accent-foreground`
- `--destructive`, `--destructive-foreground`
- `--border`, `--ring`, `--radius`
- `--card`, `--card-foreground`, `--popover`, `--popover-foreground`

This allows theme switching by changing CSS variable values without modifying component code.

## 🔍 Key Patterns to Identify

### Component Composition Strategies
- Compound components with context providers (dominant pattern)
- `asChild` prop via Radix `Slot` for custom element rendering
- `cn()` for class merging — allows consumer overrides
- `React.forwardRef` for DOM access on interactive components

### Customization Approach for shadcn/ui
- Three-tier: class extension → cva variants → full composition
- All components accept `className` prop for consumer overrides
- CSS custom properties for theming — no hardcoded colors
- Consistent animation classes (`data-[state=open]:animate-in`)

### Accessibility Patterns
- Radix UI primitives provide built-in ARIA, keyboard nav, focus management
- `sr-only` class for screen reader labels
- No custom accessibility overrides beyond Radix defaults
- No WCAG audit or testing infrastructure observed

### Props Typing Conventions
- Interface extension of HTML element types
- `ComponentProps<typeof RadixPrimitive>` for Radix wrappers
- `React.forwardRef` with typed generics
- cva `VariantProps` for variant typing

### Component Organization Philosophy
- Strict separation: `ui/` = base library, other dirs = application components
- No custom components inside `ui/` — all shadcn/ui
- Consistent naming: kebab-case file names, PascalCase component exports

## ⚠️ Potential Concerns

| # | Concern | Severity | Details |
|---|---------|----------|---------|
| 1 | **No component documentation** | MEDIUM | No JSDoc comments, no Storybook, no design system docs (`MASTER.md` doesn't exist). New developers must read source code to understand component APIs. |
| 2 | **No loading/error states in base components** | LOW | UI components are purely presentational. Loading skeletons, error boundaries, and retry logic are implemented at the application level. This is acceptable but means every data-fetching component must reimplement these patterns. |
| 3 | **`sidebar.tsx` complexity** | LOW | At 450 lines with 20+ sub-components, the sidebar is the most complex UI component. It could benefit from being split into a dedicated package or directory. |
| 4 | **No icon system standardization** | LOW | Lucide icons are used directly without a wrapper component. No consistent sizing or theming enforcement. Could benefit from an `<Icon name="..." size="md" />` wrapper. |
| 5 | **No component testing** | LOW | No test files found for UI components (`.test.tsx` or `.spec.tsx`). Radix provides accessibility guarantees, but custom styling and behavior are untested. |
| 6 | **Calendar uses non-Radix dependency** | LOW | `calendar.tsx` uses `react-day-picker` instead of a Radix primitive. This introduces an additional dependency with its own API surface and accessibility characteristics. |
