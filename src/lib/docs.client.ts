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
      title: _("Bot Flows", "تدفق الروبوت", "Flux de bot"),
      items: [
        { title: _("Overview", "نظرة عامة", "Aperçu"), href: "/docs/bot-flows" },
        { title: _("Bots vs Flows", "الروبوت مقابل التدفق", "Bots vs flux"), href: "/docs/bot-flows/bots-vs-flows" },
        { title: _("Design Studio Canvas", "لوحة المصمم المرئي", "Toile Design Studio"), href: "/docs/bot-flows/canvas-overview" },
        { title: _("Template Syntax", "صيغة القوالب", "Syntaxe de modèle"), href: "/docs/bot-flows/template-syntax" },
        { title: _("Publishing & Testing", "النشر والاختبار", "Publication et test"), href: "/docs/bot-flows/publishing-testing" },
        // Block docs
        { title: _("Block: Reply", "كتلة: رد", "Bloc: Réponse"), href: "/docs/bot-flows/block-reply" },
        { title: _("Block: Capture Reply", "كتلة: التقاط الرد", "Bloc: Capturer la réponse"), href: "/docs/bot-flows/block-capture-reply" },
        { title: _("Block: Condition", "كتلة: شرط", "Bloc: Condition"), href: "/docs/bot-flows/block-condition" },
        { title: _("Block: Set Attribute", "كتلة: تعيين سمة", "Bloc: Définir un attribut"), href: "/docs/bot-flows/block-set-attribute" },
        { title: _("Block: Ask Knowledge Base", "كتلة: سؤال قاعدة المعرفة", "Bloc: Demander à la base de connaissances"), href: "/docs/bot-flows/block-ask-kb" },
        { title: _("Block: HITL Handoff", "كتلة: نقل للوكيل", "Bloc: Transfert à un agent"), href: "/docs/bot-flows/block-hitl-handoff" },
        { title: _("Block: Apply Label", "كتلة: تطبيق تسمية", "Bloc: Appliquer un label"), href: "/docs/bot-flows/block-apply-label" },
        { title: _("Block: Change Department", "كتلة: تغيير القسم", "Bloc: Changer de département"), href: "/docs/bot-flows/block-change-department" },
        { title: _("Block: Close", "كتلة: إغلاق", "Bloc: Fermer"), href: "/docs/bot-flows/block-close" },
        { title: _("Block: Clear Transcript", "كتلة: مسح السجل", "Bloc: Effacer la transcription"), href: "/docs/bot-flows/block-clear-transcript" },
        { title: _("Block: Code Action", "كتلة: إجراء كود", "Bloc: Action de code"), href: "/docs/bot-flows/block-code-action" },
        { title: _("Block: Replace Bot", "كتلة: استبدال الروبوت", "Bloc: Remplacer le bot"), href: "/docs/bot-flows/block-replace-bot" },
        { title: _("Block: If Online Agent", "كتلة: إذا كان الوكيل متاحًا", "Bloc: Si agent en ligne"), href: "/docs/bot-flows/block-if-online-agent" },
        { title: _("Block: If Operating Hours", "كتلة: إذا كان وقت العمل", "Bloc: Si heures d'ouverture"), href: "/docs/bot-flows/block-if-operating-hours" },
        { title: _("Block: Set Priority", "كتلة: تعيين الأولوية", "Bloc: Définir la priorité"), href: "/docs/bot-flows/block-set-priority" },
        { title: _("Block: Wait", "كتلة: انتظار", "Bloc: Attendre"), href: "/docs/bot-flows/block-wait" },
        { title: _("Block: Web Request", "كتلة: طلب ويب", "Bloc: Requête web"), href: "/docs/bot-flows/block-web-request" },
        { title: _("Block: AI Task", "كتلة: مهمة ذكاء اصطناعي", "Bloc: Tâche IA"), href: "/docs/bot-flows/block-ai-task" },
      ],
    },
    {
      title: _("Knowledge Base", "قاعدة المعرفة", "Base de connaissances"),
      items: [
        { title: _("Overview", "نظرة عامة", "Aperçu"), href: "/docs/knowledge-base" },
        { title: _("Creating a KB", "إنشاء قاعدة معرفة", "Créer une base de connaissances"), href: "/docs/knowledge-base/creating-a-kb" },
        { title: _("Adding Sources", "إضافة مصادر", "Ajouter des sources"), href: "/docs/knowledge-base/adding-sources" },
        { title: _("How Semantic Search Works", "كيف يعمل البحث الدلالي", "Fonctionnement de la recherche sémantique"), href: "/docs/knowledge-base/how-semantic-search-works" },
        { title: _("Improving KB Accuracy", "تحسين دقة قاعدة المعرفة", "Améliorer la précision de la base"), href: "/docs/knowledge-base/improving-kb-accuracy" },
        { title: _("Connecting to a Bot", "ربط بقاعدة المعرفة", "Connecter à un bot"), href: "/docs/knowledge-base/connecting-to-bot" },
      ],
    },
    {
      title: _("Channels", "القنوات", "Canaux"),
      items: [
        { title: _("Overview", "نظرة عامة", "Aperçu"), href: "/docs/channels" },
        { title: _("Chat Overview", "نظرة عامة على الدردشة", "Aperçu du chat"), href: "/docs/channels/chat-overview" },
        { title: _("Widget Visitor Experience", "تجربة زائر الويدجت", "Expérience visiteur widget"), href: "/docs/channels/widget-visitor-experience" },
        { title: _("Widget Customization", "تخصيص الويدجت", "Personnalisation du widget"), href: "/docs/channels/widget-customization" },
        { title: _("Widget Configuration", "إعداد الويدجت", "Configuration du widget"), href: "/docs/channels/widget-configuration" },
        { title: _("Telegram", "تيليجرام", "Telegram"), href: "/docs/channels/telegram" },
        { title: _("WhatsApp", "واتساب", "WhatsApp"), href: "/docs/channels/whatsapp" },
        { title: _("Messenger", "ماسنجر", "Messenger"), href: "/docs/channels/messenger" },
        { title: _("Instagram", "انستجرام", "Instagram"), href: "/docs/channels/instagram" },
      ],
    },
    {
      title: _("Monitor", "المراقب", "Moniteur"),
      items: [
        { title: _("Overview", "نظرة عامة", "Aperçu"), href: "/docs/monitor" },
        { title: _("Conversation Statuses", "حالات المحادثة", "Statuts de conversation"), href: "/docs/monitor/conversation-statuses" },
        { title: _("Filters", "التصفية", "Filtres"), href: "/docs/monitor/filters" },
        { title: _("Internal Notes", "ملاحظات داخلية", "Notes internes"), href: "/docs/monitor/internal-notes" },
        { title: _("Searching Contacts", "البحث في جهات الاتصال", "Rechercher des contacts"), href: "/docs/monitor/searching-contacts" },
        { title: _("Sending Messages", "إرسال الرسائل", "Envoyer des messages"), href: "/docs/monitor/sending-messages" },
        { title: _("Unanswered Queries", "استفسارات بدون رد", "Requêtes sans réponse"), href: "/docs/monitor/unanswered-queries-dashboard" },
      ],
    },
    {
      title: _("Routing", "التوجيه", "Routage"),
      items: [
        { title: _("Overview", "نظرة عامة", "Aperçu"), href: "/docs/routing" },
        { title: _("How Routing Works", "كيف يعمل التوجيه", "Fonctionnement du routage"), href: "/docs/routing/how-routing-works" },
        { title: _("Pooled vs Assigned", "مشترك مقابل معين", "Mutualisé vs assigné"), href: "/docs/routing/pooled-vs-assigned" },
        { title: _("Unassigned Queue", "قائمة غير المعينة", "File non assignée"), href: "/docs/routing/unassigned-queue" },
        { title: _("Routing Not Assigning", "التوجيه لا يعين", "Le routage n'assigne pas"), href: "/docs/routing/routing-not-assigning" },
        { title: _("Served vs Unserved", "مخدم مقابل غير مخدم", "Servi vs non servi"), href: "/docs/routing/served-unserved" },
      ],
    },
    {
      title: _("Agent Dashboard", "لوحة تحكم الوكيل", "Tableau de bord agent"),
      items: [
        { title: _("Overview", "نظرة عامة", "Aperçu"), href: "/docs/agent-dashboard" },
        { title: _("Joining & Assigning", "الانضمام والتعيين", "Rejoindre et assigner"), href: "/docs/agent-dashboard/joining-assigning" },
        { title: _("Resolving", "حل المشكلات", "Résoudre"), href: "/docs/agent-dashboard/resolving" },
        { title: _("Departments", "الأقسام", "Départements"), href: "/docs/agent-dashboard/departments" },
        { title: _("Canned Responses", "الردود الجاهزة", "Réponses types"), href: "/docs/agent-dashboard/canned-responses" },
        { title: _("Labels", "التسميات", "Étiquettes"), href: "/docs/agent-dashboard/labels" },
        { title: _("Labels & AI Tagging", "التسميات والوسم بالذكاء الاصطناعي", "Labels et tagging IA"), href: "/docs/agent-dashboard/labels-ai-tagging" },
        { title: _("Agent Availability", "توفر الوكيل", "Disponibilité de l'agent"), href: "/docs/agent-dashboard/agent-availability" },
      ],
    },
    {
      title: _("Contacts", "جهات الاتصال", "Contacts"),
      items: [
        { title: _("Overview", "نظرة عامة", "Aperçu"), href: "/docs/contacts" },
        { title: _("Searching & Filtering", "البحث والتصفية", "Recherche et filtrage"), href: "/docs/contacts/searching-contacts" },
        { title: _("Contact Profile", "ملف الاتصال", "Profil de contact"), href: "/docs/contacts/contact-profile" },
        { title: _("Bot-set Attributes", "السمات التي يحددها الروبوت", "Attributs définis par le bot"), href: "/docs/contacts/bot-set-attributes" },
        { title: _("Managing Orders", "إدارة الطلبات", "Gérer les commandes"), href: "/docs/contacts/managing-orders" },
      ],
    },
    {
      title: _("Analytics", "التحليلات", "Analytique"),
      items: [
        { title: _("CSAT", "رضا العملاء", "CSAT"), href: "/docs/analytics/csat" },
        { title: _("Token Usage", "استخدام الرموز", "Utilisation des jetons"), href: "/docs/analytics/token-usage" },
        { title: _("Conversation Volume", "حجم المحادثات", "Volume de conversations"), href: "/docs/analytics/conversation-volume" },
        { title: _("Activity Log", "سجل النشاط", "Journal d'activité"), href: "/docs/analytics/activity-log" },
        { title: _("Activities Feed", "موجز الأنشطة", "Flux d'activités"), href: "/docs/analytics/activities-feed" },
        { title: _("Activities vs Analytics", "الأنشطة مقابل التحليلات", "Activités vs analytique"), href: "/docs/analytics/activities-vs-analytics" },
        { title: _("What Gets Logged", "ما يتم تسجيله", "Ce qui est enregistré"), href: "/docs/analytics/what-gets-logged" },
        { title: _("Data Retention", "الاحتفاظ بالبيانات", "Rétention des données"), href: "/docs/analytics/data-retention" },
      ],
    },
    {
      title: _("History", "السجل", "Historique"),
      items: [
        { title: _("Conversation History", "سجل المحادثات", "Historique des conversations"), href: "/docs/history/conversation-history" },
        { title: _("Data Retention", "الاحتفاظ بالبيانات", "Rétention des données"), href: "/docs/history/data-retention" },
      ],
    },
    {
      title: _("Settings", "الإعدادات", "Paramètres"),
      items: [
        { title: _("Operating Hours", "ساعات العمل", "Heures d'ouverture"), href: "/docs/settings/operating-hours" },
        { title: _("Notifications", "الإشعارات", "Notifications"), href: "/docs/settings/notifications" },
        { title: _("AI Model Selection", "اختيار نموذج الذكاء الاصطناعي", "Sélection du modèle IA"), href: "/docs/settings/ai-model-selection" },
        { title: _("Bot Not Responding", "الروبوت لا يستجيب", "Le bot ne répond pas"), href: "/docs/settings/bot-not-responding" },
      ],
    },
    {
      title: _("Troubleshooting", "استكشاف الأخطاء", "Dépannage"),
      items: [
        { title: _("Overview", "نظرة عامة", "Aperçu"), href: "/docs/troubleshooting" },
        { title: _("Widget Not Showing", "الويدجت لا يظهر", "Widget non affiché"), href: "/docs/troubleshooting/widget-not-showing" },
        { title: _("What Are Unanswered Queries", "ما هي الاستفسارات بدون رد", "Que sont les requêtes sans réponse"), href: "/docs/troubleshooting/what-are-unanswered-queries" },
        { title: _("Acting on Unanswered Queries", "التصرف بشأن الاستفسارات بدون رد", "Agir sur les requêtes sans réponse"), href: "/docs/troubleshooting/acting-on-unanswered-queries" },
      ],
    },

    {
      title: _("Webhooks", "خطافات الويب", "Webhooks"),
      items: [
        { title: _("Overview", "نظرة عامة", "Aperçu"), href: "/docs/webhooks" },
        { title: _("Outbound Webhooks", "خطافات الويب الصادرة", "Webhooks sortants"), href: "/docs/webhooks/outbound" },
        { title: _("Event Reference", "مرجع الأحداث", "Référence des événements"), href: "/docs/webhooks/events" },
        { title: _("Signature Verification", "التحقق من التوقيع", "Vérification de signature"), href: "/docs/webhooks/signature-verification" },
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
