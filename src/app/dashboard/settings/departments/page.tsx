import { Separator } from "@/components/ui/separator"

export default function SettingsDepartmentsPage() {
    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-medium">Departments</h3>
                <p className="text-sm text-muted-foreground">
                    Configure departments to route conversations efficiently.
                </p>
            </div>
            <Separator />
            {/* TODO: Add departments list and creation functionality */}
            <div className="p-4 border border-dashed rounded-md text-center text-muted-foreground">
                Departments management placeholder
            </div>
        </div>
    )
}
