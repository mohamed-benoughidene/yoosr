"use client"

import { useTranslations } from "next-intl"
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
import { useReducer, useEffect, useRef } from "react"
import { toast } from "sonner"
import { Loader2, MessageSquare, Copy, Check, Monitor, Languages, Code, Clock, ExternalLink, RefreshCw, UserMinus } from "lucide-react"
import { cn } from "@/lib/utils"
import { useMutation } from "convex/react"
import { api } from "../../../../../../convex/_generated/api"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

// Theme Presets
const THEMES = {
    custom: { translationKey: "color_custom", color: "#000000" },
    blue: { translationKey: "color_ocean_blue", color: "#2563eb" },
    green: { translationKey: "color_forest_green", color: "#16a34a" },
    purple: { translationKey: "color_royal_purple", color: "#7c3aed" },
    dark: { translationKey: "color_midnight", color: "#0f172a" },
}


interface WidgetConfig {
    primaryColor: string;
    align: "left" | "right";
    logoUrl: string;
    welcomeDelay: number;
    enableWelcomeNotification: boolean;
    autoCloseMinutes: number;
    preChatFormEnabled: boolean;
    contactMethod: "email" | "phone";
    translations: {
        headerTitle: string;
        onlineStatus: string;
        startChat: string;
        welcomeMessage: string;
        preChatTitle: string;
        preChatSubtitle: string;
    };
}

interface UiState {
    loading: boolean;
    iframeKey: number;
    copiedHtml: boolean;
    copiedNext: boolean;
    copiedSnippet: boolean;
    selectedPlatform: string;
}

interface WidgetSettingsState {
    widgetConfig: WidgetConfig;
    uiState: UiState;
}

type WidgetSettingsAction = 
    | { type: "SET_THEME"; payload: string }
    | { type: "SET_ALIGN"; payload: "left" | "right" }
    | { type: "SET_LOGO_URL"; payload: string }
    | { type: "SET_WELCOME_DELAY"; payload: number }
    | { type: "SET_ENABLE_WELCOME"; payload: boolean }
    | { type: "SET_AUTO_CLOSE"; payload: number }
    | { type: "SET_PRE_CHAT_ENABLED"; payload: boolean }
    | { type: "SET_CONTACT_METHOD"; payload: "email" | "phone" }
    | { type: "UPDATE_TRANSLATION"; payload: { key: string; value: string } }
    | { type: "SET_TRANSLATIONS"; payload: WidgetConfig["translations"] }
    | { type: "SET_LOADING"; payload: boolean }
    | { type: "INC_IFRAME_KEY" }
    | { type: "SET_COPIED_HTML"; payload: boolean }
    | { type: "SET_COPIED_NEXT"; payload: boolean }
    | { type: "SET_COPIED_SNIPPET"; payload: boolean }
    | { type: "SET_SELECTED_PLATFORM"; payload: string }

const initialState: WidgetSettingsState = {
    widgetConfig: {
        primaryColor: "#000000",
        align: "right",
        logoUrl: "",
        welcomeDelay: 3,
        enableWelcomeNotification: true,
        autoCloseMinutes: 30,
        preChatFormEnabled: true,
        contactMethod: "email",
        translations: {
            headerTitle: "",
            onlineStatus: "",
            startChat: "",
            welcomeMessage: "",
            preChatTitle: "",
            preChatSubtitle: ""
        }
    },
    uiState: {
        loading: false,
        iframeKey: 0,
        copiedHtml: false,
        copiedNext: false,
        copiedSnippet: false,
        selectedPlatform: "html"
    }
}

