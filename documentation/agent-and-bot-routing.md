# What is Agent & Bot Routing?
In a live chat system, when a visitor opens the widget and sends their first message, the system needs to decide **"who is going to answer this?"** 

The routing engine is the brain that makes this decision. It evaluates the incoming conversation and routes it based on rules:
1. **Should a Bot handle this first?** (e.g., a "Tier 1 Support Bot").
2. **Which Department should get it?** (e.g., Sales vs. Support).
3. **Which human should it go to?** If it goes to the "Sales" department, and there are 3 sales agents online, should it go to the one with the fewest active chats (Least-busy) or just take turns (Round-robin)?
4. **What happens if everyone is offline/busy?** Does it queue up, or fallback to an AI?

## Expected Outcomes for Our Codebase

Based on the current architecture using Next.js, Convex, and Clerk, here is how the behavior of the application will change once the routing engine is fully implemented:

1. **Automatic Status Management:**
   Right now, conversations might just be created and sit in the database. With routing, a new conversation will automatically be assigned the strict enum numeric status `100` (Unassigned/Pooled). Once the routing engine assigns it to an agent or a bot, it will transition to `200` (Assigned). This enforces the Tiledesk enum requirement.

2. **Smart Agent Assignment:**
   We will utilize a Convex Action or Mutation (`convex/routing.ts`). When a new message comes in, Convex will query the `project_members` table to find an agent who has an "available" status. A logic circuit (such as a least-busy calculation) will select the right person, updating the `assignedTo` and `participants` fields in the `conversations` table.

3. **Fallback to AI / Offline Handling:**
   If the routing engine checks the `project_members` table and sees that **no** human agents are available within a department, it will aggressively assign the conversation to the fallback AI bot, triggering the bot execution engine.

4. **Preserving History for Human-in-the-Loop (HITL):**
   If a Bot is currently assisting a visitor and fails to resolve the issue (or the user demands human intervention), the routing engine will re-assign the *same* conversation (same `conversationId`) to a human. The human agent will open the dashboard and instantly see the full conversation history prior to their assignment.

**In summary:** The routing engine transforms the application from a raw database of messages into an automated ticketing system where support threads are intelligently distributed in real-time.
