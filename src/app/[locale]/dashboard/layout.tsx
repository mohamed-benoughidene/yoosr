import { setRequestLocale } from "next-intl/server"
import DashboardShell from "./DashboardShell"
import { PushNotificationInit } from "@/components/PushNotificationInit"

export default async function DashboardLayout({
    children,
    params,
}: {
    children: React.ReactNode
    params: Promise<{ locale: string }>
}) {
    const { locale } = await params;
    setRequestLocale(locale)

    return (
        <DashboardShell>
            {children}
            <PushNotificationInit />
        </DashboardShell>
    )
}
