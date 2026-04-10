/**
 * Next.js instrumentation — runs once at server startup.
 *
 * Used here to validate all required environment variables before
 * any request is processed. Fails fast with clear error messages.
 *
 * @see https://nextjs.org/docs/app/api-reference/file-conventions/instrumentation
 */

import "./lib/env";

export async function register() {
  // The env import above triggers Zod validation at module load time.
  // If any required env var is missing, the server won't start.
}
