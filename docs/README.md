# Codebase Analysis Map

## 📋 Overview

This directory contains a **chunked analysis map** for systematically understanding the Yoosr codebase. The codebase is split into 18 focused chunks, allowing agents to analyze one section at a time without losing context or detail.

## 🗂️ Directory Structure

```
docs/
├── README.md                          ← You are here
├── analysis-map/                      ← Chunk templates (18 files)
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
└── analysis-findings/                 ← Agent analysis results
    └── (filled during analysis)
```

## 📊 Chunk Overview

### Tier 1: Project Foundation
| Chunk | File | Focus |
|-------|------|-------|
| Part 1 | [01-package-dependencies.md](./analysis-map/01-package-dependencies.md) | package.json, dependencies, scripts, package managers |
| Part 2 | [02-build-tooling-config.md](./analysis-map/02-build-tooling-config.md) | Next.js, TypeScript, ESLint, PostCSS configs |
| Part 3 | [03-project-structure-git.md](./analysis-map/03-project-structure-git.md) | .gitignore, .github/, .qwen/, folder organization |

### Tier 2: Backend Layer (Convex)
| Chunk | File | Focus |
|-------|------|-------|
| Part 4 | [04-database-schema.md](./analysis-map/04-database-schema.md) | schema.ts, data models, relationships, types |
| Part 5 | [05-queries-read-operations.md](./analysis-map/05-queries-read-operations.md) | Query functions, data fetching patterns |
| Part 6 | [06-mutations-write-operations.md](./analysis-map/06-mutations-write-operations.md) | Mutations, CRUD operations, validation |
| Part 7 | [07-auth-authorization.md](./analysis-map/07-auth-authorization.md) | Auth config, sessions, permissions |
| Part 8 | [08-backend-utilities.md](./analysis-map/08-backend-utilities.md) | Helpers, validators, constants, error handling |

### Tier 3: Design System & UI
| Chunk | File | Focus |
|-------|------|-------|
| Part 9 | [09-core-ui-components.md](./analysis-map/09-core-ui-components.md) | Buttons, inputs, cards, modals |
| Part 10 | [10-layout-structural-components.md](./analysis-map/10-layout-structural-components.md) | Layouts, wrappers, navigation, headers |
| Part 11 | [11-design-tokens-styling.md](./analysis-map/11-design-tokens-styling.md) | Colors, typography, themes, Tailwind |

### Tier 4: Application Layer
| Chunk | File | Focus |
|-------|------|-------|
| Part 12 | [12-app-routing-structure.md](./analysis-map/12-app-routing-structure.md) | Routes, pages, navigation, middleware |
| Part 13 | [13-page-components-views.md](./analysis-map/13-page-components-views.md) | Page components, views, layouts |
| Part 14 | [14-state-management-fetching.md](./analysis-map/14-state-management-fetching.md) | Hooks, Convex client, caching, state |
| Part 15 | [15-feature-modules.md](./analysis-map/15-feature-modules.md) | Feature logic, business rules, integrations |

### Tier 5: Quality & Operations
| Chunk | File | Focus |
|-------|------|-------|
| Part 16 | [16-testing-infrastructure.md](./analysis-map/16-testing-infrastructure.md) | Tests, coverage, mocking strategies |
| Part 17 | [17-cicd-deployment.md](./analysis-map/17-cicd-deployment.md) | CI/CD, Vercel, environments, builds |
| Part 18 | [18-documentation-dx.md](./analysis-map/18-documentation-dx.md) | READMEs, conventions, onboarding |

## 🔗 Cross-Reference Matrix

| From → To | 01 | 02 | 03 | 04 | 05 | 06 | 07 | 08 | 09 | 10 | 11 | 12 | 13 | 14 | 15 | 16 | 17 | 18 |
|-----------|----|----|----|----|----|----|----|----|----|----|----|----|----|----|----|----|----|----|
| **01** Deps | — | ✓ | | | | | | | | | | | | ✓ | | | | |
| **02** Config | ✓ | — | ✓ | | | | | | | | ✓ | ✓ | | | | ✓ | ✓ | |
| **03** Struct | ✓ | ✓ | — | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| **04** Schema | | | ✓ | — | ✓ | ✓ | ✓ | ✓ | | | | | | ✓ | | | | |
| **05** Queries | | | | ✓ | — | ✓ | ✓ | ✓ | | | | | | ✓ | ✓ | | | |
| **06** Mutations | | | | ✓ | ✓ | — | ✓ | ✓ | | | | | | ✓ | ✓ | | | |
| **07** Auth | | | | ✓ | ✓ | ✓ | — | ✓ | ✓ | ✓ | | ✓ | ✓ | ✓ | ✓ | | | |
| **08** Utils | | | | ✓ | ✓ | ✓ | ✓ | — | ✓ | | | | | ✓ | ✓ | | | |
| **09** UI Core | | | | | | | ✓ | | — | ✓ | ✓ | | ✓ | ✓ | | ✓ | | |
| **10** Layout | | | | | | | ✓ | | ✓ | — | ✓ | ✓ | ✓ | ✓ | | ✓ | | |
| **11** Styling | | ✓ | | | | | | | ✓ | ✓ | — | ✓ | ✓ | ✓ | | ✓ | | |
| **12** Routing | | ✓ | ✓ | | | | ✓ | | | ✓ | ✓ | — | ✓ | ✓ | ✓ | | ✓ | |
| **13** Pages | | | | | | | ✓ | | ✓ | ✓ | ✓ | ✓ | — | ✓ | ✓ | ✓ | | |
| **14** State | | | | ✓ | ✓ | ✓ | ✓ | ✓ | | | | | ✓ | — | ✓ | ✓ | | |
| **15** Features | | | | ✓ | ✓ | ✓ | ✓ | ✓ | | | | | ✓ | ✓ | — | ✓ | | |
| **16** Testing | | | | | | | | | ✓ | ✓ | | | ✓ | ✓ | ✓ | — | ✓ | |
| **17** Deploy | ✓ | ✓ | ✓ | | | | | | | | | ✓ | | | | ✓ | — | |
| **18** Docs | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | — |

