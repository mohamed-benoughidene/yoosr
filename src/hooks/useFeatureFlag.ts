/**
 * React hook for checking feature flags in components.
 * 
 * Usage:
 * ```tsx
 * function MyComponent() {
 *   const isAiBotEnabled = useFeatureFlag("ai_bot");
 *   
 *   if (!isAiBotEnabled) {
 *     return <ComingSoonBanner />;
 *   }
 *   
 *   return <AiBotInterface />;
 * }
 * ```
 */

import { useMemo } from "react";
import { isFeatureEnabled } from "@/lib/featureFlags";

/**
 * Hook to check if a feature flag is enabled.
 * Memoized to avoid recomputing on every render.
 * 
 * @param flag - Feature flag name
 * @returns boolean indicating if feature is enabled
 */
export function useFeatureFlag(flag: string): boolean {
  return useMemo(() => isFeatureEnabled(flag), [flag]);
}
