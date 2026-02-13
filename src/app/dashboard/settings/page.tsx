import { Separator } from "@/components/ui/separator"

export default function SettingsPage() {
    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-medium">General Settings</h3>
                <p className="text-sm text-muted-foreground">
                    Configure general project settings.
                </p>
            </div>
            <Separator />
            <div className="p-4 border border-dashed rounded-md text-center text-muted-foreground">
                General project settings placeholder
            </div>
        </div>
    )
}
