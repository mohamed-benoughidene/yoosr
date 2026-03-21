"use client";

import { useProject } from "@/context/ProjectContext";
import { useSearchParams, useRouter } from "next/navigation";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";
import { Id } from "../../../../convex/_generated/dataModel";
import { useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useOrganization } from "@clerk/nextjs";

import { Suspense } from "react";

function DesignStudioLayoutContent({
    children,
}: {
    children: React.ReactNode;
}) {
    const { activeProject, isLoading } = useProject();
    const { organization, isLoaded: isOrgLoaded } = useOrganization();
    const searchParams = useSearchParams();
    const router = useRouter();
    const projectId = searchParams.get("project");
    const isAdmin = activeProject?.userRole === "org:admin";

    // Ensure user profile exists
    const ensureProfile = useMutation(api.profiles.ensureCurrent);

    useEffect(() => {
        if (!isLoading && isOrgLoaded) {
            if (!isAdmin) {
                router.replace("/dashboard");
                return;
            }

            ensureProfile();

            if (!organization) {
                // No project/org => redirect to onboarding
                router.push("/onboarding");
                return;
            }
        }
    }, [projectId, activeProject, isLoading, router, ensureProfile, organization, isOrgLoaded, isAdmin]);

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

export default function DesignStudioShell({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <Suspense fallback={
            <div className="flex h-screen items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        }>
            <DesignStudioLayoutContent>{children}</DesignStudioLayoutContent>
        </Suspense>
    );
}
