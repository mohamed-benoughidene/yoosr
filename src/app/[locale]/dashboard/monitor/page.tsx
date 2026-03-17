import MonitorLayout from "@/components/dashboard/monitor/monitor-layout"
import { setRequestLocale as unstable_setRequestLocale } from "next-intl/server"

export default async function MonitorPage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    unstable_setRequestLocale(locale);
    return <MonitorLayout />
}