import { LandingHeaderNoAuth } from "@/components/layout/LandingHeaderNoAuth";
import { LandingFooter } from "@/components/layout/LandingFooter";
import { setRequestLocale as unstable_setRequestLocale } from "next-intl/server";
import { MarketingProviders } from "@/components/MarketingProviders";
import { Noto_Naskh_Arabic } from "next/font/google";
import localFont from "next/font/local";

const cabinetGrotesk = localFont({
    src: "../../../../public/fonts/cabinet-grotesk/WN5274VQ3AUBDFP74GB4EC4XYJ3EKVNE.woff2",
    variable: "--font-cabinet-grotesk",
    weight: "600 700",
    display: "swap",
});

const cabinetGroteskBold = localFont({
    src: "../../../../public/fonts/cabinet-grotesk/6QH2ALVTTK7IRVO5MYOQQ3OZNXW5SSS3.woff2",
    variable: "--font-cabinet-grotesk",
    weight: "800",
    display: "swap",
});

const notoNaskhArabic = Noto_Naskh_Arabic({
    weight: "700",
    subsets: ["arabic"],
    variable: "--font-noto-naskh-arabic",
    display: "swap",
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

    const fontClasses = `${cabinetGrotesk.variable} ${cabinetGroteskBold.variable} ${locale === "ar" ? notoNaskhArabic.variable : ""}`;

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
