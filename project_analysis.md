# Tiledesk Projects Configuration Analysis

## Overview
This document captures the design and functionality of the "Your Projects" section and the "Create Project" flow from the reference Tiledesk implementation. We will use this as a reference for future implementation.

## 1. Projects List View ("Your Projects")
The entry point is the `/dashboard/#/projects` page. It displays a list of existing projects and an option to create a new one.

![Projects List View](/home/mohamed/.gemini/antigravity/brain/dbc6d3a7-24af-4755-b171-8132453bd85a/projects_list_view_1770982555881.png)

### Key Elements:
-   **Header**: "Your Projects" title.
-   **Add Button**: A prominent "Add project" card or button.
-   **Project Cards**: Display existing projects with:
    -   Project Name.
    -   Project ID (masked/truncated).
    -   Active/Status indicator.
    -   Role/User info (likely "Owner" or similar).

---

## 2. Create Project Flow
Clicking "Add project" opens the creation wizard/modal.

![Create Project View](/home/mohamed/.gemini/antigravity/brain/dbc6d3a7-24af-4755-b171-8132453bd85a/create_project_view_1770982568763.png)

### Key Elements:
-   **Input Fields**:
    -   **Project Name**: Text input for the name of the new project.
    -   **Project URL** (Optional/Generated): Might be relevant for specific deployments.
-   **Actions**:
    -   **Create Project**: Primary action button.
    -   **Close/Cancel**: Option to dismiss the modal.

## Future Implementation Notes
When we move to implement this:
1.  We need a backend endpoint to handle project creation (likely `POST /projects`).
2.  We need to store `project_name` and generate a unique `project_id`.
3.  The frontend should redirect to the new project's dashboard (`/dashboard/#/project/:id/home`) upon success.

---

## 3. Reference Chat Interface
The chat interface (`/chat/#/conversation-detail/`) is a comprehensive messaging tool.

![Chat Conversation View](/home/mohamed/.gemini/antigravity/brain/dbc6d3a7-24af-4755-b171-8132453bd85a/chat_conversation_view.png)

### Layout Overview
The interface follows a classic 3-column layout:
1.  **Conversations List (Left)**:
    -   Displays active/archived chats.
    -   Key filters: Unassigned, All, My conversations.
    -   "New Chat" button to start internal or external conversations.
    -   Each item shows: User avatar, name, last message snippet, timestamp, and channel icon.

2.  **Conversation Detail (Center)**:
    -   **Header**: Participant name and status.
    -   **Message Feed**:
        -   Bubbles for sent/received messages.
        -   System messages (e.g., "Assigned to...").
        -   Daily timestamps.
    -   **Composer Area**:
        -   **Tabs**: Switch between standard Chat and Email modes.
        -   **Actions**: Attach files, Insert Canned Responses (flash icon), Emoji picker.
        -   **Input**: Multi-line text area with a "Send" button.

3.  **Contact Info Sidebar (Right)**:
    -   Displays user profile (Name, Email, ID).
    -   Expandable "Advanced info" section for technical details (User ID, IP, etc.).

![User Info Sidebar](/home/mohamed/.gemini/antigravity/brain/dbc6d3a7-24af-4755-b171-8132453bd85a/chat_user_info_view.png)

### Key Features to Implement
-   **Real-time Messaging**: WebSocket integration for instant updates.
-   **Rich Input**: Support for file attachments and emojis.
-   **Canned Responses**: Quick access to pre-written replies.
-   **Visitor Simulation**: Ability to test flows as a visitor.

-   **Visitor Simulation**: Ability to test flows as a visitor.

---

## 4. Project Home Dashboard
The Project Home (`/dashboard/#/project/:id/home`) serves as the command center for a specific project.

![Project Home View](/home/mohamed/.gemini/antigravity/brain/dbc6d3a7-24af-4755-b171-8132453bd85a/project_home_focused.png)

### Layout Overview
-   **Sidebar**: Expanded context-aware navigation (Home, Chat, Bots, Requests, Analytics, Settings).
-   **Header**:
    -   Project selector (dropdown).
    -   Quick actions: Simulate Visitor, Sound toggle.
    -   Sub-header with Project Name and shortcuts (Operating Hours, Global Filters).

