What the Feature Is

Right now, users build flows manually — they drag blocks onto the canvas, connect them one by one, and configure each block. This works but it's slow, especially for non-technical users.

"Build with AI" lets the user describe their flow in plain language and get a ready-made canvas in seconds.
User Experience (step by step)

    User opens Design Studio
    Clicks a "Build with AI" button in the toolbar
    A modal opens with a single textarea
    They type something like:
        "Greet the visitor, ask for their name and email, then check if they're an existing customer. If yes, hand off to a support agent. If no, send them a link to our pricing page."
        Works in Arabic too
    They click Generate
    Spinner shows for a few seconds while OpenRouter processes it
    The canvas populates with connected blocks — Reply node, Capture nodes, Condition node, HITL node, etc. — already wired together
    User reviews, tweaks individual blocks as needed, and saves


1. Convex Action

Takes prompt + orgId + projectId
Looks up the project's defaultModel (fallback to Mistral 7B)
Calls OpenRouter with a system prompt that defines your node types and expected JSON shape
Strips any markdown fences from the response
Parses and returns { nodes, edges }

2. System Prompt Strategy
The system prompt must tell the model exactly what node types exist, what each node's data shape looks like, and how to position nodes (top-to-bottom, fixed x/y spacing). This is the critical part — the better this prompt, the better the output. You know your block schemas, so you write this part.
3. Modal (client side)

Textarea where user describes the flow (set dir="auto" for Arabic support)
Calls the Convex action on submit
On success, passes { nodes, edges } up to the parent Design Studio component

4. Design Studio (wiring)

On receiving the generated nodes/edges, call React Flow's setNodes / setEdges
Then call fitView() so the canvas recenters
Show a toast so the user knows it worked

5. Defensive parsing
Always strip fences and wrap JSON.parse in try/catch — Mistral 7B sometimes leaks extra text even with strict instructions.