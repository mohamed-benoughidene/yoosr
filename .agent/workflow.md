Read AGENT.md before making any changes.

Rebuild the Project Home page with a real-time, agent-focused layout. 
Do NOT add a date range picker — this page shows live/today data only. 
Do not duplicate what's already in the Analytics page.

---

## Layout Structure

### 1. Conditional Onboarding Banner
Show a "Create your first Bot" CTA banner ONLY when the current org has zero bots.
When bots exist, hide it completely.

---

### 2. Stats Row (4 cards, real-time)
Each card is a simple number + label + icon. No charts here.

- **Open Conversations** — count of conversations with status = 200 (open) for current orgId
- **Waiting for Agent** — count of open conversations not yet assigned to any agent (assignedTo is null or undefined)
- **Online Teammates** — count of teammates in the org whose presence/status is "available" (check your schema for the correct field)
- **My Assigned** — count of open conversations assigned to the currently logged-in Clerk user

These must be live Convex `useQuery` calls, not static numbers.

---

### 3. Two-Column Section (below stats row)

**Left column — Live Queue (60% width)**
A table showing the 5 most recent open conversations.
Columns: Contact name (or "Visitor"), Channel (widget/email/etc), Wait time (createdAt → now), Assigned agent (name or "Unassigned"), Status badge.
Each row is clickable and navigates to the Chat page for that conversation.
If no open conversations, show an empty state: "No open conversations right now."

**Right column — Recent Activity Feed (40% width)**
A scrollable list of the last 10 entries from the `activity_logs` table for current orgId, ordered by createdAt descending.
Each entry shows: icon (based on action type), actor name, action description, relative time (e.g. "3 min ago").
If activity_logs table doesn't exist yet in the schema, skip this panel and leave a placeholder card with text "Activity log coming soon."

---

### 4. Today's Snapshot Row (below the two columns)
Three simple stat cards — today only, no date picker:

- **Conversations Today** — count for today vs yesterday count shown as a small +/- diff below
- **Bot Resolved Today** — conversations closed by bot today (handledBy = "bot")  
- **Avg Wait Time Today** — average time between conversation created and first agent message, for today only. If not computable yet, show "—"

---

## Technical Notes
- All data via Convex `useQuery` hooks, filtered by orgId from Clerk's `useOrganization()`
- Write the necessary Convex query functions if they don't already exist
- Use the existing shadcn/ui Card, Badge, and Table components for consistency
- Use lucide-react icons throughout
- The page should look consistent with the existing Analytics page style (same card borders, same font sizes)
- No hardcoded/mock data — if a query returns nothing, show 0 or an empty state
- Status enums: conversations use 100 (pending), 200 (open), 1000 (closed)