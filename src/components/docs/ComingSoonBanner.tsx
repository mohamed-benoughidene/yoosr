import { Languages } from "lucide-react"

interface ComingSoonBannerProps {
  locale: string
}

export async function ComingSoonBanner({ locale }: ComingSoonBannerProps) {
  // We can add translations for this banner later in messages/en.json, etc.
  // For now, let's keep it simple.
  
  const messages: Record<string, { title: string; desc: string }> = {
    ar: {
      title: "هذه الصفحة غير متوفرة بالعربية بعد",
      desc: "نحن نعمل على ترجمتها. في هذه الأثناء، نعرض لك النسخة الإنجليزية.",
    },
    fr: {
      title: "Cette page n'est pas encore disponible en français",
      desc: "Nous travaillons sur la traduction. En attendant, nous affichons la version anglaise.",
    },
  }

  const content = messages[locale as keyof typeof messages]
  if (!content) return null

  return (
    <div className="mb-8 rounded-lg border border-yellow-500/50 bg-yellow-500/5 p-4 text-yellow-700 dark:text-yellow-400">
      <div className="flex items-start gap-3">
        <Languages className="mt-0.5 h-5 w-5 shrink-0" />
        <div className="space-y-1">
          <p className="font-semibold">{content.title}</p>
          <p className="text-sm opacity-90">{content.desc}</p>
        </div>
      </div>
    </div>
  )
}
