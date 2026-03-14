Spec: Phase XX — OpenRouter API Key Integration (Per-Project)
Goal
Allow each workspace to supply its own OpenRouter API key, which the platform uses for all LLM calls instead of the platform-level key.

Scope
IN:

Store an encrypted OpenRouter API key per project (reuses existing AES-GCM pattern)
Settings > Integrations > AI Providers > OpenRouter UI: input, save, test, clear
Bot execution engine (bot.ts) reads the project's key at runtime for all LLM calls
A "Test connection" action that hits OpenRouter's /models endpoint and returns success/fail

OUT:

Embedding calls — always use platform OPENROUTER_API_KEY env variable, no change
Dynamically fetching OpenRouter's model catalog
Per-model pricing or usage metering
Any change to the static AVAILABLE_MODELS list


Schema Changes
Add one field to the projects table:
tsopenRouterApiKey: v.optional(v.string()) // AES-GCM encrypted

Backend
NameTypeDescriptionsaveOpenRouterKeymutationAccepts raw key, encrypts, writes to projects.openRouterApiKey. orgId from JWT only.clearOpenRouterKeymutationSets projects.openRouterApiKey to undefined.getOpenRouterKeyStatusqueryReturns { hasKey: boolean, maskedKey?: string } — last 4 chars only, never the raw key.testOpenRouterKeyactionDecrypts stored key, calls https://openrouter.ai/api/v1/models, returns { ok: boolean, error?: string }.
In bot.ts only:

Before any OpenRouter LLM call, read projects.openRouterApiKey
If present: decrypt → use as Authorization: Bearer
If absent: fall back to process.env.OPENROUTER_API_KEY


Frontend
Location: Settings > Integrations > AI Providers section
StateDisplayNo key savedInput field + Save button. Helper: "Encrypted and stored securely."Key savedMasked (sk-or-••••••1234) + Test button + Remove buttonTestingSpinnerTest passedGreen "Connected" badgeTest failedRed badge + error message
Key is never returned to the frontend after save.

Acceptance Criteria

User can save an OpenRouter API key — persists across sessions
Key is never returned in plaintext to any frontend query
Masked display shows last 4 characters only
Test button confirms the key reaches OpenRouter successfully
Remove button clears the key and returns UI to input state
After saving, all bot LLM calls use the project key
If no key is saved, falls back to platform env variable — existing behavior unchanged
Embedding calls are unaffected in all cases
Key is scoped to the correct org/project


Tasks (sequential)

Schema — Add openRouterApiKey: v.optional(v.string()) to projects table
Backend — Implement the 4 backend functions above
bot.ts wiring — Read and decrypt project key before every LLM call; fall back to env if absent
UI — Build the AI Providers card in Settings > Integrations