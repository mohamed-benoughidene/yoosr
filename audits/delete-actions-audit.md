# Delete Actions Audit
**Date:** 2026-03-06  
**Scope:** All delete / remove buttons and actions across UI (`src/`) and Convex backend (`convex/`)

---

## Audit Table

| # | Location | Entity Deleted | Mutation Called | Mutation Exists | Has Confirm | Issues |
|---|----------|---------------|-----------------|-----------------|-------------|--------|
| 1 | `app/dashboard/orders/page.tsx` → `handleDelete` | Order | `api.orders.deleteOrder` | ✅ Yes (`convex/orders.ts`) | ✅ Yes — `window.confirm()` browser dialog | None. Fully wired. |
| 2 | `app/dashboard/apps/[provider]/page.tsx` → `handleUninstall` | Integration (webhook/API credential) | `api.integrations.remove` | ✅ Yes (`convex/integrations.ts`) | ✅ Yes — `window.confirm()` browser dialog | No org-level authorization check in `integrations.remove` — it only checks auth, not that the caller owns the project. Low risk but worth hardening. |
| 3 | `app/dashboard/bots/page.tsx` → DropdownMenuItem Delete | Bot (and its associated `bot_flows`) | `api.bots.remove` | ✅ Yes (`convex/bots.ts`) | ❌ No — fires immediately on click, no confirmation | **Risk:** Accidental bot deletion with no undo. Bot flows are cascade-deleted, which is correct but destructive. Should add a confirmation dialog. |
| 4 | `app/dashboard/kb/[kbId]/page.tsx` → `handleRemove` | Knowledge Base Source | `api.knowledgeBases.removeSource` | ✅ Yes (`convex/knowledgeBases.ts`) | ❌ No — fires immediately on click | **Risk:** No confirmation before removing an indexed source. Minor but user-hostile. |
| 5 | `app/dashboard/settings/page.tsx` → `handleDeleteProject` | Entire Project (cascade deletes everything) | `api.projects.remove` | ✅ Yes (`convex/projects.ts`) | ✅ Yes — requires typing the project name to enable the button | Best-practice confirmation pattern. Mutation correctly cascade-deletes all child records. |
| 6 | `app/dashboard/settings/departments/page.tsx` → `handleDelete` | Department | `api.settings.removeDepartment` | ✅ Yes (`convex/settings.ts`) | ❌ No — fires immediately on click | **Risk:** No confirmation. Also: `isDefault` departments are protected via `!dept.isDefault` guard in the UI — but the backend `removeDepartment` has no equivalent guard, so a direct API call can still delete a default department. |
| 7 | `app/dashboard/settings/departments/page.tsx` → member `X` button → `handleRemoveMember` | Dept member assignment | `api.settings.removeMemberFromDepartment` | ✅ Yes (`convex/settings.ts`) | ❌ No — fires immediately | Minor: no confirmation, but this is a recoverable action (user can be re-added). |
| 8 | `app/dashboard/settings/departments/page.tsx` → tag `X` button → `removeTag` (local) | Local UI tag chip (form state only, not DB) | — (local state mutation only) | N/A | ❌ No — instant | No issue — this only removes it from the form's in-memory state array before the form is submitted. Not a Convex operation at all. |
| 9 | `app/dashboard/settings/labels/page.tsx` → `handleDelete` | Label | `api.settings.removeLabel` | ✅ Yes (`convex/settings.ts`) | ❌ No — fires immediately | **Risk:** Removing a label that is already assigned to conversations leaves orphaned tag strings on those conversations (no cascade cleanup in `removeLabel`). |
| 10 | `app/dashboard/settings/canned-responses/page.tsx` → `handleDelete` | Canned Response | `api.settings.removeCannedResponse` | ✅ Yes (`convex/settings.ts`) | ❌ No — fires immediately | Minor: no confirmation. Action is recoverable (can recreate). |
| 11 | `app/dashboard/settings/webhooks/page.tsx` → Trash icon inline onClick | Webhook Subscription | `api.webhooks.remove` | ✅ Yes (`convex/webhooks.ts`) | ❌ No — fires immediately | **Risk:** No confirmation. Also, `webhooks.remove` only checks authentication, not that the caller owns the project associated with this webhook subscription. |
| 12 | `components/dashboard/contacts/contacts-list.tsx` → `handleDelete` | Contact | `api.contacts.remove` | ✅ Yes (`convex/contacts.ts`) | ❌ No — fires immediately | **Risk:** No confirmation. No cascade: the `contacts.remove` mutation does not null-out any foreign-key references on conversations that link to this contact. |
| 13 | `components/dashboard/shared/VisitorPanel.tsx` → tag `X` button → `handleRemoveTag` | Tag assignment on a Conversation | `api.tags.removeTagFromConversation` | ✅ Yes (`convex/tags.ts`) | ❌ No — fires immediately | No issue. This is a highly recoverable action (tag can be re-added seconds later). Low risk. |
| 14 | `components/design-studio/NodePropertiesPanel.tsx` (L646) → Delete Node button → `onDeleteNode(node.id)` | Flow Node (from local ReactFlow state) | — (no Convex mutation; removes from local `nodes` array; debounced `api.botFlows.save` persists it) | N/A — client-side | ❌ No — fires immediately | **Wiring note:** Deletion is local-state-only and saved via a 1.5 s debounce. Closing the tab within the debounce window silently loses the deletion. Start node is protected (cannot be deleted), which is correct. |
| 15 | `app/design-studio/[botId]/page.tsx` — ReactFlow native Delete key | Flow Node or Edge via keyboard | N/A — triggers `onNodesDelete` / `onEdgesDelete` → `notifyChange` → debounced `api.botFlows.save` | ✅ Indirectly (via save) | ❌ No | Same debounce data-loss risk as row 14. Start node is protected via `handleNodesChange` filter. |

