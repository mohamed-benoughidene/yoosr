# Monitoring & Telemetry Features

This document provides an overview of the monitoring, analytics, and debugging features implemented to enhance visibility into bot performance, usage quotas, and real-time execution.

## 1. Usage Tracking & Quotas
Enables real-time monitoring of resource consumption at the project level.

-   **Backend Logic**: Updates the `project_usage` table in Convex during conversation creation and LLM token logging.
-   **UI Component**: `AnalyticsUsageQuotas` (located in the Analytics dashboard).
-   **Metrics Tracked**:
    -   **AI Tokens**: Total tokens consumed by LLM operations (e.g., Knowledge Base RAG, Tag Extraction).
    -   **Conversations**: Count of active/closed chat sessions within the current billing cycle.
-   **Visuals**: Progress bars indicating consumption against project limits.

## 2. LLM Semantic Tags Analytics
Leverages AI to automatically categorize conversations based on user intent and topics.

-   **Backend Logic**: An internal action `extractGenerativeTags` runs upon conversation resolution. It uses an LLM to analyze the transcript and generate 1-3 labels.
-   **UI Component**: `AnalyticsTagsChart`.
-   **Visuals**: An interactive Pie Chart (using Recharts) showing the distribution of common topics (e.g., `billing_issue`, `feature_request`, `resolved`).
-   **Benefits**: Provides high-level insights into why users are contacting support without manual tagging.

## 3. Unanswered Questions Tracker
Identifies gaps in the Knowledge Base by logging queries that the bot failed to answer.

-   **Backend Logic**: The `search` action in `convex/knowledge.ts` logs queries to the `unanswered_queries` table if no relevant chunks are found.
-   **UI Component**: `AnalyticsUnansweredQueries`.
-   **Features**:
    -   Aggregated view of failed queries with frequency counts.
    -   **Quick Action**: "Create KB Entry" button that pre-fills the Knowledge Base editor with the missing question to streamline bot improvement.

## 4. Real-Time Bot Debugger
A visual debugging tool integrated into the Design Studio to monitor bot logic execution in real-time.

-   **Backend Logic**: The `botEngine.ts` captures an `executionLog` (node ID, type, and action) for every step taken by the bot.
-   **UI Component**: `DebuggerPanel` (Floating overlay in Design Studio).
-   **Features**:
    -   **Live Sync**: Highlights the active node in the ReactFlow canvas with a pulsing green glow as it executes.
    -   **Execution History**: A scrollable terminal-style list of the most recent steps taken by the bot.
    -   **Toggleable**: Can be enabled/disabled via the "Debugger" button in the flow toolbar.

## 5. RestHooks (Outbound Webhooks)
A "Push" notification system to sync Yoosr events with external third-party systems.

-   **Backend Logic**: `fireWebhookEvent` action handles outbound POST requests with HMAC-ready payloads.
-   **Triggers**:
    -   `message.create`: Fired whenever a new message is sent.
    -   `request.close`: Fired when a conversation is resolved.
-   **Management UI**: Located at `Settings > Webhooks`.
-   **Features**: CRUD interface to add endpoint URLs, toggle status (Pause/Resume), and view subscribed events.
