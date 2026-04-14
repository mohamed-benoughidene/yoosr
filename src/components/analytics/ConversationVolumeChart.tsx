"use client";

import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";

interface DailyPoint {
    date: string;
    bot: number;
    agent: number;
    total: number;
}

interface Props {
    data: DailyPoint[] | undefined;
    isLoading: boolean;
}

export function ConversationVolumeChart({ data, isLoading }: Props) {
    const t = useTranslations("analytics");

    return (
        <Card>
            <CardHeader>
                <CardTitle>{t("conversation_volume")}</CardTitle>
                <CardDescription>{t("conversation_volume_description")}</CardDescription>
            </CardHeader>
            <CardContent>
                {isLoading ? (
                    <div className="flex h-64 items-center justify-center">
                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    </div>
                ) : !data || data.length === 0 ? (
                    <div className="flex h-64 items-center justify-center text-muted-foreground text-sm">
                        No conversation data in this period.
                    </div>
                ) : (
                    <ResponsiveContainer width="100%" height={280}>
                        <BarChart data={data} margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
                            <CartesianGrid className="stroke-border" />
                            <XAxis
                                dataKey="date"
                                tick={{ fontSize: 12 }}
                                tickFormatter={(v) => {
                                    const d = new Date(v);
                                    return `${d.getMonth() + 1}/${d.getDate()}`;
                                }}
                            />
                            <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
                            <Tooltip
                                contentStyle={{ fontSize: 12 }}
                                labelFormatter={(label) => new Date(label).toLocaleDateString()}
                            />
                            <Legend wrapperStyle={{ fontSize: 12 }} />
                            <Bar
                                dataKey="bot"
                                name={t("bot_handled")}
                                fill="hsl(var(--chart-2))"
                            />
                            <Bar
                                dataKey="agent"
                                name={t("agent_handled")}
                                fill="hsl(var(--chart-8))"
                            />
                        </BarChart>
                    </ResponsiveContainer>
                )}
            </CardContent>
        </Card>
    );
}
