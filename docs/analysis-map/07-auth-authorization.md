# Part 07: Authentication & Authorization

## 📊 Visual Map

```
convex/
└── auth.config.ts         → Convex auth configuration

External Auth Provider
└── @clerk/*               → Clerk authentication
    ├── @clerk/nextjs      → Next.js integration
    ├── @clerk/localizations → Localization support
    └── @clerk/themes      → Theme customization

src/
├── middleware.ts            → Auth middleware for Next.js
└── context/                 → Auth context providers (possibly)

convex/ (Auth in Queries & Mutations)
├── Authorization checks in queries
├── Authorization checks in mutations
└── User session management
```

## 📁 File Inventory

| File | Purpose |
|------|---------|
| `convex/auth.config.ts` | Convex authentication configuration |
| `src/middleware.ts` | Next.js middleware for auth guards |
| `src/context/*` | Auth context providers (if present) |
| `package.json` | Clerk dependencies: `@clerk/nextjs`, `@clerk/localizations`, `@clerk/themes` |

## ✅ Analysis Checklist

- [ ] What authentication provider is used? (Clerk)
- [ ] How is Clerk configured? (providers, settings)
- [ ] What auth strategies are supported? (email, OAuth, SSO, etc.)
- [ ] How is auth state passed from Next.js to Convex?
- [ ] What middleware guards exist in Next.js?
- [ ] How are protected routes defined?
- [ ] What authorization patterns exist in queries?
- [ ] What authorization patterns exist in mutations?
- [ ] Is role-based access control (RBAC) implemented?
- [ ] How are user sessions managed?
- [ ] What's the token flow? (JWT, session tokens)
- [ ] Are there admin vs regular user distinctions?
- [ ] How is multi-tenancy handled? (if applicable)
- [ ] What happens on auth failure? (redirects, errors)
- [ ] Are there refresh token patterns?
- [ ] How is user data isolated by auth?

## 🔗 Dependencies

- **Depends on:** Part 01 (Clerk packages), Part 04 (schema - user tables)
- **Connected to:** Part 05 (queries), Part 06 (mutations), Part 12 (routing), Part 13 (pages), Part 15 (features)

## 📝 Agent Findings

<!-- Fill in during analysis -->

## 🔍 Key Patterns to Identify

- Auth provider choice and rationale
- Session management patterns
- Authorization guard patterns
- Role and permission systems
- Multi-tenant data isolation
- Token handling approaches

## ⚠️ Potential Concerns to Watch For

- Missing authorization checks on sensitive operations
- Overly permissive access controls
- Auth state not properly validated in Convex
- Missing middleware protection for routes
- Token exposure in client-side code
- No session timeout or refresh handling
- Inconsistent auth patterns across files
- Missing audit logs for sensitive operations
- No rate limiting on auth endpoints
