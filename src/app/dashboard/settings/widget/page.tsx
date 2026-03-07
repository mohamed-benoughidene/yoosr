"use client"

import { useProject } from "@/context/ProjectContext"
import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useState, useEffect, useRef } from "react"
import { toast } from "sonner"
import { Loader2, MessageSquare, Copy, Check, Monitor, Languages, Code, Clock, ExternalLink, RefreshCw, UserMinus } from "lucide-react"
import { cn } from "@/lib/utils"
import { useMutation } from "convex/react"
import { api } from "../../../../../convex/_generated/api"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

// Theme Presets
const THEMES = {
    custom: { name: "Custom", color: "#000000" },
    blue: { name: "Ocean Blue", color: "#2563eb" },
    green: { name: "Forest Green", color: "#16a34a" },
    purple: { name: "Royal Purple", color: "#7c3aed" },
    dark: { name: "Midnight", color: "#0f172a" },
}

export default function WidgetSetupPage() {
    const { activeProject } = useProject()
    const [loading, setLoading] = useState(false)
    const [iframeKey, setIframeKey] = useState(0)
    const iframeRef = useRef<HTMLIFrameElement>(null)

    // Config State
    const [primaryColor, setPrimaryColor] = useState("#000000")
    const [align, setAlign] = useState<"left" | "right">("right")
    const [logoUrl, setLogoUrl] = useState("")

    // New Config
    const [welcomeDelay, setWelcomeDelay] = useState(3)
    const [enableWelcomeNotification, setEnableWelcomeNotification] = useState(true)
    const [autoCloseMinutes, setAutoCloseMinutes] = useState(30)
    const [preChatFormEnabled, setPreChatFormEnabled] = useState(true)
    const [contactMethod, setContactMethod] = useState<"email" | "phone">("email")

    // Translations
    const [translations, setTranslations] = useState({
        headerTitle: "Chat Support",
        onlineStatus: "Online",
        startChat: "Start Conversation",
        welcomeMessage: "Hi there! How can we help you?",
        preChatTitle: "Welcome!",
        preChatSubtitle: "Please fill in your details to start chatting."
    })

    const [copiedHtml, setCopiedHtml] = useState(false)
    const [copiedNext, setCopiedNext] = useState(false)
    const [copiedSnippet, setCopiedSnippet] = useState(false)
    const [selectedPlatform, setSelectedPlatform] = useState("html")

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? (typeof window !== 'undefined' ? window.location.origin : 'https://app.yoosr.com')

    const updateProject = useMutation(api.projects.update)

    useEffect(() => {
        if (activeProject?.widgetConfig) {
            const config = activeProject.widgetConfig as Record<string, any>
            setPrimaryColor(config.primaryColor || "#6366f1")
            setAlign(config.align || "right")
            setLogoUrl(config.logoUrl || "")
            setWelcomeDelay(config.welcomeDelay ?? 3)
            setEnableWelcomeNotification(config.enableWelcomeNotification ?? true)
            setAutoCloseMinutes(config.autoCloseMinutes ?? 30)
            setPreChatFormEnabled(config.preChatFormEnabled ?? true)
            setContactMethod(config.contactMethod || "email")
            setTranslations({
                headerTitle: config.translations?.headerTitle || "Chat Support",
                onlineStatus: config.translations?.onlineStatus || "Online",
                startChat: config.translations?.startChat || "Start Conversation",
                welcomeMessage: config.translations?.welcomeMessage || "Hi there! How can we help you?",
                preChatTitle: config.translations?.preChatTitle || "Welcome!",
                preChatSubtitle: config.translations?.preChatSubtitle || "Please fill in your details to start chatting."
            })
        }
    }, [activeProject])

    const handleSave = async () => {
        if (!activeProject) return
        setLoading(true)

        const config = {
            primaryColor,
            align,
            logoUrl,
            welcomeDelay,
            enableWelcomeNotification,
            autoCloseMinutes,
            preChatFormEnabled,
            contactMethod,
            translations,
        }

        try {
            await updateProject({
                id: activeProject._id,
                widgetConfig: config,
            })
            toast.success("Widget settings updated")
            // Reload preview to reflect changes
            setIframeKey(k => k + 1)
        } catch {
            toast.error("Failed to update widget settings")
        }
        setLoading(false)
    }

    const copyToClipboard = (text: string, type: 'html' | 'next' | 'generic') => {
        navigator.clipboard.writeText(text)
        if (type === 'html') {
            setCopiedHtml(true)
            setTimeout(() => setCopiedHtml(false), 2000)
        } else if (type === 'next') {
            setCopiedNext(true)
            setTimeout(() => setCopiedNext(false), 2000)
        } else {
            setCopiedSnippet(true)
            setTimeout(() => setCopiedSnippet(false), 2000)
        }
        toast.success("Snippet copied to clipboard")
    }

    const PLATFORMS = [
        { id: "html", name: "HTML / Standard" },
        { id: "nextjs", name: "Next.js" },
        { id: "react", name: "React" },
        { id: "vue", name: "Vue.js" },
        { id: "nuxt", name: "Nuxt.js" },
        { id: "angular", name: "Angular" },
        { id: "wordpress", name: "WordPress (PHP)" },
        { id: "shopify", name: "Shopify (Liquid)" },
        { id: "webflow", name: "Webflow" },
        { id: "gtm", name: "Google Tag Manager" },
    ]

    const getSnippet = (platform: string) => {
        const pId = activeProject?._id || "PROJECT_ID"
        switch (platform) {
            case 'html':
                return `<script>\n  window.yoosrSettings = { projectId: "${pId}" };\n</script>\n<script src="${baseUrl}/widget.js" async></script>`
            case 'nextjs':
                return `import Script from 'next/script'\n\n<>\n  <Script id="yoosr-init" strategy="afterInteractive">\n    {\`window.yoosrSettings = { projectId: "${pId}" };\`}\n  </Script>\n  <Script src="${baseUrl}/widget.js" strategy="afterInteractive" />\n</>`
            case 'react':
                return `import { useEffect } from 'react'\n\nexport function YoosrWidget() {\n  useEffect(() => {\n    const id = 'yoosr-widget-sdk';\n    let script = document.getElementById(id);\n    let created = false;\n    if (!script) {\n      window.yoosrSettings = { projectId: "${pId}" };\n      script = document.createElement('script');\n      script.id = id;\n      script.src = '${baseUrl}/widget.js';\n      script.async = true;\n      document.body.appendChild(script);\n      created = true;\n    }\n    return () => {\n      if (created && script?.parentNode) {\n        script.parentNode.removeChild(script);\n      }\n    };\n  }, []);\n  return null;\n}`
            case 'vue':
                return `<script setup>\nimport { onMounted, onUnmounted } from 'vue'\n\nconst SCRIPT_ID = 'yoosr-widget-sdk'\nlet scriptEl = null\nlet createdHere = false\n\nonMounted(() => {\n  scriptEl = document.getElementById(SCRIPT_ID)\n  if (!scriptEl) {\n    window.yoosrSettings = { projectId: "${pId}" };\n    scriptEl = document.createElement('script')\n    scriptEl.id = SCRIPT_ID\n    scriptEl.src = '${baseUrl}/widget.js'\n    scriptEl.async = true\n    document.body.appendChild(scriptEl)\n    createdHere = true\n  }\n})\n\nonUnmounted(() => {\n  if (createdHere && scriptEl?.parentNode) {\n    scriptEl.parentNode.removeChild(scriptEl)\n  }\n})\n</script>`
            case 'nuxt':
                return `// nuxt.config.ts\nexport default defineNuxtConfig({\n  app: {\n    head: {\n      script: [\n        { innerHTML: \`window.yoosrSettings = { projectId: "${pId}" };\` },\n        { src: '${baseUrl}/widget.js', async: true }\n      ]\n    }\n  }\n})`
            case 'angular':
                return `// In index.html before </body>\n<script>\n  window.yoosrSettings = { projectId: "${pId}" };\n</script>\n<script src="${baseUrl}/widget.js" async></script>`
            case 'wordpress':
                return `// In your theme's functions.php\nfunction yoosr_widget() { ?>\n  <script>\n    window.yoosrSettings = { projectId: "${pId}" };\n  </script>\n  <script src="${baseUrl}/widget.js" async></script>\n<?php }\nadd_action('wp_footer', 'yoosr_widget');`
            case 'shopify':
                return `{% comment %} In theme.liquid before </body> {% endcomment %}\n<script>\n  window.yoosrSettings = { projectId: "${pId}" };\n</script>\n<script src="${baseUrl}/widget.js" async></script>`
            case 'webflow':
                return `<!-- Webflow: Site Settings > Custom Code > Footer Code -->\n<script>\n  window.yoosrSettings = { projectId: "${pId}" };\n</script>\n<script src="${baseUrl}/widget.js" async></script>`
            case 'gtm':
                return `<!-- GTM: New Tag > Custom HTML, trigger: All Pages -->\n<script>\n(function(d) {\n  window.yoosrSettings = { projectId: "${pId}" };\n  var s = d.createElement('script');\n  s.src = '${baseUrl}/widget.js';\n  s.async = true;\n  s.onload = function() {\n    window.dataLayer = window.dataLayer || [];\n    window.dataLayer.push({ event: 'yoosr_widget_loaded' });\n  };\n  d.body.appendChild(s);\n})(document);\n</script>`
            default:
                return ""
        }
    }

    const applyTheme = (key: string) => {
        const theme = THEMES[key as keyof typeof THEMES]
        if (theme) {
            setPrimaryColor(theme.color)
        }
    }

    const updateTranslation = (key: string, value: string) => {
        setTranslations(prev => ({ ...prev, [key]: value }))
    }

    return (
        <div className="flex flex-col lg:flex-row gap-8 relative items-start">
            <div className="flex-1 min-w-0 space-y-6 pb-20">
                <div>
                    <h3 className="text-lg font-medium">Widget Configuration</h3>
                    <p className="text-sm text-muted-foreground">
                        Customize appearance, text, and installation.
                    </p>
                </div>
                <Separator />

                <Tabs defaultValue="appearance" className="w-full">
                    <TabsList className="grid w-full grid-cols-4">
                        <TabsTrigger value="appearance">
                            <Monitor className="mr-2 h-4 w-4" /> Appearance
                        </TabsTrigger>
                        <TabsTrigger value="translations">
                            <Languages className="mr-2 h-4 w-4" /> Text
                        </TabsTrigger>
                        <TabsTrigger value="behavior">
                            <Clock className="mr-2 h-4 w-4" /> Behavior
                        </TabsTrigger>
                        <TabsTrigger value="installation">
                            <Code className="mr-2 h-4 w-4" /> Install
                        </TabsTrigger>
                    </TabsList>

                    {/* APPEARANCE TAB */}
                    <TabsContent value="appearance" className="space-y-4 mt-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Theme</CardTitle>
                                <CardDescription>Select a preset or customize colors.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label>Presets</Label>
                                    <div className="flex flex-wrap gap-2">
                                        {Object.entries(THEMES).map(([key, theme]) => (
                                            <Button
                                                key={key}
                                                variant="outline"
                                                size="sm"
                                                onClick={() => applyTheme(key)}
                                                className="flex items-center gap-2"
                                            >
                                                <div
                                                    className="w-3 h-3 rounded-full"
                                                    style={{ backgroundColor: theme.color }}
                                                />
                                                {theme.name}
                                            </Button>
                                        ))}
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="color">Primary Color</Label>
                                    <div className="flex gap-2">
                                        <Input
                                            id="color"
                                            type="color"
                                            className="w-12 h-10 p-1 cursor-pointer"
                                            value={primaryColor}
                                            onChange={(e) => setPrimaryColor(e.target.value)}
                                        />
                                        <Input
                                            value={primaryColor}
                                            onChange={(e) => setPrimaryColor(e.target.value)}
                                            className="font-mono"
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Branding</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="logo">Logo URL</Label>
                                    <Input
                                        id="logo"
                                        placeholder="https://example.com/logo.png"
                                        value={logoUrl}
                                        onChange={(e) => setLogoUrl(e.target.value)}
                                    />
                                    <p className="text-xs text-muted-foreground">URL to your company logo (displayed in header).</p>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* BEHAVIOR TAB */}
                    <TabsContent value="behavior" className="space-y-4 mt-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Engagement</CardTitle>
                                <CardDescription>Control how the widget greets visitors.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="flex items-center justify-between space-x-2">
                                    <Label htmlFor="auto-open" className="flex flex-col space-y-1">
                                        <span>Auto-Open / Welcome Notification</span>
                                        <span className="font-normal text-xs text-muted-foreground">
                                            Automatically open the widget or show a greeting bubble.
                                        </span>
                                    </Label>
                                    <Switch
                                        id="auto-open"
                                        checked={enableWelcomeNotification}
                                        onCheckedChange={setEnableWelcomeNotification}
                                    />
                                </div>

                                <div className="flex items-center justify-between space-x-2">
                                    <Label htmlFor="pre-chat" className="flex flex-col space-y-1">
                                        <span>Pre-chat Form</span>
                                        <span className="font-normal text-xs text-muted-foreground">
                                            require visitors to provide name and email before chatting.
                                        </span>
                                    </Label>
                                    <Switch
                                        id="pre-chat"
                                        checked={preChatFormEnabled}
                                        onCheckedChange={setPreChatFormEnabled}
                                    />
                                </div>

                                {preChatFormEnabled && (
                                    <div className="space-y-3 pt-2">
                                        <Label>Contact Method</Label>
                                        <RadioGroup
                                            value={contactMethod}
                                            onValueChange={(v) => setContactMethod(v as "email" | "phone")}
                                            className="flex gap-4"
                                        >
                                            <div className="flex items-center space-x-2">
                                                <RadioGroupItem value="email" id="c-email" />
                                                <Label htmlFor="c-email">Email</Label>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <RadioGroupItem value="phone" id="c-phone" />
                                                <Label htmlFor="c-phone">Phone Number</Label>
                                            </div>
                                        </RadioGroup>
                                    </div>
                                )}

                                {enableWelcomeNotification && (
                                    <div className="space-y-2">
                                        <Label htmlFor="delay">Delay (seconds)</Label>
                                        <div className="flex items-center gap-4">
                                            <Input
                                                id="delay"
                                                type="number"
                                                min="0"
                                                max="60"
                                                value={welcomeDelay}
                                                onChange={(e) => setWelcomeDelay(Number(e.target.value))}
                                                className="w-24"
                                            />
                                            <span className="text-sm text-muted-foreground">
                                                Seconds before showing the greeting
                                            </span>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Auto-Close</CardTitle>
                                <CardDescription>Automatically close conversations after inactivity.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="auto-close">Close after inactivity (minutes)</Label>
                                    <div className="flex items-center gap-4">
                                        <Input
                                            id="auto-close"
                                            type="number"
                                            min="0"
                                            max="1440"
                                            value={autoCloseMinutes}
                                            onChange={(e) => setAutoCloseMinutes(Number(e.target.value))}
                                            className="w-24"
                                        />
                                        <span className="text-sm text-muted-foreground">
                                            Set to 0 to disable auto-close
                                        </span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* TRANSLATIONS TAB */}
                    <TabsContent value="translations" className="space-y-4 mt-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Text Labels</CardTitle>
                                <CardDescription>Customize the text displayed in the widget.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="t-header">Header Title</Label>
                                    <Input
                                        id="t-header"
                                        value={translations.headerTitle}
                                        onChange={(e) => updateTranslation('headerTitle', e.target.value)}
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="t-welcome">Welcome Message</Label>
                                    <Input
                                        id="t-welcome"
                                        value={translations.welcomeMessage}
                                        onChange={(e) => updateTranslation('welcomeMessage', e.target.value)}
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="t-pretitle">Pre-chat Title</Label>
                                    <Input
                                        id="t-pretitle"
                                        value={translations.preChatTitle}
                                        onChange={(e) => updateTranslation('preChatTitle', e.target.value)}
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="t-presub">Pre-chat Subtitle</Label>
                                    <Input
                                        id="t-presub"
                                        value={translations.preChatSubtitle}
                                        onChange={(e) => updateTranslation('preChatSubtitle', e.target.value)}
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* INSTALLATION TAB */}
                    <TabsContent value="installation" className="space-y-4 mt-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Installation Code</CardTitle>
                                <CardDescription>
                                    Choose your platform to get the installation code.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="max-w-[300px]">
                                    <Label className="mb-2 block">Platform</Label>
                                    <Select value={selectedPlatform} onValueChange={setSelectedPlatform}>
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder="Select platform" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {PLATFORMS.map((p) => (
                                                <SelectItem key={p.id} value={p.id}>
                                                    {p.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="relative group">
                                    <pre className="p-4 rounded-lg bg-[#09090b] text-zinc-100 text-xs overflow-x-auto whitespace-pre font-mono border border-zinc-800/80 ring-1 ring-white/5 shadow-2xl scrollbar-thin scrollbar-thumb-zinc-700">
                                        <code className="block lining-nums tabular-nums leading-relaxed">{getSnippet(selectedPlatform)}</code>
                                    </pre>
                                    <Button
                                        size="icon"
                                        variant="ghost"
                                        className="absolute top-2 right-2 text-zinc-500 hover:text-zinc-100 hover:bg-zinc-800/80 transition-all duration-200"
                                        onClick={() => copyToClipboard(getSnippet(selectedPlatform), 'generic')}
                                    >
                                        {copiedSnippet ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
                                        <span className="sr-only">Copy code</span>
                                    </Button>
                                </div>

                                {selectedPlatform === 'html' && (
                                    <p className="text-xs text-muted-foreground mt-2">
                                        Paste this before the closing <code>&lt;/body&gt;</code> tag.
                                    </p>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>

                <div className="pt-4 flex gap-4">
                    <Button onClick={handleSave} disabled={loading} className="flex-1 md:flex-none">
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Save Configuration
                    </Button>
                    <Button
                        variant="outline"
                        onClick={() => window.open(`/test-widget?projectId=${activeProject?._id}`, '_blank')}
                        className="flex-1 md:flex-none"
                    >
                        <ExternalLink className="mr-2 h-4 w-4" />
                        Test Widget
                    </Button>
                </div>
            </div>

            {/* LIVE PREVIEW */}
            <div className="lg:w-[400px] shrink-0 sticky top-6 hidden lg:block">
                <div className="flex flex-col items-center gap-4">
                    <Card className="w-full h-[660px] flex flex-col p-0 border-[12px] border-slate-900 rounded-[3rem] shadow-2xl relative bg-slate-900 overflow-hidden ring-4 ring-slate-800/50">
                        {/* iPhone Notch */}
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-7 bg-slate-900 rounded-b-3xl z-20"></div>

                        {/* Speakers/Sensor (Subtle) */}
                        <div className="absolute top-2 left-1/2 -translate-x-1/2 flex gap-1.5 z-30">
                            <div className="w-10 h-1 bg-slate-800 rounded-full"></div>
                            <div className="w-1 h-1 bg-slate-800 rounded-full"></div>
                        </div>

                        <div className="flex-1 bg-white relative rounded-[2.2rem] overflow-hidden mt-0 mb-0">
                            <iframe
                                ref={iframeRef}
                                key={iframeKey}
                                src={`/widget?projectId=${activeProject?._id}`}
                                className="w-full h-full border-none"
                                title="Widget Live Preview"
                            />
                        </div>

                        {/* Home Indicator */}
                        <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-28 h-1 bg-slate-800 rounded-full"></div>
                    </Card>

                    <Button
                        variant="ghost"
                        size="sm"
                        className="text-muted-foreground hover:text-foreground text-xs gap-2"
                        onClick={() => {
                            try {
                                const win = iframeRef.current?.contentWindow
                                if (win) {
                                    win.localStorage.removeItem("yoosr_visitor_id")
                                    setIframeKey(k => k + 1)
                                    toast.success("Visitor session reset")
                                }
                            } catch (e) {
                                // Fallback if CORS prevents direct access (though same-origin should work)
                                localStorage.removeItem("yoosr_visitor_id")
                                setIframeKey(k => k + 1)
                                toast.success("Visitor session reset (global)")
                            }
                        }}
                    >
                        <UserMinus className="h-3.5 w-3.5" />
                        Reset Visitor Session
                    </Button>
                </div>
            </div>
        </div>
    )
}
