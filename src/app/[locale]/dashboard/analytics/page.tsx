"use client";

import { useState, useMemo } from "react";
import { useTranslations } from "next-intl";
import { useQuery } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { useProject } from "@/context/ProjectContext";
import { useAnalyticsData } from "@/hooks/useAnalyticsData";
import dynamic from "next/dynamic";

const ConversationVolumeChart = dynamic(
    () => import("@/components/analytics/ConversationVolumeChart")
        .then(m => ({ default: m.ConversationVolumeChart })),
    { ssr: false }
);
const AnalyticsTagsChart = dynamic(
    () => import("@/components/analytics/AnalyticsTagsChart")
        .then(m => ({ default: m.AnalyticsTagsChart })),
    { ssr: false }
);

import { AnalyticsCSAT } from "@/components/analytics/AnalyticsCSAT";
import { AnalyticsUnansweredQueries } from "@/components/analytics/AnalyticsUnansweredQueries";
import { AnalyticsUsageQuotas } from "@/components/analytics/AnalyticsUsageQuotas";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
    MessageSquare,
    Bot,
    User,
    Star,
    Zap,
    CalendarRange,
    Clock,
} from "lucide-react";

export default function AnalyticsPage() {
    const t = useTranslations("analytics");
    const { activeProject } = useProject();

    // Default range: last 30 days
    const defaultTo = useMemo(() => new Date().toISOString().slice(0, 10), []);
    const defaultFrom = useMemo(() => {
        const d = new Date();
        d.setDate(d.getDate() - 30);
        return d.toISOString().slice(0, 10);
    }, []);

    const [fromDate, setFromDate] = useState(defaultFrom);
    const [toDate, setToDate] = useState(defaultTo);

    const from = new Date(fromDate).getTime();
    const to = new Date(toDate).getTime() + 86399999; // end of day

    // Fetch all analytics data in a single hook
    const {
        conversationStats,
        conversationVolume,
        tokenUsage,
        tagsSummary,
        csatSummary,
        slaBreachRate,
        loading,
        error,
    } = useAnalyticsData(activeProject?._id, { from, to });

    // Non-action queries (don't need to be in the hook)
    const csatCommentsData = useQuery(
        api.analytics.getCSATComments,
        activeProject ? { projectId: activeProject._id, limit: 5 } : "skip"
    );
    const unansweredData = useQuery(
        api.analytics.getUnansweredQueries,
        activeProject ? { projectId: activeProject._id, limit: 20, from, to } : "skip"
    );
    const usageData = useQuery(
        api.analytics.getProjectUsage,
        activeProject ? { projectId: activeProject._id } : "skip"
    );

    if (!activeProject) {
        return <div className="p-8 text-muted-foreground">{t("select_project_message")}</div>;
    }

    if (error) {
        return (
            <div className="p-8 text-center">
                <p className="text-destructive">Failed to load analytics data</p>
                <p className="text-sm text-muted-foreground mt-2">{error.message}</p>
            </div>
        );
    }

    const statsCards = [
        {
            label: t("total_conversations"),
            value: conversationStats?.total ?? "—",
            icon: MessageSquare,
            sub: t("in_selected_period"),
        },
        {
            label: t("bot_handled"),
            value: conversationVolume?.botHandled ?? "—",
            icon: Bot,
            sub: conversationVolume && conversationStats && conversationStats.total > 0
                ? t("percent_of_total", { percent: Math.round((conversationVolume.botHandled / conversationStats.total) * 100) })
                : "—",
        },
        {
            label: t("agent_handled"),
            value: conversationVolume?.agentHandled ?? "—",
            icon: User,
            sub: conversationVolume && conversationStats && conversationStats.total > 0
                ? t("percent_of_total", { percent: Math.round((conversationVolume.agentHandled / conversationStats.total) * 100) })
                : "—",
        },
        {
            label: t("avg_csat"),
            value: csatSummary && csatSummary.total > 0 ? `${csatSummary.average}/5` : "—",
            icon: Star,
            sub: csatSummary && csatSummary.total > 0 ? t("ratings_count", { count: csatSummary.total }) : t("no_ratings_yet"),
        },
        {
            label: t("total_tokens"),
            value: tokenUsage
                ? tokenUsage.totalTokens >= 1000
                    ? `${(tokenUsage.totalTokens / 1000).toFixed(1)}k`
                    : tokenUsage.totalTokens
                : "—",
            icon: Zap,
            sub: t("ai_tokens_consumed"),
        },
        {
            label: t("sla_breach_rate"),
            value: slaBreachRate ? (slaBreachRate.slaTracked > 0 ? `${slaBreachRate.breachRate}%` : t("no_sla_data")) : "—",
            icon: Clock,
            sub: slaBreachRate ? (slaBreachRate.slaTracked > 0 ? t("sla_tracked", { breached: slaBreachRate.breached, tracked: slaBreachRate.slaTracked }) : "—") : "—",
            valueClassName: slaBreachRate && slaBreachRate.slaTracked > 0
                ? slaBreachRate.breachRate > 20
                    ? "text-destructive"
                    : slaBreachRate.breachRate > 10
                        ? "text-amber-500"
                        : "text-green-500"
                : "",
        },
    ];

    return (
        <div className="flex flex-col gap-6 p-6">
            {/* Header */}
            <div className="flex flex-col gap-1">
                <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
                <p className="text-muted-foreground">
                    {t("insights_for")} <span className="font-medium text-foreground">{activeProject.name}</span>
                </p>
            </div>

            {/* Date range picker */}
            <div className="flex items-end gap-3 flex-wrap">
                <CalendarRange className="h-4 w-4 text-muted-foreground self-end mb-2.5" />
                <div className="flex flex-col gap-1">
                    <Label htmlFor="date-from" className="text-xs">{t("from")}</Label>
                    <Input
                        id="date-from"
                        type="date"
                        value={fromDate}
                        onChange={(e) => setFromDate(e.target.value)}
                        className="w-40 h-8 text-sm"
                    />
                </div>
                <div className="flex flex-col gap-1">
                    <Label htmlFor="date-to" className="text-xs">{t("to")}</Label>
                    <Input
                        id="date-to"
                        type="date"
                        value={toDate}
                        onChange={(e) => setToDate(e.target.value)}
                        className="w-40 h-8 text-sm"
                    />
                </div>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => { setFromDate(defaultFrom); setToDate(defaultTo); }}
                >
                    {t("last_30_days")}
                </Button>
            </div>

            {/* Stats row */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
                {statsCards.map(({ label, value, icon: Icon, sub, valueClassName }) => (
                    <Card key={label}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">{label}</CardTitle>
                            <Icon className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className={`text-2xl font-bold ${valueClassName || ""}`.trim()}>{String(value)}</div>
                            <p className="text-xs text-muted-foreground">{sub}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Analytics + Tags row */}
            <div className="grid gap-6 lg:grid-cols-2">
                <AnalyticsUsageQuotas
                    data={usageData}
                    isLoading={usageData === undefined}
                />
                <AnalyticsTagsChart
                    data={tagsSummary ?? undefined}
                    isLoading={tagsSummary === null || loading}
                />
            </div>

            {/* Conversation Volume chart */}
            <ConversationVolumeChart
                data={conversationVolume?.daily ?? undefined}
                isLoading={conversationVolume === null || loading}
            />

            {/* Bottom row: Unanswered Queries + CSAT */}
            <div className="grid gap-6 lg:grid-cols-2">
                <AnalyticsUnansweredQueries
                    data={unansweredData}
                    isLoading={unansweredData === undefined}
                />
                <AnalyticsCSAT
                    data={csatSummary ?? undefined}
                    isLoading={csatSummary === null || loading}
                    comments={csatCommentsData}
                />
            </div>
        </div>
    );
}
