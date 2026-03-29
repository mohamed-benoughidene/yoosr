# Yoosr Design System

> Single source of truth for all UI decisions.
> Stack: Next.js App Router · shadcn/ui · Tailwind CSS v4 · lucide-react
> Style: Clean minimal light (Linear / Notion)
> Last updated: 2026-03-28

Every spacing value, color, component dimension, and animation curve in this file is **exact**.
Agents must read this file before writing any UI code. No approximation permitted.

---

## 1. Design Principles

1. **Precision** — Every measurement is an exact px value; nothing is "roughly" anything.
2. **Restraint** — Add nothing decorative unless it carries information.
3. **Hierarchy** — Size, weight, and color differences must be perceptible at a glance.
4. **Consistency** — The same element looks identical in every context; no one-offs.
5. **RTL parity** — Every layout spec includes both LTR and RTL variants.
6. **Motion economy** — Animate only state transitions; never animate for decoration.

---

## 2. Color Tokens

### 2.1 Background

| Token | Value | Usage |
|---|---|---|
| `bg-base` | `#F7F7F7` | App shell background, page root |
| `bg-surface` | `#FFFFFF` | Cards, panels, modals, inputs |
| `bg-subtle` | `#F0F0F0` | Hover states, skeleton loaders, table headers |
| `bg-muted` | `#E8E8E8` | Pressed states, disabled surfaces |
| `bg-overlay` | `rgba(0,0,0,0.40)` | Modal backdrop |

### 2.2 Border

| Token | Value | Usage |
|---|---|---|
| `border-default` | `#E5E5E5` | Cards, inputs, dividers, table rows |
| `border-strong` | `#D4D4D4` | Focused inputs (pre-ring), separator emphasis |
| `border-subtle` | `#F0F0F0` | Hairline dividers inside panels |

### 2.3 Text

| Token | Value | Usage |
|---|---|---|
| `text-primary` | `#0A0A0A` | Body copy, headings, labels |
| `text-secondary` | `#525252` | Supporting text, descriptions, timestamps |
| `text-tertiary` | `#A3A3A3` | Placeholders, helper text, empty states |
| `text-disabled` | `#D4D4D4` | Disabled inputs and controls |
| `text-inverse` | `#FFFFFF` | Text on dark/brand backgrounds |
| `text-link` | `#4F46E5` | Clickable text links |

### 2.4 Brand

| Token | Value | Usage |
|---|---|---|
| `brand-50` | `#EEF2FF` | Brand tint backgrounds |
| `brand-100` | `#E0E7FF` | Brand subtle backgrounds |
| `brand-500` | `#4F46E5` | Primary actions, focus rings, active nav |
| `brand-600` | `#4338CA` | Button hover |
| `brand-700` | `#3730A3` | Button active / pressed |

### 2.5 Semantic

| Token | Value | Usage |
|---|---|---|
| `success-bg` | `#F0FDF4` | Success banner background |
| `success-text` | `#15803D` | Success text and icons |
| `success-border` | `#BBF7D0` | Success border |
| `warning-bg` | `#FFFBEB` | Warning banner background |
| `warning-text` | `#B45309` | Warning text and icons |
| `warning-border` | `#FDE68A` | Warning border |
| `error-bg` | `#FEF2F2` | Error banner background |
| `error-text` | `#DC2626` | Error text and icons |
| `error-border` | `#FECACA` | Error border |
| `info-bg` | `#EFF6FF` | Info banner background |
| `info-text` | `#1D4ED8` | Info text and icons |
| `info-border` | `#BFDBFE` | Info border |

### 2.6 Conversation Status Colors

| Token | Value | Usage |
|---|---|---|
| `status-unassigned` | `#F59E0B` | Status 100 dot — unassigned/open |
| `status-assigned` | `#3B82F6` | Status 200 dot — assigned |
| `status-resolved` | `#6B7280` | Status 1000 dot — resolved/closed |
| `priority-urgent` | `#DC2626` | Urgent priority badge |
| `priority-high` | `#F97316` | High priority badge |
| `priority-medium` | `#F59E0B` | Medium priority badge |
| `priority-low` | `#6B7280` | Low priority badge |

