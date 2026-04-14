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
import { useState, useEffect } from "react"
import { useForm, FormProvider } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { widgetConfigSchema, type WidgetConfigForm, defaultTranslations } from "./schema"
import { toast } from "sonner"
import { Loader2, Copy, Check, Monitor, Languages, Code, Clock, ExternalLink } from "lucide-react"
import { useMutation } from "convex/react"
import { api } from "../../../../../../convex/_generated/api"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    FormField,
    FormItem,
    FormLabel,
    FormControl,
    FormMessage,
    FormDescription,
} from "@/components/ui/form"

// Theme Presets
const THEMES = {
    custom: { translationKey: "color_custom", color: "#000000" },
    blue: { translationKey: "color_ocean_blue", color: "#2563eb" },
    green: { translationKey: "color_forest_green", color: "#16a34a" },
    purple: { translationKey: "color_royal_purple", color: "#7c3aed" },
    dark: { translationKey: "color_midnight", color: "#0f172a" },
}

export default function WidgetSetupPage() {
    const t = useTranslations("settings.widget")
    const { activeProject } = useProject()
    const [loading, setLoading] = useState(false)
    const [copiedSnippet, setCopiedSnippet] = useState(false)
    const [selectedPlatform, setSelectedPlatform] = useState("html")

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? (typeof window !== 'undefined' ? window.location.origin : 'https://app.yoosr.com')

    const updateProject = useMutation(api.projects.update)

    // Locale currently being edited in the Text tab
    const [editLocale, setEditLocale] = useState<string>("en")

    const form = useForm<WidgetConfigForm>({
        resolver: zodResolver(widgetConfigSchema),
        defaultValues: {
            primaryColor: "#000000",
            align: "right",
            logoUrl: "",
            welcomeDelay: 3,
            enableWelcomeNotification: true,
            autoCloseMinutes: 30,
            preChatFormEnabled: true,
            contactMethod: "email",
            translations: defaultTranslations(),
        }
    })

    useEffect(() => {
        if (activeProject?.widgetConfig) {
            const config = activeProject.widgetConfig as {
                primaryColor?: string;
                align?: "left" | "right";
                logoUrl?: string;
                welcomeDelay?: number;
                enableWelcomeNotification?: boolean;
                autoCloseMinutes?: number;
                preChatFormEnabled?: boolean;
                contactMethod?: "email" | "phone";
                translations?: Record<string, Record<string, string> | string>;
            }

            // Determine locale from project widgetLocale
            const projectLocale = (activeProject as unknown as Record<string, unknown>)?.widgetLocale as string | undefined
            const locale = projectLocale || "en"
            setEditLocale(locale)

            // Build translations for the form — nested structure
            const translationFields = ["headerTitle", "welcomeMessage", "onlineStatus", "preChatTitle", "preChatSubtitle", "startChat"] as const
            const defaults = defaultTranslations()
            const resolvedTranslations: Record<string, { en: string; ar: string; fr: string }> = {}

            for (const field of translationFields) {
                const existing = config.translations?.[field]
                if (typeof existing === "object" && existing !== null) {
                    // Already nested
                    resolvedTranslations[field] = {
                        en: existing.en || defaults[field].en,
                        ar: existing.ar || "",
                        fr: existing.fr || defaults[field].fr,
                    }
                } else if (typeof existing === "string") {
                    // Legacy flat format — migrate on the fly
                    resolvedTranslations[field] = {
                        en: existing || defaults[field].en,
                        ar: "",
                        fr: defaults[field].fr,
                    }
                } else {
                    // Missing — use defaults
                    resolvedTranslations[field] = defaults[field]
                }
            }

            form.reset({
                primaryColor: config.primaryColor || "#6366f1",
                align: config.align || "right",
                logoUrl: config.logoUrl || "",
                welcomeDelay: config.welcomeDelay ?? 3,
                enableWelcomeNotification: config.enableWelcomeNotification ?? true,
                autoCloseMinutes: config.autoCloseMinutes ?? 30,
                preChatFormEnabled: config.preChatFormEnabled ?? true,
                contactMethod: config.contactMethod || "email",
                translations: resolvedTranslations as WidgetConfigForm["translations"],
            })
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeProject])

    const handleSave = form.handleSubmit(async (data) => {
        if (!activeProject) return
        setLoading(true)

        try {
            await updateProject({
                id: activeProject._id,
                widgetConfig: data,
            })
            toast.success(t("settings_updated"))
        } catch {
            toast.error(t("settings_update_failed"))
        }
        setLoading(false)
    })

    const copyToClipboard = (text: string, type: 'html' | 'next' | 'generic') => {
        navigator.clipboard.writeText(text)
        if (type === 'html') {
            // Legacy - not used anymore
        } else if (type === 'next') {
            // Legacy - not used anymore
        } else {
            setCopiedSnippet(true)
            setTimeout(() => setCopiedSnippet(false), 2000)
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
                return `<script>\n  window.yoosrSettings = { projectId: "${pId}" };\n</script>\n<script src="${baseUrl}/loader.js" async></script>`
            case 'nextjs':
                return `import Script from 'next/script'\n\n<>\n  <Script id="yoosr-init" strategy="afterInteractive">\n    {\`window.yoosrSettings = { projectId: "${pId}" };\`}\n  </Script>\n  <Script src="${baseUrl}/loader.js" strategy="afterInteractive" />\n</>`
            case 'react':
                return `import { useEffect } from 'react'\n\nexport function YoosrWidget() {\n  useEffect(() => {\n    const id = 'yoosr-widget-sdk';\n    let script = document.getElementById(id);\n    let created = false;\n    if (!script) {\n      window.yoosrSettings = { projectId: "${pId}" };\n      script = document.createElement('script');\n      script.id = id;\n      script.src = '${baseUrl}/loader.js';\n      script.async = true;\n      document.body.appendChild(script);\n      created = true;\n    }\n    return () => {\n      if (created && script?.parentNode) {\n        script.parentNode.removeChild(script);\n      }\n    };\n  }, []);\n  return null;\n}`
            case 'vue':
                return `<script setup>\nimport { onMounted, onUnmounted } from 'vue'\n\nconst SCRIPT_ID = 'yoosr-widget-sdk'\nlet scriptEl = null\nlet createdHere = false\n\nonMounted(() => {\n  scriptEl = document.getElementById(SCRIPT_ID)\n  if (!scriptEl) {\n    window.yoosrSettings = { projectId: "${pId}" };\n    scriptEl = document.createElement('script')\n    scriptEl.id = SCRIPT_ID\n    scriptEl.src = '${baseUrl}/loader.js'\n    scriptEl.async = true\n    document.body.appendChild(scriptEl)\n    createdHere = true\n  }\n})\n\nonUnmounted(() => {\n  if (createdHere && scriptEl?.parentNode) {\n    scriptEl.parentNode.removeChild(scriptEl)\n  }\n})\n</script>`
            case 'nuxt':
                return `// nuxt.config.ts\nexport default defineNuxtConfig({\n  app: {\n    head: {\n      script: [\n        { innerHTML: \`window.yoosrSettings = { projectId: "${pId}" };\` },\n        { src: '${baseUrl}/loader.js', async: true }\n      ]\n    }\n  }\n})`
            case 'angular':
                return `// In index.html before </body>\n<script>\n  window.yoosrSettings = { projectId: "${pId}" };\n</script>\n<script src="${baseUrl}/loader.js" async></script>`
            case 'wordpress':
                return `// In your theme's functions.php\nfunction yoosr_widget() { ?>\n  <script>\n    window.yoosrSettings = { projectId: "${pId}" };\n  </script>\n  <script src="${baseUrl}/loader.js" async></script>\n<?php }\nadd_action('wp_footer', 'yoosr_widget');`
            case 'shopify':
                return `{% comment %} In theme.liquid before </body> {% endcomment %}\n<script>\n  window.yoosrSettings = { projectId: "${pId}" };\n</script>\n<script src="${baseUrl}/loader.js" async></script>`
            case 'webflow':
                return `<!-- Webflow: Site Settings > Custom Code > Footer Code -->\n<script>\n  window.yoosrSettings = { projectId: "${pId}" };\n</script>\n<script src="${baseUrl}/loader.js" async></script>`
            case 'gtm':
                return `<!-- GTM: New Tag > Custom HTML, trigger: All Pages -->\n<script>\n(function(d) {\n  window.yoosrSettings = { projectId: "${pId}" };\n  var s = d.createElement('script');\n  s.src = '${baseUrl}/loader.js';\n  s.async = true;\n  s.onload = function() {\n    window.dataLayer = window.dataLayer || [];\n    window.dataLayer.push({ event: 'yoosr_widget_loaded' });\n  };\n  d.body.appendChild(s);\n})(document);\n</script>`
            default:
                return ""
        }
    }

    const applyTheme = (key: string) => {
        const theme = THEMES[key as keyof typeof THEMES]
        if (theme) {
            form.setValue("primaryColor", theme.color, { shouldValidate: true, shouldDirty: true })
        }
    }

    return (
        <FormProvider {...form}>
        <form onSubmit={handleSave}>
        <div className="max-w-4xl space-y-6">
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
                                        {(Object.entries(THEMES) as [string, { translationKey: string; color: string }][]).map(([key, theme]) => (
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
                                                {t(theme.translationKey)}
                                            </Button>
                                        ))}
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label>{t("primary_color")}</Label>
                                    <div className="flex gap-2">
                                        <FormField
                                            control={form.control}
                                            name="primaryColor"
                                            render={({ field }) => (
                                                <FormItem className="flex-1">
                                                    <FormControl>
                                                        <Input
                                                            {...field}
                                                            type="color"
                                                            className="w-12 h-10 p-1 cursor-pointer"
                                                        />
                                                    </FormControl>
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="primaryColor"
                                            render={({ field, fieldState }) => (
                                                <FormItem className="flex-[2]">
                                                    <FormControl>
                                                        <Input
                                                            {...field}
                                                            className="font-mono"
                                                        />
                                                    </FormControl>
                                                    {fieldState.error && (
                                                        <FormMessage>{fieldState.error.message}</FormMessage>
                                                    )}
                                                </FormItem>
                                            )}
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
                                    <FormField
                                        control={form.control}
                                        name="logoUrl"
                                        render={({ field, fieldState }) => (
                                            <FormItem>
                                                <FormLabel>{t("logo_url")}</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        {...field}
                                                        placeholder="https://example.com/logo.png"
                                                    />
                                                </FormControl>
                                                {fieldState.error && (
                                                    <FormMessage>{fieldState.error.message}</FormMessage>
                                                )}
                                            </FormItem>
                                        )}
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
                                    <FormField
                                        control={form.control}
                                        name="enableWelcomeNotification"
                                        render={({ field }) => (
                                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 space-x-0">
                                                <div className="space-y-0.5">
                                                    <FormLabel className="text-base">{t("auto_open_title")}</FormLabel>
                                                    <FormDescription className="text-xs">
                                                        {t("auto_open_desc")}
                                                    </FormDescription>
                                                </div>
                                                <FormControl>
                                                    <Switch
                                                        checked={field.value}
                                                        onCheckedChange={field.onChange}
                                                    />
                                                </FormControl>
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <div className="flex items-center justify-between space-x-2">
                                    <FormField
                                        control={form.control}
                                        name="preChatFormEnabled"
                                        render={({ field }) => (
                                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 space-x-0">
                                                <div className="space-y-0.5">
                                                    <FormLabel className="text-base">{t("pre_chat_form")}</FormLabel>
                                                    <FormDescription className="text-xs">
                                                        {t("pre_chat_desc")}
                                                    </FormDescription>
                                                </div>
                                                <FormControl>
                                                    <Switch
                                                        checked={field.value}
                                                        onCheckedChange={field.onChange}
                                                    />
                                                </FormControl>
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                {form.watch("preChatFormEnabled") && (
                                    <div className="space-y-3 pt-2">
                                        <FormField
                                            control={form.control}
                                            name="contactMethod"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>{t("contact_method")}</FormLabel>
                                                    <FormControl>
                                                        <RadioGroup
                                                            value={field.value}
                                                            onValueChange={field.onChange}
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
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                )}

                                {form.watch("enableWelcomeNotification") && (
                                    <div className="space-y-2">
                                        <FormField
                                            control={form.control}
                                            name="welcomeDelay"
                                            render={({ field, fieldState }) => (
                                                <FormItem>
                                                    <FormLabel>{t("delay_seconds")}</FormLabel>
                                                    <FormControl>
                                                        <div className="flex items-center gap-4">
                                                            <Input
                                                                {...field}
                                                                type="number"
                                                                min="0"
                                                                max="60"
                                                                className="w-24"
                                                                onChange={(e) => field.onChange(Number(e.target.value))}
                                                            />
                                                            <span className="text-sm text-muted-foreground">
                                                                {t("delay_desc")}
                                                            </span>
                                                        </div>
                                                    </FormControl>
                                                    {fieldState.error && (
                                                        <FormMessage>{fieldState.error.message}</FormMessage>
                                                    )}
                                                </FormItem>
                                            )}
                                        />
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
                                    <FormField
                                        control={form.control}
                                        name="autoCloseMinutes"
                                        render={({ field, fieldState }) => (
                                            <FormItem>
                                                <FormLabel htmlFor="auto-close">{t("close_inactivity")}</FormLabel>
                                                <FormControl>
                                                    <div className="flex items-center gap-4">
                                                        <Input
                                                            {...field}
                                                            id="auto-close"
                                                            type="number"
                                                            min="0"
                                                            max="1440"
                                                            className="w-24"
                                                            onChange={(e) => field.onChange(Number(e.target.value))}
                                                        />
                                                        <span className="text-sm text-muted-foreground">
                                                            {t("disable_auto_close_desc")}
                                                        </span>
                                                    </div>
                                                </FormControl>
                                                {fieldState.error && (
                                                    <FormMessage>{fieldState.error.message}</FormMessage>
                                                )}
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* TRANSLATIONS TAB */}
                    <TabsContent value="translations" className="space-y-4 mt-4">
                        <Card>
                            <CardHeader className="space-y-3">
                                <div>
                                    <CardTitle>{t("text_labels_title")}</CardTitle>
                                    <CardDescription>{t("text_labels_desc")}</CardDescription>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Languages className="h-4 w-4 text-muted-foreground" />
                                    <Select value={editLocale} onValueChange={setEditLocale}>
                                        <SelectTrigger className="w-[160px]">
                                            <SelectValue placeholder="Select language" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="en">English</SelectItem>
                                            <SelectItem value="ar">العربية</SelectItem>
                                            <SelectItem value="fr">Français</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid gap-2">
                                    <FormField
                                        control={form.control}
                                        name={`translations.headerTitle.${editLocale as "en" | "ar" | "fr"}`}
                                        render={({ field, fieldState }) => (
                                            <FormItem>
                                                <FormLabel htmlFor="t-header">{t("header_title")}</FormLabel>
                                                <FormControl>
                                                    <Input id="t-header" {...field} />
                                                </FormControl>
                                                {fieldState.error && (
                                                    <FormMessage>{fieldState.error.message}</FormMessage>
                                                )}
                                            </FormItem>
                                        )}
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <FormField
                                        control={form.control}
                                        name={`translations.welcomeMessage.${editLocale as "en" | "ar" | "fr"}`}
                                        render={({ field, fieldState }) => (
                                            <FormItem>
                                                <FormLabel htmlFor="t-welcome">{t("welcome_message")}</FormLabel>
                                                <FormControl>
                                                    <Input id="t-welcome" {...field} />
                                                </FormControl>
                                                {fieldState.error && (
                                                    <FormMessage>{fieldState.error.message}</FormMessage>
                                                )}
                                            </FormItem>
                                        )}
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <FormField
                                        control={form.control}
                                        name={`translations.preChatTitle.${editLocale as "en" | "ar" | "fr"}`}
                                        render={({ field, fieldState }) => (
                                            <FormItem>
                                                <FormLabel htmlFor="t-pretitle">{t("pre_chat_title")}</FormLabel>
                                                <FormControl>
                                                    <Input id="t-pretitle" {...field} />
                                                </FormControl>
                                                {fieldState.error && (
                                                    <FormMessage>{fieldState.error.message}</FormMessage>
                                                )}
                                            </FormItem>
                                        )}
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <FormField
                                        control={form.control}
                                        name={`translations.preChatSubtitle.${editLocale as "en" | "ar" | "fr"}`}
                                        render={({ field, fieldState }) => (
                                            <FormItem>
                                                <FormLabel htmlFor="t-presub">{t("pre_chat_subtitle")}</FormLabel>
                                                <FormControl>
                                                    <Input id="t-presub" {...field} />
                                                </FormControl>
                                                {fieldState.error && (
                                                    <FormMessage>{fieldState.error.message}</FormMessage>
                                                )}
                                            </FormItem>
                                        )}
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
                                    <Select value={selectedPlatform} onValueChange={setSelectedPlatform}>
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
                                    <pre className="p-4 rounded-lg bg-card text-card-foreground text-xs overflow-x-auto whitespace-pre font-mono border border-border shadow-2xl">
                                        <code className="block lining-nums tabular-nums leading-relaxed">{getSnippet(selectedPlatform)}</code>
                                    </pre>
                                    <Button
                                        size="icon"
                                        variant="ghost"
                                        className="absolute top-2 right-2 text-muted-foreground hover:text-foreground hover:bg-accent transition-all duration-200"
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
                    <Button type="submit" disabled={loading} className="flex-1 md:flex-none">
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {t("save_config")}
                    </Button>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => window.open(`/test-widget?projectId=${activeProject?._id}`, '_blank')}
                        className="flex-1 md:flex-none"
                    >
                        <ExternalLink className="mr-2 h-4 w-4" />
                        {t("test_widget")}
                    </Button>
                </div>
            </div>
        </form>
        </FormProvider>
    )
}
