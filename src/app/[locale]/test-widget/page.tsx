import { 
  setRequestLocale as unstable_setRequestLocale,
  getTranslations 
} from "next-intl/server"
import { TestWidgetClient } from "./TestWidgetClient"

export default async function TestWidgetPage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    unstable_setRequestLocale(locale);
    const t = await getTranslations("testWidget")

    return <TestWidgetClient locale={locale} />
}
