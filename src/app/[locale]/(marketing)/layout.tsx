import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
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
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
        </div>
    );
}
