"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { useProject } from "@/context/ProjectContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Loader2, Plus, Trash2, Webhook } from "lucide-react";

export default function WebhooksPage() {
    const { activeProject } = useProject();
    const [url, setUrl] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const subscriptions = useQuery(
        api.webhooks.list,
        activeProject ? { projectId: activeProject._id } : "skip"
    );

    const createWebhook = useMutation(api.webhooks.create);
    const updateWebhook = useMutation(api.webhooks.update);
    const removeWebhook = useMutation(api.webhooks.remove);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!activeProject || !url) return;

        setIsSubmitting(true);
        try {
            await createWebhook({
                projectId: activeProject._id,
                url,
                events: ["message.create", "request.close"], // Simplified to global events for now
            });
            setUrl("");
        } catch (error) {
            console.error("Failed to create webhook", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!activeProject) {
        return <div className="text-muted-foreground p-4">Loading active project...</div>;
    }

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-medium">Webhooks & RestHooks</h3>
                <p className="text-sm text-muted-foreground">
                    Subscribe external HTTP endpoints to real-time events in your project.
                </p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                        <Webhook className="h-5 w-5 text-muted-foreground" />
                        Add New Endpoint
                    </CardTitle>
                    <CardDescription>
                        We will send HTTP POST payloads to this URL when important things happen.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleCreate} className="flex items-end gap-4">
                        <div className="flex-1 space-y-2">
                            <Label htmlFor="url">Endpoint URL</Label>
                            <Input
                                id="url"
                                placeholder="https://api.yourdomain.com/webhooks"
                                type="url"
                                value={url}
                                onChange={(e) => setUrl(e.target.value)}
                                required
                            />
                        </div>
                        <Button type="submit" disabled={isSubmitting || !url}>
                            {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
                            Add Webhook
                        </Button>
                    </form>
                </CardContent>
            </Card>

            <h4 className="font-medium text-sm pt-4">Active Subscriptions</h4>

            <div className="border rounded-md">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Target URL</TableHead>
                            <TableHead>Events</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {subscriptions === undefined ? (
                            <TableRow>
                                <TableCell colSpan={4} className="h-24 text-center">
                                    <Loader2 className="mx-auto h-5 w-5 animate-spin text-muted-foreground" />
                                </TableCell>
                            </TableRow>
                        ) : subscriptions.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                                    No webhooks registered yet.
                                </TableCell>
                            </TableRow>
                        ) : (
                            subscriptions.map((sub: any) => (
                                <TableRow key={sub._id}>
                                    <TableCell className="font-medium">{sub.url}</TableCell>
                                    <TableCell>
                                        <div className="flex flex-wrap gap-1">
                                            {sub.events.map((ev: string) => (
                                                <Badge variant="outline" key={ev}>{ev}</Badge>
                                            ))}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center space-x-2">
                                            <Switch
                                                checked={sub.isActive}
                                                onCheckedChange={(checked) =>
                                                    updateWebhook({ id: sub._id, isActive: checked })
                                                }
                                            />
                                            <span className="text-xs text-muted-foreground">
                                                {sub.isActive ? "Active" : "Paused"}
                                            </span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => removeWebhook({ id: sub._id })}
                                            className="text-destructive hover:bg-destructive/10"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
