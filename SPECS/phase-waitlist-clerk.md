# Clerk Waitlist Mode — Spec

> Phase: Waitlist Gating  
> Status: Implemented  
> Audit source: Clerk Waitlist Mode — Codebase Audit (2026-03-29)

---

## Goal

Gate dashboard access behind Clerk's built-in Waitlist feature. All "Get Early Access"
entry points redirect to `/waitlist`. Hero and FinalCTA have a single CTA button —
no email form. User enters email once on the Clerk waitlist page.

---

## Scope

**IN:**
- Rename `proxy.ts` → `middleware.ts` (critical bug fix)
- Add `/waitlist` to public routes in middleware
- Add `waitlistUrl="/waitlist"` to `<ClerkProvider>`
- Create `/waitlist` page with Clerk `<Waitlist />` + dark theme
- Hero and FinalCTA: single "Get Early Access →" button → redirect to `/waitlist`
- LandingHeader, SocialProofBar, PricingTeaser: redirect to `/waitlist`
- DashboardAuthGuard: client-side auth check on dashboard layout
- Auth pages styling: dark background, Cabinet Grotesk titles

**OUT:**
- Convex `waitlist` table or `joinWaitlist` mutation — Clerk handles this entirely
- Email input forms on Hero or FinalCTA — single entry point on /waitlist only
- Email pre-fill via query param — does not work with Clerk `<Waitlist />` at runtime
- Changes to `NavbarCTA.tsx` — not used on marketing pages
- Changes to dashboard or onboarding flows

---

## Architecture

```
Landing page CTAs
  ├── Hero "Get Early Access →" button → window.location.href = '/waitlist'
  ├── FinalCTA "Get Early Access →" button → window.location.href = '/waitlist'
  ├── LandingHeader button → router.push('/waitlist')
  ├── SocialProofBar link → router.push('/waitlist')
  └── PricingTeaser button → router.push('/waitlist')
        ↓
/waitlist page (public route)
  └── WaitlistClient.tsx
        └── <Waitlist signInUrl="/login" /> with dark theme
              ↓ (user enters email + clicks "Join the waitlist")
        Clerk handles submission + approval flow
              ↓ (admin approves in Clerk Dashboard)
        User receives email → clicks link → /login
              ↓
        /dashboard (protected by middleware + DashboardAuthGuard)
```

---

## Known File Locations

| File | Path |
|---|---|
| Middleware | `src/middleware.ts` |
| ClerkProvider | `src/components/ConvexClientProvider.tsx` |
| Waitlist page | `src/app/[locale]/waitlist/page.tsx` |
| Waitlist client | `src/app/[locale]/waitlist/WaitlistClient.tsx` |
| Login client | `src/app/[locale]/login/LoginClient.tsx` |
| Signup client | `src/app/[locale]/signup/SignupClient.tsx` |
| Dashboard layout | `src/app/[locale]/dashboard/layout.tsx` |
| LandingHeader | `src/components/layout/LandingHeader.tsx` |
| Hero | `src/components/landing/Hero.tsx` |
| FinalCTA | `src/components/landing/FinalCTA.tsx` |
| SocialProofBar | `src/components/landing/SocialProofBar.tsx` |
| PricingTeaser | `src/components/landing/PricingTeaser.tsx` |

---

## Implementation Notes

### Middleware
- File: `src/middleware.ts` (renamed from `proxy.ts`)
- Protected: `/dashboard(.*)`, `/design-studio(.*)`
- Public: everything else including `/waitlist`, `/login`, `/signup`
- Unauthenticated redirect: `/login`
- Export: `export const middleware` + `export default middleware`

### DashboardAuthGuard
Client-side second layer of protection on the dashboard layout:
- `useAuth()` from `@clerk/nextjs`
- If `!isLoaded` → full-screen spinner
- If `isLoaded && !isSignedIn` → `router.push('/login')`
- If `isLoaded && isSignedIn` → render children

### Email pre-fill — NOT IMPLEMENTED
`initialValues` prop on Clerk `<Waitlist />` does not pre-fill at runtime despite
TypeScript workaround. Removed from implementation. Hero and FinalCTA use plain
redirect buttons instead of email forms.

---

## Auth Pages Styling

All three auth pages (/login, /signup, /waitlist) share the same visual style:
- Page background: `var(--lp-bg)` (#0C0B0F)
- Clerk widget: `dark` baseTheme from `@clerk/themes`
- Title above widget: Cabinet Grotesk 700, 28px, `var(--lp-text)`
- Subtitle above widget: Inter 400, 14px, `var(--lp-text-secondary)`, margin-bottom 24px
- Single centered column layout — no two-column split
- `signInUrl="/login"` on `<Waitlist />` component

---

## Acceptance Criteria

1. `/dashboard` is protected — unauthenticated users redirected to `/login`
2. `/waitlist` page loads Clerk `<Waitlist />` in dark theme
3. Submitting email on `/waitlist` adds user to Clerk waitlist
4. Hero "Get Early Access →" button redirects to `/waitlist`
5. FinalCTA "Get Early Access →" button redirects to `/waitlist`
6. LandingHeader "Get Early Access" → redirects to `/waitlist`
7. SocialProofBar "→ Get Early Access" → redirects to `/waitlist`
8. PricingTeaser CTA → redirects to `/waitlist`
9. `/waitlist` is a public route — no auth required
10. "Already have access? Sign in" on waitlist page links to `/login` not Clerk hosted page
11. All auth pages (/login, /signup, /waitlist) have dark background matching lp-bg

---

## Dependencies

- Clerk Dashboard: manually enable **Restrictions → Waitlist mode** before testing AC3
- `@clerk/nextjs` and `@clerk/themes` already installed
