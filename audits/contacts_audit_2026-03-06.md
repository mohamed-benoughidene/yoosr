# Contacts Section Audit Report

I have completed a comprehensive audit of the Contacts section in the Yoosr dashboard. Below is a detailed breakdown of the current state of the functionality, UI, and backend infrastructure.

---

### 1. The Contacts Page
*   **URL / Route**: `/dashboard/contacts`
*   **Appearance**: The page features a standard dashboard layout with a header containing action buttons and a searchable data table.
*   **Table Component**: Uses `@tanstack/react-table` for the list view.
*   **Columns Shown**:
    *   **Select**: Checkbox for multi-row selection.
    *   **Name**: Primary contact name.
    *   **Email**: Contact email address (lowercase).
    *   **Phone**: Contact phone number.
    *   **Tags**: Array of tags displayed as badges.
    *   **Actions**: A dropdown menu with "Copy Email" and "Delete" options.
*   **Features**:
    *   Real-time data fetching via Convex `useQuery`.
    *   Filtering by name.
    *   Sorting (by name/email).
    *   Pagination (Previous/Next).
    *   Manual "Add Contact" dialog.

### 2. Import and Export Buttons
*   **Status**: **Placeholders only.**
*   **UI Location**: Top right of the Contacts page.
*   **Logic**: 
    *   The `Import` and `Export` buttons are defined in `src/app/dashboard/contacts/page.tsx`.
    *   They currently have **no `onClick` handlers** or associated logic. They are static UI elements using `lucide-react` icons (`Upload`, `Download`).

### 3. Convex Database Table
*   **Table Name**: `contacts`
*   **Schema Definition** (`convex/schema.ts`):
| Field Name | Type | Description |
|---|---|---|
| `projectId` | `v.id("projects")` | Reference to the organization's project |
| `name` | `v.string()` | Contact name (required) |
| `email` | `v.optional(v.string())` | Contact email |
| `phone` | `v.optional(v.string())` | Contact phone number |
| `address` | `v.optional(v.string())` | Physical address |
| `note` | `v.optional(v.string())` | Internal notes |
| `tags` | `v.optional(v.array(v.string()))`| Categorization tags |
| `conversationId` | `v.optional(v.id("conversations"))`| Link to the source conversation |

### 4. Existing Convex Queries & Mutations
Handled in `convex/contacts.ts`:
*   **`contacts.list`**: Fetches all contacts for a specific `projectId`.
*   **`contacts.findByConversation`**: Retrieves the contact associated with a specific chat.
*   **`contacts.create`**: Inserts a new contact record.
*   **`contacts.update`**: Partially updates an existing contact (Name, Email, Phone, Address, Note, Tags).
*   **`contacts.remove`**: Deletes a contact record by ID.

### 5. Existing Import/Export Logic
While not present for Contacts, there are reusable patterns elsewhere:
*   **Export**: The `HistoryPage` (`src/app/dashboard/history/page.tsx`) implements a client-side `exportToCSV` function that generates a Blob from JSON data and triggers a browser download.
*   **Import**: The Knowledge Base logic (`src/components/dashboard/kb/add-content-dialog.tsx`) contains file-handling UI for `.csv` files, though it lacks a full CSV parser for row-by-row database insertion.

---

**Summary for Implementation**: 
The infrastructure for CRUD is fully ready. The UI buttons are placed but need to be wired to:
1.  A CSV parser (like `papa-parse` or native browser logic) for **Import**.
2.  An iteration logic over the results of `contacts.list` for **Export**.
