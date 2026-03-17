"use client";

import { useState, useEffect } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { Loader2, Play, Terminal, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";

interface DebuggerPanelProps {
    projectId: string | null;
    botId: string;
    onActiveNodeChange: (nodeId: string | null) => void;
    onClose: () => void;
}

export function DebuggerPanel({ projectId, botId, onActiveNodeChange, onClose }: DebuggerPanelProps) {
    const t = useTranslations("designStudio");
    // We get the most recently active conversation for this project
    const recentConversations = useQuery(
        api.conversations.list,
        projectId ? { projectId: projectId as Id<"projects"> } : "skip"
    );

    // Find the most recent conversation involving this bot
    const activeConv = recentConversations?.find((c: any) =>
        c.botId === botId || (c.participants && c.participants.includes(botId))
    );

    // Fetch the real-time execution log from the dedicated bot state table
    const botState = useQuery(
        api.conversations.getBotState,
        activeConv ? { conversationId: activeConv._id } : "skip"
    );

    const executionLog = botState?.executionLog || [];

    // Auto-update highlight to the latest block executed
    useEffect(() => {
        if (executionLog.length > 0) {
            const latestNode = executionLog[executionLog.length - 1];
            onActiveNodeChange(latestNode.nodeId);
        } else {
            onActiveNodeChange(null);
        }
    }, [executionLog, onActiveNodeChange]);

    return (
        <Card className="absolute right-4 top-4 z-50 w-80 shadow-2xl border-primary/20 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
            <CardHeader className="flex flex-row items-center justify-between py-3 border-b">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <Terminal className="h-4 w-4" />
                    {t("debugger.title")}
                </CardTitle>
                <div className="flex items-center gap-1">
                    {activeConv ? (
                        <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse mr-2" />
                    ) : (
                        <span className="flex h-2 w-2 rounded-full bg-muted mr-2" />
                    )}
                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onClose}>
                        <X className="h-4 w-4" />
                    </Button>
                </div>
            </CardHeader>
            <CardContent className="p-0">
                <ScrollArea className="h-80 w-full p-4">
                    {recentConversations === undefined ? (
                        <div className="flex justify-center py-8">
                            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                        </div>
                    ) : executionLog.length === 0 ? (
                        <div className="text-sm text-muted-foreground text-center py-8">
                            {t("debugger.empty")}
                            <br />
                            <br />
                            {t("debugger.hint")}
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {executionLog.map((log: any, i: number) => (
                                <div key={i} className="text-xs space-y-1">
                                    <div className="flex justify-between items-center text-muted-foreground">
                                        <span className="font-mono">{new Date(log.timestamp).toLocaleTimeString()}</span>
                                        <span className="uppercase text-[10px] font-bold tracking-wider">{log.action}</span>
                                    </div>
                                    <div
                                        className="bg-muted px-2 py-1.5 rounded-md font-mono flex items-center gap-2 cursor-pointer hover:bg-muted/80 transition-colors"
                                        onClick={() => onActiveNodeChange(log.nodeId)}
                                    >
                                        <Play className="h-3 w-3 text-emerald-500" />
                                        <span>{t("debugger.nodeId")}{log.nodeId}</span>
                                    </div>
                                    <div className="text-[10px] text-muted-foreground ml-5">
                                        {t("debugger.type")}<span className="text-foreground">{log.type}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </ScrollArea>
            </CardContent>
        </Card>
    );
}
