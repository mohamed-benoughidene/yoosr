# Chunked Codebase Analysis Map - Workflow Guide

## 🎯 What This Is

A systematic approach to analyzing codebases by breaking them into **18 focused chunks**, allowing AI agents to analyze one section at a time without losing context, detail, or accuracy.

## 🧠 The Problem This Solves

When asking an AI agent to "analyze my codebase," it typically:
- ❌ Tries to process everything at once
- ❌ Loses track of details across large codebases
- ❌ Gives shallow, generic answers
- ❌ Forgets context as the conversation grows
- ❌ Misses important files or patterns

This chunked approach:
- ✅ Focuses the agent on 1-2 files at a time
- ✅ Maintains deep accuracy and detail
- ✅ Provides structured, answerable checklists
- ✅ Tracks progress systematically
- ✅ Produces a complete, synthesized final picture

## 📂 Directory Structure

```
docs/
├── README.md                          # Master index (TOC, cross-reference matrix, progress tracker)
├── analysis-map/                      # 18 chunk templates (created once, reused)
│   ├── 01-package-dependencies.md
│   ├── 02-build-tooling-config.md
│   ├── 03-project-structure-git.md
│   ├── 04-database-schema.md
│   ├── 05-queries-read-operations.md
│   ├── 06-mutations-write-operations.md
│   ├── 07-auth-authorization.md
│   ├── 08-backend-utilities.md
│   ├── 09-core-ui-components.md
│   ├── 10-layout-structural-components.md
│   ├── 11-design-tokens-styling.md
│   ├── 12-app-routing-structure.md
│   ├── 13-page-components-views.md
│   ├── 14-state-management-fetching.md
│   ├── 15-feature-modules.md
│   ├── 16-testing-infrastructure.md
│   ├── 17-cicd-deployment.md
│   └── 18-documentation-dx.md
└── analysis-findings/                 # Agent-filled analysis (created during use)
    ├── 01-package-dependencies.md
    ├── 02-build-tooling-config.md
    ├── ... (one per chunk analyzed)
    └── SUMMARY.md                     # Final synthesized picture from all chunks
```

## 🗂️ The 18 Chunks

### Tier 1: Foundation (Parts 01-03)
Dependencies, build config, project structure

### Tier 2: Backend (Parts 04-08)
Database schema, queries, mutations, auth, utilities

### Tier 3: Frontend (Parts 09-11)
UI components, layout, design tokens/styling

### Tier 4: Application (Parts 12-15)
Routing, pages, state management, features

### Tier 5: Quality & Ops (Parts 16-18)
Testing, CI/CD, documentation

## 🔧 How to Set Up (One-Time Setup)

### Step 1: Create the Structure

Run this in your project root:

```bash
mkdir -p docs/analysis-map docs/analysis-findings
```

### Step 2: Customize the Templates

The 18 chunk templates need to be **customized to your project** before use. Each template contains:

- **📊 Visual Map** - ASCII diagram of expected structure
- **📁 File Inventory** - Table of expected files and purposes
- **✅ Analysis Checklist** - 10-14 specific questions
- **🔗 Dependencies** - Links to related chunks
- **📝 Agent Findings** - Blank section (filled during analysis)
- **🔍 Key Patterns to Identify** - What to look for
- **⚠️ Potential Concerns** - Common issues to watch for

**Customization means:** Update the file paths and inventory to match your actual project structure. The checklist questions should be specific to what you expect to find.

### Step 3: Create the Master README

Create `docs/README.md` with:
- Table of contents linking to all 18 chunks
- Cross-reference matrix (which chunks connect)
- Progress tracker table
- Agent usage instructions

## 🚀 How to Use (Each Session)

### Step 1: Pick Your Chunk(s)

Choose based on priority:
- **Sequential:** 01 → 02 → 03 ... → 18
- **By tier:** Do all of Tier 1, then Tier 2, etc.
- **By need:** Focus on backend (04-08), or frontend (09-15)

### Step 2: Use This Prompt

Copy and fill in the prompt below, replacing `XX` and `[CHUNK_NAME]`:

