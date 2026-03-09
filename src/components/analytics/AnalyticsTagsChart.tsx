"use client";

import {
    PieChart,
    Pie,
    ResponsiveContainer,
    Cell,
    Tooltip,
    Legend
} from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Tag } from "lucide-react";

interface TagData {
    name: string;
    value: number;
}

interface Props {
    data: TagData[] | undefined;
    isLoading: boolean;
}

// Generate a smooth gradient of colors for the tags
const COLORS = [
    "hsl(var(--chart-1))",
    "hsl(var(--chart-2))",
    "hsl(var(--chart-3))",
    "hsl(var(--chart-4))",
    "hsl(var(--chart-5))",
    "#8b5cf6",
    "#ec4899",
    "#14b8a6",
    "#f59e0b",
    "#6366f1"
];

export function AnalyticsTagsChart({ data, isLoading }: Props) {
    return (
        <Card className="flex flex-col">
            <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Tag className="h-4 w-4" />
                    AI Topic Tags
                </CardTitle>
                <CardDescription>Generated automatically from closed conversations</CardDescription>
            </CardHeader>
            <CardContent className="flex-1">
                {isLoading ? (
                    <div className="flex h-48 items-center justify-center">
                        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    </div>
                ) : !data || data.length === 0 ? (
                    <div className="flex h-48 items-center justify-center text-muted-foreground text-sm">
                        No AI tags generated yet.
                    </div>
                ) : (
                    <div className="h-48 w-full mt-2">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={data}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={50}
                                    outerRadius={70}
                                    paddingAngle={2}
                                    dataKey="value"
                                >
                                    {data.map((entry, index) => (
                                        <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    formatter={(value: number) => [`${value} conv.`, "Frequency"]}
                                    contentStyle={{ borderRadius: "8px", border: "1px solid hsl(var(--border))" }}
                                />
                                <Legend
                                    layout="vertical"
                                    verticalAlign="middle"
                                    align="right"
                                    wrapperStyle={{ fontSize: "12px" }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