---

## 3. Typography

### 3.1 Font Families

| Role | Family | Fallback |
|---|---|---|
| UI (LTR) | `Inter` | `system-ui, -apple-system, sans-serif` |
| UI (RTL / Arabic) | `Cairo` | `Tajawal, system-ui, sans-serif` |
| Monospace | `JetBrains Mono` | `'Fira Code', 'Cascadia Code', monospace` |

RTL rule: apply `font-family: Cairo` and `direction: rtl` on the `<html>` element when locale
is `ar`. All font-size values are identical across LTR and RTL.

### 3.2 Type Scale

| Name | Size | Line Height | Weight | Usage |
|---|---|---|---|---|
| `text-2xs` | 11px | 16px | 400 | Micro labels, badge text, keyboard shortcuts |
| `text-xs` | 12px | 16px | 400 | Captions, helper text, timestamps |
| `text-sm` | 13px | 20px | 400 | Body default, form labels, table cells |
| `text-base` | 14px | 22px | 400 | Prominent body, button labels (lg/xl) |
| `text-md` | 16px | 24px | 500 | Section subheadings, card titles |
| `text-lg` | 18px | 28px | 600 | Page section headings |
| `text-xl` | 20px | 28px | 600 | Modal titles, drawer titles |
| `text-2xl` | 24px | 32px | 600 | Dashboard stat numbers |
| `text-3xl` | 28px | 36px | 700 | Hero numerics, KPI callouts |
| `text-4xl` | 32px | 40px | 700 | Landing page section headings |
| `text-5xl` | 36px | 44px | 700 | Landing page hero headings |

### 3.3 Weight Reference

| Name | Value | When to Use |
|---|---|---|
| Regular | 400 | Body copy, descriptions |
| Medium | 500 | UI labels, table headers, nav items |
| Semibold | 600 | Section headings, card titles, modal titles |
| Bold | 700 | Hero text, stat numerics, page headings |

### 3.4 Letter Spacing

| Context | Value |
|---|---|
| Body and UI text | `0` (default) |
| Uppercase micro labels | `0.04em` |
| Stat numerics | `-0.01em` |
| Hero headings | `-0.02em` |

---

## 4. Spacing Scale

Base unit: **4px**. All spacing values are multiples of 4px.

| Token | px | rem | Usage examples |
|---|---|---|---|
| `space-0` | 0px | 0rem | Reset |
| `space-0.5` | 2px | 0.125rem | Icon nudge, hairline offset |
| `space-1` | 4px | 0.25rem | Icon gap from text, micro padding |
| `space-1.5` | 6px | 0.375rem | Badge padding-x (xs), dense list gap |
| `space-2` | 8px | 0.5rem | Badge padding-x (md), icon button padding |
| `space-2.5` | 10px | 0.625rem | Button padding-x (sm) |
| `space-3` | 12px | 0.75rem | Button padding-x (md), input padding-x |
| `space-4` | 16px | 1rem | Card padding (sm), section gap (mobile) |
| `space-5` | 20px | 1.25rem | Button padding-x (xl), card padding (md) |
| `space-6` | 24px | 1.5rem | Card padding (lg), page content padding |
| `space-7` | 28px | 1.75rem | — |
| `space-8` | 32px | 2rem | Section vertical gap (desktop) |
| `space-10` | 40px | 2.5rem | Panel header height offset |
| `space-12` | 48px | 3rem | Top bar height |
| `space-16` | 64px | 4rem | Large section spacing |
| `space-20` | 80px | 5rem | Hero padding |
| `space-24` | 96px | 6rem | Landing page section spacing |

---

## 5. Border Radius

