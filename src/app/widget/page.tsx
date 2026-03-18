import { NextIntlClientProvider } from "next-intl";
import WidgetChat from "./components/WidgetChat";
import { Providers } from "@/components/providers";

export default async function WidgetPage(props: {
    searchParams: Promise<{ lang?: string }>;
}) {
    const searchParams = await props.searchParams;
    const lang = searchParams?.lang;
    const locale = (["en", "ar", "fr"].includes(lang || "") ? lang : "en") as "en" | "ar" | "fr";

    // Dynamically import only the required messages
    const messages = (await import(`../../../messages/${locale}.json`)).default;

    return (
        <NextIntlClientProvider locale={locale} messages={{ widget: messages.widget }}>
            <div lang={locale} dir={locale === "ar" ? "rtl" : "ltr"} className="h-full">
                <Providers>
                    <WidgetChat />
                </Providers>
            </div>
        </NextIntlClientProvider>
    );
}
