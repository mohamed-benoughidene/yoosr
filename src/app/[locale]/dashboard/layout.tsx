import { setRequestLocale } from "next-intl/server"
import DashboardShell from "./DashboardShell"
import { PushNotificationInit } from "@/components/PushNotificationInit"
import { DashboardAuthGuard } from "@/components/auth/DashboardAuthGuard"
import { Providers } from "@/components/providers"

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
        <Providers>
            <DashboardAuthGuard>
                <DashboardShell>
                    {children}
                    <PushNotificationInit />
                </DashboardShell>
            </DashboardAuthGuard>
        </Providers>
    )
}