| Token | Value | Usage |
|---|---|---|
| `radius-none` | 0px | Flush edges, full-bleed panels |
| `radius-sm` | 4px | Badges (default), code blocks, tag chips |
| `radius-md` | 6px | Buttons, inputs, dropdowns, tooltips (default UI) |
| `radius-lg` | 8px | Cards, panels, notification toasts |
| `radius-xl` | 12px | Modals, command palettes, large surface cards |
| `radius-2xl` | 16px | Widget launcher bubble, welcome panel |
| `radius-full` | 9999px | Avatar circles, toggle pills, loading spinners |

---

## 6. Shadows

| Token | CSS Value | Usage |
|---|---|---|
| `shadow-xs` | `0 1px 2px rgba(0,0,0,0.05)` | Focused inputs, hover on flat cards |
| `shadow-sm` | `0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04)` | Cards (resting), table headers |
| `shadow-md` | `0 4px 12px rgba(0,0,0,0.08), 0 2px 4px rgba(0,0,0,0.04)` | Floating panels, sticky headers |
| `shadow-lg` | `0 8px 24px rgba(0,0,0,0.10), 0 2px 6px rgba(0,0,0,0.06)` | Dropdowns, popovers, tooltips |
| `shadow-xl` | `0 16px 48px rgba(0,0,0,0.12), 0 4px 8px rgba(0,0,0,0.06)` | Modals, command palette |
| `shadow-overlay` | `0 24px 64px rgba(0,0,0,0.14), 0 8px 16px rgba(0,0,0,0.08)` | Fullscreen drawers |

---

## 7. Component Anatomy

### 7.1 Button

| Size | Height | Padding X | Font Size | Font Weight | Radius | Icon Size |
|---|---|---|---|---|---|---|
| `xs` | 24px | 8px | 11px | 500 | 4px | 12px |
| `sm` | 28px | 10px | 12px | 500 | 5px | 14px |
| `md` (default) | 32px | 12px | 13px | 500 | 6px | 14px |
| `lg` | 36px | 16px | 14px | 500 | 6px | 16px |
| `xl` | 40px | 20px | 14px | 600 | 6px | 16px |

Gap between icon and label: `6px` (md), `4px` (xs/sm), `8px` (lg/xl).

| Variant | Background | Text | Border | Hover bg | Active bg |
|---|---|---|---|---|---|
| `primary` | `#4F46E5` | `#FFFFFF` | none | `#4338CA` | `#3730A3` |
| `secondary` | `#FFFFFF` | `#0A0A0A` | `1px solid #E5E5E5` | `#F7F7F7` | `#F0F0F0` |
| `ghost` | transparent | `#0A0A0A` | none | `rgba(0,0,0,0.04)` | `rgba(0,0,0,0.08)` |
| `destructive` | `#DC2626` | `#FFFFFF` | none | `#B91C1C` | `#991B1B` |
| `link` | transparent | `#4F46E5` | none | underline | underline |

**States:**
- Disabled: `opacity: 0.4`, `cursor: not-allowed`, no hover/active
- Focus ring: `outline: 2px solid #4F46E5`, `outline-offset: 2px`
- Loading: replace label with 14px spinner (same color as label text), no width change

**RTL:** Icon-left buttons flip icon to inline-end. Padding is symmetric so no value change.

---

### 7.2 Input / Textarea

| Size | Height | Padding X | Padding Y | Font Size | Radius |
|---|---|---|---|---|---|
| `sm` | 32px | 10px | — | 12px | 6px |
| `md` (default) | 36px | 12px | — | 13px | 6px |
| `lg` | 40px | 14px | — | 14px | 6px |
| `textarea` | auto (min 80px) | 12px | 10px | 13px | 6px |

| State | Border | Shadow |
|---|---|---|
| Default | `1px solid #E5E5E5` | none |
| Hover | `1px solid #D4D4D4` | none |
| Focus | `1px solid #4F46E5` | `0 0 0 3px rgba(79,70,229,0.12)` |
| Error | `1px solid #DC2626` | `0 0 0 3px rgba(220,38,38,0.10)` |
| Disabled | `1px solid #E5E5E5` | none, `bg: #F7F7F7`, `opacity: 0.6` |

