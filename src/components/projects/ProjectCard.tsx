import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowRight, Settings, Crown, Shield, Headset } from "lucide-react"
import { useRouter } from "next/navigation"
import { useProject } from "@/context/ProjectContext"
import { Id } from "../../../convex/_generated/dataModel"

interface ProjectCardProps {
    project: {
        _id: Id<"projects">
        name: string
        description?: string
        status?: string
        userRole?: string
    }
}

const roleConfig: Record<string, { label: string; Icon: typeof Crown; variant: "default" | "secondary" | "outline" }> = {
    owner: { label: "Owner", Icon: Crown, variant: "default" },
    administrator: { label: "Admin", Icon: Shield, variant: "secondary" },
    agent: { label: "Agent", Icon: Headset, variant: "outline" },
}

export function ProjectCard({ project }: ProjectCardProps) {
    const router = useRouter()
    const { selectProject, activeProject } = useProject()

    const isActive = activeProject?._id === project._id
    const statusColor = project.status === 'active' ? "bg-green-500 hover:bg-green-600" : "bg-gray-500"

    const role = roleConfig[project.userRole ?? "owner"] ?? roleConfig.owner
    const RoleIcon = role.Icon

    const handleOpen = () => {
        selectProject(project._id)
        router.push(`/dashboard?project=${project._id}`)
    }

    return (
        <Card className={`hover:shadow-lg transition-all duration-300 group border-gray-200 ${isActive ? 'ring-2 ring-blue-500' : ''}`}>
            <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                    <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center font-bold text-xl shadow-md uppercase">
                        {project.name.charAt(0)}
                    </div>
                    <div className="flex flex-col items-end gap-1.5">
                        <Badge variant={project.status === 'active' ? "default" : "secondary"} className={statusColor}>
                            {project.status || "Unknown"}
                        </Badge>
                        <Badge variant={role.variant} className="gap-1 text-[11px]">
                            <RoleIcon className="h-3 w-3" />
                            {role.label}
                        </Badge>
                    </div>
                </div>
                <CardTitle className="mt-4 text-xl truncate" title={project.name}>{project.name}</CardTitle>
                <CardDescription className="font-mono text-xs text-gray-400 truncate">
                    ID: {project._id}
                </CardDescription>
            </CardHeader>
            <CardContent className="pb-3">
                {project.description && (
                    <p className="text-xs text-gray-400 mt-2 line-clamp-2">{project.description}</p>
                )}
            </CardContent>
            <CardFooter className="pt-3 border-t bg-gray-50/50 flex justify-between items-center">
                <Button variant="ghost" size="sm" className="text-gray-500 hover:text-gray-900">
                    <Settings className="h-4 w-4 mr-2" />
                    Settings
                </Button>
                <Button size="sm" className="gap-2 group-hover:bg-blue-600 transition-colors" onClick={handleOpen}>
                    Open
                    <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
            </CardFooter>
        </Card>
    )
}
