# Agent Presence and Availability Audit

## PART 1 — Profiles Table
**File:** `convex/schema.ts` (lines 6-16)

The `profiles` table currently defines the following fields:
- `userId` (v.string())
- `fullName` (v.optional(v.string()))
- `avatarUrl` (v.optional(v.string()))
- `username` (v.optional(v.string()))
- `email` (v.optional(v.string()))
- `isAvailable` (v.optional(v.boolean()))
- `orgId` (v.optional(v.string()))
- `updatedAt` (v.optional(v.number()))

**Specifically checking for presence fields:**
- `isAvailable`: **Exists**
- `lastSeenAt`: **Does not exist**
- `orgId`: **Exists**
- `userId`: **Exists**
- **Other heartbeat/presence fields**: None exist. There is no `lastSeenAt` or `heartbeatAt` field present.

## PART 2 — Existing Presence Mutations
**File:** `convex/profiles.ts`

The codebase already contains mutations that act on presence/availability:

1. **`setAvailability`** (mutation) - Lines 177-206
   - **Accepts args**: `{ isAvailable: v.boolean() }`
   - **Functionality**: Uses `ctx.auth.getUserIdentity()`. Checks if the profile exists; if it does, it updates `isAvailable`, `orgId`, and `updatedAt`. If it doesn't, it inserts a new profile with these fields.

2. **`setOffline`** (internalMutation) - Lines 208-224
   - **Accepts args**: `{ userId: v.string() }`
   - **Functionality**: Updates an existing profile to set `isAvailable: false` and `updatedAt: Date.now()`.

## PART 3 — Profile Creation
**File:** `convex/profiles.ts`

The primary place a profile is created when a user accesses the dashboard is the **`ensureCurrent`** mutation (Lines 106-151). 

When called, if a profile does not exist, it inserts one and sets these fields:
```typescript
{
    userId: identity.subject,
    fullName: identity.name || "Agent",
    email: identity.email,
    avatarUrl: identity.pictureUrl,
    orgId: (identity as any).org_id,
    updatedAt: Date.now(),
}
```
*Note: `isAvailable` is not set on creation during `ensureCurrent`.*

## PART 4 — Frontend Dashboard Shell
**File:** `src/app/dashboard/layout.tsx`

This is the root dashboard layout file.
**What it renders:**
It wraps the dashboard in `<SidebarProvider>`, `<AppSidebar />`, `<SidebarInset>`, and `<SiteHeader />`.

**Presence Lifecycle Hooks:**
Yes, it contains a `useEffect` and `useMutation` that handles presence updates:
- It calls `ensureProfile()` (`useMutation(api.profiles.ensureCurrent)`) when the component mounts.
- It sets up a `beforeunload` event listener that reads the current user ID using `@clerk/nextjs` (`useUser()`).
- On unload, it triggers: `navigator.sendBeacon( ${siteUrl}/presence/offline, blob);` with the user ID in the payload.

## PART 5 — Clerk User Identity in Convex
**File:** `convex/profiles.ts` (Example in `ensureCurrent` mutation)

When reading the user's identity using `ctx.auth.getUserIdentity()`, it accesses the fields exactly as follows:
- **id**: `identity.subject`
- **name**: `identity.name`
- **orgId**: `(identity as any).org_id`

## PART 6 — getOnlineAgentsInternal
**File:** `convex/bot.ts` (Lines 640-647)

The full current implementation of `getOnlineAgentsInternal` is as follows:

```typescript
export const getOnlineAgentsInternal = internalQuery({
    args: { projectId: v.id("projects") },
    handler: async (ctx, args) => {
        // TODO: Query online agents from Clerk Organization membership
        // For now, return an empty array
        return [];
    }
});
```