Leading icon: `16px`, positioned at `x=10px` from inline-start, vertically centered. Input
padding-inline-start increases by `28px` when icon present.

Trailing icon (clear / eye / chevron): same size and offset from inline-end.

**Label:** `font-size: 12px`, `font-weight: 500`, `color: #0A0A0A`, `margin-bottom: 6px`  
**Helper text:** `font-size: 12px`, `color: #A3A3A3`, `margin-top: 4px`  
**Error text:** `font-size: 12px`, `color: #DC2626`, `margin-top: 4px`

**RTL:** Inline padding and icon positions mirror automatically. No value change needed.

---

### 7.3 Select / Dropdown Trigger

Same height and padding as Input. Trailing chevron icon: `16px`, `color: #A3A3A3`,
positioned `10px` from inline-end. Chevron rotates `180deg` when open (150ms ease).

---

### 7.4 Dropdown / Menu

| Property | Value |
|---|---|
| Min width | 160px |
| Max width | 320px |
| Inner padding | 4px |
| Item height | 32px |
| Item padding-x | 10px |
| Item font size | 13px |
| Item font weight | 400 |
| Item radius | 4px |
| Section label font size | 11px |
| Section label font weight | 500 |
| Section label color | `#A3A3A3` |
| Section label padding | `6px 10px 2px 10px` |
| Divider | `1px solid #E5E5E5`, `margin: 4px 0` |
| Container radius | 8px |
| Container shadow | `shadow-lg` |
| Container border | `1px solid #E5E5E5` |
| Container bg | `#FFFFFF` |

Item states:
- Hover: `bg: #F7F7F7`
- Active/selected: `bg: #EEF2FF`, `color: #4F46E5`, `font-weight: 500`
- Destructive: `color: #DC2626`, on hover `bg: #FEF2F2`
- Disabled: `color: #D4D4D4`, `cursor: not-allowed`

Leading icon in item: `16px`, `gap: 8px` from label.

**RTL:** Menu opens from inline-end. Icon and text order mirror.

---

### 7.5 Card

| Size | Padding | Radius | Border | Shadow |
|---|---|---|---|---|
| `sm` | 16px | 8px | `1px solid #E5E5E5` | none |
| `md` (default) | 20px | 8px | `1px solid #E5E5E5` | none |
| `lg` | 24px | 8px | `1px solid #E5E5E5` | none |

Card hover: `shadow-sm`, `border-color: #D4D4D4`, transition `150ms`.  
Card selected: `border-color: #4F46E5`, `shadow: 0 0 0 3px rgba(79,70,229,0.12)`.

Card anatomy:
- **Header:** `padding-bottom: 16px`, `border-bottom: 1px solid #E5E5E5`
- **Body:** `padding-top: 16px`
- **Footer:** `padding-top: 16px`, `border-top: 1px solid #E5E5E5`
- **Title:** `font-size: 14px`, `font-weight: 600`, `color: #0A0A0A`
- **Description:** `font-size: 13px`, `color: #525252`, `margin-top: 4px`

---

### 7.6 Badge

| Size | Height | Padding X | Font Size | Font Weight | Radius |
|---|---|---|---|---|---|
| `xs` | 18px | 6px | 11px | 500 | 4px |
| `sm` (default) | 20px | 6px | 11px | 500 | 4px |
| `md` | 22px | 8px | 12px | 500 | 4px |
| `pill` (any size) | — | same | same | same | 9999px |

| Variant | Background | Text | Border |
|---|---|---|---|
| `default` | `#F0F0F0` | `#525252` | none |
| `primary` | `#EEF2FF` | `#4F46E5` | none |
| `success` | `#F0FDF4` | `#15803D` | none |
| `warning` | `#FFFBEB` | `#B45309` | none |
| `error` | `#FEF2F2` | `#DC2626` | none |
| `outline` | transparent | `#525252` | `1px solid #E5E5E5` |

Dot badge (presence indicator): `8px × 8px`, `border-radius: 9999px`.

---

### 7.7 Avatar