### Key Widgets
The main dashboard area is widgetized. **Note: The "News and documentation" section is explicitly excluded from this analysis and future implementation.**

1.  **Onboarding/Flows**:
    -   Prominent call-to-action to "Create your first Flow".
    -   Shortcuts to flow templates (Increase sales, Customer Satisfaction).
2.  **Analytics Overview**:
    -   "Conversations overview" chart (Total vs Served by Bots).
    -   Timeframe filters (Last 7 days / 30 days).
3.  **Status Cards**:
    -   **Knowledge Bases**: Count of active KBs.


---

## 5. Knowledge Base Management
The Knowledge Base section (`/dashboard/#/project/:id/knowledge-bases/:kb_id`) is where users manage data sources for AI agents.

![Knowledge Base Main View](/home/mohamed/.gemini/antigravity/brain/dbc6d3a7-24af-4755-b171-8132453bd85a/knowledge_base_main_view.png)

### Layout & Navigation
-   **Sidebar**: List of "Your Knowledge Bases" with a "New" button.
-   **Main Area**: Settings for the selected KB (e.g., "Default").
-   **Header Actions**: Export, Import, Delete usage.

### Key Configuration Areas
-   **Add Content**:
    -   **URLs**: Import specific web pages.
    -   **Sitemap**: Bulk import via XML sitemap.
    -   **FAQs**: Manual Q&A or CSV import.
    -   **Plain Text**: Direct text entry.
    -   **Upload File**: PDF/DOCX document indexing.

![Add URL Modal](/home/mohamed/.gemini/antigravity/brain/dbc6d3a7-24af-4755-b171-8132453bd85a/knowledge_base_add_url_modal.png)

### GPT/LLM Integration
-   **AI Agent Creation**: A prominent "Create your AI Agent" CTA suggests that actual LLM configuration (model selection, prompts) happens in the Chatbot/Agent settings, using the KB as a data source.
-   **Indexing Status**: Progress bars show content usage vs limits.

---

## 6. Bots Management (Flows)
The "My Chatbots" section (`/dashboard/#/project/:id/bots/my-chatbots/all`), referred to as "Flows" in the UI, is the central hub for automation.

![Bots List View](/home/mohamed/.gemini/antigravity/brain/dbc6d3a7-24af-4755-b171-8132453bd85a/bots_list_view.png)

### Layout & Navigation
-   **Header**: Titled "Flows".
-   **Primary Actions**:
    -   **New Flow**: Button to create a new bot from scratch.
    -   **Add from template**: Access to pre-built bot templates.
-   **Sidebar Filters**:
    -   **Flows**: All, AI agents, Automations.
    -   **Webhooks**: Link to webhook management.

### Key Elements (Empty State)
-   **Quick Start Cards**: Prominent options to start with:
    -   **AI Agents**: For customer support/engagement.
    -   **Automations**: For logic-based workflows.

### Terminology Note
The UI consistently uses the term **"Flow"** instead of "Bot" for the high-level object, distinguishing between "AI Agents" (LLM-backed) and "Automations" (Rule-based).

---

## 7. Requests Management (Ticket View)
The "Requests" section (`/dashboard/#/project/:id/wsrequests`) provides a ticket-style view of all conversations.

![Requests List View](/home/mohamed/.gemini/antigravity/brain/dbc6d3a7-24af-4755-b171-8132453bd85a/requests_list_view.png)

### Layout & Navigation
-   **Sidebar Filters**:
    -   **Unassigned**: New requests waiting for an agent.
    -   **Assigned to me**: Requests claimed by the current user.
    -   **All**: Global view of all requests.
-   **Header Actions**:
    -   **Simulate Visitor**: Quick access to test the flow.
    -   **Search**: Text search for requests.

### List Columns (Typical)
-   **User**: Avatar and name of the visitor.
-   **Message**: Snippet of the last interaction.
-   **Agent**: Avatar of the assigned agent (or bot).
-   **Status**: Visual indicator (Open, Served, Closed).
-   **Status**: Visual indicator (Open, Served, Closed).
-   **Time**: Timestamp of the last activity.