## 🚀 How to Use This Map

### For Agents Starting Analysis:

1. **Read this file first** to understand the overall structure
2. **Pick a chunk** from the `analysis-map/` directory (start with Part 01 and work sequentially, or pick based on priority)
3. **Read the template** for that chunk to understand what to look for
4. **Analyze the codebase** focusing ONLY on the files listed in that chunk
5. **Save findings** to `analysis-findings/XX-same-name.md` (copy the template and fill in)
6. **Update the progress tracker** below

### Analysis Workflow:

```
1. Read docs/README.md (this file)
2. Read docs/analysis-map/XX-chunk-name.md
3. Analyze the listed files/directories in the codebase
4. Answer all checklist questions
5. Save to docs/analysis-findings/XX-chunk-name.md
6. Mark progress in the table below
7. Move to next chunk
8. After all chunks: create docs/analysis-findings/SUMMARY.md
```

### Rules for Analysis:

- ✅ **Focus only on the chunk's scope** - don't wander into other areas
- ✅ **Answer all checklist questions** - be specific and detailed
- ✅ **Note patterns and anti-patterns** - what works well, what doesn't
- ✅ **Identify risks and concerns** - security, performance, maintainability
- ✅ **Trace data flow** - how does data move through this part?
- ✅ **Document assumptions** - if unsure, note it for later verification
- ❌ **Don't analyze files outside the chunk's scope**
- ❌ **Don't make code changes** - this is read-only analysis

## 📈 Progress Tracker

| Chunk | Status | Findings File | Notes |
|-------|--------|---------------|-------|
| 01 - Package Dependencies | ⬜ Pending | | |
| 02 - Build Tooling Config | ⬜ Pending | | |
| 03 - Project Structure | ⬜ Pending | | |
| 04 - Database Schema | ⬜ Pending | | |
| 05 - Queries | ⬜ Pending | | |
| 06 - Mutations | ⬜ Pending | | |
| 07 - Auth & Authorization | ⬜ Pending | | |
| 08 - Backend Utilities | ⬜ Pending | | |
| 09 - Core UI Components | ⬜ Pending | | |
| 10 - Layout Components | ⬜ Pending | | |
| 11 - Design Tokens | ⬜ Pending | | |
| 12 - App Routing | ⬜ Pending | | |
| 13 - Page Components | ⬜ Pending | | |
| 14 - State Management | ⬜ Pending | | |
| 15 - Feature Modules | ⬜ Pending | | |
| 16 - Testing | ⬜ Pending | | |
| 17 - CI/CD & Deployment | ⬜ Pending | | |
| 18 - Documentation & DX | ⬜ Pending | | |

**Legend:** ⬜ Pending | 🔄 In Progress | ✅ Complete

## 🎯 Analysis Goals

By the end of analyzing all 18 chunks, we should have a complete picture of:

1. **Architecture**: How is the application structured? What patterns are used?
2. **Data Flow**: How does data move from database → backend → frontend → UI?
3. **Security**: Where are the auth boundaries? Any vulnerabilities?
4. **Quality**: How well-tested is the code? Any technical debt?
5. **Scalability**: Can this handle growth? Any bottlenecks?
6. **Developer Experience**: How easy is it to contribute? Any friction points?
7. **Dependencies**: What external tools/libraries are critical?
8. **Deployment**: How does code get from dev to production?

## 📝 After All Chunks Are Complete

Create `docs/analysis-findings/SUMMARY.md` with:

- **Executive Summary**: High-level overview of the codebase
- **Architecture Diagram**: Visual representation of the full system
- **Key Findings**: Important discoveries from each chunk
- **Strengths**: What's done well
- **Risks & Concerns**: Issues that need attention
- **Recommendations**: Actionable improvements
- **Technical Debt**: Things that need refactoring
- **Security Audit**: Any vulnerabilities found

---

**Ready to start?** Begin with [Part 01: Package Dependencies](./analysis-map/01-package-dependencies.md)