| Size | Diameter | Font Size | Border |
|---|---|---|---|
| `xs` | 20px | 10px | none |
| `sm` | 24px | 11px | none |
| `md` (default) | 32px | 13px | none |
| `lg` | 40px | 16px | none |
| `xl` | 48px | 18px | none |

Shape: `border-radius: 9999px`.  
Fallback (initials): `bg: brand-100`, `color: brand-500`, centered text.  
Status dot: `8px`, positioned `0px bottom`, `0px inline-end`, white `2px` ring border.

---

### 7.8 Modal / Dialog

| Size | Width | Max Height | Padding | Radius |
|---|---|---|---|---|
| `sm` | 400px | 90vh | 24px | 12px |
| `md` (default) | 520px | 90vh | 24px | 12px |
| `lg` | 680px | 90vh | 28px | 12px |
| `xl` | 800px | 90vh | 32px | 12px |
| `full` | 100vw | 100vh | 0px | 0px |

Anatomy:
- **Header:** `padding-bottom: 16px`, title `font-size: 16px`, `font-weight: 600`
- **Close button:** `24px × 24px`, top-inline-end `16px` from edge, icon `16px`
- **Body:** `padding-top: 0`, scrollable when content overflows
- **Footer:** `padding-top: 20px`, `border-top: 1px solid #E5E5E5`, flex row, gap `8px`, align inline-end
- **Backdrop:** `bg-overlay`, blur `none`

Animation: Enter — scale from `0.95` + fade in over `200ms` cubic-bezier(0.16,1,0.3,1).  
Exit — scale to `0.95` + fade out over `150ms` ease.

**RTL:** Close button moves to inline-start (top-left in RTL). Footer buttons maintain LTR visual order.

---

### 7.9 Tooltip

| Property | Value |
|---|---|
| Max width | 240px |
| Padding | `6px 10px` |
| Font size | 12px |
| Font weight | 400 |
| Color | `#FFFFFF` |
| Background | `#0A0A0A` |
| Radius | 6px |
| Shadow | `shadow-md` |
| Delay (show) | 400ms |
| Delay (hide) | 0ms |
| Arrow size | `6px × 6px` (optional) |

Animation: fade in over `100ms`, fade out over `75ms`.

---

### 7.10 Table

| Property | Value |
|---|---|
| Header row height | 36px |
| Body row height | 40px |
| Cell padding-x | 16px |
| Cell font size | 13px |
| Header font size | 12px |
| Header font weight | 500 |
| Header color | `#525252` |
| Header bg | `#F7F7F7` |
| Row border | `1px solid #E5E5E5` (horizontal only) |
| Hover row bg | `#F7F7F7` |
| Selected row bg | `#EEF2FF` |
| Selected row border-left | `2px solid #4F46E5` in LTR, `border-right` in RTL |

Checkbox column width: `48px`.  
Action column width (trailing): `48px` per action icon.  
Empty state row: `height: 200px`, centered illustration + message.

---

### 7.11 Toast / Notification

| Property | Value |
|---|---|
| Width | 320px |
| Min height | 52px |
| Padding | `14px 16px` |
| Radius | 8px |
| Border | `1px solid #E5E5E5` |
| Shadow | `shadow-xl` |
| Gap (icon to text) | 12px |
| Icon size | 16px |
| Title font size | 13px, weight 600 |
| Description font size | 12px, color `#525252` |
| Stack gap | 8px |
| Position | bottom-inline-end, `24px` from edge |

Animation: slide up `8px` + fade in `200ms`. Dismiss: slide down + fade out `150ms`.  
Auto-dismiss: `4000ms` (info/success), `6000ms` (warning/error).

**RTL:** Position moves to bottom-inline-start.

---

### 7.12 Sidebar Navigation

