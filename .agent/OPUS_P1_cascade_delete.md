# Opus Planning Prompt — P-1: Cascade Delete Rewrite

> Paste this entire prompt to Opus. It will read the relevant files and produce an implementation spec.
> Save the output. Claude will then write the Flash/Pro implementation prompts from it.

---

## Prompt

You are planning a rewrite of the `remove` mutation in `convex/projects.ts` for a Convex-based SaaS platform called Yoosr.

## Context

The current `remove` mutation deletes a project and all its related data by calling `.collect()` on 15+ tables sequentially inside a single mutation. This will timeout on any project with real data because Convex mutations have a strict execution time limit.

The platform uses:
- Next.js App Router frontend
- Convex for backend, database, and scheduled jobs
- Clerk Organizations for multi-tenancy
- `requireAdmin` helper in `convex/utils.ts` for admin-only operations

## What to do

Read the following files in full before producing your plan:
- `convex/projects.ts` — focus on the `remove` mutation and all tables it touches
- `convex/schema.ts` — to understand all table relationships and what needs deleting
- `convex/utils.ts` — to understand the `requireAdmin` helper
- `convex/crons.ts` — to understand how existing scheduled jobs are registered

## What to produce

Output a complete implementation spec in this format:

```
## P-1 — Cascade Delete Rewrite Spec

### Current behavior
[Describe exactly what the current remove mutation does, based on reading the code]

### Problem
[Why it will timeout — estimated record counts per table, Convex mutation time limits]

### Proposed approach
[Step by step — what happens when admin clicks delete:
  1. What the mutation does immediately (what fields to set, what to return to the UI)
  2. How the scheduled deletion job is structured
  3. How it batches deletions per table
  4. How it handles continuation if a batch is still incomplete
  5. How the frontend knows deletion is complete]

### Schema changes needed
[Any new fields on the projects table, e.g. status: "active" | "deleting" | "deleted"]

### New functions to create
[List each new function: name, type (mutation/action/internalMutation), file, purpose]

### Modified functions
[List each existing function that needs to change and what changes]

### Edge cases to handle
[What happens if user tries to access a "deleting" project, what happens if the job fails halfway, etc.]

### Implementation order
[Numbered sequence — which function to implement first, second, etc., and why]
```

Do not write any code yet. Produce only the spec.
