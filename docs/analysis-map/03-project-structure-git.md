# Part 03: Project Structure & Git Setup

## 📊 Visual Map

```
Root Directory
├── Source Code
│   ├── src/                 → Application source code
│   │   ├── app/             → Next.js App Router pages/routes
│   │   ├── components/      → React components
│   │   ├── config/          → Configuration modules
│   │   ├── context/         → React context providers
│   │   ├── hooks/           → Custom React hooks
│   │   ├── i18n/            → Internationalization
│   │   ├── lib/             → Utility libraries
│   │   ├── types/           → TypeScript type definitions
│   │   └── middleware.ts    → Next.js middleware
│   └── public/              → Static assets
│
├── Backend
│   └── convex/              → Convex backend (see Part 04-08)
│
├── Design System
│   └── design-system/       → Design system documentation
│
├── Git & Tooling
│   ├── .gitignore           → Git ignore patterns
│   ├── .github/             → GitHub workflows and configs
│   ├── .qwen/               → Qwen Code AI assistant configs
│   ├── .agent/              → Agent configurations
│   └── .agents/             → Additional agent configs
│
├── Documentation
│   ├── docs/                → Project documentation
│   ├── documentation/       → Additional documentation
│   └── SPECS/               → Specification documents
│
└── Other
    ├── messages/            → i18n message files
    ├── .next/               → Next.js build output (gitignored)
    └── coverage/            → Test coverage reports (gitignored)
```

## 📁 File Inventory

| File/Directory | Purpose |
|----------------|---------|
| `.gitignore` | Git ignore patterns for build artifacts, env files, etc. |
| `.github/` | GitHub Actions workflows, issue templates, PR templates |
| `.github/workflows/` | CI/CD pipeline definitions |
| `.qwen/` | Qwen Code assistant configuration |
| `.agent/` | Agent-specific settings |
| `.agents/` | Additional agent configurations |
| `src/` | Main application source code |
| `public/` | Static assets (images, fonts, favicon) |
| `messages/` | Internationalization message files |
| `docs/` | Project documentation (including this analysis map) |
| `documentation/` | Additional documentation |
| `SPECS/` | Feature specifications |

## ✅ Analysis Checklist

- [ ] What is the overall directory structure philosophy?
- [ ] How is code organized? (by feature, by type, layered?)
- [ ] What does `.gitignore` cover? Is it comprehensive?
- [ ] What GitHub Actions workflows exist?
- [ ] Are there automated CI/CD pipelines?
- [ ] What agent/AI tool configurations exist?
- [ ] How is documentation organized?
- [ ] Are there multiple documentation sources? (docs/, documentation/, SPECS/)
- [ ] What's in the `messages/` directory? (i18n approach)
- [ ] Is the structure consistent and predictable?
- [ ] Any conventions for file naming?
- [ ] How are environment variables managed? (.env files?)

## 🔗 Dependencies

- **Connected to:** All chunks (structure affects everything)
- **Related to:** Part 02 (config), Part 12 (routing), Part 16 (testing), Part 17 (CI/CD)

## 📝 Agent Findings

<!-- Fill in during analysis -->

## 🔍 Key Patterns to Identify

- Convention over configuration vs explicit configuration
- Feature-based vs layer-based organization
- Documentation strategy
- Git workflow patterns
- Agent/AI tooling integration

## ⚠️ Potential Concerns to Watch For

- Inconsistent directory naming
- Missing or incomplete .gitignore
- Multiple conflicting documentation locations
- Overly deep nesting
- Unclear separation of concerns
- Missing CI/CD pipelines
- No automated testing in CI
