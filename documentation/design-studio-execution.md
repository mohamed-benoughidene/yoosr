# Design Studio Execution Explained

Based on the Tiledesk architecture we are rebuilding, **Design Studio Execution** refers to the backend engine that runs the visual chatbot flows.

### 1. What is the "Design Studio"?
In the Tiledesk platform, the Design Studio is a visual, drag-and-drop flowchart builder. Instead of writing code for their chatbots, users connect different "blocks" (nodes). For example:
- **Reply Block:** Send a text message or a carousel of buttons.
- **Set Attribute Block:** Save the user's email or phone number to the database.
- **ChatGPT Task Block:** Pass the conversation to a Large Language Model.
- **Ask Knowledge Base Block:** Search your documents (RAG) to find an answer.
- **Condition/Switch Block:** "If user is logged in, go left. If not, go right."

### 2. What is the "Execution Engine"?
When a visitor sends a message on the website, we don't just want a hardcoded auto-reply. We need our backend (Convex) to look at the visual flowchart the user created and actually "run" it.

The **Execution Engine** is the backend code that:
1. Receives the user's message.
2. Looks at the active Bot's flowchart data stored in the database (the `bot_flows` table).
3. Figures out exactly which "Block" the user is currently on in the flowchart.
4. Executes the action for that block (e.g., calls the Anthropic API, saves a variable, or sends a text reply).
5. Updates the conversation's "pointer" (usually saved in `attributes.currentNode`) so it remembers where the visitor is for their *next* message.

### Why do we need to build it?
If the Smart Routing engine simply assigns a conversation to a Bot, the conversation will just sit there. The Bot doesn't actually know *how* to reply yet because the engine that reads the visual flowchart and fires the actions hasn't been hooked up to process incoming messages step-by-step. 

Building this means creating the logic that traverses that flowchart graph so bots can hold dynamic, multi-step conversations.
