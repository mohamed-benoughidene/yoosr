# Comprehensive Dashboard & Settings Audit — Yoosr

**Date**: March 2026  
**Scope**: Full audit of sidebar navigation, settings pages, user actions, backend mutations, frontend role checks, identity shape, and route protection.  
**Policy**: Read-only audit — no changes were made.

---

## 1. Sidebar Navigation Links

The main sidebar (`AppSidebar.tsx`) exposes the following links to **all authenticated organization members**, with no role-based filtering:

| # | Label | Route | Icon |
|---|-------|-------|------|
| 1 | Home | `/dashboard` | `Home` |
| 2 | Monitor | `/dashboard/monitor` | `Radio` |
| 3 | Chat | `/dashboard/chat` | `MessageSquare` |
| 4 | Requests | `/dashboard/requests` | `Inbox` |
| 5 | Orders | `/dashboard/orders` | `ShoppingBag` |
| 6 | Bots | `/dashboard/bots` | `Bot` |
| 7 | Knowledge Base | `/dashboard/kb` | `BookOpen` |
| 8 | Analytics | `/dashboard/analytics` | `BarChart3` |
| 9 | Activities | `/dashboard/activities` | `Activity` |
| 10 | History | `/dashboard/history` | `History` |
| 11 | Contacts | `/dashboard/contacts` | `Users` |
| 12 | Settings | `/dashboard/settings` | `Settings` |

> **Finding:** No links are hidden or disabled based on role. Every member sees every section.

---

## 2. Settings Pages

The settings sidebar (`SettingsSidebar.tsx`) lists the following sub-pages:

| # | Label | Route |
|---|-------|-------|
| 1 | Project Settings | `/dashboard/settings` |
| 2 | Widget Setup | `/dashboard/settings/widget` |
| 3 | Departments | `/dashboard/settings/departments` |
| 4 | Canned Responses | `/dashboard/settings/canned-responses` |
| 5 | Labels | `/dashboard/settings/labels` |
| 6 | Operating Hours | `/dashboard/settings/operating-hours` |
| 7 | Webhooks | `/dashboard/settings/webhooks` |
| 8 | Integrations | `/dashboard/settings/integrations` |

Additional settings pages exist but are **not listed** in the settings sidebar:
- `/dashboard/settings/groups` — placeholder page ("Groups management placeholder")

The main Project Settings page (`/dashboard/settings`) internally has **3 tabs**:
- **General** — Project name, description, AI model, SLA
- **Advanced** — Security toggles, Delete Project
- **Developer** — API Key, JWT Secret

> **Finding:** No settings pages are hidden based on role.

---

## 3. User Actions by Settings Page

### 3.1 Project Settings — General Tab
| Action | Type | Functional? |
|--------|------|-------------|
| Edit Project Name | Input + Save | ✅ Yes |
| Edit Project Description | Input + Save | ✅ Yes |
| Select Default AI Model | Select dropdown | ✅ Yes |
| Set First Response SLA (hours) | Input + Save | ✅ Yes |
| Copy Project ID | Button | ✅ Yes |

### 3.2 Project Settings — Advanced Tab
| Action | Type | Functional? |
|--------|------|-------------|
| Toggle "Require Email Verification" | Switch | ❌ Non-functional |
| Toggle "Block Spam Messages" | Switch | ❌ Non-functional |
| Toggle "IP Rate Limiting" | Switch | ❌ Non-functional |
| Delete Project | Button + confirmation dialog (type name) | ✅ Yes |

### 3.3 Project Settings — Developer Tab
| Action | Type | Functional? |
|--------|------|-------------|
| View/Hide API Key | Toggle visibility | ✅ Yes |
| Copy API Key | Button | ✅ Yes |
| View/Hide JWT Secret | Toggle visibility | ✅ Yes |
| Copy JWT Secret | Button | ✅ Yes |
| Rotate JWT Secret | Button | ❌ Non-functional |

### 3.4 Widget Setup
| Action | Type | Functional? |
|--------|------|-------------|
| — | Empty directory, no page.tsx | ❌ No page |

### 3.5 Departments
| Action | Type | Functional? |
|--------|------|-------------|
| Create Department | Dialog form (name, description, routing mode, AI toggle, bot select, tags) | ✅ Yes |
| Edit Department | Dialog (same as create, pre-filled) | ✅ Yes |
| Delete Department | AlertDialog confirmation | ✅ Yes |
| Assign Member to Department | Popover (list unassigned org members) | ✅ Yes |
| Remove Member from Department | X button on member badge | ✅ Yes |
| Toggle AI Integration / Bot Select | Switch + Select | ✅ Yes |
| Set Routing Mode (Pooled / Round-Robin) | RadioGroup | ✅ Yes |
| Add / Remove Tags | Input + badge list | ✅ Yes |

