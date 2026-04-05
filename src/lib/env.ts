/**
 * Environment variable validation for the Next.js frontend.
 *
 * Validates required env vars at startup so failures are caught early
 * with clear error messages instead of silent runtime bugs.
 *
 * @see https://docs.nextjs.org/app/api-reference/config/environment-variables
 */

import { z } from "zod";

const clientEnvSchema = z.object({
  /**
   * Convex backend URL.
   * Get from: `npx convex dev` or your Convex dashboard.
   * Example: https://your-project.convex.cloud
   */
  NEXT_PUBLIC_CONVEX_URL: z.string().url("NEXT_PUBLIC_CONVEX_URL must be a valid URL"),

  /**
   * Clerk publishable key for frontend auth.
   * Get from: https://dashboard.clerk.com → API Keys.
   * Example: pk_test_...
   */
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: z.string().min(1, "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY is required"),

  /**
   * Clerk sign-in URL path.
   */
  NEXT_PUBLIC_CLERK_SIGN_IN_URL: z.string().optional(),

  /**
   * Clerk sign-up URL path.
   */
  NEXT_PUBLIC_CLERK_SIGN_UP_URL: z.string().optional(),

  /**
   * Site URL for SEO (sitemaps, Open Graph, canonical URLs).
   * Example: https://yoosr.com
   */
  NEXT_PUBLIC_SITE_URL: z.string().optional(),

  /**
   * App URL (for redirects, widget embed URLs).
   * Example: https://app.yoosr.com
   */
  NEXT_PUBLIC_APP_URL: z.string().optional(),

  /**
   * VAPID public key for web push notifications.
   * Generate with: `npx web-push generate-vapid-keys`
   */
  NEXT_PUBLIC_VAPID_PUBLIC_KEY: z.string().optional(),

  /**
   * Convex site URL for HTTP endpoint access (e.g., widget API proxy).
   * Example: https://your-project.convex.cloud
   */
  NEXT_PUBLIC_CONVEX_SITE_URL: z.string().optional(),
});

const serverEnvSchema = z.object({
  /**
   * Clerk secret key for server-side auth verification.
   * Get from: https://dashboard.clerk.com → API Keys.
   * Example: sk_test_...
   */
  CLERK_SECRET_KEY: z.string().min(1, "CLERK_SECRET_KEY is required"),

  /**
   * OpenRouter API key for LLM calls (AI bot features).
   * Get from: https://openrouter.ai/keys
   * Example: sk-or-...
   */
  OPENROUTER_API_KEY: z.string().optional(),

  /**
   * VAPID private key for web push notifications.
   * Generate with: `npx web-push generate-vapid-keys`
   */
  VAPID_PRIVATE_KEY: z.string().optional(),

  /**
   * Encryption key for encrypting webhook secrets and integration credentials.
   * Generate with: `openssl rand -hex 32`
   */
  ENCRYPTION_KEY: z.string().optional(),
});

/**
 * Combined env schema — validates both client and server vars.
 *
 * Imported by the root layout so it runs at startup.
 * Missing required vars throw immediately with a clear message.
 */
const envSchema = clientEnvSchema.merge(serverEnvSchema);

/**
 * Validated environment variables.
 *
 * Usage:
 *   import { env } from "@/lib/env";
 *   const convexUrl = env.NEXT_PUBLIC_CONVEX_URL;
 */
export const env = envSchema.parse(process.env);

/**
 * Type for all validated env vars.
 */
export type Env = z.infer<typeof envSchema>;
