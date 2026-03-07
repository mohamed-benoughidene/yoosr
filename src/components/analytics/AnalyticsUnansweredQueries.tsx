"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useProject } from "@/context/ProjectContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { PlusCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Id } from "../../../convex/_generated/dataModel";

interface UnansweredQuery {
    _id: Id<"unanswered_queries">;
    query: string;
    count: number;
    lastAskedAt: number;
}

interface Props {
    data: UnansweredQuery[] | undefined;
    isLoading: boolean;
}

export function AnalyticsUnansweredQueries({ data, isLoading }: Props) {
    const { activeProject } = useProject();

    // State for Dialog
    const [selectedQuery, setSelectedQuery] = useState<UnansweredQuery | null>(null);
    const [answer, setAnswer] = useState("");
    const [selectedKbId, setSelectedKbId] = useState<string>("");
    const [isSaving, setIsSaving] = useState(false);

    // Convex Mutations
    const addKbSource = useMutation(api.knowledgeBases.addSource);
    const dismissQuery = useMutation(api.analytics.dismissUnansweredQuery);

    // Convex Queries
    const kbs = useQuery(api.knowledgeBases.list, activeProject ? { projectId: activeProject._id } : "skip");

    const handleOpenDialog = (query: UnansweredQuery) => {
        setSelectedQuery(query);
        setAnswer("");

        // Find default KB
        const defaultKb = kbs?.find(kb => kb.isDefault);
        if (defaultKb) {
            setSelectedKbId(defaultKb._id);
        } else if (kbs && kbs.length > 0) {
            setSelectedKbId(kbs[0]._id);
        }
    };

    const handleSaveToKB = async () => {
        if (!selectedQuery || !selectedKbId || !answer.trim()) return;

        setIsSaving(true);
        try {
            // 1. Add to KB
            const content = `Q: ${selectedQuery.query}\nA: ${answer.trim()}`;
            await addKbSource({
                kbId: selectedKbId as Id<"knowledge_bases">,
                type: "text",
                value: content,
            });

            // 2. Dismiss unanswered query
            await dismissQuery({ id: selectedQuery._id });

            toast.success("Added to knowledge base");
            setSelectedQuery(null);
        } catch (error) {
            console.error("Failed to add to KB:", error);
            toast.error("Failed to save to knowledge base");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <>
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
                                                onClick={() => handleOpenDialog(row)}
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

            <Dialog open={!!selectedQuery} onOpenChange={(open) => !open && setSelectedQuery(null)}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>Create Knowledge Base Entry</DialogTitle>
                        <DialogDescription>
                            Turn this unanswered query into a trained answer for your AI bot.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="query">Unanswered Query</Label>
                            <Input
                                id="query"
                                value={selectedQuery?.query || ""}
                                readOnly
                                className="bg-muted focus-visible:ring-0"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="answer">Answer</Label>
                            <Textarea
                                id="answer"
                                placeholder="Type the answer the bot should provide..."
                                value={answer}
                                onChange={(e) => setAnswer(e.target.value)}
                                className="min-h-[120px]"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="kb">Knowledge Base</Label>
                            <Select
                                value={selectedKbId}
                                onValueChange={setSelectedKbId}
                                disabled={!kbs || kbs.length === 0}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a knowledge base" />
                                </SelectTrigger>
                                <SelectContent>
                                    {kbs?.map((kb) => (
                                        <SelectItem key={kb._id} value={kb._id}>
                                            {kb.name} {kb.isDefault ? "(Default)" : ""}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setSelectedQuery(null)} disabled={isSaving}>
                            Cancel
                        </Button>
                        <Button
                            onClick={handleSaveToKB}
                            disabled={isSaving || !answer.trim() || !selectedKbId}
                            className="min-w-[140px]"
                        >
                            {isSaving ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                "Save to Knowledge Base"
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
