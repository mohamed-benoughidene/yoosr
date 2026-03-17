"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { useTranslations } from "next-intl";
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
    const t = useTranslations("knowledge_base");
    const tCommon = useTranslations("common");
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

            toast.success(t("added_to_kb"));
            setSelectedQuery(null);
        } catch (error) {
            console.error("Failed to add to KB:", error);
            toast.error(t("failed_to_save_kb"));
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <>
            <Card>
                <CardHeader>
                    <CardTitle>{t("unanswered_queries")}</CardTitle>
                    <CardDescription>{t("unanswered_queries_desc")}</CardDescription>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="flex h-32 items-center justify-center">
                            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                        </div>
                    ) : !data || data.length === 0 ? (
                        <div className="flex h-32 items-center justify-center text-sm text-muted-foreground">
                            {t("no_unanswered")}
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>{t("query_col")}</TableHead>
                                    <TableHead className="w-24 text-center">{t("asked_col")}</TableHead>
                                    <TableHead className="w-40">{t("last_asked_col")}</TableHead>
                                    <TableHead className="w-40 text-right">{t("action_col")}</TableHead>
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
                                                {t("create_kb_entry")}
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
                        <DialogTitle>{t("create_kb_entry_title")}</DialogTitle>
                        <DialogDescription>
                            {t("create_kb_entry_desc")}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="query">{t("unanswered_query_label")}</Label>
                            <Input
                                id="query"
                                value={selectedQuery?.query || ""}
                                readOnly
                                className="bg-muted focus-visible:ring-0"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="answer">{t("answer")}</Label>
                            <Textarea
                                id="answer"
                                placeholder={t("answer_placeholder")}
                                value={answer}
                                onChange={(e) => setAnswer(e.target.value)}
                                className="min-h-[120px]"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="kb">{t("kb_selector_label")}</Label>
                            <Select
                                value={selectedKbId}
                                onValueChange={setSelectedKbId}
                                disabled={!kbs || kbs.length === 0}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder={t("kb_selector_placeholder")} />
                                </SelectTrigger>
                                <SelectContent>
                                    {kbs?.map((kb) => (
                                        <SelectItem key={kb._id} value={kb._id}>
                                            {kb.name} {kb.isDefault ? t("default_label") : ""}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setSelectedQuery(null)} disabled={isSaving}>
                            {tCommon("cancel")}
                        </Button>
                        <Button
                            onClick={handleSaveToKB}
                            disabled={isSaving || !answer.trim() || !selectedKbId}
                            className="min-w-[140px]"
                        >
                            {isSaving ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    {t("saving")}
                                </>
                            ) : (
                                t("save_to_kb")
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
