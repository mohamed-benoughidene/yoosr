import { defineConfig } from "vitest/config";

/**
 * Dedicated Vitest config for Convex backend tests.
 * Uses Node environment (no jsdom) since Convex functions don't need DOM APIs.
 *
 * Usage: bunx vitest run --config vitest.convex.config.ts
 */
export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    include: ["convex/**/*.test.{ts,tsx}"],
    exclude: ["**/node_modules/**", "**/.next/**", "**/_generated/**"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      exclude: [
        "node_modules/**",
        ".next/**",
        "convex/_generated/**",
        "**/*.config.{ts,mts}",
        "**/*.d.ts",
      ],
    },
  },
});
