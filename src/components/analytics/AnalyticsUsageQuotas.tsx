"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Loader2, Zap, MessageSquare } from "lucide-react";
import { useTranslations } from "next-intl";

interface UsageData {
    tokensConsumed: number;
    conversationsCount: number;
}

interface Props {
    data: UsageData | undefined;
    isLoading: boolean;
    // Hardcoded limits for demonstration purposes, can be pulled from a plan config later
    maxTokens?: number;
    maxConversations?: number;
}

export function AnalyticsUsageQuotas({ data, isLoading, maxTokens = 500000, maxConversations = 1000 }: Props) {
    const t = useTranslations("analytics");

    if (isLoading) {
        return (
            <Card>
                <CardContent className="flex h-32 items-center justify-center">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </CardContent>
            </Card>
        );
    }

    const tokens = data?.tokensConsumed ?? 0;
    const convs = data?.conversationsCount ?? 0;

    const tokenPercent = Math.min((tokens / maxTokens) * 100, 100);
    const convPercent = Math.min((convs / maxConversations) * 100, 100);

    const tokenLabel = tokens >= 1000 ? `${(tokens / 1000).toFixed(1)}k` : tokens;
    const maxTokenLabel = maxTokens >= 1000 ? `${(maxTokens / 1000).toFixed(0)}k` : maxTokens;

    return (
        <Card>
            <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">{t("monthly_usage_quotas")}</CardTitle>
                <CardDescription>{t("monthly_usage_quotas_description")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 pt-4">
                <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                            <Zap className="h-4 w-4 text-primary" />
                            <span className="font-medium">AI Tokens</span>
                        </div>
                        <span className="text-muted-foreground">{tokenLabel} / {maxTokenLabel}</span>
                    </div>
                    <Progress value={tokenPercent} className="h-2" />
                    <p className="text-xs text-muted-foreground text-right">{tokenPercent.toFixed(1)}% used</p>
                </div>

                <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                            <MessageSquare className="h-4 w-4 text-blue-500" />
                            <span className="font-medium">Conversations</span>
                        </div>
                        <span className="text-muted-foreground">{convs} / {maxConversations}</span>
                    </div>
                    <Progress value={convPercent} className="h-2" />
                    <p className="text-xs text-muted-foreground text-right">{convPercent.toFixed(1)}% used</p>
                </div>
            </CardContent>
        </Card>
    );
}
