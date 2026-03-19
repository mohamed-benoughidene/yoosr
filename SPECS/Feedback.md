Perfect. Here's the finalized spec — updated with your decisions.

---

# Early Access Feedback & Feature Requests — Spec

## Goal
Let dashboard users submit feedback and feature requests from inside Yoosr without leaving the app.

## Scope

**IN:**
- Feedback entry point inside the account menu (user dropdown)
- Modal with type selector (Bug · Feature · General) + message field
- Submissions stored in a `feedback` table in Convex

**OUT:**
- Real-time notifications (Discord/email) — not in this phase
- Public voting board — not in this phase
- Past submissions view — not in this phase
- Widget-side feedback — not in this phase

## Schema Changes

New table: `feedback`

```ts
feedback: defineTable({
  orgId: v.string(),
  submittedBy: v.string(),
  submitterName: v.string(),
  type: v.union(v.literal("bug"), v.literal("feature"), v.literal("general")),
  message: v.string(),
  createdAt: v.number(),
})
.index("by_org", ["orgId"])
.index("by_created", ["createdAt"])
```

## Backend

- `submitFeedback` mutation — reads `orgId` from `identity.org_id`, reads `submittedBy` from `identity.subject`, stores the record

## Frontend

- "Send Feedback" item inside the existing account/user dropdown menu
- `<FeedbackModal />` — shadcn Dialog with:
  - Type selector: 3 toggle buttons (Bug · Feature · General)
  - Textarea (min 20 chars, max 1000)
  - Submit button with loading state
  - Success state: "Thanks! We'll review your feedback." then auto-close after 2s

## Acceptance Criteria

1. "Send Feedback" item appears in the account menu
2. Clicking it opens the modal
3. All three types are selectable with clear visual feedback
4. Submitting with fewer than 20 characters shows an inline validation error
5. Successful submission stores a record in Convex with correct `orgId` and `submittedBy`
6. Modal shows success message then auto-closes
7. Works on mobile viewport

## Dependencies

- Dashboard root layout and account menu component must exist ✅
- Clerk JWT convex template includes `org_id` ✅

---

Spec approved? If yes, say the word and I'll write the implementation prompts.