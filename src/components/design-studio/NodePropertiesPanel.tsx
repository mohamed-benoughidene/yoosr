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
import { useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";

interface NodePropertiesPanelProps {
    node: Node | null;
    onUpdateNode: (nodeId: string, data: Record<string, unknown>) => void;
    onClose: () => void;
    onDeleteNode: (nodeId: string) => void;
}

export function NodePropertiesPanel({
    node,
    onUpdateNode,
    onClose,
    onDeleteNode,
}: NodePropertiesPanelProps) {
    const searchParams = useSearchParams();
    const projectId = searchParams.get("project") as Id<"projects"> | null;
    const departments = useQuery(api.settings.listDepartments, projectId ? { projectId } : "skip") || [];

    if (!node) return null;

    const data = node.data as Record<string, any>;

    const update = useCallback(
        (key: string, value: unknown) => {
            onUpdateNode(node.id, { ...data, [key]: value });
        },
        [node.id, data, onUpdateNode]
    );

    return (
        <div className="flex h-full w-80 flex-col border-l bg-background">
            {/* Header */}
            <div className="flex items-center justify-between border-b px-4 py-3">
                <div>
                    <h3 className="text-sm font-semibold">{data.label || node.type}</h3>
                    <p className="text-[10px] text-muted-foreground capitalize">
                        {node.type} block
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
                    <Label className="text-xs">Label</Label>
                    <Input
                        value={data.label || ""}
                        onChange={(e) => update("label", e.target.value)}
                        className="h-8 text-sm"
                        placeholder="Block name"
                    />
                </div>

                {/* Reply node fields */}
                {node.type === "reply" && (
                    <>
                        <div className="space-y-2">
                            <div className="flex items-center justify-between pointer-events-auto">
                                <Label className="text-xs">Message Variations</Label>
                                <Button variant="ghost" size="sm" onClick={() => {
                                    const textVariations = [...(data.textVariations || (data.text ? [data.text] : [""]))];
                                    if (!data.textVariations && !data.text) textVariations[0] = "";
                                    textVariations.push("");
                                    update("textVariations", textVariations);
                                }} className="h-6 px-2 text-xs">
                                    <Plus className="mr-1 h-3 w-3" /> Add Variation
                                </Button>
                            </div>
                            {(data.textVariations || (data.text ? [data.text] : [""])).map((text: string, i: number) => (
                                <div key={i} className="flex flex-col gap-1 relative border p-2 rounded-md bg-muted/30 pointer-events-auto">
                                    {((data.textVariations || [data.text]).length > 1) && (
                                        <Button variant="ghost" size="icon" onClick={() => {
                                            const textVariations = [...(data.textVariations || [data.text])];
                                            textVariations.splice(i, 1);
                                            update("textVariations", textVariations);
                                            if (i === 0 && textVariations.length > 0) update("text", textVariations[0]);
                                        }} className="absolute -top-3 -right-3 h-6 w-6 rounded-full bg-background border shadow-sm">
                                            <X className="h-3 w-3" />
                                        </Button>
                                    )}
                                    <Textarea
                                        value={text}
                                        onChange={(e) => {
                                            const textVariations = [...(data.textVariations || (data.text ? [data.text] : [""]))];
                                            textVariations[i] = e.target.value;
                                            update("textVariations", textVariations);
                                            if (i === 0) update("text", e.target.value);
                                        }}
                                        className="min-h-[60px] text-xs resize-none"
                                        placeholder="Message variation..."
                                    />
                                </div>
                            ))}
                        </div>
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Label className="text-xs">Buttons</Label>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 px-2 text-xs"
                                    onClick={() => {
                                        const buttons = [...(data.buttons || [])];
                                        buttons.push({
                                            label: "",
                                            value: "",
                                            type: "text",
                                        });
                                        update("buttons", buttons);
                                    }}
                                >
                                    <Plus className="mr-1 h-3 w-3" />
                                    Add
                                </Button>
                            </div>
                            {(data.buttons || []).map((btn: any, i: number) => (
                                <div key={i} className="flex items-center gap-1.5">
                                    <Input
                                        value={btn.label}
                                        onChange={(e) => {
                                            const buttons = [...data.buttons];
                                            buttons[i] = {
                                                ...buttons[i],
                                                label: e.target.value,
                                                value: e.target.value,
                                            };
                                            update("buttons", buttons);
                                        }}
                                        className="h-7 text-xs"
                                        placeholder="Button label"
                                    />
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-7 w-7 shrink-0"
                                        onClick={() => {
                                            const buttons = data.buttons.filter(
                                                (_: any, j: number) => j !== i
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
                            <Label className="text-xs">Attribute key</Label>
                            <Input
                                value={data.attributeKey || ""}
                                onChange={(e) =>
                                    update("attributeKey", e.target.value)
                                }
                                className="h-8 text-sm font-mono"
                                placeholder="e.g., user_email"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-xs">Value</Label>
                            <Input
                                value={data.attributeValue || ""}
                                onChange={(e) =>
                                    update("attributeValue", e.target.value)
                                }
                                className="h-8 text-sm"
                                placeholder="e.g., {{email}} or a static value"
                            />
                        </div>
                    </>
                )}

                {/* Condition fields */}
                {node.type === "condition" && (
                    <>
                        <div className="space-y-1.5">
                            <Label className="text-xs">Attribute to check</Label>
                            <Input
                                value={data.attributeKey || ""}
                                onChange={(e) =>
                                    update("attributeKey", e.target.value)
                                }
                                className="h-8 text-sm font-mono"
                                placeholder="e.g., lead_score"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-xs">Operator</Label>
                            <Select
                                value={data.operator || "equals"}
                                onValueChange={(v) => update("operator", v)}
                            >
                                <SelectTrigger className="h-8 text-sm">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="equals">Equals</SelectItem>
                                    <SelectItem value="notEquals">
                                        Not Equals
                                    </SelectItem>
                                    <SelectItem value="contains">
                                        Contains
                                    </SelectItem>
                                    <SelectItem value="greaterThan">
                                        Greater Than
                                    </SelectItem>
                                    <SelectItem value="lessThan">
                                        Less Than
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-xs">Compare value</Label>
                            <Input
                                value={data.compareValue || ""}
                                onChange={(e) =>
                                    update("compareValue", e.target.value)
                                }
                                className="h-8 text-sm"
                                placeholder="Value to compare against"
                            />
                        </div>
                    </>
                )}

                {/* Web Request fields */}
                {node.type === "webRequest" && (
                    <>
                        <div className="space-y-1.5">
                            <Label className="text-xs">HTTP Method</Label>
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
                            <Label className="text-xs">URL</Label>
                            <Input
                                value={data.url || ""}
                                onChange={(e) => update("url", e.target.value)}
                                className="h-8 text-sm font-mono"
                                placeholder="https://api.example.com/endpoint"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-xs">
                                Save response to variable
                            </Label>
                            <Input
                                value={data.responseVariable || ""}
                                onChange={(e) =>
                                    update("responseVariable", e.target.value)
                                }
                                className="h-8 text-sm font-mono"
                                placeholder="e.g., api_response"
                            />
                        </div>
                    </>
                )}

                {/* AI Task fields */}
                {node.type === "aiTask" && (
                    <>
                        <div className="space-y-1.5">
                            <Label className="text-xs">System Prompt</Label>
                            <Textarea
                                value={data.prompt || data.systemPrompt || ""}
                                onChange={(e) => {
                                    update("prompt", e.target.value);
                                    update("systemPrompt", e.target.value);
                                }}
                                className="min-h-[100px] text-sm resize-none"
                                placeholder="Enter system prompt... Use {{variable}} for context"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-xs">User Input Variable</Label>
                            <Input
                                value={data.userInput || ""}
                                onChange={(e) => update("userInput", e.target.value)}
                                className="h-8 text-sm font-mono"
                                placeholder="{{lastUserText}}"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-xs">Model</Label>
                            <Input
                                value={data.model || ""}
                                onChange={(e) => update("model", e.target.value)}
                                className="h-8 text-sm font-mono"
                                placeholder="mistralai/mistral-7b-instruct"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-xs">
                                Save output to variable
                            </Label>
                            <Input
                                value={data.outputVariable || ""}
                                onChange={(e) =>
                                    update("outputVariable", e.target.value)
                                }
                                className="h-8 text-sm font-mono"
                                placeholder="e.g., gpt_reply"
                            />
                        </div>
                        <p className="text-[10px] text-muted-foreground">
                            If the LLM returns valid JSON, keys are auto-mapped to context attributes.
                        </p>
                    </>
                )}

                {/* AI Assistant Node */}
                {node.type === "ai_assistant" && (
                    <>
                        <div className="space-y-1.5">
                            <Label className="text-xs">System Prompt</Label>
                            <Textarea
                                value={data.systemPrompt || ""}
                                onChange={(e) => update("systemPrompt", e.target.value)}
                                className="min-h-[120px] text-sm resize-none"
                                placeholder="Define your AI assistant persona and guardrails..."
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-xs">Model</Label>
                            <Input
                                value={data.model || ""}
                                onChange={(e) => update("model", e.target.value)}
                                className="h-8 text-sm font-mono"
                                placeholder="meta-llama/llama-3.1-8b-instruct"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-xs">Max Turns</Label>
                            <Input
                                type="number"
                                value={data.maxTurns || 3}
                                onChange={(e) => update("maxTurns", parseInt(e.target.value) || 3)}
                                className="h-8 text-sm"
                                min={1}
                                max={10}
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-xs">
                                Save final reply to variable
                            </Label>
                            <Input
                                value={data.assignTo || ""}
                                onChange={(e) => update("assignTo", e.target.value)}
                                className="h-8 text-sm font-mono"
                                placeholder="e.g., assistant_reply"
                            />
                        </div>
                        <p className="text-[10px] text-muted-foreground">
                            Suspends flow and gives full control to the LLM for multi-turn reasoning.
                        </p>
                    </>
                )}

                {/* Wait Node fields */}
                {node.type === "wait" && (
                    <div className="space-y-1.5">
                        <Label className="text-xs">Delay in Seconds</Label>
                        <Input
                            type="number"
                            value={data.delaySeconds || 1}
                            onChange={(e) => update("delaySeconds", parseInt(e.target.value) || 1)}
                            className="h-8 text-sm"
                        />
                    </div>
                )}

                {/* Ask KB Node fields */}
                {node.type === "ask_kb" && (
                    <>
                        <div className="space-y-1.5">
                            <Label className="text-xs">Search Query</Label>
                            <Input
                                value={data.query || ""}
                                onChange={(e) => update("query", e.target.value)}
                                className="h-8 text-sm"
                                placeholder="e.g. {{user_message}}"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-xs">Assign Result To Variable</Label>
                            <Input
                                value={data.assignTo || ""}
                                onChange={(e) => update("assignTo", e.target.value)}
                                className="h-8 text-sm font-mono"
                                placeholder="e.g. kb_reply"
                            />
                        </div>
                    </>
                )}

                {/* Capture Reply Form */}
                {node.type === "capture_user_reply" && (
                    <div className="space-y-1.5">
                        <Label className="text-xs">Save reply to attribute</Label>
                        <Input
                            value={data.attribute || ""}
                            onChange={(e) => update("attribute", e.target.value)}
                            className="h-8 text-sm font-mono"
                            placeholder="e.g. email_address"
                        />
                    </div>
                )}

                {/* Replace Bot Node */}
                {node.type === "replace_bot" && (
                    <div className="space-y-1.5">
                        <Label className="text-xs">Target Bot Slug</Label>
                        <Input
                            value={data.slug || ""}
                            onChange={(e) => update("slug", e.target.value)}
                            className="h-8 text-sm font-mono"
                            placeholder="e.g. tech_support_bot"
                        />
                    </div>
                )}

                {/* Change Dept Node */}
                {node.type === "change_department" && (
                    <div className="space-y-1.5">
                        <Label className="text-xs">Department</Label>
                        <Select
                            value={data.departmentId || ""}
                            onValueChange={(val) => update("departmentId", val)}
                        >
                            <SelectTrigger className="h-8 text-sm">
                                <SelectValue placeholder="Select a department" />
                            </SelectTrigger>
                            <SelectContent>
                                {departments.length === 0 ? (
                                    <SelectItem value="none" disabled>
                                        No departments found
                                    </SelectItem>
                                ) : (
                                    departments.map((dept: any) => (
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
                            <Label className="text-xs">JS Expression</Label>
                            <Textarea
                                value={data.expression || ""}
                                onChange={(e) => update("expression", e.target.value)}
                                className="min-h-[80px] text-sm font-mono resize-none"
                                placeholder="e.g. price * 0.9 + shipping"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-xs">Assign output to variable</Label>
                            <Input
                                value={data.assignTo || ""}
                                onChange={(e) => update("assignTo", e.target.value)}
                                className="h-8 text-sm font-mono"
                                placeholder="e.g. code_result"
                            />
                        </div>
                    </>
                )}

                {/* HITL Handoff fields */}
                {node.type === "hitlHandoff" && (
                    <div className="space-y-1.5">
                        <Label className="text-xs">Handoff message</Label>
                        <Textarea
                            value={data.handoffMessage || ""}
                            onChange={(e) =>
                                update("handoffMessage", e.target.value)
                            }
                            className="min-h-[60px] text-sm resize-none"
                            placeholder="Message shown when handing off to agent"
                        />
                    </div>
                )}

                {/* Close fields */}
                {node.type === "close" && (
                    <div className="space-y-1.5">
                        <Label className="text-xs">Closing message</Label>
                        <Textarea
                            value={data.closingMessage || ""}
                            onChange={(e) =>
                                update("closingMessage", e.target.value)
                            }
                            className="min-h-[60px] text-sm resize-none"
                            placeholder="Message shown when conversation closes"
                        />
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
                        Delete block
                    </Button>
                </div>
            )}
        </div>
    );
}
