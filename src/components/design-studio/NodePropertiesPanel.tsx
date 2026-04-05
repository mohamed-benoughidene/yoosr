"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, X } from "lucide-react";
import { type Node } from "@xyflow/react";
import { useCallback, useState, useMemo } from "react";
import { useSearchParams } from "@/i18n/navigation";
import Link from "next/link";
import { useProject } from "@/context/ProjectContext";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";

interface NodePropertiesPanelProps {
    node: Node | null;
    onUpdateNode: (nodeId: string, data: Record<string, unknown>) => void;
    onClose: () => void;
    onDeleteNode: (nodeId: string) => void;
}

import { Suspense } from "react";
import { useTranslations } from "next-intl";

const toCamelCase = (str: string) => str.replace(/_([a-z])/g, (g) => g[1].toUpperCase());

function NodePropertiesPanelContent({
    node,
    onUpdateNode,
    onClose,
    onDeleteNode,
}: NodePropertiesPanelProps) {
    const t = useTranslations("designStudio");
    const searchParams = useSearchParams();
    const projectId = searchParams.get("project") as Id<"projects"> | null;
    const departments = useQuery(api.settings.listDepartments, projectId ? { projectId } : "skip") || [];
    const labels = useQuery(api.labels.listLabels, projectId ? { projectId } : "skip") || [];
    const { activeProject } = useProject();
    const data = useMemo(() => (node?.data || {}) as Record<string, string>, [node?.data]);
    const dataObj = node?.data as Record<string, string | string[] | undefined> | undefined;
    const [localVariations, setLocalVariations] = useState<string[]>(() => {
        const textVariations = dataObj?.textVariations as string[] | undefined;
        const text = dataObj?.text as string | undefined;
        return textVariations || (text ? [text] : [""]);
    });
    const fallbackModel = activeProject?.defaultModel || "mistralai/mistral-small-3.1-24b-instruct:free";

    const update = useCallback(
        (key: string, value: unknown) => {
            if (node) {
                onUpdateNode(node.id, { ...data, [key]: value });
            }
        },
        [node, data, onUpdateNode]
    );

    if (!node) return null;

    return (
        <div className="flex h-full w-80 flex-col border-l bg-background">
            {/* Header */}
            <div className="flex items-center justify-between border-b px-4 py-3">
                <div>
                    <h3 className="text-sm font-semibold">{t(`blocks.${toCamelCase(node.type ?? "")}.name`) ?? ""}</h3>
                    {typeof data.label === "string" && data.label.trim() !== "" && (
                        <p className="text-xs text-muted-foreground mt-0.5">
                            {data.label}
                        </p>
                    )}
                    <p className="text-[10px] text-muted-foreground capitalize mt-0.5">
                        {t(`blocks.${toCamelCase(node.type ?? "")}.name`)} {t("properties.blockSuffix")}
                    </p>
                </div>
                <Button variant="ghost" size="icon" onClick={onClose} className="h-7 w-7">
                    <X className="h-3.5 w-3.5" />
                </Button>
            </div>

            {/* Properties */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {/* Label (all node types) */}
                <div className="space-y-1.5">
                    <Label className="text-xs">{t("properties.label")}</Label>
                    <Input
                        value={(data.label as string) || ""}
                        onChange={(e) => update("label", e.target.value)}
                        className="h-8 text-sm"
                        placeholder={t("properties.blockName")}
                    />
                </div>

                {/* Reply node fields */}
                {node.type === "reply" && (
                    <>
                        <div className="space-y-2">
                            <div className="flex items-center justify-between pointer-events-auto">
                                <Label className="text-xs">{t("properties.messageVariations")}</Label>
                                <Button variant="ghost" size="sm" onClick={() => {
                                    const next = [...localVariations, ""];
                                    setLocalVariations(next);
                                    update("textVariations", next);
                                    update("text", next[0]);
                                }} className="h-6 px-2 text-xs">
                                    <Plus className="mr-1 h-3 w-3" /> {t("properties.addVariation")}
                                </Button>
                            </div>
                            {localVariations.map((text: string, i: number) => (
                                <div key={`variation-${i}`} className="flex flex-col gap-1 relative border p-2 rounded-md bg-muted/30 pointer-events-auto">
                                    {localVariations.length > 1 && (
                                        <Button variant="ghost" size="icon" onClick={() => {
                                            const next = localVariations.filter((_, idx) => idx !== i);
                                            setLocalVariations(next);
                                            update("textVariations", next);
                                            if (i === 0 && next.length > 0) update("text", next[0]);
                                        }} className="absolute -top-3 -right-3 h-6 w-6 rounded-full bg-background border shadow-sm">
                                            <X className="h-3 w-3" />
                                        </Button>
                                    )}
                                    <Textarea
                                        value={text}
                                        onChange={(e) => {
                                            const newVal = e.target.value;
                                            const next = [...localVariations];
                                            next[i] = newVal;
                                            setLocalVariations(next);
                                            update("textVariations", next);
                                            if (i === 0) update("text", newVal);
                                        }}
                                        className="min-h-[60px] text-xs resize-none"
                                        placeholder={t("properties.variationPlaceholder")}
                                    />
                                </div>
                            ))}
                        </div>
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Label className="text-xs">{t("properties.buttons")}</Label>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 px-2 text-xs"
                                    onClick={() => {
                                        const buttons = [...((data.buttons as unknown) as Array<Record<string, unknown>> || [])];
                                        buttons.push({
                                            label: "",
                                            value: "",
                                            type: "text",
                                        });
                                        update("buttons", buttons);
                                    }}
                                >
                                    <Plus className="mr-1 h-3 w-3" />
                                    {t("properties.add")}
                                </Button>
                            </div>
                            {((data.buttons as unknown) as Array<{ label?: string; value?: string }> || []).map((btn, i) => (
                                <div key={`button-${i}`} className="flex items-center gap-1.5">
                                    <Input
                                        value={(btn as { label: string }).label || ""}
                                        onChange={(e) => {
                                            const buttons = [...(data.buttons as unknown as Array<Record<string, unknown>>)];
                                            buttons[i] = {
                                                ...buttons[i],
                                                label: e.target.value,
                                                value: e.target.value,
                                            };
                                            update("buttons", buttons);
                                        }}
                                        className="h-7 text-xs"
                                        placeholder={t("properties.buttonLabel")}
                                    />
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-7 w-7 shrink-0"
                                        onClick={() => {
                                            const buttons = ((data.buttons as unknown) as unknown[]).filter(
                                                (_: unknown, j: number) => j !== i
                                            );
                                            update("buttons", buttons);
                                        }}
                                    >
                                        <Trash2 className="h-3 w-3 text-muted-foreground" />
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </>
                )}

                {/* Set Attribute fields */}
                {node.type === "setAttribute" && (
                    <>
                        <div className="space-y-1.5">
                            <Label className="text-xs">{t("properties.attributeKey")}</Label>
                            <Input
                                value={data.attributeKey || ""}
                                onChange={(e) =>
                                    update("attributeKey", e.target.value)
                                }
                                className="h-8 text-sm font-mono"
                                placeholder={t("properties.attributeKeyPlaceholder")}
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-xs">{t("properties.value")}</Label>
                            <Input
                                value={data.attributeValue || ""}
                                onChange={(e) =>
                                    update("attributeValue", e.target.value)
                                }
                                className="h-8 text-sm"
                                placeholder={t("properties.valuePlaceholder")}
                            />
                        </div>
                    </>
                )}

                {/* Condition fields */}
                {node.type === "condition" && (
                    <>
                        <div className="space-y-1.5">
                            <Label className="text-xs">{t("properties.attributeToCheck")}</Label>
                            <Input
                                value={data.attributeKey || ""}
                                onChange={(e) =>
                                    update("attributeKey", e.target.value)
                                }
                                className="h-8 text-sm font-mono"
                                placeholder={t("properties.attributeToCheckPlaceholder")}
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-xs">{t("properties.operator")}</Label>
                            <Select
                                value={data.operator || "equals"}
                                onValueChange={(v) => update("operator", v)}
                            >
                                <SelectTrigger className="h-8 text-sm">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="equals">{t("properties.operators.equals")}</SelectItem>
                                    <SelectItem value="notEquals">
                                        {t("properties.operators.notEquals")}
                                    </SelectItem>
                                    <SelectItem value="contains">
                                        {t("properties.operators.contains")}
                                    </SelectItem>
                                    <SelectItem value="greaterThan">
                                        {t("properties.operators.greaterThan")}
                                    </SelectItem>
                                    <SelectItem value="lessThan">
                                        {t("properties.operators.lessThan")}
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-xs">{t("properties.compareValue")}</Label>
                            <Input
                                value={data.compareValue || ""}
                                onChange={(e) =>
                                    update("compareValue", e.target.value)
                                }
                                className="h-8 text-sm"
                                placeholder={t("properties.compareValuePlaceholder")}
                            />
                        </div>
                    </>
                )}

                {/* Web Request fields */}
                {node.type === "webRequest" && (
                    <>
                        <div className="space-y-1.5">
                            <Label className="text-xs">{t("properties.httpMethod")}</Label>
                            <Select
                                value={data.method || "GET"}
                                onValueChange={(v) => update("method", v)}
                            >
                                <SelectTrigger className="h-8 text-sm">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="GET">GET</SelectItem>
                                    <SelectItem value="POST">POST</SelectItem>
                                    <SelectItem value="PUT">PUT</SelectItem>
                                    <SelectItem value="DELETE">DELETE</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-xs">{t("properties.url")}</Label>
                            <Input
                                value={data.url || ""}
                                onChange={(e) => update("url", e.target.value)}
                                className="h-8 text-sm font-mono"
                                placeholder="https://api.example.com/endpoint"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-xs">
                                {t("properties.saveResponseToVariable")}
                            </Label>
                            <Input
                                value={data.responseVariable || ""}
                                onChange={(e) =>
                                    update("responseVariable", e.target.value)
                                }
                                className="h-8 text-sm font-mono"
                                placeholder={t("properties.responseVariablePlaceholder")}
                            />
                        </div>
                    </>
                )}

                {/* AI Task fields */}
                {node.type === "aiTask" && (
                    <>
                        <div className="space-y-1.5">
                            <Label className="text-xs">{t("properties.systemPrompt")}</Label>
                            <Textarea
                                value={data.prompt || data.systemPrompt || ""}
                                onChange={(e) => {
                                    update("prompt", e.target.value);
                                    update("systemPrompt", e.target.value);
                                }}
                                className="min-h-[100px] text-sm resize-none"
                                placeholder={t("properties.systemPromptPlaceholder")}
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-xs">{t("properties.userInputVariable")}</Label>
                            <Input
                                value={data.userInput || ""}
                                onChange={(e) => update("userInput", e.target.value)}
                                className="h-8 text-sm font-mono"
                                placeholder="{{lastUserText}}"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-xs">{t("properties.model")}</Label>
                            <Input
                                value={data.model || ""}
                                onChange={(e) => update("model", e.target.value)}
                                className="h-8 text-sm font-mono"
                                placeholder={fallbackModel}
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-xs">
                                {t("properties.saveOutputToVariable")}
                            </Label>
                            <Input
                                value={data.outputVariable || ""}
                                onChange={(e) =>
                                    update("outputVariable", e.target.value)
                                }
                                className="h-8 text-sm font-mono"
                                placeholder={t("properties.outputVariablePlaceholder")}
                            />
                        </div>
                        <p className="text-[10px] text-muted-foreground">
                            {t("properties.jsonHint")}
                        </p>
                    </>
                )}

                {/* AI Assistant Node (Removed) */}
                {node.type === "ai_assistant" && (
                    <p className="text-sm text-destructive font-medium p-3 bg-destructive/10 rounded-md border border-destructive/20">
                        This block has been removed. Replace it with the Knowledge Base block.
                    </p>
                )}

                {/* Wait Node fields */}
                {node.type === "wait" && (
                    <div className="space-y-1.5">
                        <Label className="text-xs">{t("properties.delaySeconds")}</Label>
                        <Input
                            type="number"
                            value={data.delaySeconds || 1}
                            onChange={(e) => update("delaySeconds", parseInt(e.target.value) || 1)}
                            className="h-8 text-sm"
                        />
                    </div>
                )}

                {/* Operating Hours Node */}
                {node.type === "if_operating_hours" && (
                    <div className="space-y-4">
                        <div className="rounded-md border border-border bg-muted/40 p-3 text-xs text-muted-foreground leading-relaxed">
                            {t("properties.operatingHoursHint")}
                        </div>

                        <Button variant="outline" size="sm" asChild className="w-full shadow-sm h-8 mt-1">
                            <Link href="/dashboard/settings/operating-hours">
                                {t("properties.configureOperatingHours")}
                            </Link>
                        </Button>

                        <div className="space-y-2 pt-2 border-t">
                            <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">{t("properties.outputPaths")}</Label>
                            <div className="flex flex-col gap-2 pt-1">
                                <div className="inline-flex items-center rounded-md border border-emerald-500/20 bg-emerald-500/10 px-2 py-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                                    {t("properties.withinHours")}
                                </div>
                                <div className="inline-flex items-center rounded-md border border-rose-500/20 bg-rose-500/10 px-2 py-1 text-[11px] font-medium text-rose-600 dark:text-rose-400">
                                    {t("properties.outsideHours")}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Ask KB Node fields */}
                {node.type === "ask_kb" && (
                    <>
                        <div className="space-y-1.5">
                            <Label className="text-xs">{t("properties.systemPrompt")}</Label>
                            <Textarea
                                value={data.systemPrompt || ""}
                                onChange={(e) => update("systemPrompt", e.target.value)}
                                className="min-h-[80px] text-sm resize-none"
                                placeholder="You are a helpful support assistant. Answer only based on the provided context. Be concise and friendly."
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-xs">{t("properties.maxTurns")}</Label>
                            <Input
                                type="number"
                                min={1}
                                value={data.maxTurns || 1}
                                onChange={(e) => update("maxTurns", parseInt(e.target.value) || 1)}
                                className="h-8 text-sm"
                            />
                            <p className="text-[10px] text-muted-foreground">
                                {t("properties.maxTurnsHelper")}
                            </p>
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-xs">{t("properties.searchQuery")}</Label>
                            <Input
                                value={data.query || ""}
                                onChange={(e) => update("query", e.target.value)}
                                className="h-8 text-sm"
                                placeholder={t("properties.searchQueryPlaceholder")}
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-xs">{t("properties.assignResultTo")}</Label>
                            <Input
                                value={data.assignTo || ""}
                                onChange={(e) => update("assignTo", e.target.value)}
                                className="h-8 text-sm font-mono"
                                placeholder={t("properties.assignResultPlaceholder")}
                            />
                        </div>
                    </>
                )}

                {/* Apply Label Node fields */}
                {node.type === "applyLabel" && (
                    <div className="space-y-1.5">
                        <Label className="text-xs">{t("properties.labelName")}</Label>
                        <Select
                            value={data.labelName || ""}
                            onValueChange={(val) => update("labelName", val)}
                        >
                            <SelectTrigger className="h-8 text-sm">
                                <SelectValue placeholder={t("properties.selectLabel")} />
                            </SelectTrigger>
                            <SelectContent>
                                {labels.length === 0 ? (
                                    <SelectItem value="none" disabled>
                                        {t("properties.noLabels")}
                                    </SelectItem>
                                ) : (
                                    labels.map((lbl: { _id: string; name: string; color: string }) => (
                                        <SelectItem key={lbl._id} value={lbl.name}>
                                            <div className="flex items-center gap-2">
                                                <div
                                                    className="w-2.5 h-2.5 rounded-full"
                                                    style={{ backgroundColor: lbl.color }}
                                                />
                                                {lbl.name}
                                            </div>
                                        </SelectItem>
                                    ))
                                )}
                            </SelectContent>
                        </Select>
                    </div>
                )}

                {/* Capture Reply Form */}
                {node.type === "capture_user_reply" && (
                    <div className="space-y-1.5">
                        <Label className="text-xs">{t("properties.saveReplyTo")}</Label>
                        <Input
                            value={data.attribute || ""}
                            onChange={(e) => update("attribute", e.target.value)}
                            className="h-8 text-sm font-mono"
                            placeholder={t("properties.saveReplyPlaceholder")}
                        />
                    </div>
                )}

                {/* Replace Bot Node */}
                {node.type === "replace_bot" && (
                    <div className="space-y-1.5">
                        <Label className="text-xs">{t("properties.targetBotSlug")}</Label>
                        <Input
                            value={data.slug || ""}
                            onChange={(e) => update("slug", e.target.value)}
                            className="h-8 text-sm font-mono"
                            placeholder={t("properties.targetBotSlugPlaceholder")}
                        />
                    </div>
                )}

                {/* Change Dept Node */}
                {node.type === "change_department" && (
                    <div className="space-y-1.5">
                        <Label className="text-xs">{t("properties.department")}</Label>
                        <Select
                            value={data.departmentId || ""}
                            onValueChange={(val) => update("departmentId", val)}
                        >
                            <SelectTrigger className="h-8 text-sm">
                                <SelectValue placeholder={t("properties.selectDepartment")} />
                            </SelectTrigger>
                            <SelectContent>
                                {departments.length === 0 ? (
                                    <SelectItem value="none" disabled>
                                        {t("properties.noDepartments")}
                                    </SelectItem>
                                ) : (
                                    departments.map((dept: { _id: string; name: string }) => (
                                        <SelectItem key={dept._id} value={dept._id}>
                                            {dept.name}
                                        </SelectItem>
                                    ))
                                )}
                            </SelectContent>
                        </Select>
                    </div>
                )}

                {/* Code Action Node */}
                {node.type === "code_action" && (
                    <>
                        <div className="space-y-1.5">
                            <Label className="text-xs">{t("properties.jsExpression")}</Label>
                            <Textarea
                                value={data.expression || ""}
                                onChange={(e) => update("expression", e.target.value)}
                                className="min-h-[80px] text-sm font-mono resize-none"
                                placeholder={t("properties.jsExpressionPlaceholder")}
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-xs">{t("properties.assignOutputTo")}</Label>
                            <Input
                                value={data.assignTo || ""}
                                onChange={(e) => update("assignTo", e.target.value)}
                                className="h-8 text-sm font-mono"
                                placeholder={t("properties.assignOutputPlaceholder")}
                            />
                        </div>
                    </>
                )}

                {/* HITL Handoff fields */}
                {node.type === "hitlHandoff" && (
                    <div className="space-y-1.5">
                        <Label className="text-xs">{t("properties.handoffMessage")}</Label>
                        <Textarea
                            value={data.handoffMessage || ""}
                            onChange={(e) =>
                                update("handoffMessage", e.target.value)
                            }
                            className="min-h-[60px] text-sm resize-none"
                            placeholder={t("properties.handoffMessagePlaceholder")}
                        />
                    </div>
                )}

                {/* Close fields */}
                {node.type === "close" && (
                    <div className="space-y-1.5">
                        <Label className="text-xs">{t("properties.closingMessage")}</Label>
                        <Textarea
                            value={data.closingMessage || ""}
                            onChange={(e) =>
                                update("closingMessage", e.target.value)
                            }
                            className="min-h-[60px] text-sm resize-none"
                            placeholder={t("properties.closingMessagePlaceholder")}
                        />
                    </div>
                )}

                {/* Set Priority Node fields */}
                {node.type === "setPriority" && (
                    <div className="space-y-1.5">
                        <Label className="text-xs">{t("properties.conversationPriority")}</Label>
                        <Select
                            value={data.priority || "normal"}
                            onValueChange={(val) => update("priority", val)}
                        >
                            <SelectTrigger className="h-8 text-sm">
                                <SelectValue placeholder={t("properties.selectPriority")} />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="low">{t("properties.priorities.low")}</SelectItem>
                                <SelectItem value="normal">{t("properties.priorities.normal")}</SelectItem>
                                <SelectItem value="high">{t("properties.priorities.high")}</SelectItem>
                                <SelectItem value="urgent">{t("properties.priorities.urgent")}</SelectItem>
                            </SelectContent>
                        </Select>
                        <p className="text-[10px] text-muted-foreground pt-1 italic">
                            {t("properties.priorityHint")}
                        </p>
                    </div>
                )}
            </div>

            {/* Footer — delete */}
            {node.type !== "start" && (
                <div className="border-t p-3">
                    <Button
                        variant="ghost"
                        size="sm"
                        className="w-full text-destructive hover:bg-destructive/10 hover:text-destructive"
                        onClick={() => onDeleteNode(node.id)}
                    >
                        <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                        {t("properties.deleteBlock")}
                    </Button>
                </div>
            )}
        </div>
    );
}

export function NodePropertiesPanel(props: NodePropertiesPanelProps) {
    return (
        <Suspense fallback={null}>
            <NodePropertiesPanelContent {...props} />
        </Suspense>
    );
}
