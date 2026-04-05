/**
 * Feature Flag system for Yoosr.
 * 
 * Flags are configured via FEATURE_FLAGS environment variable as comma-separated
 * key:value pairs. Example:
 * FEATURE_FLAGS=ai_bot:true,advanced_analytics:false,custom_integrations:true
 * 
 * Usage:
 * ```typescript
 * // Backend/SSR
 * import { isFeatureEnabled } from "@/lib/featureFlags";
 * if (isFeatureEnabled("ai_bot")) { ... }
 * 
 * // Frontend components
 * import { useFeatureFlag } from "@/hooks/useFeatureFlag";
 * const isAiBotEnabled = useFeatureFlag("ai_bot");
 * ```
 */

const FLAGS = Object.fromEntries(
  (process.env.FEATURE_FLAGS || "")
    .split(",")
    .filter(Boolean)
    .map(pair => {
      const [key, value] = pair.split(":");
      return [key?.trim(), value?.trim()];
    })
    .filter(([key, value]) => key && value)
);

/**
 * Check if a feature flag is enabled.
 * @param flag - Feature flag name
 * @returns true if flag is set to "true"
 */
export function isFeatureEnabled(flag: string): boolean {
  return FLAGS[flag] === "true";
}

/**
 * Get all feature flags as a record.
 * Useful for debugging or passing all flags to client.
 */
export function getAllFeatureFlags(): Record<string, string> {
  return { ...FLAGS };
}
