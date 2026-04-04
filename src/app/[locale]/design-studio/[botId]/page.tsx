import type { Metadata } from "next";
import { BotEditorClient } from "./BotEditorClient";
import { getTranslations, setRequestLocale as unstable_setRequestLocale } from "next-intl/server"

export async function generateMetadata({ params }: { params: Promise<{ botId: string; locale: string }> }): Promise<Metadata> {
    const { locale } = await params;
    const t = await getTranslations({ locale });
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://yoosr.co";
    const title = t("designStudio.meta.title");
    const desc = t("designStudio.meta.description");
    const ogUrl = `${baseUrl}/og/image?title=${encodeURIComponent(title)}&description=${encodeURIComponent(desc)}`;
    return {
        title: title,
        description: desc,
        openGraph: {
            images: [{ url: ogUrl, width: 1200, height: 630, alt: title }],
        },
        twitter: {
            images: [ogUrl],
        },
    }
}

export default async function BotEditorPage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    unstable_setRequestLocale(locale);
    return <BotEditorClient />;
}
