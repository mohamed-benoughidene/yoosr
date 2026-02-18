---
trigger: always_on
---

# Technology Stack Rules

This project enforces the use of the following technologies. All new features and refactors must adhere to this stack.

## 1. Frontend Framework: Next.js
- **Framework**: Use **Next.js** (latest stable version).
- **Router**: Use the **App Router** (`app/` directory).
- **Language**: Use **TypeScript** for all code.
- **Data Fetching**: Use Server Components for data fetching where possible.

## 2. UI Library: Shadcn UI
- **Components**: Use **Shadcn UI** for all UI components.
- **Styling**: Use **Tailwind CSS** for custom styling.
- **Utility**: Use `clsx` and `tailwind-merge` (via `cn` helper) for conditional classes.
- **Icons**: Use `lucide-react` for icons.
- **Installation**: Install components via CLI: `npx shadcn@latest add <component>`.

## 3. Database & Backend: Convex & Clerk
- **Database**: Use **Convex** for the primary database and real-time state.
- **Backend**: Use Convex serverless functions (queries, mutations, and actions) for business logic.
- **Auth**: Use **Clerk** for authentication, integrated with Convex.
- **Client**: Use `convex/react` and `convex/react-clerk` to interact with the backend.
- **Security**: Implement authorization checks within Convex functions using `ctx.auth.getUserIdentity()`.
- **Types**: Leverage Convex's automatic type generation from the schema.

## 4. Coding Standards
- **Strict Mode**: Ensure TypeScript `strict` mode is enabled.
- **Linter**: Follow ESLint and Prettier configurations.
- **Imports**: Use absolute imports (e.g., `@/components/ui/button`).