```
I need you to analyze Part XX: [CHUNK_NAME] from my codebase analysis map.

**Your Task:**

1. **Read the template:** Open `docs/analysis-map/XX-[CHUNK_NAME].md` and review the structure and checklist questions.

2. **Analyze the actual files:** Based on the file inventory in the template, read and analyze the corresponding files in my codebase. Be thorough - read every file mentioned in the template's scope.

3. **Answer every checklist item:** For each checkbox question in the template, provide a detailed, specific answer based on what you find in the actual code. Do not skip any questions. Do not give vague answers - cite specific patterns, file names, line numbers where relevant.

4. **Save findings:** Create a file at `docs/analysis-findings/XX-[CHUNK_NAME].md` with the following structure:
   - Copy the entire template structure from the analysis-map file
   - Fill in the "📊 Visual Map" section with actual findings from the codebase (update the ASCII diagram to reflect reality)
   - Fill in the "📁 File Inventory" table with actual files found
   - Replace every `[ ]` in "✅ Analysis Checklist" with `[x]` and provide a detailed answer for each
   - Fill in "📝 Agent Findings" with your discoveries, organized with clear headings
   - Update "🔍 Key Patterns to Identify" with what you actually found
   - Update "⚠️ Potential Concerns" with real issues you discovered, rated by severity (HIGH/MEDIUM/LOW)

5. **Be accurate and thorough:**
   - Cite specific code examples when describing patterns
   - Note exact file paths when referencing implementations
   - Count things quantitatively (how many functions, components, etc.)
   - If something is unclear or you can't find expected files, explicitly note what you couldn't find
   - Do not make assumptions - only report what you actually see in the code
   - If you find files not listed in the template, include them in your findings

6. **Update progress:** After saving, tell me the file is complete and give me a 2-3 sentence summary of your key findings.

Start now with Part XX: [CHUNK_NAME].
```

### Step 3: Review the Output

After the agent saves the findings file:
1. **Open the file** and skim the findings
2. **Verify accuracy** - spot-check a few claims
3. **Ask follow-ups** if anything is unclear
4. **Move to the next chunk** using the same prompt

### Step 4: Synthesize (After All Chunks)

Once all 18 chunks are analyzed, ask the agent:

```
Read all 18 files in docs/analysis-findings/ and create a comprehensive SUMMARY.md in that same directory.

The SUMMARY.md should include:
1. Executive Summary (high-level overview of the entire codebase)
2. Architecture Diagram (visual representation of the full system)
3. Key Findings from each chunk (2-3 sentences per chunk)
4. Strengths (what's done well)
5. Risks & Concerns (all HIGH and MEDIUM issues found)
6. Recommendations (actionable improvements)
7. Technical Debt (things that need refactoring)
8. Security Audit (vulnerabilities found)
9. Dependency Health (outdated packages, bundle size, etc.)
10. Next Steps (prioritized action items)
```

## 📊 Cross-Reference Matrix

Use this to understand how chunks connect:

| From → To | 01 | 02 | 03 | 04 | 05 | 06 | 07 | 08 | 09 | 10 | 11 | 12 | 13 | 14 | 15 | 16 | 17 | 18 |
|-----------|----|----|----|----|----|----|----|----|----|----|----|----|----|----|----|----|----|----|
| **04** Schema | | | | — | ✓ | ✓ | ✓ | ✓ | | | | | | ✓ | | | | |
| **07** Auth | | | | ✓ | ✓ | ✓ | — | ✓ | ✓ | ✓ | | ✓ | ✓ | ✓ | ✓ | | | |
| **14** State | | | | ✓ | ✓ | ✓ | ✓ | ✓ | | | | | ✓ | — | ✓ | ✓ | | |

*(Full matrix in docs/README.md)*

## ⏱️ Time Expectations

| Approach | Chunks per Session | Sessions Needed | Accuracy |
|----------|-------------------|-----------------|----------|
| **One chunk** | 1 | 18 sessions | Highest |
| **One tier** | 3-5 | 4-5 sessions | High |
| **Half codebase** | 9 | 2 sessions | Medium |
| **All at once** | 18 | 1 session | Lowest |

**Recommendation:** 3-4 chunks per session (one tier at a time) for optimal accuracy and detail.

## 🎯 Tips for Best Results

### ✅ Do This:
- Start with Tier 1 (foundation) to understand the project setup
- Review findings after each chunk before moving on
- Ask follow-up questions on interesting findings
- Use the cross-reference matrix to understand connections
- Update the progress tracker in docs/README.md
- Save findings immediately (don't batch them)

### ❌ Don't Do This:
- Don't ask for all 18 chunks in one session
- Don't skip chunks (gaps compound into wrong conclusions)
- Don't accept vague answers - demand specifics
- Don't trust the agent's summary without reading the file
- Don't let the agent skip checklist questions

## 🔁 Reusing Across Projects

This system is **project-agnostic**. For each new project:

1. **Copy the `docs/` directory structure**
2. **Customize the 18 templates** to match the new project's structure
3. **Update the file inventory** in each template with expected paths
4. **Adjust checklist questions** to match the project's tech stack
5. **Use the same prompt workflow** for analysis

The templates are reusable - just update the file paths and expected structures.

## 📦 Quick Start Commands

### Create structure:
```bash
mkdir -p docs/analysis-map docs/analysis-findings
touch docs/analysis-findings/.gitkeep
```

### Analyze one chunk:
```
(Use the prompt above, replacing XX and [CHUNK_NAME])
```

### Generate final summary:
```
(Use the synthesis prompt after all 18 chunks are done)
```

---

**Origin:** This workflow was designed to solve the "analyze my codebase" problem where AI agents lose context on large codebases. By chunking the analysis, we maintain accuracy and produce a complete, detailed picture of the entire system.