| Property | LTR Value | RTL Value |
|---|---|---|
| Sidebar width (expanded) | 220px | 220px |
| Sidebar width (collapsed) | 48px | 48px |
| Sidebar padding-x | 8px | 8px |
| Sidebar padding-top | 12px | 12px |
| Nav item height | 32px | 32px |
| Nav item padding-x | 8px | 8px |
| Nav item radius | 6px | 6px |
| Nav item font size | 13px | 13px |
| Nav item font weight | 500 | 500 |
| Nav item gap (icon to label) | 8px | 8px |
| Nav item icon size | 16px | 16px |
| Section label font size | 11px | 11px |
| Section label color | `#A3A3A3` | `#A3A3A3` |
| Section label padding | `16px 8px 4px` | `16px 8px 4px` |
| Section gap | 8px | 8px |

Nav item states:
- Default: `bg: transparent`, `color: #525252`
- Hover: `bg: rgba(0,0,0,0.04)`, `color: #0A0A0A`
- Active: `bg: #EEF2FF`, `color: #4F46E5`, icon `color: #4F46E5`
- Disabled: `color: #D4D4D4`, no hover

Collapse toggle: `32px × 32px`, positioned at sidebar bottom, `12px` from bottom edge.  
Collapse transition: `250ms` cubic-bezier(0.16,1,0.3,1).

When collapsed: show icon only, `width: 48px`. Tooltip shows nav item label on hover.

**Logo area:** `height: 48px`, `padding: 0 12px`, `border-bottom: 1px solid #E5E5E5`.

---

### 7.13 Top Bar

| Property | Value |
|---|---|
| Height | 48px |
| Padding-x | 16px |
| Border-bottom | `1px solid #E5E5E5` |
| Background | `#FFFFFF` |
| Shadow | none (border only) |
| Left section gap | 8px |
| Right section gap | 8px |
| Search input width | 240px |

---

### 7.14 Chat Bubble (Monitor / Chat)

**Visitor bubble (incoming):**
- `background: #F0F0F0`, `color: #0A0A0A`
- `padding: 10px 14px`
- `border-radius: 12px 12px 12px 4px` (LTR), `12px 12px 4px 12px` (RTL)
- `max-width: 480px`
- `font-size: 14px`, `line-height: 22px`

**Agent bubble (outgoing):**
- `background: #4F46E5`, `color: #FFFFFF`
- `padding: 10px 14px`
- `border-radius: 12px 12px 4px 12px` (LTR), `12px 12px 12px 4px` (RTL)
- `max-width: 480px`
- `font-size: 14px`, `line-height: 22px`

**Internal note bubble:**
- `background: #FFFBEB`, `color: #92400E`
- `border: 1px solid #FDE68A`
- `padding: 10px 14px`
- `border-radius: 8px`
- `max-width: 480px`
- Label above bubble: `font-size: 11px`, `color: #B45309`, `font-weight: 500`, text "Internal Note"

**Bot bubble:**
- Same as visitor bubble plus `4px` leading bot avatar (`20px` diameter)

Bubble group gap: `4px`. Gap between groups (different sender): `16px`.  
Timestamp: `font-size: 11px`, `color: #A3A3A3`, shown below group, align to bubble edge.

---

### 7.15 Form

Form group gap (between fields): `16px`.  
Fieldset gap (grouped related fields): `24px`.  
Form section gap (visual blocks): `32px`.  
Submit button: always `primary`, size `md`, placed at inline-end of form footer.  
Form max-width: `560px` (standalone form), full-width inside panels.

---

## 8. Layout Rules

### 8.1 Breakpoints

| Name | Min Width | Usage |
|---|---|---|
| `sm` | 640px | Mobile landscape, small tablet |
| `md` | 768px | Tablet portrait |
| `lg` | 1024px | Desktop minimum |
| `xl` | 1280px | Standard desktop |
| `2xl` | 1440px | Wide desktop |
| `3xl` | 1920px | 4K / ultrawide |

Dashboard requires `lg` minimum. Below `lg`, show a "use desktop" message.

### 8.2 Page Grid

| Property | Mobile | Desktop |
|---|---|---|
| Columns | 4 | 12 |
| Gutter | 16px | 24px |
| Margin | 16px | 24px |
| Max content width | 100% | 1280px |

