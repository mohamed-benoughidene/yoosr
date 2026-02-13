
import { ContactsList } from "@/components/dashboard/contacts/contacts-list"
import { Button } from "@/components/ui/button"
import { Download, Upload, Plus } from "lucide-react"

export default function ContactsPage() {
    return (
        <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">Contacts</h1>
                <div className="flex gap-2">
                    <Button variant="outline">
                        <Upload className="mr-2 h-4 w-4" />
                        Import
                    </Button>
                    <Button variant="outline">
                        <Download className="mr-2 h-4 w-4" />
                        Export
                    </Button>
                    <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Contact
                    </Button>
                </div>
            </div>
            <ContactsList />
        </div>
    )
}
