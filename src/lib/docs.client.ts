/**
 * Client-safe docs navigation types and data.
 *
 * This module contains ONLY the navigation tree generator (`getDocsNav`)
 * and can be imported from both Server and Client Components.
 *
 * For server-only utilities (MDX parsing, file discovery) see `docs.server.ts`.
 */

export interface DocsNavItem {
  title: string
  href: string
  items?: DocsNavItem[]
}

export type DocsNavSection = {
  title: string
  icon?: string
  items: DocsNavItem[]
}

/**
 * Return the docs navigation tree for a given locale.
 *
 * Titles are keyed by locale so they can be translated later.
 */
export function getDocsNav(locale: string): DocsNavSection[] {
  const _ = (en: string, _ar: string, _fr: string) => {
    if (locale === "ar") return _ar
    if (locale === "fr") return _fr
    return en
  }

  return [
    {
      title: _("Getting Started", "البدء", "Commencer"),
      items: [
        { title: _("Overview", "نظرة عامة", "Aperçu"), href: "/docs/getting-started" },
        { title: _("Create a Project", "إنشاء مشروع", "Créer un projet"), href: "/docs/getting-started/create-project" },
        { title: _("Your First Widget", "أول ويدجت لك", "Votre premier widget"), href: "/docs/getting-started/first-widget" },
      ],
    },
    {
      title: _("Widget", "الويدجت", "Widget"),
      items: [
        { title: _("Installation", "التثبيت", "Installation"), href: "/docs/widget/installation" },
        { title: _("Customization", "التخصيص", "Personnalisation"), href: "/docs/widget/customization" },
        { title: _("Configuration", "الإعدادات", "Configuration"), href: "/docs/widget/configuration" },
      ],
    },
    {
      title: _("AI Chatbots", "روبوتات الذكاء الاصطناعي", "Chatbots IA"),
      items: [
        { title: _("Overview", "نظرة عامة", "Aperçu"), href: "/docs/ai-chatbots" },
        { title: _("Models", "النماذج", "Modèles"), href: "/docs/ai-chatbots/models" },
        { title: _("Knowledge Base", "قاعدة المعرفة", "Base de connaissances"), href: "/docs/ai-chatbots/knowledge-base" },
        { title: _("Prompts", "الموجهات", "Prompts"), href: "/docs/ai-chatbots/prompts" },
      ],
    },
    {
      title: _("Channels", "القنوات", "Canaux"),
      items: [
        { title: _("Overview", "نظرة عامة", "Aperçu"), href: "/docs/channels" },
        { title: _("Telegram", "تيليجرام", "Telegram"), href: "/docs/channels/telegram" },
        { title: _("WhatsApp", "واتساب", "WhatsApp"), href: "/docs/channels/whatsapp" },
        { title: _("Messenger", "ماسنجر", "Messenger"), href: "/docs/channels/messenger" },
        { title: _("Instagram", "انستجرام", "Instagram"), href: "/docs/channels/instagram" },
      ],
    },
    {
      title: _("Bot Flows", "تدفق الروبوت", "Flux de bot"),
      items: [
        { title: _("Overview", "نظرة عامة", "Aperçu"), href: "/docs/bot-flows" },
        { title: _("Visual Designer", "المصمم المرئي", "Concepteur visuel"), href: "/docs/bot-flows/designer" },
        { title: _("Nodes & Actions", "العقد والإجراءات", "Nœuds et actions"), href: "/docs/bot-flows/nodes" },
      ],
    },
    {
      title: _("Agent Dashboard", "لوحة تحكم الوكيل", "Tableau de bord agent"),
      items: [
        { title: _("Overview", "نظرة عامة", "Aperçu"), href: "/docs/agent-dashboard" },
        { title: _("Conversations", "المحادثات", "Conversations"), href: "/docs/agent-dashboard/conversations" },
        { title: _("Departments", "الأقسام", "Départements"), href: "/docs/agent-dashboard/departments" },
        { title: _("Canned Responses", "الردود الجاهزة", "Réponses types"), href: "/docs/agent-dashboard/canned-responses" },
        { title: _("Labels", "التسميات", "Étiquettes"), href: "/docs/agent-dashboard/labels" },
      ],
    },
    {
      title: _("API Reference", "مرجع API", "Référence API"),
      items: [
        { title: _("Overview", "نظرة عامة", "Aperçu"), href: "/docs/api" },
        { title: _("Widget API", "ويدجت API", "Widget API"), href: "/docs/api/widget-api" },
        { title: _("Webhooks", "خطافات الويب", "Webhooks"), href: "/docs/api/webhooks" },
      ],
    },
    {
      title: _("Webhooks", "خطافات الويب", "Webhooks"),
      items: [
        { title: _("Outbound (RestHooks)", "الصادر (RestHooks)", "Sortants (RestHooks)"), href: "/docs/webhooks/outbound" },
        { title: _("Inbound", "الوارد", "Entrants"), href: "/docs/webhooks/inbound" },
        { title: _("Signature Verification", "التحقق من التوقيع", "Vérification de signature"), href: "/docs/webhooks/verification" },
      ],
    },
    {
      title: _("Troubleshooting", "استكشاف الأخطاء", "Dépannage"),
      items: [
        { title: _("Common Issues", "مشاكل شائعة", "Problèmes courants"), href: "/docs/troubleshooting" },
        { title: _("FAQ", "الأسئلة الشائعة", "FAQ"), href: "/docs/troubleshooting/faq" },
      ],
    },
    {
      title: _("Changelog", "سجل التغييرات", "Journal des modifications"),
      items: [
        { title: _("What's New", "ما الجديد", "Nouveautés"), href: "/docs/changelog" },
      ],
    },
  ]
}

// ---------------------------------------------------------------------------
// Shared Types (used by both client and server)
// ---------------------------------------------------------------------------

export interface DocsPageMeta {
  title: string
  description: string
  section: string
  href: string
  /** Full file path for search indexing */
  filePath: string
  /** Plain text body (for search indexing) */
  body: string
}
