# Error Boundaries — Spec

## Goal
Add branded error.tsx boundary files across the app so unhandled errors
show a recoverable UI instead of the raw Next.js error page.

## Scope

IN:
- error.tsx for every route segment that has a page.tsx or layout.tsx
- A shared ErrorFallback component to avoid duplicating UI code
- "Try again" button (uses Next.js reset() callback)
- "Go home" button linking back to /dashboard

OUT:
- not-found.tsx (separate issue, separate phase)
- loading.tsx (separate issue, separate phase)
- Custom error tracking / Sentry integration
- Different designs per route

## Routes That Need error.tsx
Based on the inventory:
- /[locale]/(marketing)
- /[locale]/dashboard
- /[locale]/dashboard/chat
- /[locale]/dashboard/kb
- /[locale]/dashboard/settings
- /[locale]/design-studio
- /[locale]/dashboard/monitor
- /[locale]/dashboard/analytics
- /[locale]/dashboard/activities
- /[locale]/dashboard/contacts
- /[locale]/dashboard/bots
- /[locale]/dashboard/orders

## Shared Component
A single ErrorFallback component at src/components/error-fallback.tsx:
- Accepts message, reset (Next.js callback), and homeHref props
- Minimal dark UI matching the dashboard style
- "Try again" button calls reset()
- "Go home" button navigates to /[locale]/dashboard

## error.tsx Pattern
Every error.tsx:
- Must be a client component ("use client")
- Receives { error, reset } props from Next.js
- Renders ErrorFallback with appropriate homeHref

## Acceptance Criteria
1. Every route segment listed above has an error.tsx file
2. All error.tsx files are client components
3. Unhandled errors in any dashboard route show the branded fallback UI
   instead of the raw Next.js error page
4. "Try again" resets the error boundary and re-renders the segment
5. "Go home" navigates back to /dashboard
6. No duplicated UI code — all error.tsx files use the shared ErrorFallback

## Tasks
1. Create shared ErrorFallback component
2. Add error.tsx to all route segments listed above