# Audit Report: VisitorPanel Enhancement - Collapsible Sections and Agent Profile Enrichment

## Goal 1: Show agent name/email instead of raw Clerk user ID

### current Implementation
In `src/components/dashboard/shared/VisitorPanel.tsx`:
- The component fetches conversation data via `useQuery(api.conversations.get, { id: conversationId })`.
- It renders the assigned agent as follows:
```tsx
<div className="flex items-center gap-3">
    <User className="h-4 w-4 text-muted-foreground shrink-0" />
    <span className="text-muted-foreground">Assigned to: </span>
    {conversation.assignedTo ? (
        <span className="truncate">{conversation.assignedTo}</span>
    ) : (
        <span>Unassigned</span>
    )}
</div>
```
- `conversation.assignedTo` contains only the raw Clerk subject ID (e.g., `user_...`).

### Backend Support
- **Query**: `api.conversations.get` in `convex/conversations.ts` returns the raw database document for the conversation without enrichment.
- **Profile Resolution**: The file `convex/profiles.ts` contains a query `getByUserId` which fetches a profile record from the `profiles` table given a Clerk `userId`. This record includes `fullName`, `email`, and `avatarUrl`.

---

## Goal 2: Make sections collapsible

### Current Collapsibility Status
Sections in `src/components/dashboard/shared/VisitorPanel.tsx`:
- **Header (Avatar & Name/Email)**: Always visible.
- **Visitor Info**: Standard `div` (line 270), always visible.
- **Conversation Details**: Standard `div` (line 289), always visible.
- **Technical Info**: Wrapped in a shadcn/ui `Accordion` (line 333), **collapsible**.
- **Tags**: Standard `div` (line 380), always visible.

### Available UI Components
The following shadcn/ui Accordion components are already imported and available for use in the file:
- `Accordion`
- `AccordionContent`
- `AccordionItem`
- `AccordionTrigger`

---

## Conclusion
- To achieve **Goal 1**, the `VisitorPanel` component must call `useQuery(api.profiles.getByUserId, { userId: conversation.assignedTo })` whenever `assignedTo` is present, then render the avatar fallback and name from that profile.
- To achieve **Goal 2**, the sections for **Visitor Info**, **Conversation Details**, and **Tags** should be moved inside the `Accordion` component, either as separate `AccordionItem`s or by using multiple `Accordion` instances.
