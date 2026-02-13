
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Plus, MoreHorizontal } from "lucide-react"

const members = [
    {
        id: "1",
        name: "Alice Smith",
        email: "alice@example.com",
        role: "Owner",
        status: "active",
        avatar: "/avatars/01.png",
        initials: "AS"
    },
    {
        id: "2",
        name: "Bob Jones",
        email: "bob@example.com",
        role: "Admin",
        status: "active",
        avatar: "/avatars/02.png",
        initials: "BJ"
    },
    {
        id: "3",
        name: "Charlie Brown",
        email: "charlie@example.com",
        role: "Agent",
        status: "invited",
        avatar: "/avatars/03.png",
        initials: "CB"
    }
]

export function TeamSettings() {
    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <div>
                    <h3 className="text-lg font-medium">Team Members</h3>
                    <p className="text-sm text-muted-foreground">
                        Manage your team members and their roles.
                    </p>
                </div>
                <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Invite Member
                </Button>
            </div>

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>User</TableHead>
                            <TableHead>Role</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {members.map((member) => (
                            <TableRow key={member.id}>
                                <TableCell className="flex items-center gap-2">
                                    <Avatar className="h-8 w-8">
                                        <AvatarImage src={member.avatar} alt={member.name} />
                                        <AvatarFallback>{member.initials}</AvatarFallback>
                                    </Avatar>
                                    <div className="flex flex-col">
                                        <span className="font-medium">{member.name}</span>
                                        <span className="text-xs text-muted-foreground">{member.email}</span>
                                    </div>
                                </TableCell>
                                <TableCell>{member.role}</TableCell>
                                <TableCell>
                                    <Badge variant={member.status === 'active' ? 'default' : 'secondary'}>
                                        {member.status}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-right">
                                    <Button variant="ghost" size="icon">
                                        <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}

