"use client"

import { useProject } from "@/context/ProjectContext"
import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
    CardFooter,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select"
import { createClient } from "@/lib/supabase/client"
import { useState, useEffect } from "react"
import { toast } from "sonner"
import { Loader2, MessageSquare, Copy, Monitor, Languages, Code } from "lucide-react"
import { logActivity } from "@/lib/logging"
import { cn } from "@/lib/utils"

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

    // Translations
    const [translations, setTranslations] = useState({
        headerTitle: "Chat Support",
        onlineStatus: "Online",
        startChat: "Start Conversation",
        welcomeMessage: "Hi there! How can we help you?"
    })

    useEffect(() => {
        if (activeProject?.widget_config) {
            const config = activeProject.widget_config as any
            setPrimaryColor(config.primaryColor || "#000000")
            setAlign(config.align || "right")
            setLogoUrl(config.logoUrl || "")
            setTranslations({
                headerTitle: config.translations?.headerTitle || "Chat Support",
                onlineStatus: config.translations?.onlineStatus || "Online",
                startChat: config.translations?.startChat || "Start Conversation",
                welcomeMessage: config.translations?.welcomeMessage || "Hi there! How can we help you?"
            })
        }
    }, [activeProject])

    const handleSave = async () => {
        if (!activeProject) return
        setLoading(true)
        const supabase = createClient()

        const config = {
            primaryColor,
            align,
            logoUrl,
            translations
        }

        const { error } = await supabase
            .from('projects')
            .update({
                widget_config: config
            })
            .eq('id', activeProject.id)

        if (error) {
            toast.error("Failed to update widget settings")
        } else {
            toast.success("Widget settings updated")
            await logActivity({
                projectId: activeProject.id,
                actionType: 'update_project',
                description: `Updated widget appearance`,
            })
        }
        setLoading(false)
    }

    const copyScript = () => {
        const script = `<script type="text/javascript">
  window.tiledeskSettings = {
    projectid: "${activeProject?.id}"
  };
  (function(d, s, id) {
    var js, fjs = d.getElementsByTagName(s)[0];
    if (d.getElementById(id)) return;
    js = d.createElement(s); js.id = id;
    js.src = "https://widget.tiledesk.com/v6/launch.js";
    fjs.parentNode.insertBefore(js, fjs);
  }(document, 'script', 'tiledesk-jssdk'));
</script>`
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
        <div className="flex flex-col lg:flex-row gap-8">
            <div className="flex-1 space-y-6">
                <div>
                    <h3 className="text-lg font-medium">Widget Configuration</h3>
                    <p className="text-sm text-muted-foreground">
                        Customize appearance, text, and installation.
                    </p>
                </div>
                <Separator />

                <Tabs defaultValue="appearance" className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="appearance">
                            <Monitor className="mr-2 h-4 w-4" /> Appearance
                        </TabsTrigger>
                        <TabsTrigger value="translations">
                            <Languages className="mr-2 h-4 w-4" /> Translations
                        </TabsTrigger>
                        <TabsTrigger value="installation">
                            <Code className="mr-2 h-4 w-4" /> Installation
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
                                <CardTitle>Position & Branding</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="align">Alignment</Label>
                                    <Select value={align} onValueChange={(v: any) => setAlign(v)}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select position" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="left">Bottom Left</SelectItem>
                                            <SelectItem value="right">Bottom Right</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
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
                                    <Label htmlFor="t-online">Online Status</Label>
                                    <Input
                                        id="t-online"
                                        value={translations.onlineStatus}
                                        onChange={(e) => updateTranslation('onlineStatus', e.target.value)}
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="t-start">Start Button</Label>
                                    <Input
                                        id="t-start"
                                        value={translations.startChat}
                                        onChange={(e) => updateTranslation('startChat', e.target.value)}
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
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* INSTALLATION TAB */}
                    <TabsContent value="installation" className="space-y-4 mt-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Installation Script</CardTitle>
                                <CardDescription>
                                    Paste this code before the closing &lt;/body&gt; tag on every page of your website.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="relative">
                                    <pre className="p-4 rounded-lg bg-muted text-xs overflow-x-auto whitespace-pre-wrap font-mono border">
                                        {`<script type="text/javascript">
  window.tiledeskSettings = {
    projectid: "${activeProject?.id}"
  };
  (function(d, s, id) {
    var js, fjs = d.getElementsByTagName(s)[0];
    if (d.getElementById(id)) return;
    js = d.createElement(s); js.id = id;
    js.src = "https://widget.tiledesk.com/v6/launch.js";
    fjs.parentNode.insertBefore(js, fjs);
  }(document, 'script', 'tiledesk-jssdk'));
</script>`}
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
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>

                <div className="pt-4">
                    <Button onClick={handleSave} disabled={loading} className="w-full md:w-auto">
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Save Configuration
                    </Button>
                </div>
            </div>

            {/* LIVE PREVIEW */}
            <div className="lg:w-[380px] shrink-0 sticky top-6">
                <Card className="h-[700px] flex flex-col p-0 bg-gray-50 dark:bg-zinc-900 border-2 border-dashed relative overflow-hidden">
                    <div className="absolute top-4 w-full text-center text-sm text-muted-foreground z-10">
                        Live Preview
                    </div>

                    <div className="flex-1 relative w-full h-full p-4 flex flex-col justify-end">
                        {/* Mock Widget UI */}
                        <div
                            className={cn(
                                "w-[320px] bg-background rounded-lg shadow-2xl overflow-hidden border mb-4 transition-all duration-300",
                                align === 'left' ? "self-start" : "self-end"
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
                            <div className="h-[250px] bg-muted/20 flex flex-col gap-3 p-4 overflow-y-auto">
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
                            </div>

                            {/* Footer */}
                            <div className="p-3 border-t bg-background">
                                <Button
                                    className="w-full"
                                    style={{ backgroundColor: primaryColor, borderColor: primaryColor }}
                                >
                                    {translations.startChat}
                                </Button>
                            </div>
                        </div>

                        {/* Launcher Button */}
                        <div
                            className={cn(
                                "w-14 h-14 rounded-full flex items-center justify-center text-white shadow-lg transition-all duration-300 hover:scale-110 cursor-pointer",
                                align === 'left' ? "self-start" : "self-end"
                            )}
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
