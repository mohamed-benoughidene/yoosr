import {
  setRequestLocale as unstable_setRequestLocale,
  getTranslations
} from "next-intl/server"
import { TestWidgetClient } from "./TestWidgetClient"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Widget Test | Yoosr",
  description: "Test your Yoosr chat widget integration.",
  robots: { index: false },
}

export default async function TestWidgetPage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    unstable_setRequestLocale(locale);
    const t = await getTranslations("testWidget")

    return <TestWidgetClient locale={locale} />
}
