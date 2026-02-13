import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Mail, MapPin, Monitor, Globe } from "lucide-react"

export function ContactInfo() {
    return (
        <div className="flex flex-col h-full bg-background border-l p-4 space-y-6">
            <div className="flex flex-col items-center gap-2 text-center">
                <Avatar className="h-20 w-20">
                    <AvatarImage src="/avatars/01.png" alt="@shadcn" />
                    <AvatarFallback className="text-lg">AS</AvatarFallback>
                </Avatar>
                <div>
                    <h2 className="text-xl font-semibold">Alice Smith</h2>
                    <p className="text-sm text-muted-foreground">alice@example.com</p>
                </div>
            </div>

            <Separator />

            <div className="space-y-4">
                <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wider">Details</h3>

                <div className="flex items-center gap-3 text-sm">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="truncate">alice@example.com</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                    <Globe className="h-4 w-4 text-muted-foreground" />
                    <span>192.168.1.1</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>San Francisco, CA</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                    <Monitor className="h-4 w-4 text-muted-foreground" />
                    <span>Mac OS • Chrome</span>
                </div>
            </div>

            <div className="mt-auto">
                <Button variant="outline" className="w-full">
                    View Full Profile
                </Button>
            </div>
        </div>
    )
}
