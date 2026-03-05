# VisitorPanel Component Audit Report

This audit describes the current state and structure of the `VisitorPanel` component in the `yoosr` project.

## 1. Existing Accordion Sections
The component uses a shadcn `Accordion` with the following `AccordionItem` values (in order):
1. `visitor-info`
2. `conversation-details`
3. `technical-info`
4. `tags`

## 2. Component Props
The component receives a single prop:
- `conversationId`: `Id<"conversations">` (Convex ID)

## 3. Convex Queries Called
The following Convex queries are called inside the component:
- `api.conversations.get`: Fetches conversation details by `conversationId`.
- `api.contacts.findByConversation`: Searches for an existing contact linked to the `conversationId`.
- `api.labels.listLabels`: Lists available labels for tagging (skipped if `activeProject` is null).
- `api.profiles.getByUserId`: Fetches the profile of the assigned agent (skipped if `conversation.assignedTo` is null).

## 4. Project ID Availability
- **Is it available?** Yes.
- **Source**: It comes from the `useProject()` hook: `const { activeProject } = useProject()`.
- **Usage**: Accessed via `activeProject._id`.

## 5. Visitor Data Availability
- **visitorName**: Available from the `conversation` data: `conversation.visitorName`.
- **visitorPhone**: Available from the `conversation` data: `conversation.visitorPhone`.
- Both are already used in the component (e.g., in `InlineEditField` and the header).

## 6. Insertion Point
- **Last AccordionItem value**: `tags`.
- **Note**: The user intends to insert a new section after the `tags` AccordionItem.

---
*Audit performed on: 2026-03-05*
