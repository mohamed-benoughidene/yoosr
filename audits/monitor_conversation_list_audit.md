# Monitor Conversation List Audit Report

Performed on: 2026-03-04

## Overview
This audit examines the sorting, filtering, and search capabilities of the Monitor conversation list component and its integration with the Convex backend.

---

### 1. Search
- **Status**: **UI-only (No backend or frontend connection).**
- **Existing Code**: `src/components/dashboard/monitor/conversation-list.tsx:L125-128`
- **Behavior**: The search input field exists but is not bound to any state or filter logic. Typing in it has no effect on the list.
- **Backend**: No search argument is supported in `getConversations`.

### 2. Label Filter
- **Status**: **Wired (Client-side only).**
- **Existing Code**: `src/components/dashboard/monitor/conversation-list.tsx:L105`
- **Behavior**: Successfully filters the 100 loaded conversations by checking if `item.tags` includes the selected label name.
- **Backend**: Not passed as a query argument.

### 3. Department Filter (Dept)
- **Status**: **Wired but disconnected.**
- **Existing Code**: `src/components/dashboard/monitor/monitor-layout.tsx:L23-26` (Frontend) & `convex/conversations.ts:L710` (Backend).
- **Behavior**: The UI filters by department *name* client-side. The backend query supports a `departmentId` argument, but it is currently not being passed by the parent `MonitorLayout`.
- **Note**: The backend implementation uses `.filter()` on a subset of results rather than a database index.

### 4. Agent Filter
- **Status**: **UI-only (Decorative).**
- **Existing Code**: `src/components/dashboard/monitor/conversation-list.tsx:L216-219`
- **Behavior**: The button exists but has no dropdown menu or logic attached.

### 5. Status Filter
- **Status**: **UI-only (Decorative).**
- **Existing Code**: `src/components/dashboard/monitor/conversation-list.tsx:L242-245`
- **Behavior**: The button exists but is non-functional. The numeric status codes (100, 200, 1000) are not exposed for filtering.

### 6. Current Sort
- **Status**: **Mixed (Backend Default + Client-side Override).**
- **Backend Order**: Returns top 100 most recent by `_creationTime`.
- **Frontend Logic**: Defaults to sorting by `timestamp` (which maps to `updatedAt ?? _creationTime`) in descending order.

### 7. Sort Controls
- **Status**: **Wired (Client-side).**
- **Existing Code**: `src/components/dashboard/monitor/conversation-list.tsx:L109-118`
- **Behavior**: Users can toggle between "Recent" and "Priority". Priority sort uses a hardcoded mapping (Urgent > High > Normal > Low).

---

### Backend Reference: getConversations Args
The `getConversations` query in `convex/conversations.ts` accepts:
```typescript
args: {
    projectId: v.id("projects"),
    departmentId: v.optional(v.id("departments")),
}
```

### Pagination
- **Status**: **Hard-limited.**
- **Details**: The list is capped at 100 items via `.take(100)`. There is no implementation for infinite scroll or page-based navigation.

---

### Conclusion
The Monitor list is currently primarily a client-side experience limited to the latest 100 conversations. While some filters (Label, Sort) work locally, Search, Agent, and Status filters are purely placeholders. The Department filter is partially implemented but not fully "wired" between the layout and the query.
