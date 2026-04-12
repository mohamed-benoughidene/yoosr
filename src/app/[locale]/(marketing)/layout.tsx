import { LandingHeaderNoAuth } from "@/components/layout/LandingHeaderNoAuth";
import { LandingFooter } from "@/components/layout/LandingFooter";
import { setRequestLocale as unstable_setRequestLocale } from "next-intl/server";
import { MarketingProviders } from "@/components/MarketingProviders";
import { ThemeProvider } from "@/components/theme-provider";
import { Mirza, Space_Grotesk } from "next/font/google";

const spaceGrotesk = Space_Grotesk({
    weight: "variable",
    style: "normal",
    subsets: ["latin"],
    variable: "--font-cabinet-grotesk",
    display: "swap",
    preload: false,
});

// Arabic heading/title font
const mirza = Mirza({
    weight: ["400", "500", "600", "700"],
    subsets: ["arabic"],
    variable: "--font-mirza",
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

    const fontClasses = `${spaceGrotesk.variable} ${locale === "ar" ? mirza.variable : ""}`;

    return (
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
            <MarketingProviders>
                <div
                    className={`flex min-h-screen flex-col ${fontClasses}`}
                    style={{ backgroundColor: "var(--lp-bg)" }}
                    suppressHydrationWarning
                >
                    <LandingHeaderNoAuth />
                    <main className="flex-1">{children}</main>
                    <LandingFooter />
                </div>
            </MarketingProviders>
        </ThemeProvider>
    );
}