---

## 8. Analytics Dashboard
The Analytics section (`/dashboard/#/project/:id/analytics`) provides insights into project performance.

![Analytics Dashboard View](/home/mohamed/.gemini/antigravity/brain/dbc6d3a7-24af-4755-b171-8132453bd85a/analytics_dashboard_view.png)

### Layout & Tabbing
The view is divided into three main tabs:
1.  **Overview**: High-level trends (Conversations last 7 days, Hourly distribution).
2.  **Metrics**: Detailed historical data with sub-navigation for:
    -   **Conversations**: Total count, Bot vs Human.
    -   **Visitors**: Unique visitor tracking.
    -   **Response Time**: Speed of agent replies.
    -   **Satisfaction**: Customer sentiment/feedback.
3.  **Real Time**: Live monitoring of active/queued conversations.

### Key Features
-   **Filters**: Robust filtering by Date Range, Department, Agent, and Channel.
-   **Visualizations**: Line charts for trends, bar charts for distribution.
-   **Visualizations**: Line charts for trends, bar charts for distribution.
-   **Live Data**: Real-time counters for Active, Assigned, and Unassigned chats.

---

## 9. Activities Logs
The Activities section (`/dashboard/#/project/:id/activities`) serves as the project's audit trail.

![Activities List View](/home/mohamed/.gemini/antigravity/brain/dbc6d3a7-24af-4755-b171-8132453bd85a/activities_list_view.png)

### Purpose
To track administrator and agent actions within the project for accountability and troubleshooting.

### Key Elements
-   **Filters**:
    -   **Date Range**: Start and End date picker.
    -   **Agent**: Filter actions by specific user.
    -   **Activity Type**: Filter by action (e.g., Login, Update).
-   **List View**:
    -   Chronological list of events.
    -   Sortable by date.

---

## 10. Conversation History
The History section (`/dashboard/#/project/:id/history`) acts as the archive for completed conversations.

![History List View](/home/mohamed/.gemini/antigravity/brain/dbc6d3a7-24af-4755-b171-8132453bd85a/history_list_view.png)

### Comparison with Requests
It shares the same list layout as the Request (Active) view but is filtered for closed items by default.

### Key Features
-   **Advanced Search**:
    -   Filter by Department, Agent, Channel, Tags, Email.
    -   Date Range picker (Closed At).
    -   Full-text search.
-   **Actions**:
    -   **Export to CSV**: Download archival data.
    -   **Selection**: Bulk operations on closed tickets.

---

## 11. Widget Setup
The Widget Setup section (`/dashboard/#/project/:id/widget-set-up`) configures the customer-facing chat widget.

![Widget Setup Main View](/home/mohamed/.gemini/antigravity/brain/dbc6d3a7-24af-4755-b171-8132453bd85a/widget_setup_main_view.png)

### Layout
-   **Split View**: Configuration options on the left, **Live Preview** on the right.
-   **Sidebar Tabs**:
    -   **Widget**: Appearance settings (Themes, Colors, Logo, Position).
    -   **Installation**: Script tags for Web, WordPress, etc.
    -   **Translations**: Multi-language support.
    -   **Other**: Routing, Operating Hours, etc.

### Key Capabilities
-   **Theming**: Pre-set themes or custom HEX codes for primary/secondary colors.
-   **Installation**: Generates the `<script>` tag including the `projectid`.
-   **Preview**: Real-time visualization of changes.

---

## 12. Departments Management
The Departments section (`/dashboard/#/project/:id/departments`) handles query routing and team organization.

![Departments List View](/home/mohamed/.gemini/antigravity/brain/dbc6d3a7-24af-4755-b171-8132453bd85a/departments_list_view.png)

### Layout
-   **Default Department**: Always present, acts as the fallback.
-   **List View**: Shows Name, Visibility, AI Agent assigned, Routing mode, and Assigned Teammates.
-   **Actions**: Edit or Create new departments.

