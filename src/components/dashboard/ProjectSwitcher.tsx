"use client"

import { useProject } from "@/context/ProjectContext"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Id } from "../../../convex/_generated/dataModel"

export function ProjectSwitcher() {
    const { projects, activeProject, setProjectId } = useProject()

    if (projects.length <= 1) {
        return null
    }

    const handleValueChange = (value: string) => {
        setProjectId(value as Id<"projects">)
    }

    return (
        <Select
            value={activeProject?._id ?? ""}
            onValueChange={handleValueChange}
        >
            <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Select project" />
            </SelectTrigger>
            <SelectContent>
                {projects.map((project) => (
                    <SelectItem key={project._id} value={project._id}>
                        {project.name}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    )
}
