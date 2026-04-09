/* eslint-disable react-hooks/set-state-in-effect */
/**
 * Custom hook for fetching analytics data.
 * 
 * Note: This hook uses setState within useEffect for data fetching,
 * which is a standard pattern when synchronized with external async operations.
 * The isMounted ref prevents state updates after unmount.
 */

import { useAction } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useState, useEffect, useRef } from "react";
import { Id } from "../../convex/_generated/dataModel";

interface AnalyticsData {
  conversationStats: { total: number; open: number; closed: number } | null;
  conversationVolume: {
    total: number;
    botHandled: number;
    agentHandled: number;
    daily: { date: string; bot: number; agent: number; total: number }[];
  } | null;
  tokenUsage: { totalTokens: number; byModel: { model: string; tokens: number }[] } | null;
  tagsSummary: { name: string; value: number }[] | null;
  csatSummary: { average: number; total: number; distribution: Record<number, number> } | null;
  slaBreachRate: { total: number; slaTracked: number; breached: number; breachRate: number } | null;
  loading: boolean;
  error: Error | null;
}

export function useAnalyticsData(
  projectId: Id<"projects"> | undefined,
  dateRange: { from: number; to: number }
): AnalyticsData {
  const [data, setData] = useState<Omit<AnalyticsData, "loading" | "error">>({
    conversationStats: null,
    conversationVolume: null,
    tokenUsage: null,
    tagsSummary: null,
    csatSummary: null,
    slaBreachRate: null,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const isMounted = useRef(true);

  const getConversationStats = useAction(api.analytics.getConversationStats);
  const getConversationVolume = useAction(api.analytics.getConversationVolume);
  const getTokenUsage = useAction(api.analytics.getTokenUsage);
  const getTagsSummary = useAction(api.analytics.getTagsSummary);
  const getCSATSummary = useAction(api.analytics.getCSATSummary);
  const getSLABreachRate = useAction(api.analytics.getSLABreachRate);

  // Standard data fetching pattern with cleanup
  useEffect(() => {
    isMounted.current = true;

    if (!projectId) {
      // Reset state when no projectId - safe to call setState here
      setData({
        conversationStats: null,
        conversationVolume: null,
        tokenUsage: null,
        tagsSummary: null,
        csatSummary: null,
        slaBreachRate: null,
      });
      setLoading(false);
      return;
    }

    async function fetchData() {
      if (!projectId) return;
      
      try {
        const [stats, volume, usage, tags, csat, sla] = await Promise.all([
          getConversationStats({ projectId, ...dateRange }),
          getConversationVolume({ projectId, ...dateRange }),
          getTokenUsage({ projectId, ...dateRange }),
          getTagsSummary({ projectId, ...dateRange }),
          getCSATSummary({ projectId, ...dateRange }),
          getSLABreachRate({ projectId, ...dateRange }),
        ]);

        if (isMounted.current) {
          setData({
            conversationStats: stats,
            conversationVolume: volume,
            tokenUsage: usage,
            tagsSummary: tags,
            csatSummary: csat,
            slaBreachRate: sla,
          });
          setLoading(false);
        }
      } catch (err) {
        if (isMounted.current) {
          setError(err instanceof Error ? err : new Error(String(err)));
          setLoading(false);
        }
      }
    }

    fetchData();

    return () => {
      isMounted.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- dateRange.from/to tracked; whole object would cause infinite re-renders
  }, [projectId, dateRange.from, dateRange.to, getConversationStats, getConversationVolume, getTokenUsage, getTagsSummary, getCSATSummary, getSLABreachRate]);

  return { ...data, loading, error };
}
