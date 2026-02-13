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

## 3. Database & Backend: Supabase
- **Database**: Use **Supabase** (PostgreSQL) as the primary database.
- **Auth**: Use Supabase Auth for authentication.
- **Client**: Use `@supabase/supabase-js` and `@supabase/ssr` for accessing the database.
- **Security**: Enable Row Level Security (RLS) on all tables and write policies.
- **Types**: Generate TypeScript types from your database schema:
  `npx supabase gen types typescript --project-id <your-project-id> > types/supabase.ts`

## 4. Coding Standards
- **Strict Mode**: Ensure TypeScript `strict` mode is enabled.
- **Linter**: Follow ESLint and Prettier configurations.
- **Imports**: Use absolute imports (e.g., `@/components/ui/button`).