### 3.6 Canned Responses
| Action | Type | Functional? |
|--------|------|-------------|
| Create Canned Response | Dialog form (title + message + placeholder insertion) | ✅ Yes |
| Edit Canned Response | Dialog form | ✅ Yes |
| Delete Canned Response | AlertDialog confirmation | ✅ Yes |
| Search Responses | Search input | ✅ Yes |
| Insert Personalization Placeholder | Dropdown menu in dialog | ✅ Yes |

### 3.7 Labels
| Action | Type | Functional? |
|--------|------|-------------|
| Create Label | Inline form (color select + name input) | ✅ Yes |
| Delete Label | Trash button | ✅ Yes |

> **Note:** No edit label action exists.

### 3.8 Operating Hours
| Action | Type | Functional? |
|--------|------|-------------|
| Toggle Master Enable/Disable | Switch | ✅ Yes |
| Select Timezone | Select dropdown (20+ options) | ✅ Yes |
| Toggle Day Open/Closed | Switch per day | ✅ Yes |
| Set Time Slots (start/end) | Select dropdowns per slot | ✅ Yes |
| Add Time Slot | Button per day | ✅ Yes |
| Remove Time Slot | Trash button per slot | ✅ Yes |
| Save Changes | Button | ✅ Yes |

### 3.9 Webhooks
| Action | Type | Functional? |
|--------|------|-------------|
| Add Webhook Endpoint | Form (URL + event checkboxes) | ✅ Yes |
| Copy Webhook Secret | Button (shown once on creation) | ✅ Yes |
| Enable/Pause Webhook | Toggle / button | ✅ Yes |
| Delete Webhook | AlertDialog confirmation | ✅ Yes |

### 3.10 Integrations
| Action | Type | Functional? |
|--------|------|-------------|
| Configure Integration (OpenRouter, Telegram, Messenger, Instagram) | Click card → config form | ✅ Yes |
| Enable/Disable Integration | Switch toggle | ✅ Yes |
| Enter Credentials (API keys, tokens) | Input fields per provider | ✅ Yes |
| Save Configuration | Button | ✅ Yes |

### 3.11 Groups (Placeholder)
| Action | Type | Functional? |
|--------|------|-------------|
| — | Placeholder text only | ❌ Not implemented |

---

## 4. User Actions by Non-Settings Section

### 4.1 Dashboard Home (`/dashboard`)
| Action | Type |
|--------|------|
| View stats (Open Conversations, Waiting, Online Teammates, My Assigned) | Read-only cards |
| Click Live Queue row → navigate to chat | Table row click |
| Load more activity | Button |
| Click onboarding "Create Bot" banner → navigate to bots | Link button |

### 4.2 Monitor (`/dashboard/monitor`)
| Action | Type |
|--------|------|
| Renders `MonitorLayout` component | Read-only monitoring view |

### 4.3 Chat (`/dashboard/chat`)
| Action | Type |
|--------|------|
| Send message (agent) | Message input |
| Send internal note | Toggle + message input |
| View conversation details | Side panel |
| Assign/reassign conversation | Action buttons |

### 4.4 Requests (`/dashboard/requests`)
| Action | Type |
|--------|------|
| Filter by Unassigned / Assigned to Me / Bot Escalated | Sidebar filter buttons |
| Search requests | Search input |
| Assign conversation to self ("Assign to me") | Button per row |
| Resolve conversation | Button per row |
| Click row → navigate to chat | Table row click |

### 4.5 Orders (`/dashboard/orders`)
| Action | Type |
|--------|------|
| Create Order | Dialog form |
| Update Order Status (new / confirmed / cancelled) | Dropdown menu |
| Delete Order | AlertDialog confirmation |
| Export Orders (CSV, JSON, XLSX) | Dropdown + download |
| Import Orders (CSV, JSON, XLSX file upload) | Dialog + file input + confirm |
| Filter by status | Sidebar filter |
| Search orders | Search input |

### 4.6 Bots (`/dashboard/bots`)
| Action | Type |
|--------|------|
| Create Bot (AI Agent or Automation) | Create dialog |
| Open Canvas (navigate to design studio) | Dropdown menu |
| Activate / Deactivate Bot | Dropdown menu toggle |
| Duplicate Bot | Dropdown menu (appears non-functional) |
| Delete Bot | AlertDialog confirmation |
| Filter by All / AI Agents / Automations | Sidebar filter |
| Search bots | Search input |
| Quick-create bot from empty state | Card click |

