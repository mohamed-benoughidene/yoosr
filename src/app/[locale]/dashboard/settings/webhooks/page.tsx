"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../../../convex/_generated/api";
import { useProject } from "@/context/ProjectContext";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, Plus, Trash2, Webhook, Check, Copy, AlertTriangle, CheckCircle2 } from "lucide-react";
import { Id } from "../../../../../../convex/_generated/dataModel";
import { Checkbox } from "@/components/ui/checkbox";

const AVAILABLE_EVENTS = [
    "message.create",
    "conversation.opened",
    "conversation.closed",
    "contact.created",
    "agent.assigned",
    "request.close",
];


export default function WebhooksPage() {
    const t = useTranslations("settings.webhooks");
    const { activeProject } = useProject();
    const isAdmin = activeProject?.userRole === "org:admin";
    const [url, setUrl] = useState("");
    const [selectedEvents, setSelectedEvents] = useState<string[]>(AVAILABLE_EVENTS);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [webhookPendingDelete, setWebhookPendingDelete] = useState<Id<"webhook_subscriptions"> | null>(null);
    const [newWebhookSecret, setNewWebhookSecret] = useState<string | null>(null);
    const [copiedSecret, setCopiedSecret] = useState(false);

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
            const newWebhook = await createWebhook({
                projectId: activeProject._id,
                url,
                events: selectedEvents,
            });
            setUrl("");
            setSelectedEvents(AVAILABLE_EVENTS);
            if (newWebhook) {
                setNewWebhookSecret(newWebhook.secret);
            }
            setCopiedSecret(false);
            toast.success(t("webhook_created"));
        } catch (error: any) {
            const errorMessage = error.data?.message || error.message || t("webhook_create_failed");
            toast.error(errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!activeProject) {
        return <div className="text-muted-foreground p-4">{t("loading")}</div>;
    }

    return (
        <>
            <div className="space-y-6">
                <div>
                    <h3 className="text-lg font-medium">{t("title")}</h3>
                    <p className="text-sm text-muted-foreground">
                        {t("description")}
                    </p>
                </div>

                {isAdmin && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base flex items-center gap-2">
                                <Webhook className="h-5 w-5 text-muted-foreground" />
                                {t("add_endpoint")}
                            </CardTitle>
                            <CardDescription>
                                {t("add_endpoint_desc")}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleCreate} className="space-y-6">
                                <div className="flex items-end gap-4">
                                    <div className="flex-1 space-y-2">
                                        <Label htmlFor="url">{t("endpoint_url")}</Label>
                                        <Input
                                            id="url"
                                            placeholder="https://api.yourdomain.com/webhooks"
                                            type="url"
                                            value={url}
                                            onChange={(e) => setUrl(e.target.value)}
                                            required
                                            className="bg-muted/30"
                                        />
                                    </div>
                                    <Button type="submit" disabled={isSubmitting || !url || selectedEvents.length === 0}>
                                        {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
                                        {t("add_webhook_btn")}
                                    </Button>
                                </div>

                                <div className="space-y-3">
                                    <Label className="text-sm font-medium">{t("select_events")}</Label>
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 border rounded-lg p-4 bg-muted/20">
                                        {AVAILABLE_EVENTS.map((event) => (
                                            <div key={event} className="flex items-center space-x-2 group">
                                                <Checkbox
                                                    id={`event-${event}`}
                                                    checked={selectedEvents.includes(event)}
                                                    onCheckedChange={(checked) => {
                                                        if (checked) {
                                                            setSelectedEvents([...selectedEvents, event]);
                                                        } else {
                                                            setSelectedEvents(selectedEvents.filter((e) => e !== event));
                                                        }
                                                    }}
                                                    className="border-primary/50 data-[state=checked]:bg-primary"
                                                />
                                                <label
                                                    htmlFor={`event-${event}`}
                                                    className="text-xs font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer select-none group-hover:text-primary transition-colors"
                                                >
                                                    {event}
                                                </label>
                                            </div>
                                        ))}
                                    </div>
                                    {selectedEvents.length === 0 && (
                                        <p className="text-[10px] text-destructive flex items-center gap-1">
                                            <Check className="h-3 w-3 rotate-45" /> {t("select_one_event")}
                                        </p>
                                    )}
                                </div>
                            </form>

                            {newWebhookSecret && (
                                <Alert className="mt-6 border-amber-500/50 bg-amber-500/10 text-amber-900 dark:text-amber-200">
                                    <AlertTriangle className="h-4 w-4 stroke-amber-600 dark:stroke-amber-400" />
                                    <AlertTitle className="text-amber-800 dark:text-amber-300">
                                        {t("save_secret_title")}
                                    </AlertTitle>
                                    <AlertDescription className="space-y-3">
                                        <p className="text-xs opacity-90">
                                            {t("save_secret_desc")}
                                        </p>
                                        <div className="flex items-center gap-2">
                                            <code className="relative rounded bg-background/50 px-[0.3rem] py-[0.2rem] font-mono text-sm border border-amber-500/20 select-all">
                                                {newWebhookSecret}
                                            </code>
                                            <Button
                                                variant="outline"
                                                size="icon"
                                                className="h-8 w-8 bg-background/50 border-amber-500/20 hover:bg-amber-500/20"
                                                onClick={() => {
                                                    navigator.clipboard.writeText(newWebhookSecret);
                                                    setCopiedSecret(true);
                                                    setTimeout(() => setCopiedSecret(false), 2000);
                                                    toast.success(t("secret_copied"));
                                                }}
                                            >
                                                {copiedSecret ? <CheckCircle2 className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                                            </Button>
                                        </div>
                                        <Button
                                            size="sm"
                                            className="w-full bg-amber-600 hover:bg-amber-700 text-white dark:bg-amber-500 dark:hover:bg-amber-600"
                                            onClick={() => setNewWebhookSecret(null)}
                                        >
                                            {t("saved_secret_btn")}
                                        </Button>
                                    </AlertDescription>
                                </Alert>
                            )}
                        </CardContent>
                    </Card>
                )}

                <h4 className="font-medium text-sm pt-4">{t("active_subscriptions")}</h4>

                <div className="border rounded-md">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>{t("table_target_url")}</TableHead>
                                <TableHead>{t("table_events")}</TableHead>
                                <TableHead>{t("table_status")}</TableHead>
                                <TableHead className="text-right">{t("table_actions")}</TableHead>
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
                                        {t("no_webhooks")}
                                    </TableCell>
                                </TableRow>
                            ) : (
                                subscriptions.map((sub: any) => (
                                    <TableRow key={sub._id}>
                                        <TableCell className="font-medium">{sub.url}</TableCell>
                                        <TableCell>
                                            <div className="flex flex-wrap gap-1.5 max-w-[300px]">
                                                {sub.events.map((ev: string) => (
                                                    <Badge
                                                        variant="secondary"
                                                        key={ev}
                                                        className="text-[10px] font-mono px-2 py-0.5 bg-primary/10 text-primary border-primary/20 hover:bg-primary/20 transition-colors cursor-default"
                                                    >
                                                        {ev}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center space-x-2">
                                                <Switch
                                                    checked={sub.isActive}
                                                    onCheckedChange={async (checked) => {
                                                        try {
                                                            await updateWebhook({ id: sub._id, isActive: checked });
                                                            toast.success(checked ? t("webhook_activated") : t("webhook_paused"));
                                                        } catch (error: any) {
                                                            const errorMessage = error.data?.message || error.message || t("webhook_update_failed");
                                                            toast.error(errorMessage);
                                                        }
                                                    }}
                                                />
                                                <span className="text-xs text-muted-foreground">
                                                    {sub.isActive ? t("status_active") : t("status_paused")}
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            {isAdmin && (
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => setWebhookPendingDelete(sub._id)}
                                                    className="text-destructive hover:bg-destructive/10"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>

            {/* Delete Webhook Confirmation */}
            <AlertDialog open={webhookPendingDelete !== null} onOpenChange={(open) => { if (!open) setWebhookPendingDelete(null) }}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>{t("delete_dialog_title")}</AlertDialogTitle>
                        <AlertDialogDescription>
                            {t("delete_dialog_desc")}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
                        <AlertDialogAction
                            className="bg-destructive text-white hover:bg-destructive/90"
                            onClick={async () => {
                                if (webhookPendingDelete) {
                                    try {
                                        await removeWebhook({ id: webhookPendingDelete });
                                        toast.success(t("webhook_deleted"));
                                        setWebhookPendingDelete(null);
                                    } catch (error: any) {
                                        const errorMessage = error.data?.message || error.message || t("webhook_delete_failed");
                                        toast.error(errorMessage);
                                    }
                                }
                            }}
                        >
                            {t("delete_btn")}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
