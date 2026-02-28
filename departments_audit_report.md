# Codebase Audit: Departments & Teammate Assignment

This report provides a full audit of the current implementation of departments and teammate assignment in the Yoosr codebase, highlighting the current data models, logic flows, and identified gaps.

---

## 1. Schema Definitions

### Departments Table
**File:** `/convex/schema.ts` (Lines 148–156)
```typescript
    // Departments
    departments: defineTable({
        projectId: v.id("projects"),
        name: v.string(),
        description: v.optional(v.string()),
        isDefault: v.optional(v.boolean()),
        routingMode: v.optional(v.string()), // "pooled" | "assigned"
        botId: v.optional(v.string()), // Bot ID if AI-assigned
        tags: v.optional(v.array(v.string())),
    }).index("by_projectId", ["projectId"]),
```

### Project Members Table
**File:** `/convex/schema.ts` (Lines 25–36)
```typescript
    // Project members (team)
    project_members: defineTable({
        projectId: v.id("projects"),
        userId: v.optional(v.string()), // Clerk user ID (null if invited but not joined)
        role: v.string(), // "owner" | "administrator" | "agent"
        status: v.string(), // "available" | "unavailable"
        invitedEmail: v.optional(v.string()),
        invitedAt: v.optional(v.number()),
        inviteStatus: v.optional(v.string()), // "pending" | "accepted" | "rejected"
    })
        .index("by_projectId", ["projectId"])
        .index("by_userId", ["userId"])
        .index("by_invitedEmail", ["invitedEmail"]),
```

---

## 2. Convex Logic (Mutations & Queries)

### Department Management
**File:** `/convex/settings.ts`
```typescript
// List departments for a project
export const listDepartments = query({
    args: { projectId: v.id("projects") },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return [];
        return await ctx.db
            .query("departments")
            .withIndex("by_projectId", (q) => q.eq("projectId", args.projectId))
            .collect();
    },
});

// Create a new department
export const createDepartment = mutation({
    args: {
        projectId: v.id("projects"),
        name: v.string(),
        description: v.optional(v.string()),
        isDefault: v.optional(v.boolean()),
        routingMode: v.optional(v.string()),
        botId: v.optional(v.string()),
        tags: v.optional(v.array(v.string())),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Not authenticated");
        const id = await ctx.db.insert("departments", args);
        await ctx.runMutation(internal.activityLogs.logActivityInternal, {
            projectId: args.projectId,
            actorId: identity.subject,
            actorName: identity.name ?? identity.email ?? "Unknown",
            action: "department_updated",
            targetType: "department",
            targetId: id,
            metadata: { name: args.name, change: "created" },
        });
        return id;
    },
});

// Update an existing department
export const updateDepartment = mutation({
    args: {
        id: v.id("departments"),
        name: v.optional(v.string()),
        description: v.optional(v.string()),
        isDefault: v.optional(v.boolean()),
        tags: v.optional(v.array(v.string())),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Not authenticated");
        const { id, ...updates } = args;
        const clean: Record<string, any> = {};
        for (const [k, v] of Object.entries(updates)) if (v !== undefined) clean[k] = v;
        await ctx.db.patch(id, clean);
    },
});

// Remove a department
export const removeDepartment = mutation({
    args: { id: v.id("departments") },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Not authenticated");
        await ctx.db.delete(args.id);
    },
});
```

### Routing & Assignment Engine
**File:** `/convex/routing.ts` (Routing logic)
```typescript
export const routeConversation = internalMutation({
    args: {
        conversationId: v.id("conversations"),
        projectId: v.id("projects"),
        departmentId: v.optional(v.id("departments")),
        initialMessage: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const conversation = await ctx.db.get(args.id);
        if (!conversation) return;

        // 1. Get all members for this project
        const members = await ctx.db
            .query("project_members")
            .withIndex("by_projectId", (q) => q.eq("projectId", args.projectId))
            .collect();

        // Filter for available human agents
        const availableAgents = members.filter(
            (m) => m.status === "available" && m.userId && (m.role === "agent" || m.role === "administrator" || m.role === "owner")
        );

        let chosenAgentId: string | null = null;

        // Apply least-busy algorithm
        if (availableAgents.length > 0) {
            // ... algorithm implementation ...
            // NOTE: Currently ignores departmentId filter for human agents
        }

        if (chosenAgentId) {
            // Assign to human...
        } else {
            // Fallback to bot assignment
            if (args.departmentId) {
                const dept = await ctx.db.get(args.departmentId);
                if (dept?.botId) {
                    // Use department-specific bot
                }
            }
        }
    }
});
```

---

## 3. Frontend Pages

### Departments Settings Page
**File:** `/src/app/dashboard/settings/departments/page.tsx`
- **Functionality:** CRUD operations for departments.
- **Features:** 
  - Routing mode selection (Pooled vs Assigned).
  - AI Integration toggle.
  - Tag management for routing.
- **Observation:** The UI allows adding tags/routing logic, but the actual filtering per agent/department is not yet implemented in the backend.

### Teammates Settings Page
**File:** `/src/app/dashboard/settings/teammates/page.tsx`
- **Functionality:** Invitation and role management for the project.
- **Roles:** Owner, Administrator, Agent.
- **Observation:** There is no UI for assigning a teammate to a specific department.

---

## 4. Relationship Health Check

### Do members link to departments?
**No.** Checked the `project_members` table and the `members.ts` file. There is no `departmentId` or `departmentIds` field in the member record.

### Do departments link to members?
**No.** Checked the `departments` table. It contains a `botId` for AI assignment, but does not maintain any list of human member IDs or user IDs.

---

## 5. Usage of "departmentId" in Frontend

Search results for `departmentId` in `/src`:

| File Path | Description |
|---|---|
| `src/types/flow.ts` | Type for Design Studio nodes. |
| `src/components/design-studio/NodePropertiesPanel.tsx` | UI to set departmentId on a "Change Dept" block. |
| `src/components/chat/ChatArea.tsx` | Transfer conversation mutation execution. |
| `src/components/dashboard/monitor/chat-display.tsx` | Transfer conversation functionality in monitor. |

---

## 6. Identified Infrastructure Gaps

1. **Member-Department Link:** There is currently no database relationship between agents and departments. An agent belongs to a project but cannot be restricted or prioritized for a specific department (e.g., "Sales").
2. **Routing Logic:** The `routeConversation` mutation in `routing.ts` fetches **all** project members regardless of whether a `departmentId` was passed. It effectively treats departments as global categories rather than isolated agent pools.
3. **UI for Mapping:** Both settings pages (`departments` and `teammates`) lack the ability to bridge the two entities. An Admin cannot select which agents live in which department.
4. **Reference Compliance:** Per `TILEDESK_REFERENCE.md`, assignment should be "Department-based routing." The current codebase has the tables but lacks the relational logic to enforce this.
