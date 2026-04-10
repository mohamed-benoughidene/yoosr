/**
 * Environment variable validation for the Next.js frontend.
 *
 * Validates required env vars at startup so failures are caught early
 * with clear error messages instead of silent runtime bugs.
 *
 * Import this from `src/instrumentation.ts` to run validation at startup.
 *
 * @see https://nextjs.org/docs/app/api-reference/file-conventions/instrumentation
 */

import { z } from "zod";

/**
 * Client-side env vars (exposed via NEXT_PUBLIC_ prefix, available in browser)
 */
export const clientEnvSchema = z.object({
  // Required — Convex backend URL
  NEXT_PUBLIC_CONVEX_URL: z.string().url("NEXT_PUBLIC_CONVEX_URL must be a valid URL"),
  // Required — Clerk publishable key
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: z.string().min(1, "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY is required"),
  // Optional — Auth routes (defaults provided by Clerk)
  NEXT_PUBLIC_CLERK_SIGN_IN_URL: z.string().optional(),
  NEXT_PUBLIC_CLERK_SIGN_UP_URL: z.string().optional(),
  // Optional — Site URLs
  NEXT_PUBLIC_SITE_URL: z.string().url().optional(),
  NEXT_PUBLIC_APP_URL: z.string().url().optional(),
  // Optional — Convex site URL (for widget API proxy)
  NEXT_PUBLIC_CONVEX_SITE_URL: z.string().url().optional(),
  // Optional — Web Push (VAPID)
  NEXT_PUBLIC_VAPID_PUBLIC_KEY: z.string().min(1, { message: "NEXT_PUBLIC_VAPID_PUBLIC_KEY must be non-empty if set" }).optional(),
});

/**
 * Server-side env vars (only available in server components, API routes, middleware)
 */
export const serverEnvSchema = z.object({
  // Required — Clerk secret key
  CLERK_SECRET_KEY: z.string().min(1, "CLERK_SECRET_KEY is required"),
  // Required — Clerk JWT issuer domain (for Convex auth)
  CLERK_JWT_ISSUER_DOMAIN: z.string().min(1, "CLERK_JWT_ISSUER_DOMAIN is required"),
  // Required — Clerk webhook secret
  CLERK_WEBHOOK_SECRET: z.string().min(1, "CLERK_WEBHOOK_SECRET is required"),
  // Optional — AI/LLM
  OPENROUTER_API_KEY: z.string().min(1, { message: "OPENROUTER_API_KEY must be non-empty if set" }).optional(),
  AI_RATE_LIMIT_PER_HOUR: z.coerce.number().int().positive().optional().default(100),
  LLM_RETRY_MAX_ATTEMPTS: z.coerce.number().int().positive().optional().default(3),
  LLM_RETRY_BASE_DELAY_MS: z.coerce.number().int().positive().optional().default(1000),
  EMBEDDING_MODEL: z.string().optional(),
  EMBEDDING_DIMENSIONS: z.coerce.number().int().positive().optional().default(2048),
  // Optional — Encryption (for webhook secrets, integration credentials)
  ENCRYPTION_KEY: z.string().min(1, { message: "ENCRYPTION_KEY must be non-empty if set" }).optional(),
  // Optional — Web Push (VAPID)
  VAPID_PRIVATE_KEY: z.string().min(1, { message: "VAPID_PRIVATE_KEY must be non-empty if set" }).optional(),
  // Optional — Feature flags
  FEATURE_FLAGS: z.string().optional().default(""),
  // Optional — Staging deployment
  VERCEL_PROJECT_ID_STAGING: z.string().optional(),
  // Optional — Node environment
  NODE_ENV: z.enum(["development", "production", "test"]).optional().default("development"),
});

export const envSchema = clientEnvSchema.merge(serverEnvSchema);

/**
 * Skip validation during CI builds — env vars aren't available at build time.
 * In production, validate at startup via instrumentation.ts.
 */
const isBuildTime =
  process.env.CI === "true" ||
  (process.env.NODE_ENV === "production" && !process.env.NEXT_RUNTIME);

export const env = isBuildTime
  ? process.env as unknown as z.infer<typeof envSchema>
  : envSchema.parse(process.env);

export type Env = z.infer<typeof envSchema>;