### 4.7 Knowledge Base (`/dashboard/kb`)
| Action | Type |
|--------|------|
| Create or auto-create default KB | Mutation |
| Add Source (URL, text, file upload) | Form |
| Remove Source | Delete button |

### 4.8 Analytics (`/dashboard/analytics`)
| Action | Type |
|--------|------|
| Set date range filter | Date inputs |
| View metric cards (conversations, bot resolved, human resolved, ratings, tokens, avg response time) | Read-only |

### 4.9 Activities (`/dashboard/activities`)
| Action | Type |
|--------|------|
| View activity log table | Paginated data table |
| Load more activities | Button |

### 4.10 History (`/dashboard/history`)
| Action | Type |
|--------|------|
| Search resolved conversations | Search input |
| Filter by date range | Date range picker |
| Export to CSV | Button |
| Click row → view details | Table row click |

### 4.11 Contacts (`/dashboard/contacts`)
| Action | Type |
|--------|------|
| Add Contact | Dialog form (name, email, phone, address, note) |
| Import Contacts (CSV, XLSX, JSON) | Dialog + file upload + preview + confirm |
| Export Contacts (CSV, XLSX, JSON) | Dropdown menu |
| View Contacts List | Table with pagination |

---

## 5. Backend Mutations — Full Inventory

Every Convex mutation that writes or deletes data, with `org_role` check status:

### 5.1 Project & Settings Mutations
| File | Mutation | Operation | `org_role` Check? |
|------|----------|-----------|--------------------|
| `projects.ts` | `create` | Insert project | ❌ No |
| `projects.ts` | `update` | Patch project | ❌ No |
| `projects.ts` | `remove` | Delete project + cascade | ❌ No |
| `projects.ts` | `ensureProject` | Upsert project on dashboard load | ❌ No |
| `settings.ts` | `createDepartment` | Insert department | ❌ No |
| `settings.ts` | `updateDepartment` | Patch department | ❌ No |
| `settings.ts` | `removeDepartment` | Delete department | ❌ No |
| `settings.ts` | `addMemberToDepartment` | Patch department memberIds | ❌ No |
| `settings.ts` | `removeMemberFromDepartment` | Patch department memberIds | ❌ No |
| `settings.ts` | `createCannedResponse` | Insert canned response | ❌ No |
| `settings.ts` | `updateCannedResponse` | Patch canned response | ❌ No |
| `settings.ts` | `removeCannedResponse` | Delete canned response | ❌ No |
| `settings.ts` | `createLabel` | Insert label | ❌ No |
| `settings.ts` | `updateLabel` | Patch label | ❌ No |
| `settings.ts` | `removeLabel` | Delete label | ❌ No |
| `settings.ts` | `upsertOperatingHours` | Upsert operating hours | ❌ No |

### 5.2 Bots & Flows Mutations
| File | Mutation | Operation | `org_role` Check? |
|------|----------|-----------|--------------------|
| `bots.ts` | `create` | Insert bot | ❌ No |
| `bots.ts` | `update` | Patch bot | ❌ No |
| `bots.ts` | `remove` | Delete bot | ❌ No |
| `botFlows.ts` | `save` | Upsert bot flow design | ❌ No |

### 5.3 Integrations & Webhooks
| File | Mutation | Operation | `org_role` Check? |
|------|----------|-----------|--------------------|
| `integrations.ts` | `upsert` | Upsert integration credentials | ❌ No |
| `integrations.ts` | `remove` | Delete integration | ❌ No |
| `webhooks.ts` | `create` | Insert webhook + generate secret | ❌ No |
| `webhooks.ts` | `update` | Patch webhook (enable/disable) | ❌ No |
| `webhooks.ts` | `remove` | Delete webhook | ❌ No |

### 5.4 Orders
| File | Mutation | Operation | `org_role` Check? |
|------|----------|-----------|--------------------|
| `orders.ts` | `createOrder` | Insert order | ❌ No |
| `orders.ts` | `updateOrderStatus` | Patch order status | ❌ No |
| `orders.ts` | `deleteOrder` | Delete order | ❌ No |
| `orders.ts` | `batchImportOrders` | Bulk insert orders (≤500) | ❌ No |