### 8.3 Dashboard App Shell

```
[ Sidebar 220px ] [ Top Bar 48px        ]
                  [ Content Area flex-1 ]
```

- Sidebar: `position: fixed`, `top: 0`, `inset-inline-start: 0`, `height: 100vh`
- Main area: `margin-inline-start: 220px` (LTR) / `margin-inline-end: 220px` (RTL)
- Top bar: `position: sticky`, `top: 0`, `z-index: 10`
- Content area: `padding: 24px`, `overflow-y: auto`

### 8.4 Monitor 3-Panel Layout

```
[ Conversation List 320px ] [ Chat Display flex-1 ] [ Contact Info 280px ]
```

| Panel | Width | Overflow |
|---|---|---|
| Conversation List | `320px` fixed | `overflow-y: auto` |
| Chat Display | `flex: 1` (min `400px`) | `overflow-y: auto` |
| Contact Info | `280px` fixed | `overflow-y: auto` |

Panel separators: `1px solid #E5E5E5`, no shadow.  
Total minimum viewport: `1024px` (320 + 400 + 280 + 24 sidebar margin).

Chat Display anatomy:
- Header: `height: 52px`, `padding: 0 16px`, `border-bottom: 1px solid #E5E5E5`
- Messages area: `flex: 1`, `padding: 16px`, `gap: 4px`
- Input area: `min-height: 64px`, `padding: 12px 16px`, `border-top: 1px solid #E5E5E5`

Conversation List anatomy:
- Search bar: `height: 52px`, `padding: 8px 12px`, `border-bottom: 1px solid #E5E5E5`
- Filter bar: `height: 40px`, `padding: 0 12px`, `border-bottom: 1px solid #E5E5E5`
- List items: `height: 72px`, `padding: 12px 16px`, `border-bottom: 1px solid #F0F0F0`

**RTL Monitor:** Panel order reverses. Conversation list at inline-end (right in LTR).

### 8.5 Settings Layout

```
[ Settings Nav 200px ] [ Settings Content max-width 720px ]
```

Settings content padding: `32px`.

### 8.6 Z-index Scale

| Layer | Value | Usage |
|---|---|---|
| `z-base` | 0 | Default stacking |
| `z-raised` | 10 | Sticky headers, top bar |
| `z-dropdown` | 100 | Dropdowns, popovers |
| `z-sticky` | 200 | Floating action buttons |
| `z-overlay` | 300 | Modal backdrops |
| `z-modal` | 400 | Modals, dialogs |
| `z-toast` | 500 | Toast notifications |
| `z-tooltip` | 600 | Tooltips (always on top) |

---

## 9. Motion & Animation

### 9.1 Duration Scale

| Token | Value | Usage |
|---|---|---|
| `duration-instant` | 75ms | Checkbox toggle, radio select |
| `duration-fast` | 100ms | Button hover bg, icon swap |
| `duration-normal` | 150ms | Dropdowns open, tooltip fade, input focus ring |
| `duration-slow` | 200ms | Modal enter, toast slide |
| `duration-xslow` | 250ms | Sidebar collapse, drawer slide |
| `duration-page` | 300ms | Page transitions |

### 9.2 Easing Functions

| Token | CSS Value | Usage |
|---|---|---|
| `ease-standard` | `cubic-bezier(0.16, 1, 0.3, 1)` | Panels, modals, drawers entering (spring-like) |
| `ease-enter` | `cubic-bezier(0.0, 0.0, 0.2, 1)` | Elements entering the screen |
| `ease-exit` | `cubic-bezier(0.4, 0.0, 1, 1)` | Elements exiting the screen |
| `ease-linear` | `linear` | Progress bars, spinners, shimmer |
| `ease-bounce` | `cubic-bezier(0.34, 1.56, 0.64, 1)` | Notification badge pop, avatar drop |

### 9.3 Animation Rules

- **Never animate layout properties** (`width`, `height`, `padding`, `margin`). Use `transform` and
  `opacity` only for performance.