---

## Summary of Issues

### 🔴 Critical / High Risk

**1. Bot delete has no confirmation (row 3)**  
`bots/page.tsx` fires `removeBot` immediately from a DropdownMenuItem click. `bots.remove` cascade-deletes all `bot_flows`. A mis-click permanently destroys the entire bot and all its flow design.  
→ **Fix:** Wrap in a Shadcn `AlertDialog` confirmation before calling `removeBot`.

**2. Label deletion does not clean up conversation tags (row 9)**  
`settings.removeLabel` deletes the label document but does **not** remove the label's `name` from the `tags[]` array on any conversations in the same project. After deletion, conversations show a stale tag badge with no associated colour or metadata.  
→ **Fix:** In the backend `removeLabel` handler, also query and patch all conversations that contain the deleted label name in their `tags` array.

**3. `integrations.remove` and `webhooks.remove` lack ownership authorization (rows 2, 11)**  
Both mutations check only `ctx.auth.getUserIdentity()` (is the user logged in?) but do **not** verify the caller belongs to the org that owns the specific resource. Any authenticated user who knows or guesses the document `_id` can delete another org's integration or webhook via a direct Convex call.  
→ **Fix:** Fetch the parent project of the document, then compare `project.orgId` against `identity.org_id`.

**4. Contact deletion has no cascade check (row 12)**  
`contacts.remove` deletes the contact row but does not null-out or clean up `conversationId` back-references or any `contactId` fields on related conversations.  
→ **Fix:** Either block deletion if active conversations reference the contact, or null-out the reference in the same mutation.

---

### 🟡 Medium Risk

**5. No confirmation dialogs on: KB Source (4), Department (6), Label (9), Canned Response (10), Webhook (11), Contact (12)**  
Most delete buttons in the settings area fire Convex mutations immediately with no dialog. These are permanent, server-side operations.  
→ **Fix:** Add `AlertDialog` confirm flows for these destructive buttons.

**6. Default department backend has no server-side guard (row 6)**  
The UI conditionally hides the Delete button for default departments (`{!dept.isDefault && ...}`), but the Convex `removeDepartment` mutation has no equivalent check. A caller bypassing the UI (e.g. Convex Dashboard, custom script) can delete the default department.  
→ **Fix:** Add `if (department.isDefault) throw new ConvexError("Cannot delete the default department")` to the mutation handler.

---

### 🟢 No Issue / Low Risk

| Row | Why it's fine |
|-----|---------------|
| 1 — Order delete | `window.confirm()` present; mutation fully wired and authorized |
| 2 — Integration uninstall | `window.confirm()` present; fully wired (auth risk flagged above) |
| 5 — Project delete | Typed-name confirmation, thorough cascade delete in backend |
| 7 — Dept member remove | Recoverable, instant feedback, authorization is correct |
| 8 — Local tag chip remove | Not a DB operation, pure in-memory form state |
| 13 — Conversation tag remove | Recoverable action, properly wired |
| 14/15 — Design Studio node delete | Works correctly; data-loss window is bounded by debounce |
