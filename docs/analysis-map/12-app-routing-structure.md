# Part 12: App Routing Structure

## 📊 Visual Map

```
src/app/ (Next.js App Router)
├── layout.tsx             → Root layout
├── page.tsx               → Home page (/)
├── (auth)/                → Auth route group
│   ├── sign-in/[[...sign-in]]/page.tsx
│   └── sign-up/[[...sign-up]]/page.tsx
│
├── (dashboard)/           → Dashboard route group (if present)
│   ├── layout.tsx
│   ├── page.tsx
│   └── ...
│
├── api/                   → API routes (if any)
│
├── [locales]/             → i18n routes (if using next-intl)
│
└── other routes
    ├── /projects
    ├── /bots
    ├── /conversations
    ├── /settings
    └── ...

src/middleware.ts          → Route middleware (auth, i18n, etc.)
```

## 📁 File Inventory

| File/Directory | Purpose |
|----------------|---------|
| `src/app/` | Next.js App Router directory |
| `src/app/layout.tsx` | Root layout |
| `src/app/page.tsx` | Home page |
| `src/app/(group)/` | Route groups for shared layouts |
| `src/middleware.ts` | Next.js middleware for routing logic |
| `src/i18n/` | Internationalization configuration |

## ✅ Analysis Checklist

- [ ] What's the route hierarchy?
- [ ] How are route groups used? (parentheses directories)
- [ ] Are there dynamic routes? (brackets: `[id]`)
- [ ] How is middleware used? (auth guards, i18n, logging)
- [ ] Is internationalization (i18n) routing enabled?
- [ ] What's the URL structure? (clean, nested, flat?)
- [ ] How are protected routes handled?
- [ ] Are there API routes in `app/api/`?
- [ ] How are 404 and error pages handled?
- [ ] What's the loading strategy? (suspense boundaries)
- [ ] Are there route handlers? (GET, POST, etc.)
- [ ] How is navigation implemented? (Link, useRouter, etc.)
- [ ] Are there any redirects or rewrites?
- [ ] How deep is the route nesting?

## 🔗 Dependencies

- **Depends on:** Part 03 (project structure), Part 07 (auth), Part 11 (styling)
- **Connected to:** Part 13 (pages), Part 14 (state), Part 15 (features)

## 📝 Agent Findings

<!-- Fill in during analysis -->

## 🔍 Key Patterns to Identify

- Route organization philosophy
- Middleware usage patterns
- Internationalization approach
- Protected route strategy
- Loading and error boundaries

## ⚠️ Potential Concerns to Watch For

- Overly deep route nesting
- Missing error boundaries
- No 404 handling
- Inconsistent route structure
- Missing middleware protection
- No loading states
- Broken navigation flows
- Hardcoded URLs instead of constants
