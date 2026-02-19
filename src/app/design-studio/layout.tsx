"use client";

import { useProject } from "@/context/ProjectContext";
import { useSearchParams, useRouter } from "next/navigation";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";
import { Id } from "../../../convex/_generated/dataModel";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";

export default function DesignStudioLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { activeProject, selectProject, isLoading } = useProject();
    const searchParams = useSearchParams();
    const router = useRouter();
    const projectId = searchParams.get("project");

    // Ensure user profile exists
    const ensureProfile = useMutation(api.profiles.ensureCurrent);

    useEffect(() => {
        if (!isLoading) {
            ensureProfile();

            if (projectId) {
                if (projectId !== activeProject?._id) {
                    selectProject(projectId as Id<"projects">);
                }
            } else if (activeProject) {
                // Keep project in URL if possible
                // router.replace(...)
            } else {
                // No project => redirect to selection
                router.push("/projects");
            }
        }
    }, [projectId, activeProject, isLoading, selectProject, router, ensureProfile]);

    if (isLoading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!activeProject && !projectId) {
        return null; // Will redirect
    }

    // Render children directly (standalone layout, no sidebar/header)
    return <div className="h-screen w-full bg-background">{children}</div>;
}
