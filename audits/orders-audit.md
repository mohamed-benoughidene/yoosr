# Audit: Orders Section

## 1. Orders Page Overview
- **URL/Route**: `/dashboard/orders` (Path: `src/app/dashboard/orders/page.tsx`)
- **Appearance**: A clean, data-heavy dashboard page using Shadcn UI table. It includes:
  - Header with a title ("Orders") and description.
  - Filter bar with status filters: "All", "New", "Confirmed", "Cancelled".
  - A scrollable table for listing orders.
- **Table Columns**:
  - **Contact Name**: The name of the customer who placed the order.
  - **Phone**: Contact phone number (displays "-" if missing).
  - **Product**: The product requested in the order.
  - **Notes**: Extra details or requirements (truncated with tooltip on hover).
  - **Status**: Visual badge showing the current state:
    - `New` (Blue)
    - `Confirmed` (Green)
    - `Cancelled` (Red)
  - **Created At**: Date and time when the order was created.
  - **Actions**: A dropdown menu (`...`) for each row with:
    - Mark Confirmed
    - Mark Cancelled
    - Delete

## 2. Export & Import Buttons
- **Status**: **Not found.**
- **Details**: There are currently no buttons or UI elements for exporting or importing orders in the Orders section. The UI is focused on manual status management and deletion.

## 3. Convex Data Model
- **Table Name**: `orders` (Defined in `convex/schema.ts`)
- **Fields**:
| Field Name | Type | Description |
|---|---|---|
| `projectId` | `v.id("projects")` | Link to the project owning the order. |
| `conversationId` | `v.optional(v.id("conversations"))` | Link to the chat where the order originated. |
| `contactName` | `v.string()` | Name of the lead/customer. |
| `phone` | `v.optional(v.string())` | Lead's phone number. |
| `product` | `v.string()` | Description of the ordered item. |
| `notes` | `v.optional(v.string())` | Additional context or comments. |
| `status` | `v.union("new", "confirmed", "cancelled")` | Current workflow state. |
| `agentId` | `v.optional(v.string())` | Clerk user ID of the agent who handled it. |
| `createdAt` | `v.number()` | Millisecond timestamp. |

- **Indexes**:
  - `by_projectId` (Standard lookup)
  - `by_conversationId` (For linking back to chat)
  - `by_projectId_status` (For filtering)

## 4. Convex API Functions
The logic is located in `convex/orders.ts`:
- **`listOrders({ projectId })`**: (Query) Fetches all orders for a project, sorted by `createdAt` descending.
- **`createOrder({ ... })`**: (Mutation) Creates a new order. Defaults status to `new`. Includes server-side auth checks (Clerk `org_id` must match project `orgId`).
- **`updateOrderStatus({ orderId, status })`**: (Mutation) Updates the status of an existing order.
- **`deleteOrder({ orderId })`**: (Mutation) Deletes an order record.

## 5. Existing Import/Export Logic
- **Status**: **None found.**
- **Findings**: There are no references to CSV, JSON, or Excel export/import utilities in the orders-related files. The current implementation is strictly for displaying and managing records already in the database.
