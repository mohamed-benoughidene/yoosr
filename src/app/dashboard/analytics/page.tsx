"use client";

import { useState, useMemo } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useProject } from "@/context/ProjectContext";
import { ConversationVolumeChart } from "@/components/analytics/ConversationVolumeChart";
import { AnalyticsCSAT } from "@/components/analytics/AnalyticsCSAT";
import { AnalyticsUnansweredQueries } from "@/components/analytics/AnalyticsUnansweredQueries";
import { AnalyticsUsageQuotas } from "@/components/analytics/AnalyticsUsageQuotas";
import { AnalyticsTagsChart } from "@/components/analytics/AnalyticsTagsChart";
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
} from "lucide-react";

function toMs(dateStr: string): number {
    return new Date(dateStr).getTime();
}

function formatDateInput(d: Date): string {
    return d.toISOString().slice(0, 10);
}

export default function AnalyticsPage() {
    const { activeProject } = useProject();

    // Default range: last 30 days
    const defaultTo = useMemo(() => formatDateInput(new Date()), []);
    const defaultFrom = useMemo(() => {
        const d = new Date();
        d.setDate(d.getDate() - 30);
        return formatDateInput(d);
    }, []);

    const [fromDate, setFromDate] = useState(defaultFrom);
    const [toDate, setToDate] = useState(defaultTo);

    const from = toMs(fromDate);
    const to = toMs(toDate) + 86399999; // end of day

    const convStatsData = useQuery(
        api.analytics.getConversationStats,
        activeProject ? { projectId: activeProject._id, from, to } : "skip"
    );

    const volumeData = useQuery(
        api.analytics.getConversationVolume,
        activeProject ? { projectId: activeProject._id, from, to } : "skip"
    );
    const tokenData = useQuery(
        api.analytics.getTokenUsage,
        activeProject ? { projectId: activeProject._id, from, to } : "skip"
    );
    const csatData = useQuery(
        api.analytics.getCSATSummary,
        activeProject ? { projectId: activeProject._id, from, to } : "skip"
    );
    const unansweredData = useQuery(
        api.analytics.getUnansweredQueries,
        activeProject ? { projectId: activeProject._id, limit: 20 } : "skip"
    );
    const usageData = useQuery(
        api.analytics.getProjectUsage,
        activeProject ? { projectId: activeProject._id } : "skip"
    );
    const tagsData = useQuery(
        api.analytics.getTagsSummary,
        activeProject ? { projectId: activeProject._id, from, to } : "skip"
    );

    if (!activeProject) {
        return <div className="p-8 text-muted-foreground">Select a project to view analytics.</div>;
    }

    const statsCards = [
        {
            label: "Total Conversations",
            value: convStatsData?.total ?? "—",
            icon: MessageSquare,
            sub: "in selected period",
        },
        {
            label: "Bot Handled",
            value: volumeData?.botHandled ?? "—",
            icon: Bot,
            sub: volumeData && convStatsData && convStatsData.total > 0
                ? `${Math.round((volumeData.botHandled / convStatsData.total) * 100)}% of total`
                : "—",
        },
        {
            label: "Agent Handled",
            value: volumeData?.agentHandled ?? "—",
            icon: User,
            sub: volumeData && convStatsData && convStatsData.total > 0
                ? `${Math.round((volumeData.agentHandled / convStatsData.total) * 100)}% of total`
                : "—",
        },
        {
            label: "Avg CSAT",
            value: csatData && csatData.total > 0 ? `${csatData.average}/5` : "—",
            icon: Star,
            sub: csatData && csatData.total > 0 ? `${csatData.total} rating${csatData.total !== 1 ? "s" : ""}` : "No ratings yet",
        },
        {
            label: "Total Tokens",
            value: tokenData
                ? tokenData.totalTokens >= 1000
                    ? `${(tokenData.totalTokens / 1000).toFixed(1)}k`
                    : tokenData.totalTokens
                : "—",
            icon: Zap,
            sub: "AI tokens consumed",
        },
    ];

    return (
        <div className="flex flex-col gap-6 p-6">
            {/* Header */}
            <div className="flex flex-col gap-1">
                <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
                <p className="text-muted-foreground">
                    Insights for <span className="font-medium text-foreground">{activeProject.name}</span>
                </p>
            </div>

            {/* Date range picker */}
            <div className="flex items-end gap-3 flex-wrap">
                <CalendarRange className="h-4 w-4 text-muted-foreground self-end mb-2.5" />
                <div className="flex flex-col gap-1">
                    <Label htmlFor="date-from" className="text-xs">From</Label>
                    <Input
                        id="date-from"
                        type="date"
                        value={fromDate}
                        onChange={(e) => setFromDate(e.target.value)}
                        className="w-40 h-8 text-sm"
                    />
                </div>
                <div className="flex flex-col gap-1">
                    <Label htmlFor="date-to" className="text-xs">To</Label>
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
                    Last 30 days
                </Button>
            </div>

            {/* Stats row */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
                {statsCards.map(({ label, value, icon: Icon, sub }) => (
                    <Card key={label}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">{label}</CardTitle>
                            <Icon className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{String(value)}</div>
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
                    data={tagsData}
                    isLoading={tagsData === undefined}
                />
            </div>

            {/* Conversation Volume chart */}
            <ConversationVolumeChart
                data={volumeData?.daily}
                isLoading={volumeData === undefined}
            />

            {/* Bottom row: Unanswered Queries + CSAT */}
            <div className="grid gap-6 lg:grid-cols-2">
                <AnalyticsUnansweredQueries
                    data={unansweredData as any}
                    isLoading={unansweredData === undefined}
                />
                <AnalyticsCSAT
                    data={csatData as any}
                    isLoading={csatData === undefined}
                />
            </div>
        </div>
    );
}
