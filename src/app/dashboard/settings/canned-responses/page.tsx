import { Separator } from "@/components/ui/separator"

export default function SettingsCannedResponsesPage() {
    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-medium">Canned Responses</h3>
                <p className="text-sm text-muted-foreground">
                    Create quick replies to speed up your support.
                </p>
            </div>
            <Separator />
            {/* TODO: Add canned responses list and creation functionality */}
            <div className="p-4 border border-dashed rounded-md text-center text-muted-foreground">
                Canned responses management placeholder
            </div>
        </div>
    )
}
