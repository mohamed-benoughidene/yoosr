# Canned Responses System Audit: Variable Handling

This report details the implementation of the canned responses system in the Yoosr project, with a focus on how placeholders and variables are managed.

## 1. Convex Schema Definition
The `canned_responses` table is defined in `convex/schema.ts`. It stores the shortcut trigger and the message body containing placeholders.

```typescript
// convex/schema.ts lines 147-152
canned_responses: defineTable({
    projectId: v.id("projects"),
    trigger: v.string(),
    message: v.string(),
    createdBy: v.optional(v.string()), // Clerk user ID
}).index("by_projectId", ["projectId"]),
```

## 2. Creation Mutation
The mutation responsible for saving canned responses is `createCannedResponse` in `convex/settings.ts`. The content is stored as a raw string without any pre-processing or validation of placeholders.

```typescript
// convex/settings.ts lines 101-115
export const createCannedResponse = mutation({
    args: {
        projectId: v.id("projects"),
        trigger: v.string(),
        message: v.string(),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Not authenticated");
        return await ctx.db.insert("canned_responses", {
            ...args,
            createdBy: identity.subject,
        });
    },
});
```

## 3. UI Component: Creation and Variable Insertion
The management UI is located in `src/app/dashboard/settings/canned-responses/page.tsx`. It provides a "Personalize" dropdown that inserts placeholders at the cursor position in a `Textarea`.

### Placeholders Definition:
```typescript
// src/app/dashboard/settings/canned-responses/page.tsx lines 51-56
const placeholders = [
    { label: "User Name", value: "{{user_name}}", icon: User },
    { label: "User Email", value: "{{user_email}}", icon: Mail },
    { label: "Project Name", value: "{{project_name}}", icon: Building2 },
    { label: "Ticket ID", value: "{{ticket_id}}", icon: Hash },
]
```

### Insertion Logic:
```typescript
// src/app/dashboard/settings/canned-responses/page.tsx lines 124-138
const insertPlaceholder = (value: string) => {
    const textarea = messageRef.current
    if (!textarea) {
        setNewMessage((prev) => prev + value)
        return
    }
    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const text = newMessage
    setNewMessage(text.substring(0, start) + value + text.substring(end))
    setTimeout(() => {
        textarea.focus()
        textarea.setSelectionRange(start + value.length, start + value.length)
    }, 0)
}
```

## 4. UI Component: Usage in Chat
Canned responses are selected using the `CannedResponsePicker` component, which is triggered by typing a `/` in the chat input area.

### Picker Activation:
```typescript
// src/components/chat/ChatArea.tsx lines 204-212
const lastSlashIndex = val.lastIndexOf("/");
if (lastSlashIndex !== -1 && (lastSlashIndex === 0 || val[lastSlashIndex - 1] === " " || val[lastSlashIndex - 1] === "\n")) {
    const query = val.slice(lastSlashIndex + 1);
    setPickerQuery(query);
    setShowPicker(true);
} else {
    setShowPicker(false);
}
```

## 5. Variable Substitution Logic
Substitution occurs on the client-side within the `handlePickerSelect` function before the text is inserted into the message input field.

### Substitution Code (ChatArea):
```typescript
// src/components/chat/ChatArea.tsx lines 214-237
const handlePickerSelect = (message: string) => {
    if (!conversation) return;

    let processedMessage = message;

    const visitorName = conversation.visitorName || "Visitor";
    const agentName = user?.fullName || "Agent";
    const projectName = activeProject?.name || "";

    processedMessage = processedMessage.replace(/{{visitor_name}}/g, visitorName);
    processedMessage = processedMessage.replace(/{{agent_name}}/g, agentName);
    processedMessage = processedMessage.replace(/{{project_name}}/g, projectName);

    const lastSlashIndex = inputValue.lastIndexOf("/");
    if (lastSlashIndex !== -1 && (lastSlashIndex === 0 || inputValue[lastSlashIndex - 1] === " " || inputValue[lastSlashIndex - 1] === "\n")) {
        const newValue = inputValue.substring(0, lastSlashIndex) + processedMessage;
        setInputValue(newValue);
    } else {
        setInputValue(inputValue + processedMessage);
    }

    setShowPicker(false);
    setPickerQuery("");
}
```

### Supported Variables Mismatch:
There is a significant mismatch between the placeholders suggested in the Settings UI and the variables actually substituted in the Chat UI:

| Settings UI Placeholder | Chat Substitution Variable | Status |
|---|-|---|
| `{{user_name}}` | `{{visitor_name}}` | **Broken** (Incorrect key) |
| `{{project_name}}` | `{{project_name}}` | **Working** |
| `{{user_email}}` | - | **Broken** (Not implemented) |
| `{{ticket_id}}` | - | **Broken** (Not implemented) |
| - | `{{agent_name}}` | **Hidden** (Not in Settings UI) |

## 6. Sanitization and Transformation
There is **no sanitization, escaping, or transformation** applied beyond the simple regex string replacement. The processed string is directly set as the value of the `Textarea` and subsequently sent to the Convex `sendMessage` mutation as-is.
