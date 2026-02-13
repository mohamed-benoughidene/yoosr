"use client"

import { Bar, BarChart, Line, LineChart, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { type ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

const data = [
    {
        name: "Jan",
        total: Math.floor(Math.random() * 5000) + 1000,
    },
    {
        name: "Feb",
        total: Math.floor(Math.random() * 5000) + 1000,
    },
    {
        name: "Mar",
        total: Math.floor(Math.random() * 5000) + 1000,
    },
    {
        name: "Apr",
        total: Math.floor(Math.random() * 5000) + 1000,
    },
    {
        name: "May",
        total: Math.floor(Math.random() * 5000) + 1000,
    },
    {
        name: "Jun",
        total: Math.floor(Math.random() * 5000) + 1000,
    },
    {
        name: "Jul",
        total: Math.floor(Math.random() * 5000) + 1000,
    },
    {
        name: "Aug",
        total: Math.floor(Math.random() * 5000) + 1000,
    },
    {
        name: "Sep",
        total: Math.floor(Math.random() * 5000) + 1000,
    },
    {
        name: "Oct",
        total: Math.floor(Math.random() * 5000) + 1000,
    },
    {
        name: "Nov",
        total: Math.floor(Math.random() * 5000) + 1000,
    },
    {
        name: "Dec",
        total: Math.floor(Math.random() * 5000) + 1000,
    },
]

const chartConfig = {
    total: {
        label: "Total Requests",
        color: "hsl(var(--primary))",
    },
} satisfies ChartConfig


export function Overview() {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Overview</CardTitle>
                <CardDescription>Request volume per month</CardDescription>
            </CardHeader>
            <CardContent className="pl-2">
                <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
                    <BarChart accessibilityLayer data={data}>
                        <CartesianGrid vertical={false} />
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
                            tickFormatter={(value) => `$${value}`}
                        />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Bar dataKey="total" fill="var(--color-total)" radius={4} />
                    </BarChart>
                </ChartContainer>
            </CardContent>
        </Card>
    )
}

const lineData = [
    { name: 'Mon', requests: 400, bots: 240 },
    { name: 'Tue', requests: 300, bots: 139 },
    { name: 'Wed', requests: 200, bots: 980 },
    { name: 'Thu', requests: 278, bots: 390 },
    { name: 'Fri', requests: 189, bots: 480 },
    { name: 'Sat', requests: 239, bots: 380 },
    { name: 'Sun', requests: 349, bots: 430 },
];

const lineConfig = {
    requests: {
        label: "Requests",
        color: "hsl(var(--chart-1))",
    },
    bots: {
        label: "Bot Actions",
        color: "hsl(var(--chart-2))",
    },
} satisfies ChartConfig

export function ActivityChart() {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Weekly Activity</CardTitle>
                <CardDescription>Requests vs Bot Actions</CardDescription>
            </CardHeader>
            <CardContent>
                <ChartContainer config={lineConfig} className="min-h-[200px] w-full">
                    <LineChart accessibilityLayer data={lineData}>
                        <CartesianGrid vertical={false} />
                        <XAxis dataKey="name" tickLine={false} axisLine={false} tickMargin={8} />
                        <Tooltip />
                        <Line type="monotone" dataKey="requests" stroke="var(--color-requests)" strokeWidth={2} dot={false} />
                        <Line type="monotone" dataKey="bots" stroke="var(--color-bots)" strokeWidth={2} dot={false} />
                    </LineChart>
                </ChartContainer>
            </CardContent>
        </Card>
    )
}
