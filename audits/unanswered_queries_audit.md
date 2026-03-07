# Audit Report: Unanswered Queries Feature

## Overview
This audit examines the "unanswered queries" feature across the codebase, identifying the Convex queries, mutations, UI components, and the integration with the Knowledge Base (KB).

## Files Involved

| File | Function/Component | Description |
|---|---|---|
| `convex/schema.ts` | `unanswered_queries` | Table schema for storing unanswered queries. |
| `convex/analytics.ts` | `getUnansweredQueries` | Query to fetch top unanswered queries for a project. |
| `convex/analytics.ts` | `logUnansweredQuery` | Internal mutation to upsert an unanswered query (increment count if it exists). |
| `convex/knowledge.ts` | `searchSimilarChunks` | Calls `logUnansweredQuery` when no relevant KB chunks are found. |
| `convex/knowledgeBases.ts` | `addSource` | Generic mutation used to create KB entries (called after redirection from analytics). |
| `src/components/analytics/AnalyticsUnansweredQueries.tsx` | `AnalyticsUnansweredQueries` | UI component that renders the table of unanswered queries. |
| `src/app/dashboard/analytics/page.tsx` | `AnalyticsPage` | Main analytics dashboard page that displays the `AnalyticsUnansweredQueries` component. |
| `src/app/dashboard/kb/page.tsx` | `KnowledgeBasePage` | KB landing page that currently redirects to `/dashboard/kb/default`. |
| `src/app/dashboard/kb/[kbId]/page.tsx` | `KnowledgeBaseDetailsPage` | KB details page where users manage sources. |

---

## Technical Details

### 1. Convex Query: Fetching Unanswered Queries
- **Name**: `getUnansweredQueries`
- **File**: [`convex/analytics.ts`](file:///home/mohamed/lab/yoosr/convex/analytics.ts)
- **Fields Returned**: `_id`, `projectId`, `query`, `count`, `lastAskedAt`.
- **Logic**: Filters by `projectId`, sorts by `count` descending, and optionally filters by date range.

### 2. Convex Mutation: Creating KB Entry
- **Name**: There is **no specialized mutation** to create a KB entry specifically from an unanswered query.
- **Workflow**: The system uses the generic `addSource` mutation in [`convex/knowledgeBases.ts`](file:///home/mohamed/lab/yoosr/convex/knowledgeBases.ts).
- **What it does**: Inserts a new record into `knowledge_base_sources` and schedules the indexing pipeline.

### 3. Convex Mutation: Delete/Dismiss Unanswered Query
- **Existence**: **Does not exist**.
- **Observation**: There is currently no mutation to dismiss or delete individual unanswered queries from the analytics table. They are only deleted when the entire project is removed ([`convex/projects.ts`](file:///home/mohamed/lab/yoosr/convex/projects.ts)).

### 4. UI Component: Unanswered Queries Table
- **Name**: `AnalyticsUnansweredQueries`
- **File**: [`src/components/analytics/AnalyticsUnansweredQueries.tsx`](file:///home/mohamed/lab/yoosr/src/components/analytics/AnalyticsUnansweredQueries.tsx)
- **Features**: Displays the query text, occurrence count, and last date asked.

### 5. UI Element: "Create KB Entry" Trigger
- **Description**: A "Create KB Entry" button exists in each row of the Unanswered Queries table.
- **Trigger Logic**: 
  ```tsx
  const handleCreateKBEntry = (query: string) => {
      router.push(`/dashboard/kb?prefill=${encodeURIComponent(query)}`);
  };
  ```

### 6. Post-Action Behavior
- **Outcome**: When "Create KB Entry" is clicked, the user is redirected to the KB dashboard.
- **Current Issue**: The `prefill` query parameter is currently **lost** because [`src/app/dashboard/kb/page.tsx`](file:///home/mohamed/lab/yoosr/src/app/dashboard/kb/page.tsx) performs a hard redirect to `/dashboard/kb/default` without passing along the search params. Furthermore, the KB details page does not yet have logic to consume a `prefill` parameter to auto-open the "Add Content" dialog.
- **Row Status**: The row **stays as-is** in the analytics table because there is no link between the created KB entry and the unanswered query record (and no "dismiss" mutation).

### 7. Table Schemas

#### **knowledge_bases**
| Field | Type | Description |
|---|---|---|
| `projectId` | `v.id("projects")` | Reference to the project. |
| `name` | `v.string()` | Name of the KB. |
| `description` | `v.optional(v.string())` | Optional description. |
| `isDefault` | `v.optional(v.boolean())` | Whether this is the default KB. |

#### **knowledge_base_sources**
| Field | Type | Description |
|---|---|---|
| `kbId` | `v.id("knowledge_bases")` | Reference to the KB. |
| `type` | `v.string()` | Source type: "url", "text", or "file". |
| `value` | `v.string()` | The content (URL string, raw text, or file storage ID). |
| `status` | `v.optional(v.string())` | Indexing status: "indexing", "indexed", "failed". |

### 8. Create-KB-Entry Pipeline
- **Mechanism**: Adds to `knowledge_base_sources` directly via `ctx.db.insert`.
- **Indexing**: After insertion, it schedules [`internal.knowledge.indexSource`](file:///home/mohamed/lab/yoosr/convex/knowledge.ts) which handles chunking and embedding generation via OpenRouter.
