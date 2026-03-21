# Opus Planning Prompt — Org Check Security Fixes (S-3, S-4, S-5, S-6, S-7)

> Paste this entire prompt to Opus. It will read the relevant files and produce a fix plan.
> Save the output. Claude will then write the Flash implementation prompts from it.

---

## Prompt

You are auditing the security of a Convex backend for a multi-tenant SaaS platform called Yoosr.

The multi-tenancy model works as follows:
- A Clerk Organization = one customer workspace
- Every `projects` record has an `orgId` field matching the Clerk Organization ID
- `orgId` is always read from `identity.org_id` (injected via JWT) — it is never passed from the frontend
- All other tables (conversations, bots, contacts, etc.) use `projectId` as a foreign key to `projects`
- To verify a resource belongs to the caller's org: fetch its `projectId` → fetch the project → assert `project.orgId === identity.org_id`

---

## Items to audit

Read the following files and functions. For each one, produce a concrete fix plan.

### S-3 — `convex/knowledgeBases.ts` → `get`, `create`, `addSource`, `removeSource`
Issue: no org ownership check — any authenticated user can read or modify any KB by ID.

### S-4 — `convex/bots.ts` → `get`
Issue: no org ownership check — any authenticated user can read any bot by ID.

### S-5 — `convex/contacts.ts` → `update`, `findByConversation`
Issue: no org ownership check — any authenticated user can update or read any contact.

### S-6 — `convex/tags.ts` → `assignTagToConversation`, `removeTagFromConversation`
Issue: no org ownership check — any authenticated user can tag any conversation.

### S-7 — `convex/analytics.ts` → `getConversationStats`, `getVisitorStats`, `getMessageStats`, `getConversationVolume`, `getTokenUsage`, `getCSATSummary`, `getTagsSummary`, `getProjectUsage`
Issue: identity existence is checked but the requested `projectId` is never verified to belong to the caller's org.

---

## What to produce

For each item (S-3 through S-7), output a fix plan in this exact format:

```
### [ID] — [File] → [Function(s)]

Current behavior:
[What the function does today, based on reading the actual code]

Where the check is missing:
[Exact location in the function — before which line, after which operation]

Fix:
[Exact code to add — include the helper call pattern, where to place it, and whether a shared helper can be extracted]

Can a shared helper be reused across items?
[Yes/No — if yes, specify which items share the same pattern and propose the helper signature]

Side effects to watch for:
[Any callers of this function that might break, any internalQuery variants that should be exempt]
```

After all 5 items, add a final section:

```
## Shared Helper Recommendation
[If multiple items share the same ownership check pattern, propose a single reusable helper function — name, signature, implementation, and which items use it]
```

Do not write any implementation code yet. Produce only the fix plan.
