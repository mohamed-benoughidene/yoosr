# Current Route Map Audit

## 1 & 2. Directory Tree and Segment Types

Here is the current route structure under `src/app`, mapping directories to their page/layout/route definitions:

```
src/app/
├── api/
│   └── widget/
│       └── project/
│           └── route.ts (Route Handler)
├── dashboard/
│   ├── activities/
│   │   └── page.tsx
│   ├── analytics/
│   │   └── page.tsx
│   ├── apps/
│   │   ├── [provider]/
│   │   │   └── page.tsx (Dynamic segment)
│   │   └── page.tsx
│   ├── bots/
│   │   └── page.tsx
│   ├── chat/
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── contacts/
│   │   └── page.tsx
│   ├── history/
│   │   └── page.tsx
│   ├── kb/
│   │   ├── [kbId]/
│   │   │   └── page.tsx (Dynamic segment)
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── layout.tsx
│   ├── monitor/
│   │   └── page.tsx
│   ├── orders/
│   │   └── page.tsx
│   ├── page.tsx
│   ├── requests/
│   │   └── page.tsx
│   ├── settings/
│   │   ├── canned-responses/
│   │   │   └── page.tsx
│   │   ├── departments/
│   │   │   └── page.tsx
│   │   ├── groups/
│   │   │   └── page.tsx
│   │   ├── integrations/
│   │   │   └── page.tsx
│   │   ├── labels/
│   │   │   └── page.tsx
│   │   ├── layout.tsx
│   │   ├── operating-hours/
│   │   │   └── page.tsx
│   │   ├── page.tsx
│   │   ├── webhooks/
│   │   │   └── page.tsx
│   │   └── widget/
│   │       └── page.tsx
│   └── test-widget/
│       └── page.tsx
├── design-studio/
│   ├── [botId]/
│   │   ├── BotEditorClient.tsx (Client Component)
│   │   └── page.tsx (Dynamic segment)
│   └── layout.tsx
├── globals.css (Styles)
├── layout.tsx (Root Layout)
├── [locale]/
│   └── layout.tsx (Localization Layout)
├── login/
│   ├── LoginClient.tsx (Client Component)
│   └── page.tsx
├── (marketing)/ (Route Group)
│   ├── layout.tsx
│   ├── legal/
│   │   ├── privacy/
│   │   │   └── page.tsx
│   │   └── terms/
│   │       └── page.tsx
│   └── page.tsx
├── onboarding/
│   ├── OnboardingClient.tsx (Client Component)
│   └── page.tsx
├── pricing/
│   └── page.tsx
├── products/
│   └── [slug]/
│       └── page.tsx (Dynamic segment)
├── signup/
│   ├── page.tsx
│   └── SignupClient.tsx (Client Component)
├── solutions/
│   └── [slug]/
│       └── page.tsx (Dynamic segment)
├── test-widget/
│   └── page.tsx
└── widget/
    ├── components/
    │   └── PreChatForm.tsx (Component)
    ├── layout.tsx
    ├── page.tsx
    └── rating-component.tsx (Component)
```

## 3. Existing Route Groups
- `(marketing)`: Used to group marketing pages, including `legal/privacy`, `legal/terms`, and the global marketing index `page.tsx`.

## 4. Dynamic Segments Currently in Use
- `[provider]` under `/dashboard/apps`
- `[kbId]` under `/dashboard/kb`
- `[botId]` under `/design-studio`
- `[locale]` under `/` (already created for the localization layout)
- `[slug]` under `/products` and `/solutions`

## 5. Current Root `layout.tsx`
The primary source layout at `src/app/layout.tsx` defines metadata and imports the `Geist` fonts.

**What providers does it wrap?**
It strictly wraps the nested content in `<Providers> {children} </Providers>`. The `{ Providers }` are imported from `@/components/providers`.

**What does the `<html>` tag look like?**
It currently has a hardcoded language: `<html lang="en">` with no bidirectional `dir` mapping. The `<body>` includes variables for the `Geist` fonts along with standard Tailwind `antialiased` utility classes.

## 6. Current `middleware.ts`
The only existing middleware is mapped for the `next-intl` configuration we just set up during Phase A of the localization spec. It intercepts everything, except for defined paths (`/api/*`, `_next`, `favicon.ico`, and typical static extensions `.png`, `.jpg`, `.svg`, etc.), and adds the relevant routing parameters for `["en", "ar", "fr"]` with `"en"` as the default fallback. There was no pre-existing logic (such as Clerk Auth or custom redirects) placed here prior to this integration.

## 7. Hardcoded Rules in `next.config.ts`
The `next.config.ts` is currently completely empty regarding hardcoded redirects or rewrites. It only establishes the basic Next.js environment by exporting a blank `nextConfig` definitions block.