### 5.5 Conversations & Messages
| File | Mutation | Operation | `org_role` Check? |
|------|----------|-----------|--------------------|
| `conversations.ts` | `create` | Insert conversation | ❌ No |
| `conversations.ts` | `update` | Patch conversation (assign, status, priority) | ❌ No |
| `conversations.ts` | `updateConversationStatus` | Patch status + botPaused | ❌ No |
| `conversations.ts` | `resolve` | Set status to 1000 (resolved) | ❌ No |
| `conversations.ts` | `join` | Add agent to participants | ❌ No |
| `conversations.ts` | `leave` | Remove agent from participants | ❌ No |
| `conversations.ts` | `updateVisitorInfo` | Patch visitor fields | ❌ No |
| `conversations.ts` | `markAsRead` | Reset unread count | ❌ No |
| `messages.ts` | `send` | Insert message | ❌ No |
| `messages.ts` | `sendMessage` | Insert message (monitor/agent view) | ❌ No |

### 5.6 Contacts
| File | Mutation | Operation | `org_role` Check? |
|------|----------|-----------|--------------------|
| `contacts.ts` | `create` | Insert contact | ❌ No |
| `contacts.ts` | `update` | Patch contact | ❌ No |
| `contacts.ts` | `remove` | Delete contact | ❌ No |
| `contacts.ts` | `batchImport` | Bulk insert contacts (≤500) | ❌ No |

### 5.7 Knowledge Base
| File | Mutation | Operation | `org_role` Check? |
|------|----------|-----------|--------------------|
| `knowledgeBases.ts` | `getOrCreateDefault` | Upsert default KB | ❌ No |
| `knowledgeBases.ts` | `create` | Insert KB | ❌ No |
| `knowledgeBases.ts` | `addSource` | Insert KB source + trigger indexing | ❌ No |
| `knowledgeBases.ts` | `removeSource` | Delete KB source | ❌ No |

### 5.8 Profiles & Notifications
| File | Mutation | Operation | `org_role` Check? |
|------|----------|-----------|--------------------|
| `profiles.ts` | `updateMe` | Patch own profile | ❌ No (self-only is acceptable) |
| `profiles.ts` | `ensureCurrent` | Upsert own profile on dashboard load | ❌ No (self-only) |
| `profiles.ts` | `setAvailability` | Toggle own availability | ❌ No (self-only) |
| `notifications.ts` | `markAsRead` | Patch own notification | ❌ No (checks `recipientId === identity.subject`) |
| `notifications.ts` | `markAllRead` | Patch all own unread → read | ❌ No (self-only) |
| `notifications.ts` | `clearAll` | Delete all own notifications | ❌ No (self-only) |

### 5.9 Activity Logs & Tags
| File | Mutation | Operation | `org_role` Check? |
|------|----------|-----------|--------------------|
| `activityLogs.ts` | `log` | Insert activity log entry | ❌ No |
| `tags.ts` | `assignTagToConversation` | Patch conversation tags | ❌ No |
| `tags.ts` | `removeTagFromConversation` | Patch conversation tags | ❌ No |

> **Summary:** Out of **55+ public mutations**, **ZERO** check `identity.org_role`.  
> Self-only mutations (profile, notifications) have ownership checks (correct behavior), but no admin-only restrictions exist anywhere.

---

## 6. Frontend Role Checks

### 6.1 Current State

A comprehensive search across all dashboard and settings components reveals:

| Location | Check Present? | Details |
|----------|---------------|---------|
| `AppSidebar.tsx` | ❌ No | All nav links rendered unconditionally |
| `SettingsSidebar.tsx` | ❌ No | All settings links visible to all users |
| `ProjectContext.tsx` | ⚠️ Partial | `activeProject.userRole` is available but **never consumed** for conditional rendering |
| `SiteHeader.tsx` | ❌ No | Uses `SignedIn` from Clerk (authenticated check only, not role) |
| `settings/page.tsx` | ❌ No | Delete Project, API Keys, JWT Secrets — all visible to members |
| `settings/departments/page.tsx` | ❌ No | Uses `useOrganization({ memberships: ... })` to list members, but **not for role checking** |
| `settings/canned-responses/page.tsx` | ❌ No | Uses `useUser()` for display name only |
| `settings/labels/page.tsx` | ❌ No | Uses `useUser()` for display name only |
| `settings/operating-hours/page.tsx` | ❌ No | No role logic |
| `settings/webhooks/page.tsx` | ❌ No | No role logic |
| `settings/integrations/page.tsx` | ❌ No | No role logic |
| `bots/page.tsx` | ❌ No | Create, delete, activate bots — all unprotected |
| `orders/page.tsx` | ❌ No | Create, delete, import — all unprotected |
| `contacts/page.tsx` | ❌ No | Create, delete, import — all unprotected |
| `requests/page.tsx` | ❌ No | Assign and resolve — all unprotected |

