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
import { useState, useEffect } from "react"
import { toast } from "sonner"
import { Loader2, MessageSquare, Copy, Monitor, Languages, Code, Clock, ExternalLink } from "lucide-react"
import { cn } from "@/lib/utils"
import { useMutation } from "convex/react"
import { api } from "../../../../../convex/_generated/api"

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

    const updateProject = useMutation(api.projects.update)

    useEffect(() => {
        if (activeProject?.widgetConfig) {
            const config = activeProject.widgetConfig as Record<string, any>
            setPrimaryColor(config.primaryColor || "#000000")
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
        } catch {
            toast.error("Failed to update widget settings")
        }
        setLoading(false)
    }

    const copyScript = () => {
        const script = `<script>
  window.yoosrSettings = {
    projectId: "${activeProject?._id}"
  };
</script>
<script src="${window.location.origin}/widget.js" async></script>`
        navigator.clipboard.writeText(script)
        toast.success("Script copied to clipboard")
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
                            <CardContent>
                                <Tabs defaultValue="html">
                                    <TabsList className="mb-4">
                                        <TabsTrigger value="html">HTML / Standard</TabsTrigger>
                                        <TabsTrigger value="nextjs">Next.js</TabsTrigger>
                                    </TabsList>

                                    <TabsContent value="html">
                                        <div className="relative">
                                            <pre className="p-4 rounded-lg bg-muted text-xs overflow-x-auto whitespace-pre-wrap font-mono border">
                                                {`<script>
  window.yoosrSettings = {
    projectId: "${activeProject?._id}"
  };
</script>
<script src="${typeof window !== 'undefined' ? window.location.origin : 'https://app.yoosr.com'}/widget.js" async></script>`}
                                            </pre>
                                            <Button
                                                size="sm"
                                                variant="secondary"
                                                className="absolute top-2 right-2"
                                                onClick={copyScript}
                                            >
                                                <Copy className="h-4 w-4 mr-2" />
                                                Copy
                                            </Button>
                                        </div>
                                        <p className="text-xs text-muted-foreground mt-2">
                                            Paste this before the closing <code>&lt;/body&gt;</code> tag.
                                        </p>
                                    </TabsContent>

                                    <TabsContent value="nextjs">
                                        <div className="relative">
                                            <pre className="p-4 rounded-lg bg-muted text-xs overflow-x-auto whitespace-pre-wrap font-mono border">
                                                {`import Script from 'next/script'

// Add to your RootLayout or a high-level component

<>
  <Script id="yoosr-init" strategy="afterInteractive">
    {\`
      window.yoosrSettings = {
        projectId: "${activeProject?._id}"
      };
    \`}
  </Script>
  <Script 
    src="${typeof window !== 'undefined' ? window.location.origin : 'https://app.yoosr.com'}/widget.js"
    strategy="afterInteractive" 
  />
</>`}
                                            </pre>
                                            <Button
                                                size="sm"
                                                variant="secondary"
                                                className="absolute top-2 right-2"
                                                onClick={() => {
                                                    const script = `import Script from 'next/script'

// ... in your Layout
<>
  <Script id="yoosr-init" strategy="afterInteractive">
    {\`
      window.yoosrSettings = {
        projectId: "${activeProject?._id}"
      };
    \`}
  </Script>
  <Script src="${window.location.origin}/widget.js" strategy="afterInteractive" />
</>`
                                                    navigator.clipboard.writeText(script)
                                                    toast.success("Next.js snippet copied")
                                                }}
                                            >
                                                <Copy className="h-4 w-4 mr-2" />
                                                Copy
                                            </Button>
                                        </div>
                                    </TabsContent>
                                </Tabs>
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
                        onClick={() => window.open(`/test-widget.html?projectId=${activeProject?._id}`, '_blank')}
                        className="flex-1 md:flex-none"
                    >
                        <ExternalLink className="mr-2 h-4 w-4" />
                        Test Widget
                    </Button>
                </div>
            </div>

            {/* LIVE PREVIEW */}
            <div className="lg:w-[380px] shrink-0 sticky top-6 hidden lg:block">
                <Card className="h-[700px] flex flex-col p-0 bg-gray-50 dark:bg-zinc-900 border-2 border-dashed relative overflow-hidden">
                    <div className="absolute top-4 w-full text-center text-sm text-muted-foreground z-10">
                        Live Preview
                    </div>

                    <div className="flex-1 relative w-full h-full p-4 flex flex-col justify-end">
                        {/* Mock Widget UI */}
                        <div
                            className={cn(
                                "w-[320px] bg-background rounded-lg shadow-2xl overflow-hidden border mb-4 transition-all duration-300 self-end",
                                "animate-in fade-in slide-in-from-bottom-4 duration-700"
                            )}
                        >
                            {/* Header */}
                            <div
                                className="p-4 text-white flex items-center gap-3"
                                style={{ backgroundColor: primaryColor }}
                            >
                                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center shrink-0 overflow-hidden">
                                    {logoUrl ? (
                                        <img src={logoUrl} className="w-full h-full object-cover" alt="Logo" />
                                    ) : (
                                        <MessageSquare className="w-5 h-5" />
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="font-semibold text-base truncate">{translations.headerTitle}</div>
                                    <div className="text-xs opacity-90 flex items-center gap-1">
                                        <span className="w-2 h-2 bg-green-400 rounded-full inline-block" />
                                        {translations.onlineStatus}
                                    </div>
                                </div>
                            </div>

                            {/* Body */}
                            <div className="h-[300px] bg-muted/20 flex flex-col gap-3 p-4 overflow-y-auto">
                                {preChatFormEnabled ? (
                                    <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
                                        <div>
                                            <h4 className="font-bold text-lg">{translations.preChatTitle}</h4>
                                            <p className="text-xs text-muted-foreground">{translations.preChatSubtitle}</p>
                                        </div>
                                        <div className="w-full space-y-2">
                                            <div className="h-8 bg-white border rounded w-full px-2 flex items-center text-xs text-muted-foreground">Name</div>
                                            {contactMethod === "email" ? (
                                                <div className="h-8 bg-white border rounded w-full px-2 flex items-center text-xs text-muted-foreground">Email</div>
                                            ) : (
                                                <div className="h-8 bg-white border rounded w-full px-2 flex items-center text-xs text-muted-foreground">Phone Number</div>
                                            )}
                                            <div className="h-8 rounded w-full text-white text-xs flex items-center justify-center" style={{ backgroundColor: primaryColor }}>
                                                Start Chat
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex gap-2 items-end">
                                        <div className="w-6 h-6 rounded-full bg-primary/20 shrink-0 flex items-center justify-center overflow-hidden">
                                            {logoUrl ? (
                                                <img src={logoUrl} className="w-full h-full object-cover" alt="Logo" />
                                            ) : (
                                                <MessageSquare className="w-3 h-3 text-primary" />
                                            )}
                                        </div>
                                        <div className="bg-white dark:bg-muted p-3 rounded-2xl rounded-bl-none text-sm shadow-sm border max-w-[85%]">
                                            {translations.welcomeMessage}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Footer */}
                            <div className="p-3 border-t bg-background">
                                <div className="flex gap-2">
                                    <div className="flex-1 h-9 rounded-md bg-muted/50 border border-transparent" />
                                    <div className="w-9 h-9 rounded-md" style={{ backgroundColor: primaryColor }} />
                                </div>
                            </div>
                        </div>

                        {/* Launcher Button */}
                        <div
                            className="w-14 h-14 rounded-full flex items-center justify-center text-white shadow-lg transition-all duration-300 hover:scale-110 cursor-pointer self-end"
                            style={{ backgroundColor: primaryColor }}
                        >
                            <MessageSquare className="w-7 h-7" />
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    )
}
