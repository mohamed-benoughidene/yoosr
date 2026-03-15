# Localization — Spec

## Goal
Add full three-language support (Arabic, English, French) to Yoosr's dashboard,
widget, landing page, Design Studio (including canvas), widget test page, and
email notifications, with complete RTL layout for Arabic across every surface.

---

## Scope

### IN
- next-intl setup with App Router `[locale]` routing
- RTL layout switching for Arabic (full platform, no exceptions)
- Dashboard language: per-user preference stored in Clerk `publicMetadata.locale`
- Language switcher in user profile/settings (en / ar / fr)
- Widget language: browser auto-detect with operator manual override stored in Convex project
- Translation files for all three languages: dashboard UI strings, widget strings,
  landing page strings, Design Studio UI + canvas strings, test page strings
- Design Studio: full localization — UI chrome (sidebar, panels, toolbar) AND
  canvas node labels, block type names, and inline text
- Widget test page (already exists): add locale support so the embedded widget
  renders in the correct language based on browser detection or project override
- Email/notification string externalization (Clerk email templates + any in-app
  notification text)
- Tailwind RTL utility setup (`rtl:` variants enabled)

### OUT
- Professional translation quality (placeholder strings acceptable for launch)
- Locale-aware formatting of dates, numbers, currencies (deferred)
- Per-page language switching without full navigation (locale is set globally)
- Design Studio canvas RTL text direction inside node text inputs (deferred —
  canvas RTL is a distinct sub-problem from layout RTL)

---

## Architecture Decisions

### URL Structure
All routes nested under a `[locale]` segment:
- `/en/dashboard`, `/ar/dashboard`, `/fr/dashboard`
- `/en/`, `/ar/`, `/fr/` (landing page)
- `/en/design-studio`, `/ar/design-studio`, `/fr/design-studio`
- `/en/test`, `/ar/test`, `/fr/test` (widget test page)
- Widget itself is not URL-routed — locale resolved at render time

### Locale Resolution Order
**Dashboard + Design Studio:** Clerk `publicMetadata.locale` → browser
`Accept-Language` → `en`
**Widget + Test page:** Project `widgetLocale` override (if set) →
visitor browser `navigator.language` → `en`

### RTL
When `locale === "ar"`, the root `<html>` element gets `dir="rtl"` and
`lang="ar"`. Tailwind's `rtl:` variant handles component-level mirroring.
shadcn/ui components are RTL-compatible via CSS logical properties — no
forking needed. Design Studio canvas panels and toolbars get the same
treatment; node text content direction is out of scope for this phase.

---

## Schema Changes

### Convex — `projects` table
Add one optional field:
```ts
widgetLocale: v.optional(v.union(v.literal("en"), v.literal("ar"), v.literal("fr")))
```
Default: `undefined` (falls back to visitor browser detection).

No other schema changes. Dashboard locale lives in Clerk, not Convex.

---

## Backend

### Convex mutations
- `updateWidgetLocale(projectId, locale)` — sets `widgetLocale` on the project.
  Called from Widget Setup settings page.

### Clerk metadata
- Dashboard locale written to `user.publicMetadata.locale` via Clerk frontend SDK
  (`user.update({ publicMetadata: { locale } })`).
- Read on app load to determine which `[locale]` path to redirect to.
- No Convex involvement for dashboard locale.

### next-intl middleware
- Reads locale from URL segment first.
- On `/dashboard` hit with no locale prefix, reads Clerk `publicMetadata.locale`,
  falls back to `Accept-Language`, falls back to `en`, redirects to
  `/{locale}/dashboard`.
- Same logic applies for `/design-studio` and `/test` routes.

---

## Frontend

### File Structure
```
/messages
  en.json
  ar.json
  fr.json
/src/app
  /[locale]
    layout.tsx            ← sets <html dir lang>, provides NextIntlClientProvider
    /dashboard/...        ← all existing dashboard routes moved here
    /design-studio/...    ← Design Studio routes moved here
    /test/...             ← widget test page moved here
    /...                  ← landing page routes moved here
middleware.ts             ← next-intl locale detection + routing
```

### Translation File Namespaces
```json
{
  "nav": {},
  "monitor": {},
  "chat": {},
  "bots": {},
  "settings": {},
  "design_studio": {
    "toolbar": {},
    "panels": {},
    "blocks": {
      "reply": {},
      "condition": {},
      "ai_task": {},
      "capture": {},
      "web_request": {},
      "apply_label": {},
      "hitl": {},
      "wait": {},
      "ask_kb": {},
      "ai_assistant": {},
      "replace_bot": {},
      "clear_transcript": {},
      "set_attribute": {}
    }
  },
  "widget": {
    "greeting": {},
    "input_placeholder": {},
    "send": {},
    "powered_by": {}
  },
  "test_page": {
    "title": {},
    "subtitle": {},
    "open_widget": {}
  },
  "landing": {},
  "auth": {}
}
```

### Components to build/modify

1. **Root `[locale]/layout.tsx`** — wraps everything in `NextIntlClientProvider`,
   sets `<html dir={locale === "ar" ? "rtl" : "ltr"} lang={locale}>`.
2. **Language switcher** — dropdown in user account menu (top-right of dashboard).
   Writes to Clerk metadata + navigates to `/{newLocale}/dashboard`.
