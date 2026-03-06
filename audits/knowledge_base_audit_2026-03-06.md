# Knowledge Base Audit Report - 2026-03-06

## 1. Main Knowledge Base Page (Dashboard)
The primary interface for the Knowledge Base is located at `src/app/dashboard/kb/[kbId]/page.tsx`. While technically a "details" page, the main `/dashboard/kb` route redirects to `/dashboard/kb/default`, making this the primary landing page for KB management.

- **Component**: `KnowledgeBaseDetailsPage`
- **Header Buttons**:
  - **Label**: "Import"
    - **onClick**: None (not implemented)
    - **Wired to**: No Convex mutations or actions.
  - **Label**: "Export"
    - **onClick**: None (not implemented)
    - **Wired to**: No Convex mutations or actions.
  
> [!NOTE]
> These buttons are currently placeholders and are not functional. They are rendered as simple `<Button variant="outline">` elements without any event listeners or backend wiring.

## 2. Knowledge Base Detail/Sources Page
The **Details** and **Sources** are combined into a single page: `src/app/dashboard/kb/[kbId]/page.tsx`. It displays "Data Sources" in a tabular format below the header.
- **Import/Export Buttons**: These are only present in the main header of this page. They do not appear in any other section of the child page.

## 3. Convex Backend Audit
Examined the Convex server-side logic in `convex/knowledgeBases.ts` and `convex/knowledge.ts`.

- **Listing MB/Sources**:
  - `knowledgeBases:list`: Returns all knowledge bases for a specific `projectId`.
  - `knowledgeBases:listSources`: Returns all sources (URLs, text, files) for a specific `kbId`.
- **Importing/Exporting**:
  - **No actions or mutations exist** for importing or exporting data in bulk (e.g., CSV, JSON, or external KB migration).
  - The current backend only supports adding sources individually via `knowledgeBases:addSource`.

## 4. Data Models (Schema)
The data shape for the Knowledge Base system is defined in `convex/schema.ts`:

### **Knowledge Base (`knowledge_bases`)**
| Field | Type | Description |
|---|---|---|
| `projectId` | `Id<"projects">` | Link to the specific project. |
| `name` | `string` | The display name of the KB. |
| `description` | `string` (Optional) | Description of the KB. |
| `isDefault` | `boolean` (Optional) | Marks the auto-created default KB. |

### **Knowledge Base Source (`knowledge_base_sources`)**
| Field | Type | Description |
|---|---|---|
| `kbId` | `Id<"knowledge_bases">` | Link to the parent KB. |
| `type` | `string` | Enum values: `"url"`, `"text"`, `"file"`. |
| `value` | `string` | The URL, raw text, or `_storage` ID for files. |
| `status` | `string` (Optional) | Enum values: `"indexing"`, `"indexed"`, `"failed"`. |

### **Knowledge Base Chunk (`knowledge_base_chunks`)**
| Field | Type | Description |
|---|---|---|
| `sourceId` | `Id<"knowledge_base_sources">` | Link to the source object. |
| `projectId` | `Id<"projects">` | Link to the project for scoping. |
| `text` | `string` | The raw text of the chunk. |
| `embedding` | `Float64Array` | 2048-dimensional vector embedding. |