function widgetSettingsReducer(state: WidgetSettingsState, action: WidgetSettingsAction): WidgetSettingsState {
    switch (action.type) {
        case "SET_THEME": return { ...state, widgetConfig: { ...state.widgetConfig, primaryColor: action.payload } }
        case "SET_ALIGN": return { ...state, widgetConfig: { ...state.widgetConfig, align: action.payload } }
        case "SET_LOGO_URL": return { ...state, widgetConfig: { ...state.widgetConfig, logoUrl: action.payload } }
        case "SET_WELCOME_DELAY": return { ...state, widgetConfig: { ...state.widgetConfig, welcomeDelay: action.payload } }
        case "SET_ENABLE_WELCOME": return { ...state, widgetConfig: { ...state.widgetConfig, enableWelcomeNotification: action.payload } }
        case "SET_AUTO_CLOSE": return { ...state, widgetConfig: { ...state.widgetConfig, autoCloseMinutes: action.payload } }
        case "SET_PRE_CHAT_ENABLED": return { ...state, widgetConfig: { ...state.widgetConfig, preChatFormEnabled: action.payload } }
        case "SET_CONTACT_METHOD": return { ...state, widgetConfig: { ...state.widgetConfig, contactMethod: action.payload } }
        case "UPDATE_TRANSLATION": return {
            ...state,
            widgetConfig: { ...state.widgetConfig, translations: { ...state.widgetConfig.translations, [action.payload.key]: action.payload.value } }
        }
        case "SET_TRANSLATIONS": return { ...state, widgetConfig: { ...state.widgetConfig, translations: action.payload } }
        case "SET_LOADING": return { ...state, uiState: { ...state.uiState, loading: action.payload } }
        case "INC_IFRAME_KEY": return { ...state, uiState: { ...state.uiState, iframeKey: state.uiState.iframeKey + 1 } }
        case "SET_COPIED_HTML": return { ...state, uiState: { ...state.uiState, copiedHtml: action.payload } }
        case "SET_COPIED_NEXT": return { ...state, uiState: { ...state.uiState, copiedNext: action.payload } }
        case "SET_COPIED_SNIPPET": return { ...state, uiState: { ...state.uiState, copiedSnippet: action.payload } }
        case "SET_SELECTED_PLATFORM": return { ...state, uiState: { ...state.uiState, selectedPlatform: action.payload } }
        default: return state;
    }
}

