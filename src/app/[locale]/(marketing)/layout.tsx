import { LandingHeaderNoAuth } from "@/components/layout/LandingHeaderNoAuth";
import { LandingFooter } from "@/components/layout/LandingFooter";
import { setRequestLocale as unstable_setRequestLocale } from "next-intl/server";
import { MarketingProviders } from "@/components/MarketingProviders";

export default async function MarketingLayout({
    children,
    params,
}: {
    children: React.ReactNode;
    params: Promise<{ locale: string }>;
}) {
    const { locale } = await params;
    unstable_setRequestLocale(locale);

    return (
        <MarketingProviders>
            <div className="flex min-h-screen flex-col">
                <link rel="preconnect" href="https://cdn.fontshare.com" />
                <link rel="preconnect" href="https://api.fontshare.com" />
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
                <link rel="preconnect" href="https://safe-pheasant-87.clerk.accounts.dev" />
                <link href="https://api.fontshare.com/v2/css?f[]=cabinet-grotesk@800,700,600&display=optional" rel="stylesheet" />
                <link href="https://fonts.googleapis.com/css2?family=Noto+Naskh+Arabic:wght@700&display=optional" rel="stylesheet" />
                <LandingHeaderNoAuth />
                <main className="flex-1">{children}</main>
                <LandingFooter />
            </div>
        </MarketingProviders>
    );
}
