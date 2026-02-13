import { Separator } from "@/components/ui/separator"

export default function SettingsTeammatesPage() {
    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-medium">Teammates</h3>
                <p className="text-sm text-muted-foreground">
                    Manage your team members and their roles.
                </p>
            </div>
            <Separator />
            {/* TODO: Add teammates list and invite functionality */}
            <div className="p-4 border border-dashed rounded-md text-center text-muted-foreground">
                Teammates management placeholder
            </div>
        </div>
    )
}