![Department Creation View](/home/mohamed/.gemini/antigravity/brain/dbc6d3a7-24af-4755-b171-8132453bd85a/department_creation_view.png)

### Configuration Flow
-   **Basic Info**: Name and Description.
-   **AI Integration**: Toggle to "Activate an AI Agent" and selector for specific bots.
-   **Routing Rules**:
    -   **Assigned**: Round-robin/load-balanced assignment.
    -   **Pooled**: Agents pick from a shared queue (`unassigned`).

---

## 13. Teammates Management (Users)
The Users section (`/dashboard/#/project/:id/users`) manages team access and roles.

![Teammates List View](/home/mohamed/.gemini/antigravity/brain/dbc6d3a7-24af-4755-b171-8132453bd85a/teammates_list_view.png)

### Layout
-   **List View**: Displays Avatar, Name, Email, Status (Available/Unavailable), and Role.
-   **Status Indicator**: Dropdown to manually change availability.
-   **Actions**: Edit role, remove user.

![Invite Teammate View](/home/mohamed/.gemini/antigravity/brain/dbc6d3a7-24af-4755-b171-8132453bd85a/invite_teammate_view.png)

### Invitation Flow
-   **Inputs**: Email Address and Role selection.
-   **Roles**:
    -   **Owner**: Full access.
    -   **Administrator**: Manage settings and users.
    -   **Agent**: Handle conversations.

---

## 14. Canned Responses
The Canned Responses section (`/dashboard/#/project/:id/cannedresponses`) manages quick replies for agents.

![Canned Responses List View](/home/mohamed/.gemini/antigravity/brain/dbc6d3a7-24af-4755-b171-8132453bd85a/canned_responses_list_view.png)

### Layout
-   **List**: Table showing Title, Message, and Creator.
-   **Empty State**: Help text and tips for usage (e.g., using `/` shortcut).

![Canned Response Creation View](/home/mohamed/.gemini/antigravity/brain/dbc6d3a7-24af-4755-b171-8132453bd85a/canned_response_creation_modal.png)

### Editor Flow
-   **Fields**:
    -   **Title**: Internal name/shortcut.
    -   **Message**: The actual text sent to the visitor.
-   **Personalization**: Button to insert dynamic placeholders (e.g., User Name).

-   **Note**: Tags are not part of the creation modal here, unlike some other sections.

---

## 15. Labels (Tags)
The Labels section (`/dashboard/#/project/:id/labels`), referred to as "Tags" in the UI, allows for categorizing conversations.

![Tags List View](/home/mohamed/.gemini/antigravity/brain/dbc6d3a7-24af-4755-b171-8132453bd85a/labels_list_view.png)

### Layout
-   **Inline Creation**: Unlike other sections, tags are created via an inline form above the list.
-   **List View**: Displays Tag Name (with color badge), Creator, and Date.

![Tags Color Picker](/home/mohamed/.gemini/antigravity/brain/dbc6d3a7-24af-4755-b171-8132453bd85a/labels_creation_view.png)

### Creation Flow
-   **Fields**:
    -   **Color**: Dropdown selection (Red, Orange, Yellow, Green, Blue, Violet).
    -   **Name**: Text input.
-   **Usage**: Applied to conversations for filtering and reporting.

---

## 16. Operating Hours
The Operating Hours section (`/dashboard/#/project/:id/hours`) controls when the project is considered "Open" or "Closed".

![Operating Hours View](/home/mohamed/.gemini/antigravity/brain/dbc6d3a7-24af-4755-b171-8132453bd85a/operating_hours_view.png)

### Configuration
-   **Master Switch**: "Activate General Operating Hours" toggle.
-   **Schedule**:
    -   Daily rows (Sun-Sat).
    -   Status toggle (Open/Closed).
    -   Multiple time slots per day (e.g., 09:00-13:00, 14:00-18:00).
-   **Timezone**: Dropdown to set the project's timezone.
-   **Timezone**: Dropdown to set the project's timezone.
-   **Note**: Offline welcome messages are NOT configured here (likely in Widget/Translations).

---

