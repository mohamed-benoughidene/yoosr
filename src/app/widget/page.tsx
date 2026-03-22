import { NextIntlClientProvider } from "next-intl";
import WidgetChat from "./components/WidgetChat";
import { Providers } from "@/components/providers";

export default async function WidgetPage(props: {
    searchParams: Promise<{ lang?: string; projectId?: string }>;
}) {
    const searchParams = await props.searchParams;
    const lang = searchParams?.lang;
    const projectId = searchParams?.projectId;

    let projectLocale: string | undefined;

    if (projectId) {
        try {
            const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
            const fetchUrl = `${baseUrl}/api/widget/project?projectId=${projectId}`;
            const response = await fetch(fetchUrl, {
                cache: "no-store",
            });
            if (response.ok) {
                const project = await response.json();
                if (["en", "ar", "fr"].includes(project?.widgetLocale)) {
                    projectLocale = project.widgetLocale;
                } else {
                    projectLocale = "en";
                }
            } else {
                console.error(`Fetch failed for ${fetchUrl}. Status: ${response.status}`);
            }
        } catch (error) {
            console.error("Error fetching project locale:", error);
        }
    }

    const locale = (projectLocale || (["en", "ar", "fr"].includes(lang || "") ? lang : "en")) as "en" | "ar" | "fr";

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
