import { Separator } from "@/components/ui/separator"
import { useTranslations } from "next-intl"
import { setRequestLocale as unstable_setRequestLocale } from "next-intl/server"

export default async function SettingsGroupsPage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    unstable_setRequestLocale(locale);
    const t = useTranslations("settings.groups")
    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-medium">{t("title")}</h3>
                <p className="text-sm text-muted-foreground">
                    {t("description")}
                </p>
            </div>
            <Separator />
            {/* TODO: Add groups list and creation functionality */}
            <div className="p-4 border border-dashed rounded-md text-center text-muted-foreground">
                {t("placeholder")}
            </div>
        </div>
    )
}