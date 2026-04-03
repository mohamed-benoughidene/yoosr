/**
 * Environment variable validation for production safety.
 *
 * Convex functions run in isolated environments, so missing env vars
 * won't crash at startup — they'll fail silently at runtime.
 * This helper ensures critical secrets are present in production.
 */

/**
 * Validate that a required environment variable is present.
 * Throws a descriptive error in production; warns in development.
 */
export function requireEnv(name: string, value: string | undefined): string {
    if (!value) {
        if (process.env.NODE_ENV === "production") {
            throw new Error(
                `${name} environment variable is required in production. ` +
                `Set it via \`npx convex env set ${name} <value>\`.`
            );
        }
        console.warn(`⚠️  ${name} not configured (development only — some features may not work)`);
        return "";
    }
    return value;
}
