# RBAC Audit Report — Yoosr Project

This audit examines the implementation of Role-Based Access Control (RBAC) across the Convex backend and the Next.js frontend.

## 1. Convex Backend Audit

We analyzed mutations across several core modules to determine if they enforce permissions based on the user's organization role (`org_role`).

### Mutations & Authorization Checks

| Module | Table/Feature | Mutations Checked | `org_role` Check? | Notes |
| :--- | :--- | :--- | :--- | :--- |
| `projects.ts` | Projects | `create`, `update`, `remove`, `ensureProject` | **NO** | Only checks `identity.org_id`. Any org member can delete a project. |
| `settings.ts` | Departments | `createDepartment`, `updateDepartment`, `removeDepartment`, `addMemberToDepartment` | **NO** | Only checks `identity.org_id`. |
| `settings.ts` | Canned Resp. | `createCannedResponse`, `updateCannedResponse`, `removeCannedResponse` | **NO** | No role checks. |
| `settings.ts` | Labels | `createLabel`, `updateLabel`, `removeLabel` | **NO** | No role checks. |
| `settings.ts` | Op. Hours | `upsertOperatingHours` | **NO** | No role checks. |
| `bots.ts` | Bots | `create`, `update`, `remove` | **NO** | No role checks. |
| `integrations.ts`| Integrations | `upsert`, `remove` | **NO** | No role checks. |
| `webhooks.ts` | Webhooks | `create`, `update`, `remove` | **NO** | No role checks. |
| `orders.ts` | Orders | `createOrder`, `updateOrderStatus`, `deleteOrder` | **NO** | No role checks. |

### Summary of Backend RBAC
*   **Current State**: Authorization is based solely on membership in the organization (`org_id`).
*   **Gap**: There is no distinction between `org:admin` and `org:member`. A member has the same write permissions as an admin, including destructive actions like deleting projects or integrations.

---

## 2. Frontend Audit

We examined the dashboard layout, sidebar, and settings pages for role-based rendering or interaction logic.

### Protected UI Elements

| Component | UI Element | Role Check? | Notes |
| :--- | :--- | :--- | :--- |
| `AppSidebar.tsx` | Navigation Links | **NO** | All links (Bots, Analytics, Settings, etc.) are visible to all users. |
| `SettingsSidebar.tsx`| Settings Links | **NO** | All settings sub-pages are visible to all users. |
| `Project Settings` | "Delete Project" | **NO** | The danger zone is visible and usable by any member. |
| `Webhooks Page` | "Add Webhook" | **NO** | Any member can create or delete webhook subscriptions. |
| `SiteHeader.tsx` | Status Switcher | **NO** | Any user can toggle their own availability (this is correct, but no global admin overrides exist). |

### Summary of Frontend RBAC
*   **Current State**: The UI assumes all users have full access once they are part of an organization.
*   **Missing Features**:
    *   No use of Clerk's `Protect` component or `useOrganization` hooks to hide admin-only sections.
    *   No conditional disabling of buttons based on the `userRole` returned by the `ProjectContext`.

---

## 3. Identity Shape in Convex

The current shape of the `identity` object in Convex (returned by `ctx.auth.getUserIdentity()`) is cast in several files (e.g., `projects.ts`, `orders.ts`) to a custom `ClerkIdentity` type:

```typescript
type ClerkIdentity = {
    subject: string;
    org_id?: string;
    org_role?: string; // Included in the type, but rarely used for logic
    [key: string]: any;
};
```

*   **`org_role` Status**: The field is present in the JWT from Clerk and accessible in Convex. It is currently being passed back to the frontend in the `api.projects.list` and `api.projects.get` queries (aliased as `userRole`).
*   **Usage**: It is **not** currently being used in any `handler` to `throw new ConvexError("Unauthorized")` for non-admin users.

---

## 4. Recommendations

1.  **Backend Enforcement**: Update mutations in `projects.ts`, `integrations.ts`, and `webhooks.ts` to require `identity.org_role === "org:admin"`.
2.  **Frontend Hiding**: Use the `userRole` available in `useProject()` or Clerk's `<Protect>` component to hide the "Settings" link in the sidebar for non-admins, or at least the "Danger Zone" in Project Settings.
3.  **Consistency**: Ensure `org_role` checking is standardized across all mutations that modify organization-level state versus user-level state (like messages or active conversations).
