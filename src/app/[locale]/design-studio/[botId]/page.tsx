import type { Metadata } from "next";
import { BotEditorClient } from "./BotEditorClient";
import { getTranslations, setRequestLocale as unstable_setRequestLocale } from "next-intl/server"

export async function generateMetadata({ params }: { params: Promise<{ botId: string; locale: string }> }): Promise<Metadata> {
    const { locale } = await params;
    const t = await getTranslations({ locale });
    return {
        title: t("designStudio.meta.title"),
        description: t("designStudio.meta.description")
    }
}

export default async function BotEditorPage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    unstable_setRequestLocale(locale);
    return <BotEditorClient />;
}
