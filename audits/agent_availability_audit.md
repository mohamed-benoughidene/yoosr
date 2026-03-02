# Agent Availability Toggle Feature Audit

## 1. Where availability state is stored
Currently, availability state is **not persisted** in any database or metadata store.
*   **Convex**: No `availability` or `status` field exists in the `profiles` table (the primary user table).
*   **Clerk**: There are no calls to `updateUserMetadata` or similar Clerk persistent storage.
*   **LocalStorage/React State**: In `SiteHeader.tsx`, it's stored in a **local React `useState` hook** (non-persistent across refreshes). In `DashboardHeader.tsx`, it's a **hardcoded stub**.

**File: `convex/schema.ts`**
```typescript
profiles: defineTable({
    userId: v.string(), // Clerk user ID
    fullName: v.optional(v.string()),
    avatarUrl: v.optional(v.string()),
    username: v.optional(v.string()),
    email: v.optional(v.string()),
    updatedAt: v.optional(v.number()),
}).index("by_userId", ["userId"]),
```

## 2. How the toggle sets availability
There is **no mutation or action** currently linked to the toggle. The logic is purely client-side logging.

**File: `src/components/dashboard/DashboardHeader.tsx`**
```typescript
const toggleAvailability = async (checked: boolean) => {
    console.log("Toggle availability: ", checked)
}
```

**File: `src/components/dashboard/SiteHeader.tsx`**
```typescript
const [isAvailable, setIsAvailable] = useState(true)
// ...
<Switch
    id="availability"
    checked={isAvailable}
    onCheckedChange={(val) => { setIsAvailable(val); console.log("availability:", val) }}
/>
```

## 3. How availability is read on page load
The state is defaulted to `true` on every mount via React `useState`. It is not fetched from any query or hook.
*   `DashboardHeader.tsx` uses a hardcoded member object: `const currentMember = { status: "available" }`.
*   `SiteHeader.tsx` initializes `useState(true)`.

## 4. The "Online Teammates" count on the home section
The "Online Teammates" count on the dashboard is currently a **hardcoded fallback value of `1`** in the Convex query.

**File: `src/app/dashboard/page.tsx`**
```typescript
const homeStats = useQuery(api.dashboard.getHomeStats, ...)
// Displays: {liveStats.onlineTeammatesCount}
```

**File: `convex/dashboard.ts`**
```typescript
// Fetch online teammates
// TODO: With Clerk Organizations, fetch active members online status from Clerk or a new presence system
// ... (commented out DB query)
const onlineTeammatesCount = 1; // Fallback for now
```

## 5. Mismatch Summary
There is a **complete mismatch** between the UI and the data layer:
*   **Write**: The toggle writes only to the browser console and local React state.
*   **Read**: Page loads default to "Available" locally, while the dashboard stats (Online Teammates) read a hardcoded `1` from Convex.
*   **Routing**: The assignment engine in `convex/routing.ts` also lacks presence checks, containing a `TODO: Query available agents from Clerk Organization membership` and defaulting to `availableAgents = []`.
