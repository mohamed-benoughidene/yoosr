"use client";

import { Bar, BarChart as RechartsBarChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid, Legend } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface BarChartProps {
    title: string;
    description?: string;
    data: any[];
    categories: string[];
    colors?: string[];
}

export function BarChart({
    title,
    description,
    data,
    categories,
    colors = ["#2563eb", "#60a5fa", "#93c5fd"],
}: BarChartProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>{title}</CardTitle>
                {description && <CardDescription>{description}</CardDescription>}
            </CardHeader>
            <CardContent className="pb-4">
                <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <RechartsBarChart data={data}>
                            <CartesianGrid vertical={false} stroke="#e5e5e5" strokeDasharray="3 3" />
                            <XAxis
                                dataKey="name"
                                stroke="#888888"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                            />
                            <YAxis
                                stroke="#888888"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                                tickFormatter={(value) => `${value}`}
                            />
                            <Tooltip
                                cursor={{ fill: 'transparent' }}
                                contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb' }}
                            />
                            <Legend />
                            {categories.map((category, index) => (
                                <Bar
                                    key={category}
                                    dataKey={category}
                                    fill={colors[index % colors.length]}
                                    radius={[4, 4, 0, 0]}
                                />
                            ))}
                        </RechartsBarChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
}
