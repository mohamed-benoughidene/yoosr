import { setRequestLocale } from "next-intl/server";
import DesignStudioShell from "./DesignStudioShell";
import { Providers } from "@/components/providers";

export default async function DesignStudioLayout({
    children,
    params,
}: {
    children: React.ReactNode;
    params: Promise<{ locale: string }>;
}) {
    const { locale } = await params;
    setRequestLocale(locale);

    return (
        <Providers>
            <DesignStudioShell>{children}</DesignStudioShell>
        </Providers>
    );
}
