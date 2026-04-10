# Part 15: Feature Modules — Updated Findings

## ✅ Resolved: AI JSON Parsing Robustness

`convex/aiFlowBuilder.ts` now uses `extractJsonObject()` from `convex/lib/jsonExtract.ts` instead of fragile regex-based markdown fence stripping. The bracket-counting extractor handles:
- Preamble text before JSON
- Markdown code fences (with/without `json` tag)
- Trailing commas (invalid JSON)
- Nested objects and arrays
- Escaped quotes inside strings
- Multiple JSON blocks (returns first valid)
- Empty objects, whitespace

**14 test cases** in `convex/lib/jsonExtract.test.ts` verify all edge cases.

## ✅ Resolved: Test Coverage

Convex backend tests now exist via `vitest.convex.config.ts`:

| Test File | Coverage |
|-----------|----------|
| `convex/lib/auth.test.ts` | 9 test cases — ownership checks |
| `convex/lib/softDelete.test.ts` | 7 test cases — soft-delete utilities |
| `convex/lib/jsonExtract.test.ts` | 14 test cases — JSON extraction |
| `src/lib/env.test.ts` | 8 test cases — env validation |
| `src/lib/utils.test.ts` | 4 test cases — utility functions |

**Total: 42 test cases** (12 frontend + 30 Convex backend)

## ✅ New Feature: Soft-Delete Across All Modules

All 22 soft-deleted tables use `convex/lib/softDelete.ts` utilities. Mutation files updated to use soft-delete instead of hard deletes. Weekly cron permanently deletes records older than 30 days.

## ✅ New Feature: TTL on Conversations/Messages

`conversations` and `messages` tables have `expiresAt` fields with 90-day default. Daily cron soft-deletes expired conversations and their messages.

## Still Accurate (Unchanged from Original Analysis)

- Domain-centric file organization in `convex/` and `src/app/[locale]/dashboard/`
- OpenRouter AI for chat completions and AI flow builder
- Multi-channel integrations (WhatsApp, Messenger, Instagram, Telegram)
- Web push notifications split into mutations (state) and actions (delivery)
- Activity logging tightly coupled across all features
- Encrypted integration credentials via `convex/lib/crypto.ts`

## Outstanding Concerns

- **LOW**: No generic feature flagging infrastructure (though `useFeatureFlag` hook exists)
- **LOW**: Tightly coupled activity logging — if `logActivityInternal` fails, trace risk increases
