# Audit: Member ID Consistency Across Department System

## 1. Profiles Table Schema (`convex/schema.ts`)

```typescript
profiles: defineTable({
    userId: v.string(), // Clerk user ID
    fullName: v.optional(v.string()),
    avatarUrl: v.optional(v.string()),
    username: v.optional(v.string()),
    email: v.optional(v.string()),
    isAvailable: v.optional(v.boolean()),
    orgId: v.optional(v.string()), // Added for multi-tenancy support
    updatedAt: v.optional(v.number()),
}).index("by_userId", ["userId"])
    .index("by_orgId", ["orgId"]),
```

**Field name:** `userId`, type: `v.string()`, comment says "Clerk user ID".

---

## 2. `addMemberToDepartment` in `convex/settings.ts`

```typescript
export const addMemberToDepartment = mutation({
    args: {
        departmentId: v.id("departments"),
        clerkUserId: v.string(),
    },
    handler: async (ctx, args) => {
        ...
        const memberIds = department.memberIds ?? [];
        if (!memberIds.includes(args.clerkUserId)) {
            await ctx.db.patch(args.departmentId, {
                memberIds: [...memberIds, args.clerkUserId],
            });
        }
    },
});
```

**What is pushed:** `args.clerkUserId` — the raw string passed from the frontend.

---

## 3. `routeConversation` Agent Filter in `convex/routing.ts`

```typescript
let availableAgents = await ctx.db
    .query("profiles")
    .withIndex("by_orgId", (q) => q.eq("orgId", project.orgId))
    .filter((q) => q.eq(q.field("isAvailable"), true))
    .collect();

...
if (department.memberIds) {
    const memberIds = new Set(department.memberIds);
    availableAgents = availableAgents.filter((agent) =>
        memberIds.has(agent.userId)
    );
}
```

**Comparison:** `agent.userId` (from the `profiles` table) is compared against values in `department.memberIds`.

---

## 4. Department Settings Page — Value Passed to `addMemberToDepartment`

```typescript
const { memberships } = useOrganization({ memberships: { infinite: true, pageSize: 50 } })
const members = (memberships?.data ?? []).map(m => ({
    userId: m.publicUserData?.userId ?? "",
    fullName: `${m.publicUserData?.firstName ?? ''} ${m.publicUserData?.lastName ?? ''}`.trim() || m.publicUserData?.identifier || "",
    imageUrl: m.publicUserData?.imageUrl ?? "",
    role: m.role,
}))
```

Called as:

```typescript
handleAssignMember(m.userId, dept._id)
```

Which calls:

```typescript
await addMemberToDepartment({ clerkUserId, departmentId })
```

**Value passed:** `m.publicUserData?.userId` from Clerk's `useOrganization().memberships`.

---

## ⚠️ Potential Mismatch

| Location | Value used | Source |
|---|---|---|
| `departments.memberIds` (written) | `m.publicUserData?.userId` | Clerk `useOrganization` |
| `routing.ts` agent filter | `agent.userId` | `profiles` table |
| `getMyDepartments` query | `identity.subject` | Convex auth JWT |

**Risk:** If `profiles.userId` (synced from Clerk webhook) and `m.publicUserData?.userId` (from Clerk's client SDK) contain the same Clerk user ID format, the system works. But `getMyDepartments` uses `identity.subject`, which in Convex+Clerk is typically formatted as `user_xxxx|org_yyyy` (a composite subject), **not** the bare Clerk user ID `user_xxxx`. If `memberIds` stores the bare Clerk user ID but `getMyDepartments` compares with `identity.subject`, the filter `d.memberIds?.includes(userId)` will **never match**.
