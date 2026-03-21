import { setRequestLocale } from "next-intl/server"
import KbShell from "./KbShell"

export default async function KnowledgeBaseLayout({
    children,
    params,
}: {
    children: React.ReactNode
    params: Promise<{ locale: string }>
}) {
    const { locale } = await params
    setRequestLocale(locale)

    return <KbShell>{children}</KbShell>
}
