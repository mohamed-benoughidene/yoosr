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
  NEXT_PUBLIC_CONVEX_URL: z.string().url("NEXT_PUBLIC_CONVEX_URL must be a valid URL"),
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: z.string().min(1, "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY is required"),
  NEXT_PUBLIC_CLERK_SIGN_IN_URL: z.string().optional(),
  NEXT_PUBLIC_CLERK_SIGN_UP_URL: z.string().optional(),
  NEXT_PUBLIC_SITE_URL: z.string().optional(),
  NEXT_PUBLIC_APP_URL: z.string().optional(),
  NEXT_PUBLIC_VAPID_PUBLIC_KEY: z.string().optional(),
  NEXT_PUBLIC_CONVEX_SITE_URL: z.string().optional(),
});

const serverEnvSchema = z.object({
  CLERK_SECRET_KEY: z.string().min(1, "CLERK_SECRET_KEY is required"),
  OPENROUTER_API_KEY: z.string().optional(),
  VAPID_PRIVATE_KEY: z.string().optional(),
  ENCRYPTION_KEY: z.string().optional(),
  CLERK_WEBHOOK_SECRET: z.string().optional(),
});

const envSchema = clientEnvSchema.merge(serverEnvSchema);

// Skip validation during CI builds — env vars aren't available at build time
const isBuildTime =
  process.env.CI === "true" || process.env.NODE_ENV === "production" && !process.env.NEXT_RUNTIME;

export const env = isBuildTime
  ? process.env as unknown as z.infer<typeof envSchema>
  : envSchema.parse(process.env);

export type Env = z.infer<typeof envSchema>;
