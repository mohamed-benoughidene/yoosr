import { notFound } from "next/navigation"
import { DocsSidebar } from "@/components/docs/DocsSidebar"
import { DocsSearch } from "@/components/docs/DocsSearch"
import { DocsBreadcrumbs } from "@/components/docs/DocsBreadcrumbs"
import { parseDocsFrontmatter } from "@/lib/docs"
import { setRequestLocale as unstable_setRequestLocale } from "next-intl/server"
import { getTranslations } from "next-intl/server"
import { Menu } from "lucide-react"
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"

const VALID_LOCALES = ["en", "ar", "fr"] as const

export default async function DocsLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  if (!VALID_LOCALES.includes(locale as (typeof VALID_LOCALES)[number])) {
    notFound()
  }
  unstable_setRequestLocale(locale)

  const pages = parseDocsFrontmatter(locale)
  const t = await getTranslations("docs")

  return (
    <div className="relative flex min-h-screen">
      {/* Desktop sidebar */}
      <aside className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col z-40">
        <div className="flex h-full flex-col border-r bg-background pt-16">
          <div className="px-4 py-3 shrink-0">
            <DocsSearch pages={pages} locale={locale} />
          </div>
          <div className="flex-1 overflow-y-auto">
            <DocsSidebar locale={locale} />
          </div>
        </div>
      </aside>

      {/* Mobile sidebar trigger */}
      <div className="fixed inset-x-0 top-0 z-50 flex items-center justify-between border-b bg-background px-4 py-3 lg:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" aria-expanded="false" aria-label="Open docs navigation">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Open docs navigation</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 p-0">
            <div className="flex flex-col h-full">
              <SheetHeader className="px-4 py-3 border-b text-left">
                <SheetTitle className="font-semibold text-lg">{t("brandName")}</SheetTitle>
              </SheetHeader>
              <div className="flex-1 overflow-y-auto">
                <DocsSidebar locale={locale} />
              </div>
            </div>
          </SheetContent>
        </Sheet>
        <span className="font-semibold">{t("brandName")}</span>
        <div className="w-9" /> {/* spacer for centering */}
      </div>

      {/* Main content */}
      <main className="flex-1 lg:pl-64">
        <div className="mx-auto max-w-4xl px-4 py-8 lg:px-8 lg:py-12 pt-16 lg:pt-8">
          {children}
        </div>
      </main>
    </div>
  )
}