## 17. Integrations
The Integrations section (`/dashboard/#/project/:id/integrations`) connects the project to external channels and AI providers.

![Integrations List View](/home/mohamed/.gemini/antigravity/brain/dbc6d3a7-24af-4755-b171-8132453bd85a/integrations_list_view.png)

### Available Integrations
-   **AI Providers**: OpenAI, Google Gemini, Anthropic, etc. (Available for configuration).
-   **Channels**:
    -   **Telegram**: Available. Requires a Bot Token.
    -   **Messenger / WhatsApp**: Currently **LOCKED** (Requires Pro Plan). The UI prompts for an upgrade.
    -   **Twilio SMS / CRM**: Also listed.

![Telegram Integration (Available)](/home/mohamed/.gemini/antigravity/brain/dbc6d3a7-24af-4755-b171-8132453bd85a/telegram_integration_available.png)

### Configuration Pattern (Based on Telegram)
-   **Toggle**: Enable/Disable the integration.
-   **Credentials**: Input fields for API keys or Tokens (e.g., Telegram Bot Token).
-   **Instructions**: Detailed setup guide provided within the UI.

![Messenger Integration (Locked)](/home/mohamed/.gemini/antigravity/brain/dbc6d3a7-24af-4755-b171-8132453bd85a/messenger_integration_locked.png)

### Note on Locked Features
### Note on Locked Features
Features like Messenger are currently gated behind a plan check in this local instance. Implementation should prepare for standard OAuth or Token-based configuration fields (Page ID, Access Token, App Secret) similar to the open Telegram integration.

### Messenger Deep Dive
The Messenger integration page is hard-locked with an overlay.

![Messenger Locked View](/home/mohamed/.gemini/antigravity/brain/dbc6d3a7-24af-4755-b171-8132453bd85a/messenger_integration_locked.png)

**Observed State:**
-   **URL**: `/integrations?name=messenger`
-   **UI**: Replaced by "Upgrade your plan!" promo.
-   **Bypass**: No obvious soft-lock (likely component replacement).

**Implementation Strategy:**
Since we cannot inspect the fields directly, we will implement the standard Tiledesk/Facebook Developer fields:
1.  **Page Name**
2.  **Page ID**
3.  **Page Access Token**
4.  **App Secret**
4.  **App Secret**
5.  **Verify Token** (for Webhooks)

---

## 18. App Store
The App Store section (`/dashboard/#/project/:id/app-store`) lists all available extensions and integrations.

![App Store View](/home/mohamed/.gemini/antigravity/brain/dbc6d3a7-24af-4755-b171-8132453bd85a/app_store_list_view.png)

### Layout
-   **Grid View**: Cards for each app (e.g., WhatsApp Business, Messenger, OpenAI, etc.).
-   **Categories**: All, AI, Analytics, CRM, Channels, etc.
-   **Status**: Apps show "Install", "Configure", or "Upgrade" buttons.
-   **Search**: Bar to filter apps by name.

### Key Observations
-   Mirroring the Integrations page, premium apps (WhatsApp, Messenger) prompt for upgrades.
-   This section acts as a catalog, while installed apps often appear in the "Integrations" section or sidebar.

---

## 19. Project Settings
The Project Settings area (`/dashboard/#/project/:id/project-settings/general`) manages core project configuration.

### General Settings
Values visible:
-   **Project Name**
-   **Description**
-   **Project ID** (Crucial for API usage)
-   **Disconnect from Tiledesk** (Dangerous action)

![General Settings](/home/mohamed/.gemini/antigravity/brain/dbc6d3a7-24af-4755-b171-8132453bd85a/project_settings_general.png)

### Advanced Settings
The "Advanced" tab contains sensitive operations like project deletion.
*(Note: In the local version, this might be gated or labelled differently)*

![Advanced Settings](/home/mohamed/.gemini/antigravity/brain/dbc6d3a7-24af-4755-b171-8132453bd85a/project_settings_advanced.png)

### Developer Settings
Although not always visible in the main tabs, developer settings usually host:
-   **API Keys**
-   **Webhooks**
-   **Security Settings** (JWT Secrets)
















