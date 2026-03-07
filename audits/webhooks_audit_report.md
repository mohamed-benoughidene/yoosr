# Webhooks Audit Report

This document contains a comprehensive audit of all webhook-related implementations within the codebase.

## 1. Webhook-related UI Surfaces

There are two distinct UI surfaces in the dashboard that mention or configure webhooks.

### Surface A: Project Settings (Developer Tab)
- **File Name**: `src/app/dashboard/settings/page.tsx`
- **Route/Path**: `/dashboard/settings` (specifically under the "Developer" tab > "Webhooks" section)
- **UI Elements Rendered**:
  - **Switch/Toggle**: Labelled "Enable Webhooks".
  - **Input Field**: Labelled "Endpoint URL" (`id="webhook-url"`, placeholder `https://your-server.com/api/webhooks`).
  - **Static Badges**: A visual list of "Events sent:" (`message.created`, `conversation.opened`, `conversation.closed`, `contact.created`, `agent.assigned`).
  - **Button**: Text "Save Webhook Settings" to submit the changes.

### Surface B: Dedicated Webhooks Page
- **File Name**: `src/app/dashboard/settings/webhooks/page.tsx`
- **Route/Path**: `/dashboard/settings/webhooks`
- **UI Elements Rendered**:
  - **Form (Add New Endpoint)**: Contains an Input for "Endpoint URL" and a Button "Add Webhook".
  - **Table (Active Subscriptions)**: Displays columns for Target URL, Events, Status, and Actions.
  - **Switch/Toggle (in table)**: To toggle the active status of an individual webhook.
  - **Button (in table)**: A trash icon button to trigger deletion.
  - **Alert Dialog**: Confirmation modal for deleting a webhook.

---

## 2. Convex Backend — Webhook Schema and Mutations

The schema defines a dedicated table for webhook subscriptions.

### Schema Table
Table Name: `webhook_subscriptions`
**Fields:**
- `projectId` (`v.id("projects")`): The project this webhook belongs to.
- `url` (`v.string()`): The target webhook endpoint.
- `events` (`v.array(v.string())`): Array of events the webhook subscribes to.
- `secretName` (`v.optional(v.string())`): Optional secret lookup key.
- `isActive` (`v.boolean()`): Determines if the webhook should receive payloads.

Additionally, the `projects` table has a `widgetConfig` field (`v.optional(v.any())`) which the UI uses to loosely store webhook data (explained below).

### Convex Queries and Mutations (located in `convex/webhooks.ts`)
- **`fireWebhookEvent`** (internal action): 
  - **Arguments**: `{ projectId, event, payload }`
  - **What it does**: Fetches active subscriptions for a given project/event and loops through them to fire HTTP POST requests with a standard JSON payload and an `X-Tiledesk-Event` header. (Note: Currently called internally by message and conversation creation mutations using `ctx.scheduler.runAfter`).
- **`getActiveSubscriptions`** (internal query): 
  - **Arguments**: `{ projectId, event }`
  - **What it does**: Queries `webhook_subscriptions` filtering by `projectId` and `isActive == true`, mapping over results to only return subscriptions that include the target `event`.
- **`list`** (query):
  - **Arguments**: `{ projectId }`
  - **What it does**: Returns all webhook subscriptions for the given project.
- **`create`** (mutation):
  - **Arguments**: `{ projectId, url, events }`
  - **What it does**: Inserts a new row into `webhook_subscriptions` with `isActive: true`.
- **`update`** (mutation):
  - **Arguments**: `{ id, isActive }`
  - **What it does**: Updates an existing subscription to set `isActive` state (pause/resume).
- **`remove`** (mutation):
  - **Arguments**: `{ id }`
  - **What it does**: Deletes a webhook subscription row.

---

## 3. Convex HTTP Actions (Incoming Webhooks)

There are incoming webhook HTTP action routes defined in `convex/http.ts`:

- **Route**: `POST /clerk-webhook`
  - **What it does**: Listens for Clerk events (`user.created`, `user.updated`). Extracts user data and runs `internal.profiles.upsertFromClerk` to sync Clerk users into the Convex database.
  - **Tables Touched**: `profiles` (for upserting sync data).
  
- **Route**: `GET /webhooks/meta`
  - **What it does**: Facebook/Instagram platform verification endpoint. Verifies the `hub.verify_token` against an environment variable and echoes back `hub.challenge`.
  - **Tables Touched**: None.
  
- **Route**: `POST /webhooks/meta`
  - **What it does**: Processes incoming messages from Facebook Messenger and Instagram integrations. It parses the incoming `entry` arrays and executes `internal.conversations.createOrUpdateFromMeta` for valid message objects.
  - **Tables Touched**: Operates on `conversations` and `messages` (via the targeted internal mutation).

---

## 4. Frontend Wiring

The mechanisms saving data in the two frontend surfaces are fundamentally different.

### Surface A Wiring (`/dashboard/settings`)
- **Is it wired to a backend function?** Yes, but **not** to the webhook system.
- **Which function?** The "Save Webhook Settings" button runs `api.projects.update`. 
- **What it does**: It patches the `projects` table by storing `webhookUrl` and `webhookEnabled` inside a loose JSON object on the project record (`activeProject.widgetConfig`). 

### Surface B Wiring (`/dashboard/settings/webhooks`)
- **Is it wired to a backend function?** Yes, it maps directly to the real schema.
- **Which functions?** It natively uses the `api.webhooks.*` endpoints.
- **What it does**: The table actively reads from `api.webhooks.list`. The Add action uses `api.webhooks.create`. Toggling states uses `api.webhooks.update`, and deleting utilizes `api.webhooks.remove`.

---

## 5. Duplication and Conflicts

- **Are they rendering the same component/data?**
  - No. They are handling two distinct approaches to webhooks. Surface A attempts to save a singular, global webhook URL inside the `projects.widgetConfig` column. Surface B manages a list of entries within the dedicated `webhook_subscriptions` collection.
  
- **Is there any shared state/do they operate independently?**
  - They operate **completely independently** and represent a severe architectural collision.
  - State is separated: Surface A reads from / writes to `widgetConfig`, whereas Surface B manipulates `webhook_subscriptions`.
  - **Conflict & Disconnect**: The Convex action responsible for actually *firing* outgoing webhooks (`internal.webhooks.fireWebhookEvent`) exclusively queries the `webhook_subscriptions` table. Therefore, anything saved in the `widgetConfig` via `Settings > Project Settings` is **dormant state**. A user configuring their webhook on the main settings page will *never receive an event* because that configuration is entirely bypassed by the backend processing logic.
