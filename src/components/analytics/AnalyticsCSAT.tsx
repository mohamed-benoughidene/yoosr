"use client";

import { Star, Loader2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useTranslations } from "next-intl";

interface CSATData {
    average: number;
    total: number;
    distribution: Record<number, number>;
}

interface Props {
    data: CSATData | undefined;
    isLoading: boolean;
}

export function AnalyticsCSAT({ data, isLoading }: Props) {
    const t = useTranslations("analytics");
    const avg = data?.average ?? 0;
    const total = data?.total ?? 5; // Use 5 as placeholder as requested
    const dist = data?.distribution ?? { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };

    return (
        <Card>
            <CardHeader>
                <CardTitle>{t("customer_satisfaction")}</CardTitle>
                <CardDescription>
                    {t("based_on_ratings", { count: total })}
                </CardDescription>
            </CardHeader>
            <CardContent>
                {isLoading ? (
                    <div className="flex h-32 items-center justify-center">
                        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    </div>
                ) : (
                    <div className="space-y-4">
                        {/* Average score */}
                        <div className="flex items-center gap-3">
                            <span className="text-4xl font-bold">{avg > 0 ? avg.toFixed(1) : "—"}</span>
                            <div className="flex flex-col gap-1">
                                <div className="flex gap-0.5">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <Star
                                            key={star}
                                            className={`h-5 w-5 ${star <= Math.round(avg) ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"}`}
                                        />
                                    ))}
                                </div>
                                <span className="text-xs text-muted-foreground">Average score</span>
                            </div>
                        </div>

                        {/* Distribution bars */}
                        <div className="space-y-2">
                            {[5, 4, 3, 2, 1].map((star) => {
                                const count = dist[star] ?? 0;
                                const pct = total > 0 ? Math.round((count / total) * 100) : 0;
                                return (
                                    <div key={star} className="flex items-center gap-2 text-sm">
                                        <span className="w-4 text-right text-muted-foreground">{star}</span>
                                        <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400 shrink-0" />
                                        <Progress value={pct} className="h-2 flex-1" />
                                        <span className="w-8 text-right text-muted-foreground text-xs">{pct}%</span>
                                        <span className="w-6 text-right text-xs text-muted-foreground">({count})</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