### 6.2 Existing Clerk Hooks Usage

| Hook | File | Purpose |
|------|------|---------|
| `useOrganization({ memberships })` | `departments/page.tsx` | Listing org members for department assignment |
| `useUser()` | Various settings pages | Display current user's name |
| `SignedIn` / `SignedOut` | `SiteHeader.tsx`, layouts | Authentication gating (not role checking) |

> **Finding:** `useOrganization`, `has()`, `Protect`, and `org_role` are **never used** for authorization. The `userRole` from `ProjectContext` is available but ignored.

---

## 7. Convex Identity Shape

The `identity` object returned by `ctx.auth.getUserIdentity()` in Convex is cast in multiple files to:

```typescript
type ClerkIdentity = {
    subject: string;       // Clerk user ID
    org_id?: string;       // Organization ID  
    org_role?: string;     // e.g. "org:admin" or "org:member"
    name?: string;         // Display name
    email?: string;        // Email address
    pictureUrl?: string;   // Avatar URL
    [key: string]: any;    // Additional claims
};
```

**Key observations:**
- `org_id` is used everywhere for multi-tenancy scoping (correct)
- `org_role` is **defined in the type** but **never read in any handler logic**
- `profiles.ts` → `ensureCurrent()` logs `identity.org_id` to console but does nothing with `org_role`
- `projects.ts` → queries expose `userRole` to the frontend via the response, but mutations don't enforce it

---

## 8. Route Protection (Next.js Middleware)

**File:** `src/proxy.ts`


```typescript
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isProtectedRoute = createRouteMatcher(["/dashboard(.*)", "/design-studio(.*)"]);

export default clerkMiddleware(async (auth, req) => {
    if (isProtectedRoute(req)) await auth.protect();
});
```

**Analysis:**
- ✅ All `/dashboard/**` and `/design-studio/**` routes require **authentication**
- ❌ No **role-based** route protection exists (e.g., no `auth.protect({ role: "org:admin" })`)
- ❌ No specific routes (like `/dashboard/settings`) are restricted to admins
- Static files, API routes, and Next.js internals are correctly excluded

---

## 9. Summary of Findings

### Critical Gaps

| Category | Finding | Severity |
|----------|---------|----------|
| Backend RBAC | 0/55+ mutations check `org_role` | 🔴 Critical |
| Frontend RBAC | No UI elements are hidden/disabled by role | 🟠 High |
| Route Protection | Middleware only checks authentication, not authorization | 🟠 High |
| Identity Shape | `org_role` is available but completely unused | 🟡 Medium |
| Non-functional UI | 3 Advanced toggles + Rotate Secret button are broken | 🟡 Medium |
| Placeholder Pages | Widget Setup (empty), Groups (placeholder) | 🔵 Low |

### What Works Correctly
- ✅ Authentication is enforced on all dashboard routes
- ✅ Multi-tenancy via `org_id` scoping works correctly
- ✅ Self-only mutations (profile, notifications) have correct ownership checks
- ✅ Webhook secrets are properly generated and shown once
- ✅ Contact deletion blocks on active conversations

---

## 10. Recommendations

### Phase 1: Backend — Admin-Only Mutations (Critical)
Add `org_role === "org:admin"` checks to destructive / configuration mutations:
- `projects.remove`, `projects.update`
- All `settings.ts` mutations (departments, canned responses, labels, operating hours)
- `bots.create`, `bots.update`, `bots.remove`
- `botFlows.save`
- `integrations.upsert`, `integrations.remove`
- `webhooks.create`, `webhooks.update`, `webhooks.remove`
- `knowledgeBases.create`, `knowledgeBases.addSource`, `knowledgeBases.removeSource`

### Phase 2: Frontend — Conditional Rendering
- Use `userRole` from `ProjectContext` (or Clerk's `<Protect>`) to:
  - Hide/disable Settings link for non-admins, OR
  - Hide Danger Zone (Delete Project, API keys, JWT secrets) for non-admins
  - Disable create/edit/delete buttons on settings sub-pages for members

### Phase 3: Route-Level Protection
- Add role-based middleware for `/dashboard/settings/**` routes
- Consider Clerk's `auth.protect({ role: "org:admin" })` in middleware

### Phase 4: Clean Up
- Remove or implement the 3 non-functional security toggles in Advanced settings
- Implement the Widget Setup and Groups pages, or remove from navigation
- Implement the Rotate JWT Secret functionality
