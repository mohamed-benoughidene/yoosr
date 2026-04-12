"use client"

import { useState } from "react"
import { useProject } from "@/context/ProjectContext"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { useTranslations } from "next-intl"
import { Copy, RefreshCw, Eye, Code } from "lucide-react"

export default function TestWidgetPage() {
    const { activeProject, isLoading } = useProject()
    const t = useTranslations("testWidget")
    const [iframeKey, setIframeKey] = useState(0)
    // Initialize baseUrl once on client side
    const [baseUrl] = useState(() =>
        typeof window !== "undefined" ? window.location.origin : ""
    )

    if (isLoading) {
        return (
            <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
                <div className="flex flex-col items-center gap-2">
                    <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">Loading preview...</p>
                </div>
            </div>
        )
    }

    if (!activeProject) {
        return (
            <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
                <p className="text-red-500">No active project found.</p>
            </div>
        )
    }

    const projectId = activeProject._id
    const embedCode = `<script>
  window.yoosrSettings = {
    projectId: "${projectId}"
  };
</script>
<script src="${baseUrl}/loader.js" async></script>`

    const handleCopy = () => {
        navigator.clipboard.writeText(embedCode)
        toast.success(t("embedCopied"))
    }

    const handleResetVisitor = () => {
        localStorage.removeItem("yoosr_visitor_id")
        setIframeKey(prev => prev + 1)
        toast.success(t("sessionReset"), { description: t("sessionResetDesc") })
    }

    return (
        <div className="container mx-auto py-8 px-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Widget Preview</h1>
                    <p className="text-muted-foreground mt-1">
                        Visualize your widget live and grab your installation code.
                    </p>
                </div>
                <Button variant="outline" onClick={handleResetVisitor} className="gap-2 shrink-0">
                    <RefreshCw className="h-4 w-4" />
                    Reset Visitor Session
                </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
                {/* Left Column: Live Preview */}
                <div className="flex flex-col items-center lg:items-start order-2 lg:order-1">
                    <h2 className="text-xl font-semibold mb-6 flex items-center gap-2 self-start">
                        <Eye className="h-5 w-5 text-indigo-500" />
                        Live Widget Preview
                    </h2>

                    {/* Phone Frame */}
                    <div className="relative mx-auto lg:mx-0">
                        <div className="relative border-[12px] border-slate-900 rounded-[3rem] p-0 shadow-2xl bg-slate-900 overflow-hidden w-[380px] h-[660px] flex flex-col ring-4 ring-slate-800/50">
                            {/* iPhone Notch */}
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-7 bg-slate-900 rounded-b-3xl z-20"></div>

                            {/* Speakers/Sensor (Subtle) */}
                            <div className="absolute top-2 left-1/2 -translate-x-1/2 flex gap-1.5 z-30">
                                <div className="w-10 h-1 bg-slate-800 rounded-full"></div>
                                <div className="w-1 h-1 bg-slate-800 rounded-full"></div>
                            </div>

                            <div className="flex-1 bg-white relative rounded-[2.2rem] overflow-hidden mt-0 mb-0">
                                <iframe
                                    key={iframeKey}
                                    src={`${baseUrl}/widget?projectId=${projectId}`}
                                    className="w-full h-full border-none"
                                    title="Widget Preview"
                                />
                            </div>

                            {/* Home Indicator */}
                            <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-28 h-1 bg-slate-800 rounded-full"></div>
                        </div>
                    </div>

                    <p className="mt-6 text-sm text-center lg:text-left text-muted-foreground max-w-[380px]">
                        The preview updates instantly as you change settings. Use the button above to clear your local session for testing.
                    </p>
                </div>

                {/* Right Column: Embed Code & Documentation */}
                <div className="space-y-8 order-1 lg:order-2">
                    <Card className="border-indigo-100 shadow-sm">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-indigo-600">
                                <Code className="h-5 w-5" />
                                Installation Snippet
                            </CardTitle>
                            <CardDescription>
                                Add this code to your website right before the closing <code>&lt;/body&gt;</code> tag.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="relative group">
                                <pre className="bg-slate-950 text-slate-50 p-6 rounded-xl overflow-x-auto text-[13px] font-mono leading-relaxed border border-slate-800 shadow-inner min-h-[160px]">
                                    {embedCode}
                                </pre>
                                <Button
                                    size="sm"
                                    variant="secondary"
                                    className="absolute top-3 right-3 opacity-90 group-hover:opacity-100 transition-opacity bg-white/10 hover:bg-white/20 text-white border-white/10"
                                    onClick={handleCopy}
                                >
                                    <Copy className="h-3.5 w-3.5 mr-2" />
                                    Copy Code
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base font-semibold">Testing Checklist</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <ul className="space-y-3">
                                <li className="flex items-start gap-3 text-sm text-muted-foreground font-medium">
                                    <div className="w-5 h-5 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 mt-0.5 text-[10px]">1</div>
                                    <span>Verify your <strong>Project ID</strong> matches your installation script.</span>
                                </li>
                                <li className="flex items-start gap-3 text-sm text-muted-foreground font-medium">
                                    <div className="w-5 h-5 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 mt-0.5 text-[10px]">2</div>
                                    <span>Try sending a message to test the <strong>welcome notification</strong>.</span>
                                </li>
                                <li className="flex items-start gap-3 text-sm text-muted-foreground font-medium">
                                    <div className="w-5 h-5 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 mt-0.5 text-[10px]">3</div>
                                    <span>Reset the session to verify the <strong>Pre-Chat Form</strong> (if enabled).</span>
                                </li>
                                <li className="flex items-start gap-3 text-sm text-muted-foreground font-medium">
                                    <div className="w-5 h-5 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 mt-0.5 text-[10px]">4</div>
                                    <span>Check your <strong>Dashboard Monitor</strong> to see incoming messages in real-time.</span>
                                </li>
                            </ul>
                        </CardContent>
                    </Card>

                    <div className="rounded-2xl bg-indigo-50 p-6 border border-indigo-100">
                        <h3 className="font-semibold text-indigo-900 mb-2">Need help?</h3>
                        <p className="text-sm text-indigo-700/80 mb-4">
                            Check our documentation for advanced configuration options including custom events, user identity, and multi-language support.
                        </p>
                        <Button variant="link" className="text-indigo-600 p-0 h-auto font-semibold">
                            View Documentation →
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}
