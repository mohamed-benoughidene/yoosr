
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { templates } from "./data"

export function BotTemplates() {
    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {templates.map((template) => (
                <Card key={template.id} className="cursor-pointer hover:border-primary transition-colors">
                    <CardHeader>
                        <CardTitle>{template.name}</CardTitle>
                        <CardDescription>{template.category}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground">{template.description}</p>
                    </CardContent>
                    <CardFooter>
                        <Button className="w-full">
                            <Plus className="mr-2 h-4 w-4" />
                            Use Template
                        </Button>
                    </CardFooter>
                </Card>
            ))}
        </div>
    )
}
