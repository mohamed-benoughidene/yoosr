import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowRight, Settings, Users } from "lucide-react"
import { useRouter } from "next/navigation"
import { Database } from "@/types/supabase"
import { useProject } from "@/context/ProjectContext"

type Project = Database["public"]["Tables"]["projects"]["Row"]

interface ProjectCardProps {
    project: Project
}

export function ProjectCard({ project }: ProjectCardProps) {
    const router = useRouter()
    const { selectProject, activeProject } = useProject()

    // Derived state
    const isActive = activeProject?.id === project.id
    const statusColor = project.status === 'active' ? "bg-green-500 hover:bg-green-600" : "bg-gray-500"

    const handleOpen = () => {
        selectProject(project.id)
        router.push(`/dashboard?project=${project.id}`)
    }

    return (
        <Card className={`hover:shadow-lg transition-all duration-300 group border-gray-200 ${isActive ? 'ring-2 ring-blue-500' : ''}`}>
            <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                    <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center font-bold text-xl shadow-md uppercase">
                        {project.name.charAt(0)}
                    </div>
                    <Badge variant={project.status === 'active' ? "default" : "secondary"} className={statusColor}>
                        {project.status || "Unknown"}
                    </Badge>
                </div>
                <CardTitle className="mt-4 text-xl truncate" title={project.name}>{project.name}</CardTitle>
                <CardDescription className="font-mono text-xs text-gray-400 truncate">
                    ID: {project.id}
                </CardDescription>
            </CardHeader>
            <CardContent className="pb-3">
                <div className="flex items-center gap-4 text-sm text-gray-500">
                    <div className="flex items-center gap-1.5">
                        <Users className="h-4 w-4" />
                        <span>Owner</span>
                    </div>
                </div>
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
