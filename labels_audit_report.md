# Labels and Tags Implementation: Audit & Context Report

This report provides a comprehensive overview of the labels and tags implementation within the Yoosr codebase.

---

## 1. Database Schema (Convex)

The labels and tags system is built on top of the following table structures in [`convex/schema.ts`](./convex/schema.ts).

### **Labels Table**
Defines the project-wide "dictionary" of available labels.
```typescript
labels: defineTable({
    projectId: v.id("projects"),
    name: v.string(),
    color: v.string(), // "red" | "orange" | "yellow" | "green" | "blue" | "violet"
    createdBy: v.optional(v.string()),
}).index("by_projectId", ["projectId"]),
```

### **Conversations Table (Tags Field)**
Conversations store an array of tag strings.
```typescript
conversations: defineTable({
    // ...
    tags: v.optional(v.array(v.string())),
    attributes: v.optional(v.any()), // Extensibility layer
    // ...
})
```

### **Departments Table**
Departments are used for primary conversation routing and organization.
```typescript
departments: defineTable({
    projectId: v.id("projects"),
    name: v.string(),
    description: v.optional(v.string()),
    isDefault: v.optional(v.boolean()),
    routingMode: v.optional(v.string()), // "pooled" | "assigned"
    botId: v.optional(v.string()), // Bot ID if AI-assigned
}).index("by_projectId", ["projectId"]),
```

---

## 2. Backend Logic (Mutations & Queries)

### **Labels Dictionary (CRUD)**
Handled in [`convex/settings.ts`](./convex/settings.ts):
- `listLabels`: Retrieves all available labels for a project.
- `createLabel`: Adds a new label definition.
- `updateLabel`: Modifies label name or color.
- `removeLabel`: Deletes a label definition.

### **Conversation Tagging (AI-Driven)**
Handled in [`convex/tags.ts`](./convex/tags.ts):
- `extractGenerativeTags`: An internal action triggered when a conversation is resolved. It analyzes the transcript using an LLM to generate 1-3 relevant tags.
- `updateConversationTags`: An internal mutation that merges AI-generated tags into the conversation's `tags` array.

### **Manual Assignment**
Manual tag assignment to conversations is **not currently implemented** in the backend mutations. The system is designed for automated tagging upon resolution.

---

## 3. UI Implementation (Where they are displayed)

Labels and tags are integrated across several screens in the agent dashboard:

### **Management UI**
- **Labels Settings Page**: [`src/app/dashboard/settings/labels/page.tsx`](./src/app/dashboard/settings/labels/page.tsx)
  - Purpose: Creation, listing, and deletion of project-level labels.
  - Features: Color selection (Red, Orange, Yellow, Green, Blue, Violet).

### **Active Chat & Monitoring UI**
- **Conversation List**: [`src/components/dashboard/monitor/conversation-list.tsx`](./src/components/dashboard/monitor/conversation-list.tsx)
  - Display: Tags are shown as small `Badge` components in each list item.
- **Contact Info Panel**: [`src/components/dashboard/monitor/contact-info.tsx`](./src/components/dashboard/monitor/contact-info.tsx)
  - Display: A dedicated "Tags" section in the right sidebar displays conversation tags as rounded badges.
- **Chat Display**: [`src/components/dashboard/monitor/chat-display.tsx`](./src/components/dashboard/monitor/chat-display.tsx)
  - Note: Does **not** currently show tags in the header or chat body.

### **CRM & Analytics UI**
- **Contacts List**: [`src/components/dashboard/contacts/contacts-list.tsx`](./src/components/dashboard/contacts/contacts-list.tsx)
  - Display: A "Tags" column in the data table shows badges for each contact's associated tags.
- **AI Topic Analysis**: [`src/components/analytics/AnalyticsTagsChart.tsx`](./src/components/analytics/AnalyticsTagsChart.tsx)
  - Display: A pie chart visualization showing the frequency of AI-generated tags across closed conversations.

---

## 4. Bot Engine Integration

- **[`convex/bot.ts`](./convex/bot.ts)**: There is **no mention of labels or tags** within the primary bot execution engine.
- Bots currently operate using `attributes`. There is no built-in block for "Add Label" or "If Has Label".

---

## 5. Summary of Findings

1. **Automated Approach**: The current architecture heavily favors AI-extracted tags over manual labeling.
2. **Read-Only Display**: While tags are displayed in the chat list and contact info panel, there is no UI element for an agent to manually add or remove a tag during a live chat.
3. **Consistency**: The `labels` table defines available categories and colors, but the AI tagging system (`tags.ts`) currently generates dynamic strings which may or may not match the predefined dictionary in `labels`.
