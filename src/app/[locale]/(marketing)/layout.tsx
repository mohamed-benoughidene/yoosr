import { LandingHeader } from "@/components/layout/LandingHeader";
import { LandingFooter } from "@/components/layout/LandingFooter";
import { setRequestLocale as unstable_setRequestLocale } from "next-intl/server";

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
        <div className="flex min-h-screen flex-col">
            <link href="https://api.fontshare.com/v2/css?f[]=cabinet-grotesk@800,700,600&display=swap" rel="stylesheet" />
            <link href="https://fonts.googleapis.com/css2?family=Noto+Naskh+Arabic:wght@700&display=swap" rel="stylesheet" />
            <LandingHeader />
            <main className="flex-1">{children}</main>
            <LandingFooter />
        </div>
    );
}
