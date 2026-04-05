# Part 01: Package Dependencies

## 📊 Visual Map

```
package.json
├── dependencies (runtime)
│   ├── @clerk/*              → Authentication & user management
│   ├── convex                → Backend/database layer
│   ├── react, react-dom      → UI framework
│   ├── next                  → React framework (SSR/SSG)
│   ├── @radix-ui/*           → Headless UI components
│   ├── tailwindcss           → Styling system
│   ├── zod                   → Schema validation
│   ├── react-hook-form       → Form management
│   ├── recharts              → Data visualization
│   ├── framer-motion         → Animations
│   ├── next-intl             → Internationalization
│   └── openai, @huggingface  → AI/ML integrations
│
├── devDependencies (tooling)
│   ├── typescript            → Type system
│   ├── eslint                → Code linting
│   ├── tailwindcss           → CSS framework
│   └── @testing-library/*    → Testing utilities
│
└── scripts
    ├── dev                   → Start development server
    ├── build                 → Production build
    ├── start                 → Run production server
    └── lint                  → Run ESLint
```

## 📁 File Inventory

| File | Purpose |
|------|---------|
| `package.json` | Project manifest: dependencies, scripts, metadata |
| `bun.lock` | Bun package manager lockfile |
| `package-lock.json` | npm package manager lockfile |
| `skills-lock.json` | Agent skills configuration |

## ✅ Analysis Checklist

- [ ] What package manager is being used? (bun vs npm - both lockfiles exist)
- [ ] What are the core dependencies and their roles?
- [ ] Are there any unused or outdated dependencies?
- [ ] What version ranges are used? (fixed, semver, latest?)
- [ ] Are there any security vulnerabilities in dependencies?
- [ ] What's the bundle size impact of major dependencies?
- [ ] Are dev dependencies properly separated from runtime deps?
- [ ] What npm scripts are defined? Are they sufficient?
- [ ] Are there any peer dependency issues?
- [ ] What's the update strategy for dependencies?

## 🔗 Dependencies

- **Connected to:** Part 02 (build config), Part 17 (deployment)
- **Impacts:** All chunks (dependencies are used throughout)

## 📝 Agent Findings

<!-- Fill in during analysis -->

## 🔍 Key Patterns to Identify

- Package manager consistency (bun vs npm lockfiles both present)
- Monorepo vs single package structure
- Dependency versioning strategy
- Script conventions and automation level

## ⚠️ Potential Concerns to Watch For

- Multiple lockfiles (bun.lock + package-lock.json) - potential conflicts
- Large dependency tree affecting bundle size
- Unpinned versions causing unpredictable builds
- Security vulnerabilities in outdated packages
- Unused dependencies bloating the project
