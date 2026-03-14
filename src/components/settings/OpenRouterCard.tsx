"use client"

import { useState, useCallback } from "react"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { useQuery, useMutation, useAction } from "convex/react"
import { api } from "../../../convex/_generated/api"
import { toast } from "sonner"
import { Loader2, Trash2, Zap, CheckCircle2, XCircle, Shield } from "lucide-react"
import { cn } from "@/lib/utils"

export function OpenRouterCard() {
    const status = useQuery(api.openrouter_api.getOpenRouterKeyStatus)
    const saveKey = useMutation(api.openrouter_api.saveOpenRouterKey)
    const clearKey = useMutation(api.openrouter_api.clearOpenRouterKey)
    const testKey = useAction(api.openrouter_api.testOpenRouterKey)

    const [apiKey, setApiKey] = useState("")
    const [saving, setSaving] = useState(false)
    const [testing, setTesting] = useState(false)
    const [removing, setRemoving] = useState(false)
    const [testResult, setTestResult] = useState<{
        ok: boolean
        error?: string
    } | null>(null)

    const hasKey = status?.hasKey ?? false
    const maskedKey = status?.maskedKey

    const handleSave = useCallback(async () => {
        const trimmed = apiKey.trim()
        if (!trimmed) {
            toast.error("Please enter an API key")
            return
        }
        setSaving(true)
        try {
            await saveKey({ key: trimmed })
            setApiKey("")
            setTestResult(null)
            toast.success("OpenRouter API key saved")
        } catch (err: unknown) {
            const message =
                err instanceof Error ? err.message : "Failed to save API key"
            toast.error(message)
        } finally {
            setSaving(false)
        }
    }, [apiKey, saveKey])

    const handleTest = useCallback(async () => {
        setTesting(true)
        setTestResult(null)
        try {
            const result = await testKey()
            setTestResult(result)
            if (result.ok) {
                toast.success("Connection successful")
            } else {
                toast.error(result.error ?? "Connection failed")
            }
        } catch (err: unknown) {
            const message =
                err instanceof Error ? err.message : "Connection test failed"
            setTestResult({ ok: false, error: message })
            toast.error(message)
        } finally {
            setTesting(false)
        }
    }, [testKey])

    const handleRemove = useCallback(async () => {
        setRemoving(true)
        try {
            await clearKey()
            setTestResult(null)
            toast.success("OpenRouter API key removed")
        } catch (err: unknown) {
            const message =
                err instanceof Error ? err.message : "Failed to remove API key"
            toast.error(message)
        } finally {
            setRemoving(false)
        }
    }, [clearKey])

    // Loading state while status query resolves
    if (status === undefined) {
        return (
            <Card className="p-4">
                <div className="flex items-center gap-3">
                    <span className="inline-flex items-center justify-center h-10 w-10 rounded-lg bg-pink-100 text-pink-700">
                        <Zap className="h-5 w-5" />
                    </span>
                    <div className="flex-1 space-y-1.5">
                        <div className="h-4 w-24 bg-muted animate-pulse rounded" />
                        <div className="h-3 w-48 bg-muted animate-pulse rounded" />
                    </div>
                </div>
            </Card>
        )
    }

    return (
        <Card className="p-4 transition-shadow hover:shadow-md">
            <div className="flex items-start gap-3">
                <span className="inline-flex items-center justify-center h-10 w-10 rounded-lg bg-pink-100 text-pink-700 shrink-0">
                    <Zap className="h-5 w-5" />
                </span>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                        <p className="text-sm font-medium">OpenRouter</p>
                        {hasKey && testResult?.ok && (
                            <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-100 gap-1">
                                <CheckCircle2 className="h-3 w-3" />
                                Connected
                            </Badge>
                        )}
                        {hasKey && testResult && !testResult.ok && (
                            <Badge
                                variant="destructive"
                                className="gap-1 max-w-[200px] truncate"
                                title={testResult.error}
                            >
                                <XCircle className="h-3 w-3 shrink-0" />
                                <span className="truncate">
                                    {testResult.error ?? "Connection failed"}
                                </span>
                            </Badge>
                        )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                        Unified API for 100+ AI models
                    </p>

                    {/* ── STATE A: No key saved ── */}
                    {!hasKey && (
                        <div className="mt-3 space-y-3">
                            <div className="space-y-1.5">
                                <Label
                                    htmlFor="openrouter-key"
                                    className="text-xs font-medium"
                                >
                                    API Key
                                </Label>
                                <div className="flex gap-2">
                                    <Input
                                        id="openrouter-key"
                                        type="password"
                                        placeholder="sk-or-..."
                                        value={apiKey}
                                        onChange={(e) =>
                                            setApiKey(e.target.value)
                                        }
                                        disabled={saving}
                                        className="h-9 text-sm font-mono"
                                        onKeyDown={(e) => {
                                            if (e.key === "Enter") handleSave()
                                        }}
                                    />
                                    <Button
                                        size="sm"
                                        onClick={handleSave}
                                        disabled={saving || !apiKey.trim()}
                                        className="h-9 px-4 shrink-0 cursor-pointer"
                                    >
                                        {saving ? (
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                        ) : (
                                            "Save"
                                        )}
                                    </Button>
                                </div>
                            </div>
                            <div className="flex items-start gap-1.5 text-xs text-muted-foreground">
                                <Shield className="h-3.5 w-3.5 shrink-0 mt-0.5 text-muted-foreground/70" />
                                <span>
                                    Your key is encrypted and stored securely.
                                    Used for all bot LLM calls in this
                                    workspace.
                                </span>
                            </div>
                        </div>
                    )}

                    {/* ── STATE B: Key saved ── */}
                    {hasKey && (
                        <div className="mt-3 space-y-3">
                            <div className="flex items-center gap-2">
                                <code
                                    className={cn(
                                        "text-sm font-mono px-2.5 py-1 rounded-md",
                                        "bg-muted/60 text-foreground/80 tracking-wide select-all"
                                    )}
                                >
                                    {maskedKey}
                                </code>
                            </div>
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleTest}
                                    disabled={testing || removing}
                                    className="h-8 cursor-pointer"
                                >
                                    {testing ? (
                                        <>
                                            <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                                            Testing…
                                        </>
                                    ) : (
                                        <>
                                            <Zap className="mr-1.5 h-3.5 w-3.5" />
                                            Test
                                        </>
                                    )}
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={handleRemove}
                                    disabled={removing || testing}
                                    className="h-8 text-destructive hover:text-destructive hover:bg-destructive/10 cursor-pointer"
                                >
                                    {removing ? (
                                        <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                                    ) : (
                                        <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                                    )}
                                    Remove
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </Card>
    )
}
