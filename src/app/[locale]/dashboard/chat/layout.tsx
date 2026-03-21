import { setRequestLocale } from "next-intl/server"
import ChatShell from "./ChatShell"

export default async function ChatLayout({
    children,
    params,
}: {
    children: React.ReactNode
    params: Promise<{ locale: string }>
}) {
    const { locale } = await params
    setRequestLocale(locale)

    return <ChatShell>{children}</ChatShell>
}
