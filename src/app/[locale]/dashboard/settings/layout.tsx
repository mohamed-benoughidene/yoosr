import { setRequestLocale } from "next-intl/server"
import SettingsShell from "./SettingsShell"

export default async function SettingsLayout({
    children,
    params,
}: {
    children: React.ReactNode
    params: Promise<{ locale: string }>
}) {
    const { locale } = await params;
    setRequestLocale(locale)

    return <SettingsShell>{children}</SettingsShell>
}
