Good question — let me think through this properly for Yoosr's specific context.

---

## Test & Debug Phase Workflow

### The Core Principle
**Don't hunt bugs randomly.** Go feature by feature, surface to backend, and close each one before moving on.

---

### Phase Structure

**Step 1 — Inventory first**
Before touching any code, we need a full list of what to test. We go through every built feature and write a checklist of expected behaviors. Nothing gets tested from memory — it's all written down.

**Step 2 — Test by module, in this order**
Start with the foundation and work outward:

1. Auth & Onboarding (Clerk org creation → Convex project creation)
2. Multi-tenancy isolation (org A can't see org B's data)
3. Monitor — conversations, filters, chat, assign, resolve
4. Chat section
5. Design Studio — each block type, bot execution end-to-end
6. Knowledge Base — embedding, search, Ask KB block
7. Channels — Telegram relay, Meta relay
8. Settings — all pages, RBAC (admin vs member)
9. Widget — public-facing, message flow, bot trigger
10. Analytics & Activity Log (if built)

**Step 3 — For each module, the loop is:**
```
Run → observe → if broken → audit prompt → Antigravity diagnoses → fix prompt → verify → move on
```

**Step 4 — Track everything**
Every bug gets logged before it gets fixed. We maintain a simple bug log so nothing falls through the cracks.

---

### Skill Triggers Per Scenario

| Situation | Skills to trigger |
|---|---|
| Unexpected behavior | `systematic-debugging` + `debugging-strategies` |
| Convex query/mutation wrong | `convex` + `convex-performance-patterns` |
| Convex security concern | `convex-security-audit` |
| API call failing (OpenRouter, Telegram, Meta) | `api-error-handling` + `error-handling-patterns` |
| After any fix | `code-review` |

---

### My Role vs Antigravity's Role

| Claude | Antigravity |
|---|---|
| Writes audit prompts | Reads codebase, reports reality |
| Analyzes bug reports | Executes fix prompts |
| Writes fix prompts | Applies changes |
| Tracks what's verified | Runs code-review on its own output |

---

### Practical Rule
**One bug at a time.** You share what's broken (screenshot, error, description), I write the audit prompt, Antigravity diagnoses, I write the fix, you verify, we close it. Never fix two things in the same prompt.

---

**To start:** should we build the module checklist together first, or do you already have specific bugs you've noticed that you want to tackle immediately?