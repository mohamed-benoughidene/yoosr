import { Separator } from "@/components/ui/separator"

export default function SettingsGroupsPage() {
    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-medium">Groups</h3>
                <p className="text-sm text-muted-foreground">
                    Organize users into groups for easier management.
                </p>
            </div>
            <Separator />
            {/* TODO: Add groups list and creation functionality */}
            <div className="p-4 border border-dashed rounded-md text-center text-muted-foreground">
                Groups management placeholder
            </div>
        </div>
    )
}
