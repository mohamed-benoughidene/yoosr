import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"

interface Teammate {
    id: string
    name: string
    avatar: string
    status: "online" | "offline" | "busy"
}

const teammates: Teammate[] = [
    { id: "1", name: "Alice", avatar: "https://github.com/shadcn.png", status: "online" },
    { id: "2", name: "Bob", avatar: "", status: "offline" },
    { id: "3", name: "Charlie", avatar: "", status: "busy" },
    { id: "4", name: "David", avatar: "", status: "online" },
    { id: "5", name: "Eve", avatar: "", status: "offline" },
    { id: "6", name: "Frank", avatar: "", status: "online" },
]

export function TeammatesCarousel() {
    return (
        <div className="w-full border-b bg-background p-4">
            <div className="mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Teammates
            </div>
            <ScrollArea className="w-full whitespace-nowrap">
                <div className="flex w-max space-x-4">
                    {teammates.map((teammate) => (
                        <div key={teammate.id} className="flex flex-col items-center gap-1">
                            <div className="relative">
                                <Avatar className="h-10 w-10 border-2 border-background">
                                    <AvatarImage src={teammate.avatar} alt={teammate.name} />
                                    <AvatarFallback>{teammate.name[0]}</AvatarFallback>
                                </Avatar>
                                <span
                                    className={cn(
                                        "absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-background",
                                        teammate.status === "online" && "bg-green-500",
                                        teammate.status === "offline" && "bg-slate-400",
                                        teammate.status === "busy" && "bg-red-500"
                                    )}
                                />
                            </div>
                            <span className="text-[10px] font-medium text-muted-foreground">
                                {teammate.name}
                            </span>
                        </div>
                    ))}
                </div>
                <ScrollBar orientation="horizontal" />
            </ScrollArea>
        </div>
    )
}
