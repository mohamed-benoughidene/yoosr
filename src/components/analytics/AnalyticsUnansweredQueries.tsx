"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { PlusCircle, Loader2 } from "lucide-react";

interface UnansweredQuery {
    _id: string;
    query: string;
    count: number;
    lastAskedAt: number;
}

interface Props {
    data: UnansweredQuery[] | undefined;
    isLoading: boolean;
}

export function AnalyticsUnansweredQueries({ data, isLoading }: Props) {
    const router = useRouter();

    const handleCreateKBEntry = (query: string) => {
        router.push(`/dashboard/kb?prefill=${encodeURIComponent(query)}`);
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Unanswered Queries</CardTitle>
                <CardDescription>Questions the bot couldn&apos;t answer — create KB entries to fill the gaps</CardDescription>
            </CardHeader>
            <CardContent>
                {isLoading ? (
                    <div className="flex h-32 items-center justify-center">
                        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    </div>
                ) : !data || data.length === 0 ? (
                    <div className="flex h-32 items-center justify-center text-sm text-muted-foreground">
                        No unanswered queries yet. 🎉
                    </div>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Query</TableHead>
                                <TableHead className="w-24 text-center">Asked</TableHead>
                                <TableHead className="w-40">Last Asked</TableHead>
                                <TableHead className="w-40 text-right">Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {data.map((row) => (
                                <TableRow key={row._id}>
                                    <TableCell className="font-medium max-w-xs truncate" title={row.query}>
                                        {row.query}
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <Badge variant="secondary">{row.count}×</Badge>
                                    </TableCell>
                                    <TableCell className="text-muted-foreground text-sm">
                                        {new Date(row.lastAskedAt).toLocaleDateString()}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => handleCreateKBEntry(row.query)}
                                            className="gap-1.5"
                                        >
                                            <PlusCircle className="h-3.5 w-3.5" />
                                            Create KB Entry
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}
            </CardContent>
        </Card>
    );
}
