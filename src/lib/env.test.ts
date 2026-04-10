import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

describe("env schema", () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    // Reset process.env for each test
    process.env = { ...originalEnv };
    // Clear module cache so Zod re-validates
    vi.resetModules();
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  async function importEnvModule() {
    return import("./env");
  }

  it("passes with all required env vars", async () => {
    process.env.NEXT_PUBLIC_CONVEX_URL = "https://test.convex.cloud";
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY = "pk_test_xxx";
    process.env.CLERK_SECRET_KEY = "sk_test_xxx";
    process.env.CLERK_JWT_ISSUER_DOMAIN = "test.clerk.accounts.dev";
    process.env.CLERK_WEBHOOK_SECRET = "whsec_test";

    const { env } = await importEnvModule();

    expect(env.NEXT_PUBLIC_CONVEX_URL).toBe("https://test.convex.cloud");
    expect(env.CLERK_SECRET_KEY).toBe("sk_test_xxx");
    expect(env.AI_RATE_LIMIT_PER_HOUR).toBe(100);
    expect(env.LLM_RETRY_MAX_ATTEMPTS).toBe(3);
    expect(env.EMBEDDING_DIMENSIONS).toBe(2048);
  });

  it("fails when NEXT_PUBLIC_CONVEX_URL is missing", async () => {
    process.env.CLERK_SECRET_KEY = "sk_test_xxx";
    process.env.CLERK_JWT_ISSUER_DOMAIN = "test.clerk.accounts.dev";
    process.env.CLERK_WEBHOOK_SECRET = "whsec_test";
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY = "pk_test_xxx";
    delete process.env.NEXT_PUBLIC_CONVEX_URL;

    await expect(importEnvModule()).rejects.toThrow();
  });

  it("fails when CLERK_SECRET_KEY is missing", async () => {
    process.env.NEXT_PUBLIC_CONVEX_URL = "https://test.convex.cloud";
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY = "pk_test_xxx";
    process.env.CLERK_JWT_ISSUER_DOMAIN = "test.clerk.accounts.dev";
    process.env.CLERK_WEBHOOK_SECRET = "whsec_test";
    delete process.env.CLERK_SECRET_KEY;

    try {
      await importEnvModule();
      expect.fail("Expected validation to throw");
    } catch (err: unknown) {
      const issues = (err as { issues?: Array<{ path: string[] }> }).issues;
      expect(issues).toBeDefined();
      expect(issues?.some((i) => i.path.includes("CLERK_SECRET_KEY"))).toBe(true);
    }
  });

  it("fails when CLERK_JWT_ISSUER_DOMAIN is missing", async () => {
    process.env.NEXT_PUBLIC_CONVEX_URL = "https://test.convex.cloud";
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY = "pk_test_xxx";
    process.env.CLERK_SECRET_KEY = "sk_test_xxx";
    process.env.CLERK_WEBHOOK_SECRET = "whsec_test";
    delete process.env.CLERK_JWT_ISSUER_DOMAIN;

    try {
      await importEnvModule();
      expect.fail("Expected validation to throw");
    } catch (err: unknown) {
      const issues = (err as { issues?: Array<{ path: string[] }> }).issues;
      expect(issues).toBeDefined();
      expect(issues?.some((i) => i.path.includes("CLERK_JWT_ISSUER_DOMAIN"))).toBe(true);
    }
  });

  it("fails when CLERK_WEBHOOK_SECRET is missing", async () => {
    process.env.NEXT_PUBLIC_CONVEX_URL = "https://test.convex.cloud";
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY = "pk_test_xxx";
    process.env.CLERK_SECRET_KEY = "sk_test_xxx";
    process.env.CLERK_JWT_ISSUER_DOMAIN = "test.clerk.accounts.dev";
    delete process.env.CLERK_WEBHOOK_SECRET;

    try {
      await importEnvModule();
      expect.fail("Expected validation to throw");
    } catch (err: unknown) {
      const issues = (err as { issues?: Array<{ path: string[] }> }).issues;
      expect(issues).toBeDefined();
      expect(issues?.some((i) => i.path.includes("CLERK_WEBHOOK_SECRET"))).toBe(true);
    }
  });

  it("coerces AI_RATE_LIMIT_PER_HOUR to number with default", async () => {
    process.env.NEXT_PUBLIC_CONVEX_URL = "https://test.convex.cloud";
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY = "pk_test_xxx";
    process.env.CLERK_SECRET_KEY = "sk_test_xxx";
    process.env.CLERK_JWT_ISSUER_DOMAIN = "test.clerk.accounts.dev";
    process.env.CLERK_WEBHOOK_SECRET = "whsec_test";
    process.env.AI_RATE_LIMIT_PER_HOUR = "50";

    const { env } = await importEnvModule();

    expect(env.AI_RATE_LIMIT_PER_HOUR).toBe(50);
  });

  it("coerces EMBEDDING_DIMENSIONS to number with default", async () => {
    process.env.NEXT_PUBLIC_CONVEX_URL = "https://test.convex.cloud";
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY = "pk_test_xxx";
    process.env.CLERK_SECRET_KEY = "sk_test_xxx";
    process.env.CLERK_JWT_ISSUER_DOMAIN = "test.clerk.accounts.dev";
    process.env.CLERK_WEBHOOK_SECRET = "whsec_test";
    delete process.env.EMBEDDING_DIMENSIONS;

    const { env } = await importEnvModule();

    expect(env.EMBEDDING_DIMENSIONS).toBe(2048);
  });

  it("accepts optional AI env vars when provided", async () => {
    process.env.NEXT_PUBLIC_CONVEX_URL = "https://test.convex.cloud";
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY = "pk_test_xxx";
    process.env.CLERK_SECRET_KEY = "sk_test_xxx";
    process.env.CLERK_JWT_ISSUER_DOMAIN = "test.clerk.accounts.dev";
    process.env.CLERK_WEBHOOK_SECRET = "whsec_test";
    process.env.OPENROUTER_API_KEY = "sk-or-xxx";
    process.env.ENCRYPTION_KEY = "abc123def456";

    const { env } = await importEnvModule();

    expect(env.OPENROUTER_API_KEY).toBe("sk-or-xxx");
    expect(env.ENCRYPTION_KEY).toBe("abc123def456");
  });
});