export default function WidgetSetupPage() {
    const t = useTranslations("settings.widget")
    const { activeProject } = useProject()
    const [state, dispatch] = useReducer(widgetSettingsReducer, undefined, () => ({
        ...initialState,
        widgetConfig: {
            ...initialState.widgetConfig,
            translations: {
                headerTitle: t("default_title"),
                onlineStatus: t("status_online"),
                startChat: t("start_conversation"),
                welcomeMessage: t("default_welcome_message"),
                preChatTitle: t("default_greeting"),
                preChatSubtitle: t("default_form_description")
            }
        }
    }))
    const { widgetConfig, uiState } = state
    const {
        primaryColor, align, logoUrl, welcomeDelay, enableWelcomeNotification,
        autoCloseMinutes, preChatFormEnabled, contactMethod, translations
    } = widgetConfig
    const {
        loading, iframeKey, copiedHtml, copiedNext, copiedSnippet, selectedPlatform
    } = uiState

    const iframeRef = useRef<HTMLIFrameElement>(null)

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? (typeof window !== 'undefined' ? window.location.origin : 'https://app.yoosr.com')

    const updateProject = useMutation(api.projects.update)

    useEffect(() => {
        if (activeProject?.widgetConfig) {
            const config = activeProject.widgetConfig as Record<string, any>
            dispatch({ type: "SET_THEME", payload: config.primaryColor || "#6366f1" })
            dispatch({ type: "SET_ALIGN", payload: config.align || "right" })
            dispatch({ type: "SET_LOGO_URL", payload: config.logoUrl || "" })
            dispatch({ type: "SET_WELCOME_DELAY", payload: config.welcomeDelay ?? 3 })
            dispatch({ type: "SET_ENABLE_WELCOME", payload: config.enableWelcomeNotification ?? true })
            dispatch({ type: "SET_AUTO_CLOSE", payload: config.autoCloseMinutes ?? 30 })
            dispatch({ type: "SET_PRE_CHAT_ENABLED", payload: config.preChatFormEnabled ?? true })
            dispatch({ type: "SET_CONTACT_METHOD", payload: config.contactMethod || "email" })
            dispatch({ type: "SET_TRANSLATIONS", payload: {
                headerTitle: config.translations?.headerTitle || t("default_title"),
                onlineStatus: config.translations?.onlineStatus || t("status_online"),
                startChat: config.translations?.startChat || t("start_conversation"),
                welcomeMessage: config.translations?.welcomeMessage || t("default_welcome_message"),
                preChatTitle: config.translations?.preChatTitle || t("default_greeting"),
                preChatSubtitle: config.translations?.preChatSubtitle || t("default_form_description")
            }})
        }
    }, [activeProject])

    const handleSave = async () => {
        if (!activeProject) return
        dispatch({ type: "SET_LOADING", payload: true })

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
            toast.success(t("settings_updated"))
            // Reload preview to reflect changes
            dispatch({ type: "INC_IFRAME_KEY" })
        } catch {
            toast.error(t("settings_update_failed"))
        }
        dispatch({ type: "SET_LOADING", payload: false })
    }

    const copyToClipboard = (text: string, type: 'html' | 'next' | 'generic') => {
        navigator.clipboard.writeText(text)
        if (type === 'html') {
            dispatch({ type: "SET_COPIED_HTML", payload: true })
            setTimeout(() => dispatch({ type: "SET_COPIED_HTML", payload: false }), 2000)
        } else if (type === 'next') {
            dispatch({ type: "SET_COPIED_NEXT", payload: true })
            setTimeout(() => dispatch({ type: "SET_COPIED_NEXT", payload: false }), 2000)
        } else {
            dispatch({ type: "SET_COPIED_SNIPPET", payload: true })
            setTimeout(() => dispatch({ type: "SET_COPIED_SNIPPET", payload: false }), 2000)
        }
        toast.success(t("snippet_copied"))
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
            dispatch({ type: "SET_THEME", payload: theme.color })
        }
    }

    const updateTranslation = (key: string, value: string) => {
        dispatch({ type: "UPDATE_TRANSLATION", payload: { key, value } })
    }

    return (
        <div className="flex flex-col lg:flex-row gap-8 relative items-start">
            <div className="flex-1 min-w-0 space-y-6 pb-20">
                <div>
                    <h3 className="text-lg font-medium">{t("title")}</h3>
                    <p className="text-sm text-muted-foreground">
                        {t("description")}
                    </p>
                </div>
                <Separator />

                <Tabs defaultValue="appearance" className="w-full">
                    <TabsList className="grid w-full grid-cols-4">
                        <TabsTrigger value="appearance">
                            <Monitor className="mr-2 h-4 w-4" /> {t("tab_appearance")}
                        </TabsTrigger>
                        <TabsTrigger value="translations">
                            <Languages className="mr-2 h-4 w-4" /> {t("tab_text")}
                        </TabsTrigger>
                        <TabsTrigger value="behavior">
                            <Clock className="mr-2 h-4 w-4" /> {t("tab_behavior")}
                        </TabsTrigger>
                        <TabsTrigger value="installation">
                            <Code className="mr-2 h-4 w-4" /> {t("tab_install")}
                        </TabsTrigger>
                    </TabsList>

                    {/* APPEARANCE TAB */}
                    <TabsContent value="appearance" className="space-y-4 mt-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>{t("theme_title")}</CardTitle>
                                <CardDescription>{t("theme_desc")}</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label>{t("presets")}</Label>
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
                                                {t((theme as any).translationKey)}
                                            </Button>
                                        ))}
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="color">{t("primary_color")}</Label>
                                    <div className="flex gap-2">
                                        <Input
                                            id="color"
                                            type="color"
                                            className="w-12 h-10 p-1 cursor-pointer"
                                            value={primaryColor}
                                            onChange={(e) => dispatch({ type: "SET_THEME", payload: e.target.value })}
                                        />
                                        <Input
                                            value={primaryColor}
                                            onChange={(e) => dispatch({ type: "SET_THEME", payload: e.target.value })}
                                            className="font-mono"
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>{t("branding_title")}</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="logo">{t("logo_url")}</Label>
                                    <Input
                                        id="logo"
                                        placeholder="https://example.com/logo.png"
                                        value={logoUrl}
                                        onChange={(e) => dispatch({ type: "SET_LOGO_URL", payload: e.target.value })}
                                    />
                                    <p className="text-xs text-muted-foreground">{t("logo_url_desc")}</p>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* BEHAVIOR TAB */}
                    <TabsContent value="behavior" className="space-y-4 mt-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>{t("engagement_title")}</CardTitle>
                                <CardDescription>{t("engagement_desc")}</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="flex items-center justify-between space-x-2">
                                    <Label htmlFor="auto-open" className="flex flex-col space-y-1">
                                        <span>{t("auto_open_title")}</span>
                                        <span className="font-normal text-xs text-muted-foreground">
                                            {t("auto_open_desc")}
                                        </span>
                                    </Label>
                                    <Switch
                                        id="auto-open"
                                        checked={enableWelcomeNotification}
                                        onCheckedChange={(v) => dispatch({ type: "SET_ENABLE_WELCOME", payload: v })}
                                    />
                                </div>

                                <div className="flex items-center justify-between space-x-2">
                                    <Label htmlFor="pre-chat" className="flex flex-col space-y-1">
                                        <span>{t("pre_chat_form")}</span>
                                        <span className="font-normal text-xs text-muted-foreground">
                                            {t("pre_chat_desc")}
                                        </span>
                                    </Label>
                                    <Switch
                                        id="pre-chat"
                                        checked={preChatFormEnabled}
                                        onCheckedChange={(v) => dispatch({ type: "SET_PRE_CHAT_ENABLED", payload: v })}
                                    />
                                </div>

                                {preChatFormEnabled && (
                                    <div className="space-y-3 pt-2">
                                        <Label>{t("contact_method")}</Label>
                                        <RadioGroup
                                            value={contactMethod}
                                            onValueChange={(v) => dispatch({ type: "SET_CONTACT_METHOD", payload: v as "email" | "phone" })}
                                            className="flex gap-4"
                                        >
                                            <div className="flex items-center space-x-2">
                                                <RadioGroupItem value="email" id="c-email" />
                                                <Label htmlFor="c-email">{t("method_email")}</Label>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <RadioGroupItem value="phone" id="c-phone" />
                                                <Label htmlFor="c-phone">{t("method_phone")}</Label>
                                            </div>
                                        </RadioGroup>
                                    </div>
                                )}

                                {enableWelcomeNotification && (
                                    <div className="space-y-2">
                                        <Label htmlFor="delay">{t("delay_seconds")}</Label>
                                        <div className="flex items-center gap-4">
                                            <Input
                                                id="delay"
                                                type="number"
                                                min="0"
                                                max="60"
                                                value={welcomeDelay}
                                                onChange={(e) => dispatch({ type: "SET_WELCOME_DELAY", payload: Number(e.target.value) })}
                                                className="w-24"
                                            />
                                            <span className="text-sm text-muted-foreground">
                                                {t("delay_desc")}
                                            </span>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>{t("auto_close_title")}</CardTitle>
                                <CardDescription>{t("auto_close_desc")}</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="auto-close">{t("close_inactivity")}</Label>
                                    <div className="flex items-center gap-4">
                                        <Input
                                            id="auto-close"
                                            type="number"
                                            min="0"
                                            max="1440"
                                            value={autoCloseMinutes}
                                            onChange={(e) => dispatch({ type: "SET_AUTO_CLOSE", payload: Number(e.target.value) })}
                                            className="w-24"
                                        />
                                        <span className="text-sm text-muted-foreground">
                                            {t("disable_auto_close_desc")}
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
                                <CardTitle>{t("text_labels_title")}</CardTitle>
                                <CardDescription>{t("text_labels_desc")}</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="t-header">{t("header_title")}</Label>
                                    <Input
                                        id="t-header"
                                        value={translations.headerTitle}
                                        onChange={(e) => updateTranslation('headerTitle', e.target.value)}
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="t-welcome">{t("welcome_message")}</Label>
                                    <Input
                                        id="t-welcome"
                                        value={translations.welcomeMessage}
                                        onChange={(e) => updateTranslation('welcomeMessage', e.target.value)}
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="t-pretitle">{t("pre_chat_title")}</Label>
                                    <Input
                                        id="t-pretitle"
                                        value={translations.preChatTitle}
                                        onChange={(e) => updateTranslation('preChatTitle', e.target.value)}
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="t-presub">{t("pre_chat_subtitle")}</Label>
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
                                <CardTitle>{t("install_code_title")}</CardTitle>
                                <CardDescription>
                                    {t("install_code_desc")}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="max-w-[300px]">
                                    <Label className="mb-2 block">{t("platform_label")}</Label>
                                    <Select value={selectedPlatform} onValueChange={(v) => dispatch({ type: "SET_SELECTED_PLATFORM", payload: v })}>
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder={t("select_platform_placeholder")} />
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
                                        {t("paste_before_body")}
                                    </p>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>

                <div className="pt-4 flex gap-4">
                    <Button onClick={handleSave} disabled={loading} className="flex-1 md:flex-none">
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {t("save_config")}
                    </Button>
                    <Button
                        variant="outline"
                        onClick={() => window.open(`/test-widget?projectId=${activeProject?._id}`, '_blank')}
                        className="flex-1 md:flex-none"
                    >
                        <ExternalLink className="mr-2 h-4 w-4" />
                        {t("test_widget")}
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
                            {/* Mock Launcher Button */}
                            <div 
                                className="absolute bottom-4 right-4 h-12 w-12 rounded-full shadow-lg flex items-center justify-center cursor-pointer"
                                style={{ backgroundColor: primaryColor }}
                            >
                                <MessageSquare className="text-white h-5 w-5" />
                            </div>
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
                                    dispatch({ type: "INC_IFRAME_KEY" })
                                    toast.success(t("session_reset"))
                                }
                            } catch (e) {
                                // Fallback if CORS prevents direct access (though same-origin should work)
                                localStorage.removeItem("yoosr_visitor_id")
                                dispatch({ type: "INC_IFRAME_KEY" })
                                toast.success(t("session_reset_global"))
                            }
                        }}
                    >
                        <UserMinus className="h-3.5 w-3.5" />
                        {t("reset_session")}
                    </Button>
                </div>
            </div>
        </div>
    )
}
