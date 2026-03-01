# Canned Responses - Feature Audit Report

## 1. Convex Schema
- **File Location**: `convex/schema.ts` (Lines 147-152)
- **What exists**: 
    - A `canned_responses` table is correctly defined.
    - **Fields**:
        - `projectId` (v.id("projects")): Link to project.
        - `trigger` (v.string): The shortcut trigger (e.g., "hello").
        - `message` (v.string): The full text of the response.
        - `createdBy` (v.optional(v.string)): Clerk ID of the creator.
- **What's Missing/Broken**:
    - No fields for "categories" or "tags" which might be useful for enterprise-level response management.
    - The schema is solid but basic.

## 2. Convex Queries & Mutations
- **File Location**: `convex/settings.ts` (Lines 89-140)
- **What exists**:
    - `listCannedResponses` (Query): Fetches responses for a project.
    - `createCannedResponse` (Mutation): Inserts a new response.
    - `updateCannedResponse` (Mutation): Patches an existing response.
    - `removeCannedResponse` (Mutation): Deletes a response.
- **What's Missing/Broken**:
    - **Missing**: Server-side search or filtering. Currently, searching is done client-side in the dashboard.
    - **Missing**: Authorization check beyond `if (!identity)`. It doesn't verify if the user belongs to the project/org (though `projectId` is passed).

## 3. Dashboard Settings Page
- **File Location**: `src/app/dashboard/settings/canned-responses/page.tsx`
- **What exists**: 
    - A fully styled, functional page built with Shadcn UI.
    - **Features**: List, Create (via Dialog), Delete, Search (client-side), and Placeholders assistant (Personalize dropdown).
- **What's Missing/Broken**:
    - **Missing Update UI**: Although the `updateCannedResponse` mutation exists in Convex, there is no "Edit" button or modal in the UI to modify existing responses.
    - **Broken "Created By" logic**: The "Created By" column in the table is hardcoded to show `user.fullName || "You"` (Lines 288-290). This logic should ideally look up the profile based on the `createdBy` ID.
    - **Hardcoded Placeholders**: The list of placeholders (`{{user_name}}`, etc.) is hardcoded (Lines 50-55) and not managed as a central constant or dynamic list.

## 4. Monitor / Chat UI Integration
- **File Location**: `src/components/dashboard/monitor/chat-display.tsx`
- **What exists**: **Nothing related to canned responses.**
- **What's Missing/Broken**:
    - **Missing Trigger**: There is no logic to intercept the `/` character in the `Textarea` input.
    - **Missing Popup**: There is no UI component to display matching responses when the user types a trigger.
    - **Missing Injection Logic**: No code to replace `{{placeholder}}` syntax with actual conversation data when a response is selected.
    - **Missing Data Fetching**: `chat-display.tsx` does not subscribe to `api.settings.listCannedResponses`.

## 5. TypeScript Types & Constants
- **What exists**: 
    - Only the auto-generated types from Convex.
- **What's Missing/Broken**:
    - **Missing Constants**: No shared constant file for placeholder keys (e.g., `CANNED_RESPONSE_PLACEHOLDERS`).
    - **Missing Utility Types**: No shared types for the CannedResponse object used across the frontend.

---
**Summary Verdict**: The backend (schema/functions) and the management UI (settings page) are about 80% complete, but the actual **usage** in the chat monitor is 0% implemented.