- **Respect `prefers-reduced-motion`**: wrap all `@keyframes` and transitions in
  `@media (prefers-reduced-motion: no-preference)`. Reduced motion = instant state change.
- **Stagger lists**: when a list of items enters, stagger by `20ms` per item, max `10` items
  staggered (items beyond 10 use the 10th item delay).
- **Loading spinners**: `360deg` rotation, `duration: 700ms`, `ease-linear`, infinite.
- **Skeleton loaders**: shimmer from `bg-subtle` to `bg-muted`, `1.5s ease-in-out` infinite.

### 9.4 Common Transition Specs

| Interaction | Property | Duration | Easing |
|---|---|---|---|
| Button hover | `background-color` | 100ms | ease-fast |
| Button press | `transform: scale(0.98)` | 75ms | ease-linear |
| Input focus ring | `box-shadow` | 150ms | ease-standard |
| Dropdown open | `opacity` + `translateY(-4px → 0)` | 150ms | ease-enter |
| Dropdown close | `opacity` + `translateY(0 → -4px)` | 100ms | ease-exit |
| Modal open | `opacity` + `scale(0.95 → 1)` | 200ms | ease-standard |
| Modal close | `opacity` + `scale(1 → 0.95)` | 150ms | ease-exit |
| Toast enter | `opacity` + `translateY(8px → 0)` | 200ms | ease-standard |
| Toast exit | `opacity` + `translateY(0 → 8px)` | 150ms | ease-exit |
| Sidebar collapse | `width` (exception — use clip-path if possible) | 250ms | ease-standard |
| Page transition | `opacity` | 200ms | ease-enter |
| Skeleton shimmer | `background-position` | 1500ms | ease-linear, infinite |

---

## 10. RTL / LTR Rules

| Rule | Detail |
|---|---|
| Direction | Set `dir="rtl"` on `<html>` for `ar` locale |
| Font | Switch to `Cairo` for Arabic content, keep `Inter` for numbers/code |
| Logical properties | Always use `padding-inline`, `margin-inline`, `border-inline`, `inset-inline` instead of left/right |
| Icons | Mirror icons that imply direction (arrows, chevrons, send, back). Do NOT mirror symmetric icons (close, settings, star). |
| Text alignment | `text-align: start` — never hardcode `left` or `right` |
| Shadows | `box-shadow` with positive x-offset in LTR becomes negative in RTL — use `logical` shadows or reset in RTL |
| Toast position | `bottom-inline-end` — renders correctly in both directions |
| Table | Columns in the same order; cells start at inline-start |
| Chat bubbles | Radius values swap as documented in 7.14 |
| Numbers | Always render in Western Arabic numerals (`1234`) not Eastern Arabic (`١٢٣٤`) |

---

## 11. Icon Rules

Icon library: `lucide-react`.  
Never use two icon libraries in the same component.

| Context | Size |
|---|---|
| Inside button (xs/sm) | 12px |
| Inside button (md) | 14px |
| Inside button (lg/xl) | 16px |
| Inline in text (sm) | 14px |
| Inline in text (md/base) | 16px |
| Navigation sidebar | 16px |
| Section heading | 18px |
| Empty state | 40px |
| Illustration-level | 48px |

Stroke width: `1.5` everywhere. Never `1` or `2`.  
Color: inherits `currentColor`. Never hardcode icon color unless semantic (status dot, error icon).

---

## 12. Accessibility Rules

- All interactive elements must have `:focus-visible` ring: `outline: 2px solid #4F46E5`,
  `outline-offset: 2px`.
- Color alone must never convey information — always pair color with text or icon.
- Minimum touch target: `44px × 44px`. Visual size may be smaller; use padding or pseudo-element.
- All images and icons must have `aria-label` or `aria-hidden="true"`.
- Modals trap focus. Close on `Escape`. Return focus to trigger on close.
- All form inputs have associated `<label>` elements (not placeholder-only).
- Contrast ratios: body text ≥ 4.5:1, large text ≥ 3:1.

---

DESIGN.md written — 13 sections, design system defined.