import { setRequestLocale } from "next-intl/server";
import DesignStudioShell from "./DesignStudioShell";

export default async function DesignStudioLayout({
    children,
    params,
}: {
    children: React.ReactNode;
    params: Promise<{ locale: string }>;
}) {
    const { locale } = await params;
    setRequestLocale(locale);

    return <DesignStudioShell>{children}</DesignStudioShell>;
}