3. **Widget locale resolver** — reads project `widgetLocale` from Convex;
   if unset, reads `navigator.language`; resolves to `en|ar|fr`.
4. **Widget Setup settings page** — adds "Widget Language" select field
   (Auto-detect / English / Arabic / French).
5. **All dashboard pages** — replace hardcoded strings with `useTranslations()`.
6. **Design Studio UI chrome** — toolbar, block palette labels, side panels,
   inspector fields, all replace hardcoded strings with `useTranslations()`.
7. **Design Studio canvas nodes** — block type names and node labels rendered
   inside React Flow nodes replaced with translation keys. Node dimensions may
   need adjustment for Arabic string lengths.
8. **Widget test page** — replace hardcoded strings, add locale resolver so
   the embedded widget uses the correct language.
9. **Landing page** — replace hardcoded strings, add language toggle to nav.
10. **RTL audit pass** — every flex row, icon, directional padding/margin across
    dashboard, Design Studio, widget, test page, and landing page gets `rtl:`
    variants where directionality matters.

---

## Acceptance Criteria

1. Navigating to `/ar/dashboard` renders the full dashboard in Arabic with
   `dir="rtl"` on `<html>` — sidebar, panels, and text all mirrored correctly.
2. A user can switch language from the account menu — preference persists
   across sessions (Clerk metadata) and correct locale loads on next login.
3. The widget auto-detects Arabic from browser language and renders RTL with
   Arabic strings, without operator configuration.
4. An operator can override widget language to a fixed locale from Widget Setup
   settings — this overrides browser detection for all visitors.
5. The landing page renders correctly in all three languages at `/en`, `/ar`, `/fr`.
6. `/ar/design-studio` renders the Design Studio with Arabic UI chrome and
   Arabic block labels inside React Flow canvas nodes, with RTL panels.
7. The widget test page respects the same locale resolution as the widget —
   browser detect or project override.
8. French renders correctly LTR — no RTL bleed from Arabic config.
9. No hardcoded UI strings remain in dashboard, Design Studio, widget, test page,
   or landing page — all text comes from translation files.
10. Clerk email templates updated with localized content or marked with English
    fallback comment.
11. Build has zero TypeScript errors and zero next-intl key warnings in all
    three locales.

---

## Dependencies
- next-intl installed and configured
- Clerk `publicMetadata` write permission confirmed (frontend SDK)
- Convex `projects` table migration run (add `widgetLocale` field)
- All existing routes confirmed working before migration to `[locale]` segments
- Design Studio canvas audit: confirm how block labels are currently rendered
  (hardcoded strings vs constants) before writing canvas localization prompt

---

## Implementation Phases

### Phase A — Infrastructure (no UI changes)
1. Install next-intl, create `/messages/en.json` with all keys as English
   placeholders.
2. Create `middleware.ts` for locale routing.
3. Create `/app/[locale]/layout.tsx` with `dir`/`lang` switching and
   `NextIntlClientProvider`.
4. Migrate all existing routes under `/app/[locale]/` — verify every route
   works before moving on. This is the highest-risk task.

### Phase B — Dashboard strings
5. Add `ar.json` and `fr.json`.
6. Replace all hardcoded strings in dashboard pages with `useTranslations()`.
7. Build language switcher in account menu.
8. Wire Clerk metadata read/write for locale persistence.

### Phase C — Design Studio
9. Audit how block labels and node text are currently rendered in the canvas
   — report back before writing the localization prompt.
10. Replace Design Studio UI chrome strings with `useTranslations()`.
11. Replace canvas node labels with translation keys.
12. RTL audit for Design Studio panels, toolbar, and side drawers.

### Phase D — Widget + Test page
13. Add `widgetLocale` to Convex schema + `updateWidgetLocale` mutation.
14. Add Widget Language selector to Widget Setup settings page.
15. Build locale resolver in widget (browser detect + project override).
16. Replace widget hardcoded strings with translation keys + apply widget RTL.
17. Localize widget test page strings + wire locale resolver.

### Phase E — Landing page
18. Replace landing page hardcoded strings with translation keys.
19. Add language toggle to landing page nav.
20. RTL audit for landing page.

### Phase F — Emails / Notifications
21. Audit Clerk email templates — update or mark English fallback.
22. Audit in-app notification strings — externalize to translation files.

---

## Notes
- **Route migration (Phase A, task 4) is the highest-risk task** — touches every
  route. Run as one isolated prompt and verify fully before proceeding.
- **Design Studio canvas audit (Phase C, task 9) is required before writing
  any canvas localization prompt** — do not guess how node labels are rendered.
- **Canvas RTL text direction** (text flowing right-to-left inside node input
  fields) is explicitly out of scope — only the surrounding UI panels get RTL.
- `rtl:` Tailwind variants require usage in source files or safelist —
  confirm Tailwind v4 behavior before the RTL audit pass.
- shadcn/ui uses CSS logical properties in most components — RTL is largely
  automatic. Manual `rtl:` overrides needed mainly for icons, custom flex rows,
  and absolutely positioned elements.
- Node dimensions in React Flow may need `minWidth` adjustments for Arabic
  strings which can be longer than English equivalents.