import {
  setRequestLocale as unstable_setRequestLocale
} from "next-intl/server"
import { TestWidgetClient } from "./TestWidgetClient"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Widget Test",
  description: "Test your Yoosr chat widget integration.",
  robots: { index: false },
}

export default async function TestWidgetPage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    unstable_setRequestLocale(locale);

    return <TestWidgetClient />
}
