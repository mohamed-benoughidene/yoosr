# Knowledge Base Implementation Audit

This report provides a detailed audit of the **Knowledge Base (KB)** implementation in the Yoosr project.

## 1. Knowledge Base Schema

The schema is defined in `convex/schema.ts`.

### `knowledge_bases` Table
| Field | Type | Description |
|---|---|---|
| `projectId` | `v.id("projects")` | Reference to the parent project |
| `name` | `v.string()` | Name of the knowledge base |
| `description` | `v.optional(v.string())` | Optional description |
| `isDefault` | `v.optional(v.boolean())` | Whether this is the default KB for the project |

### `knowledge_base_sources` Table
| Field | Type | Description |
|---|---|---|
| `kbId` | `v.id("knowledge_bases")` | Reference to the parent knowledge base |
| `type` | `v.string()` | Source type: `"url"`, `"text"`, or `"file"` |
| `value` | `v.string()` | The source content (e.g., the URL link, the raw text, or a file reference) |
| `status` | `v.optional(v.string())` | Source indexing status: `"indexing"`, `"indexed"`, or `"failed"` |

### `knowledge_base_chunks` Table
| Field | Type | Description |
|---|---|---|
| `sourceId` | `v.id("knowledge_base_sources")` | Reference to the originating source record |
| `projectId` | `v.id("projects")` | Reference to the parent project |
| `text` | `v.string()` | The actual text chunk |
| `embedding` | `v.array(v.number())` | Vector embedding (1024 dimensions) |

---

## 2. Adding a Text Source: Mutation/Action Flow

### Flow Overview
1.  **Mutation (`convex/knowledgeBases.ts:addSource`)**:
    - **Arguments**: `kbId`, `type`, `value`.
    - **Logic**: Inserts a record into `knowledge_base_sources` with `status: "indexing"`.
    - **Scheduling**: Immediately schedules the `internal.knowledge.indexSource` action using `ctx.scheduler.runAfter(0, ...)`.

2.  **Action (`convex/knowledge.ts:indexSource`)**:
    - **Chunking**: Splits the raw text into fragments using `rawText.split('\n\n')`.
    - **Embedding**: Sends each chunk to the **Hugging Face API** using the `BAAI/bge-m3` model via `@huggingface/inference`.
    - **Storing**: Calls `internal.knowledge.insertChunkInternal` (mutation) to insert each chunk text and its embedding into the `knowledge_base_chunks` table.
    - **Finalization**: Updates the source status to `"indexed"` (or `"failed"` if errors occurred).

---

## 3. File Upload Infrastructure

*   **Status**: **Placeholder UI only.**
*   **Observations**:
    - The `AddContentDialog` component contains a "File" tab with a drag-and-drop dropzone UI.
    - There is **no client-side logic** to handle the file upload in `handleSubmit`.
    - There is **no backend infrastructure** (e.g., Convex file storage, UploadThing) currently implemented for knowledge base files.
    - `indexSource` currently marks any source with `type: "file"` as `"failed"` immediately.

---

## 4. URL Fetching / Scraping Logic

*   **Status**: **Not implemented.**
*   **Observations**:
    - `package.json` contains no scraping libraries (e.g., `cheerio`, `puppeteer`, `axios`).
    - Standard `fetch` is only used for internal API calls (e.g., in the chat widget setup).
    - In `convex/knowledge.ts`, the `indexSource` action currently marks any source with `type: "url"` as `"failed"` with the log message: `"Unsupported source type for MVP: url"`.

---

## 5. Knowledge Base UI: "Add Source" Flow

*   **Component**: `src/components/dashboard/kb/add-content-dialog.tsx`.
*   **Structure**: 
    - Triggered by an "**Add Content**" button in the KB details page (`src/app/dashboard/kb/[kbId]/page.tsx`).
    - Opens a **Radix Dialog/Modal** containing a **Tabs** component with three options:
        1.  **URL**: Contains a Label, Input field (`id="url"`), and an "Import URL" button.
        2.  **Text**: Contains a Label, Textarea (`id="text"`), and a "Save Text" button.
        3.  **File**: Contains a decorative dropzone UI that is currently non-functional.
*   **Form Logic**: Controlled state (`url`, `text`) managed within the dialog component; calls an `onAdd` callback passed from the parent page.

---

## 6. `knowledge_base_sources` Detail

As mentioned in the schema section, this table differentiates source types via the `type` field.
- **`type`**: `"url" | "text" | "file"`
- **`value`**: 
    - For `"text"`, it contains the full raw text pasted by the user.
    - For `"url"`, it stores the string representation of the URL.
- **`status`**: Tracked via `indexing`, `indexed`, or `failed`.

---

## 7. Chunking Utility

*   **Location**: Inline within `convex/knowledge.ts` inside the `indexSource` internal action.
*   **Logic**: 
    ```typescript
    const chunks = rawText.split('\n\n').filter((c: string) => c.trim().length > 0);
    ```
*   **Behavior**: It performs basic splitting based on double newlines. It does not currently handle overlapping chunks, recursive character splitting, or token-count-based chunking.

---

## 8. Convex Actions in Knowledge Base File

The following actions are defined in `convex/knowledge.ts`:

1.  **`indexSource`** (`internalAction`):
    - **Purpose**: Processes a new source record.
    - **External Calls**: Imports `@huggingface/inference` and makes HTTP requests to the Hugging Face API for embeddings.
    - **Database Interaction**: Reads source data via `internalQuery` and writes chunk/status data via `internalMutation`.

2.  **`searchSimilarChunks`** (`action`):
    - **Purpose**: Used for Retrieval-Augmented Generation (RAG).
    - **External Calls**: Calls Hugging Face API to embed the search query.
    - **Database Interaction**: Performs a `ctx.vectorSearch` on the `knowledge_base_chunks` table using the `by_embedding` index and filters results by `MIN_RELEVANCE_SCORE` (0.75).

---

**Report Date**: March 01, 2026
**Auditor**: Antigravity
