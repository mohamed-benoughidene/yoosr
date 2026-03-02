# Feature Audits Report - March 2, 2026

## 1. Audit: "Transfer to Agent" Feature

The audit of the **Transfer to Agent** feature in the Monitor section reveals that it is currently **unimplemented** and uses hardcoded empty data, which explains why organization members are not appearing in the dialog.

### 1.1 Component Rendering the "Transfer to Agent" Dialog
The feature is present in two main components:
- `src/components/dashboard/monitor/chat-display.tsx` (Line 349)
- `src/components/chat/ChatArea.tsx` (Line 320)

### 1.2 Member Data Fetching Logic
In both components, the list of members is **not fetched** from any query or action. Instead, it is initialized as a hardcoded empty array:

**`src/components/dashboard/monitor/chat-display.tsx`**:
```typescript
49:     const projectMembers: Array<{ userId: string; profile?: { fullName?: string; avatarUrl?: string }; role?: string }> = [];
```

**`src/components/chat/ChatArea.tsx`**:
```typescript
57:     const projectMembers: Array<{ userId: string; profile?: { fullName?: string; avatarUrl?: string }; role?: string }> = [];
```

Because of this, the dialog logic always evaluates `projectMembers.length === 0` to true and displays "No agents found."

### 1.3 Source of Member Data
The components currently use **neither** Clerk's `useOrganization()` nor a Convex query for member data. The `AGENT.md` instructions specify that multi-tenancy is handled via Clerk Organizations and that the `project_members` table has been removed. However:
- The frontend has not been updated to use `useOrganization()` to fetch members.
- The backend lacks a query that bridges Clerk membership with the Convex `profiles` table.

### 1.4 Convex Query for Members
There is **no exact Convex query** currently implemented to return the agent/member list. Multiple backend files contain `TODO` comments or commented-out code indicating this missing integration:

**`convex/settings.ts`**:
```typescript
20:         // Enrich each department with its assigned members and their profiles
21:         // TODO: Query members from Clerk Organization membership
22:         const enrichedMembers: any[] = [];
```

**`convex/routing.ts`**:
```typescript
21:         // 1. Get all members for this project
22:         // TODO: Query available agents from Clerk Organization membership
23:         // For now, fall back to bot assignment only
24:         let availableAgents: any[] = [];
```

**`convex/dashboard.ts`**:
```typescript
37:         // TODO: With Clerk Organizations, fetch active members online status from Clerk or a new presence system
38:         // const teamMembers = await ctx.db
39:         //     .query("project_members")
40:         //     .withIndex("by_projectId", q => q.eq("projectId", args.projectId))
41:         //     .collect();
```

### 1.5 `orgId` Passing Mechanism
In existing working queries (like `api.projects.list`), `orgId` is retrieved on the server-side from the authenticated identity:
```typescript
// convex/projects.ts
25:     handler: async (ctx) => {
26:         const identity = await ctx.auth.getUserIdentity() as ClerkIdentity | null;
27:         if (!identity || !identity.org_id) return [];
28: 
29:         const orgProjects = await ctx.db
30:             .query("projects")
31:             .withIndex("by_orgId", (q) => q.eq("orgId", identity.org_id!))
```

### 1.6 Query Return Data Structure
Since the query is missing, it returns nothing. Historically, the code references a deleted `project_members` table (as seen in `convex/dashboard.ts`). The modern approach intended (per `AGENT.md`) is to use Clerk's native organization management, which is not yet wired up to the Transfer dialog.

### 1.7 Errors
- **TypeScript**: No TypeScript errors are present because the empty array matches the expected interface.
- **Console**: No runtime errors are triggered; the UI simply shows an empty list state as designed:
```tsx
// src/components/dashboard/monitor/chat-display.tsx
363:                             ) : projectMembers.length === 0 ? (
364:                                 <div className="text-sm text-muted-foreground text-center py-4">No agents found.</div>
```

---

## 2. Audit: "Assign Members to Departments" Feature

The audit of the **Assign Members to Departments** feature in the Departments settings reveals that it is currently **unimplemented** and consists primarily of stubbed-out code, which explains why clicking the "+" button shows no members.

### 2.1 Component and Member Assignment UI
The Departments settings page is located in:
- `src/app/dashboard/settings/departments/page.tsx` (Line 48)

The member assignment UI is a `Popover` triggered by a `Button` with a `Plus` icon:
```tsx
// src/app/dashboard/settings/departments/page.tsx
339:                                                 <Popover>
340:                                                     <PopoverTrigger asChild>
341:                                                         <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full">
342:                                                             <Plus className="h-3.5 w-3.5" />
343:                                                         </Button>
344:                                                     </PopoverTrigger>
```

### 2.2 & 2.3 Fetching Member List
The member list inside the popover is **hardcoded as an empty array** on the frontend:
```tsx
// src/app/dashboard/settings/departments/page.tsx
67:     const members: any[] = []
```
Consequently, the UI logic displays "All members are in this department." because the list is empty:
```tsx
349:                                                                 {members.filter(m => m.userId && !dept.members?.find((dm: any) => dm.userId === m.userId)).length === 0 ? (
350:                                                                     <p className="text-xs text-center text-muted-foreground py-2">All members are in this department.</p>
```
The feature does **not** use Clerk's `useOrganization()` or a functioning Convex query to resolve the organization's members.

### 2.4 Convex Query and Department Logic
The `listDepartments` query on the backend also returns a hardcoded empty `members` array for each department:
```typescript
// convex/settings.ts
9: export const listDepartments = query({
...
20:         // Enrich each department with its assigned members and their profiles
21:         // TODO: Query members from Clerk Organization membership
22:         const enrichedMembers: any[] = [];
23: 
24:         return departments.map(dept => ({
25:             ...dept,
26:             members: enrichedMembers,
27:         }));
```

### 2.5 `project_members` Table References
The feature does not directly query a `project_members` table, but it lacks the logic to replace it. `AGENT.md` explicitly states the table was removed, but the code in `convex/dashboard.ts` (commented out) and `src/app/dashboard/settings/departments/page.tsx` shows the replacement logic is missing.

### 2.6 Department Schema and Assignments
The `departments` table in `convex/schema.ts` **does not have a field to store members**:
```typescript
// convex/schema.ts
136:     departments: defineTable({
137:         projectId: v.id("projects"),
...
144:     }).index("by_projectId", ["projectId"]),
```
There is also no junction table like `department_members` in the schema. This indicates that the data model for member-to-department assignment is **completely missing**.

### 2.7 Errors
- **TypeScript**: The `handleAssignMember` function (Line 144) is non-functional as its logic is commented out.
- **Backend Error**: A mutation `api.members.assignMemberToDepartment` is referenced in a comment (Line 70), but `convex/members.ts` does not exist.
- **Logic**: Since `members` is a constant empty array, the filtering logic for adding new members always returns an empty result set.
