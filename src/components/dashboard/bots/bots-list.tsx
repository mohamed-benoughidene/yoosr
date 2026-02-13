
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MoreHorizontal, Play, Pause, Edit } from "lucide-react"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { bots } from "./data"

export function BotsList() {
    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {bots.map((bot) => (
                <Card key={bot.id}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            {bot.name}
                        </CardTitle>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0">
                                    <span className="sr-only">Open menu</span>
                                    <MoreHorizontal className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuItem>Edit</DropdownMenuItem>
                                <DropdownMenuItem>Duplicate</DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="text-destructive">
                                    Delete
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </CardHeader>
                    <CardContent>
                        <div className="text-xs text-muted-foreground mb-4">
                            {bot.description}
                        </div>
                        <div className="flex items-center justify-between">
                            <Badge variant={bot.status === "active" ? "default" : "secondary"}>
                                {bot.status}
                            </Badge>
                            <span className="text-xs text-muted-foreground">{bot.updatedAt}</span>
                        </div>
                    </CardContent>
                    <CardFooter className="flex justify-between">
                        <Button variant="outline" size="sm">
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                        </Button>
                        {bot.status === 'active' ? (
                            <Button variant="ghost" size="sm" className="text-muted-foreground">
                                <Pause className="mr-2 h-4 w-4" />
                                Pause
                            </Button>
                        ) : (
                            <Button variant="ghost" size="sm" className="text-primary">
                                <Play className="mr-2 h-4 w-4" />
                                Activate
                            </Button>
                        )}
                    </CardFooter>
                </Card>
            ))}
        </div>
    )
}
