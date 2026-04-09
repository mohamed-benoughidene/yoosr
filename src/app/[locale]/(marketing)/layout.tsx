import { LandingHeaderNoAuth } from "@/components/layout/LandingHeaderNoAuth";
import { LandingFooter } from "@/components/layout/LandingFooter";
import { setRequestLocale as unstable_setRequestLocale } from "next-intl/server";
import { MarketingProviders } from "@/components/MarketingProviders";
import { Noto_Naskh_Arabic, Space_Grotesk } from "next/font/google";

const spaceGrotesk = Space_Grotesk({
    weight: "variable",
    style: "normal",
    subsets: ["latin"],
    variable: "--font-cabinet-grotesk",
    display: "swap",
    preload: false,
});

const notoNaskhArabic = Noto_Naskh_Arabic({
    weight: "700",
    subsets: ["arabic"],
    variable: "--font-noto-naskh-arabic",
    display: "swap",
    preload: false,
});

export default async function MarketingLayout({
    children,
    params,
}: {
    children: React.ReactNode;
    params: Promise<{ locale: string }>;
}) {
    const { locale } = await params;
    unstable_setRequestLocale(locale);

    const fontClasses = `${spaceGrotesk.variable} ${locale === "ar" ? notoNaskhArabic.variable : ""}`;

    return (
        <MarketingProviders>
            <div className={`flex min-h-screen flex-col ${fontClasses}`}>
                <LandingHeaderNoAuth />
                <main className="flex-1">{children}</main>
                <LandingFooter />
            </div>
        </MarketingProviders>
    );
}
