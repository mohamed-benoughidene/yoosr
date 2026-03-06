# Widget Setup Audit Report

This report documents the current implementation of the Widget Setup and Configuration settings page in the Yoosr project.

## 1. Page Implementation and Routing
- **File Path**: `src/app/dashboard/settings/widget/page.tsx`
- **Route**: `/dashboard/settings/widget`
- **Component Name**: `WidgetSetupPage`
- **Access Control**: Handled via `ProjectContext` and Clerk Organization ID (`orgId`).

## 2. Page Structure and Sections
The page is divided into a configuration area (tabs) and a live preview area.

### Tabs and Sections:
- **Appearance Tab (`appearance`)**:
  - **Theme**: Color presets (Custom, Ocean Blue, Forest Green, Royal Purple, Midnight) and a custom Color Picker for the primary color.
  - **Branding**: Field for "Logo URL" to display in the widget header.
- **Behavior Tab (`behavior`)**:
  - **Engagement**: Toggle for "Auto-Open / Welcome Notification", toggle for "Pre-chat Form", and selection for "Contact Method" (Email or Phone).
  - **Engagement Delay**: Input for seconds before showing the welcome greeting.
  - **Auto-Close**: Input for minutes of inactivity before automatically closing conversations.
- **Text Tab (`translations`)**:
  - **Text Labels**: Customizable fields for "Header Title", "Welcome Message", "Pre-chat Title", and "Pre-chat Subtitle".
- **Install Tab (`installation`)**:
  - **HTML / Standard**: Provides a script snippet for standard websites.
  - **Next.js**: Provides a snippet using the `next/script` component.
- **Live Preview (Desktop only)**:
  - Displays a sticky iPhone mockup on the right side.
  - Renders an iframe pointing to `/widget?projectId={projectId}`.
  - Includes a "Reset Visitor Session" button to clear local storage.

## 3. Installation Code Section
The "Install" tab provides the necessary code to embed the widget:

### HTML / Standard Snippet:
```html
<script>
  window.yoosrSettings = {
    projectId: "{PROJECT_ID}"
  };
</script>
<script src="{BASE_URL}/widget.js" async></script>
```

### Next.js Snippet:
```tsx
import Script from 'next/script'

<>
  <Script id="yoosr-init" strategy="afterInteractive">
    {`
      window.yoosrSettings = {
        projectId: "{PROJECT_ID}"
      };
    `}
  </Script>
  <Script 
    src="{BASE_URL}/widget.js"
    strategy="afterInteractive" 
  />
</>
```

## 4. Database Schema (Projects Table)
Fields related to widget configuration in the `projects` table within `convex/schema.ts`:

- **`_id`**: Standard Convex ID (used as the unique `projectId` for embedding).
- **`widgetConfig`**: A `v.optional(v.any())` field that stores the following JSON structure:
  - `primaryColor`: Hex color string.
  - `align`: "left" | "right".
  - `logoUrl`: String URL.
  - `welcomeDelay`: Number (seconds).
  - `enableWelcomeNotification`: Boolean.
  - `autoCloseMinutes`: Number (minutes).
  - `preChatFormEnabled`: Boolean.
  - `contactMethod`: "email" | "phone".
  - `translations`: Object containing:
    - `headerTitle`
    - `onlineStatus`
    - `startChat`
    - `welcomeMessage`
    - `preChatTitle`
    - `preChatSubtitle`

**Note**: There are currently no dedicated "apiToken" or "embedKey" fields; the project's internal Convex ID is exposed as the identifier.

## 5. Unique Identifier Generation
- **Identifier**: `projectId` is used as the unique key.
- **Generation**: It is the standard Convex ID (`_id`) generated automatically when a project is inserted into the `projects` table.
- **Location**: Created in `convex/projects.ts` within the `ensureProject` and `create` mutations.
- **Format**: Standard Convex ID format (e.g., `jd7efv7m499...`).

## 6. Widget Bootstrap Endpoints
The widget (`widget.js` and the iframe) calls several endpoints to initialize:

- **Next.js API Routes**:
  - `GET /api/widget/project?projectId={id}`: Proxies to Convex to fetch project settings and primary color.
- **Convex HTTP Endpoints (`convex/http.ts`)**:
  - `GET /widget/project`: Returns public project info (name, `widgetConfig`). No auth required.
  - `GET /widget/conversations`: Finds an existing conversation for a `projectId` and `visitorId`.
  - `POST /widget/conversations`: Creates a new conversation.
  - `GET /widget/messages`: Fetches message history for a conversation.
- **Iframe Route**:
  - `GET /widget?projectId={id}`: Renders the React-based widget UI.

## 7. Widget Embed Scripts
- **Loader Script**: `public/widget.js`
  - This script handles the creation of the floating container, the launcher button, and the iframe. 
  - It communicates with the iframe via `window.postMessage` for events like `auto_open` and `new_message`.
- **Widget Application**: `src/app/widget/page.tsx`
  - This is the React application that runs inside the iframe, handling the chat UI, polling for messages, and interacting with Convex HTTP endpoints.
