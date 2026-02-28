# Multi-Tenancy Audit: Custom Project System -> Clerk Organizations

## 1. Tables with `projectId` field

The following tables in `convex/schema.ts` have a `projectId` field:

- **project_members**: `projectId: v.id("projects"),`
- **conversations**: `projectId: v.id("projects"),`
- **messages**: `projectId: v.id("projects"),`
- **bots**: `projectId: v.id("projects"),`
- **activity_logs**: `projectId: v.id("projects"),`
- **integrations**: `projectId: v.id("projects"),`
- **departments**: `projectId: v.id("projects"),`
- **canned_responses**: `projectId: v.id("projects"),`
- **labels**: `projectId: v.id("projects"),`
- **operating_hours**: `projectId: v.id("projects"),`
- **knowledge_bases**: `projectId: v.id("projects"),`
- **contacts**: `projectId: v.id("projects"),`
- **knowledge_base_chunks**: `projectId: v.id("projects"),`
- **conversation_events**: `projectId: v.id("projects"),`
- **csat_ratings**: `projectId: v.id("projects"),`
- **token_usage**: `projectId: v.id("projects"),`
- **unanswered_queries**: `projectId: v.id("projects"),`
- **project_usage**: `projectId: v.id("projects"),`
- **webhook_subscriptions**: `projectId: v.id("projects"),`


## 2. Convex Queries and Mutations accepting `projectId` as an argument

Searches confirm that almost every major model file takes `projectId` as an argument. Examples include:

- `convex/members.ts` (`list`, `current`, `invite`, `getProjectMembers`)
- `convex/conversations.ts` (`list`, `get`, `create`, `assignToAgent`, `updateStatus`)
- `convex/messages.ts` (`list`, `create`)
- `convex/analytics.ts` (`getOverviewStats`, `getConversationVolume`, `getCSATStats`, etc.)
- `convex/bot.ts` (`list`, `get`, `update`, `create`)
- `convex/botEngine.ts` (`executeNode`)
- `convex/knowledge.ts` (`list`, `update`, `deleteSource`)
- `convex/knowledgeBases.ts` (`list`, `create`, `update`)
- `convex/tags.ts` (`list`, `create`, `delete`)
- `convex/activityLogs.ts` (`list`, `logActivityInternal`)
- `convex/integrations.ts` (`list`, `updateEnabled`)
- `convex/settings.ts` (`getGeneralSettings`, `updateGeneralSettings`)
- `convex/webhooks.ts` (`createSubscription`, `deleteSubscription`, etc.)
- `convex/routing.ts` (`evaluateRouting`)


## 3. Convex logic reading `ownerId` from `identity.subject`

The logic that maps `ownerId` to the current user token subject is centralized in `convex/projects.ts`:

- `list`: `.withIndex("by_ownerId", (q) => q.eq("ownerId", identity.subject))`
- `create`: `ownerId: identity.subject`
- `update`: `if (!project || project.ownerId !== identity.subject)`
- `delete`: `if (!project || project.ownerId !== identity.subject)`
- `getSettings`: `if (!project || project.ownerId !== identity.subject)`


## 4. `ProjectContext`

File: `src/context/ProjectContext.tsx`

```tsx
"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { useQuery, useMutation } from "convex/react"
import { api } from "../../convex/_generated/api"
import { Id } from "../../convex/_generated/dataModel"

interface Project {
    _id: Id<"projects">
    _creationTime: number
    name: string
    description?: string
    ownerId: string
    status?: string
    widgetConfig?: any
}

interface ProjectContextType {
    projects: Project[]
    activeProject: Project | null
    isLoading: boolean
    createProject: (name: string, description?: string) => Promise<Id<"projects"> | null>
    selectProject: (projectId: Id<"projects">) => void
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined)

export function ProjectProvider({ children }: { children: React.ReactNode }) {
    const [activeProject, setActiveProject] = useState<Project | null>(null)

    // Convex query — automatically reactive, no subscriptions needed!
    const projects = useQuery(api.projects.list) ?? []
    const isLoading = projects === undefined

    const createProjectMutation = useMutation(api.projects.create)

    // Auto-select the active project when projects load
    useEffect(() => {
        if (projects.length > 0 && !activeProject) {
            const savedProjectId = localStorage.getItem("activeProjectId")
            const foundProject = projects.find(
                (p) => p._id === savedProjectId
            )
            if (foundProject) {
                setActiveProject(foundProject)
            } else {
                setActiveProject(projects[0])
            }
        }
        // Update activeProject if it changed in the data
        if (activeProject) {
            const updated = projects.find((p) => p._id === activeProject._id)
            if (updated && JSON.stringify(updated) !== JSON.stringify(activeProject)) {
                setActiveProject(updated)
            }
        }
    }, [projects, activeProject])

    const createProject = async (name: string, description?: string) => {
        try {
            const projectId = await createProjectMutation({ name, description })
            localStorage.setItem("activeProjectId", projectId)
            return projectId
        } catch (error) {
            console.error("Error creating project:", error)
            return null
        }
    }

    const selectProject = (projectId: Id<"projects">) => {
        const project = projects.find((p) => p._id === projectId)
        if (project) {
            setActiveProject(project)
            localStorage.setItem("activeProjectId", projectId)
        }
    }

    return (
        <ProjectContext.Provider
            value={{
                projects,
                activeProject,
                isLoading,
                createProject,
                selectProject,
            }}
        >
            {children}
        </ProjectContext.Provider>
    )
}

export function useProject() {
    const context = useContext(ProjectContext)
    if (context === undefined) {
        throw new Error("useProject must be used within a ProjectProvider")
    }
    return context
}
```

## 5. Frontend Pages calls to `useProject()` or `activeProject`

The `useProject` hook and `activeProject` properties are deeply embedded in the frontend app (170+ references found). 
Here are the primary layout and page files:

- `src/app/dashboard/layout.tsx` (handles standard routing based on activeProject)
- `src/app/design-studio/layout.tsx`
- `src/app/projects/page.tsx`
- `src/app/dashboard/analytics/page.tsx`
- `src/app/dashboard/contacts/page.tsx`
- `src/app/dashboard/requests/page.tsx`
- `src/app/dashboard/settings/app-store/page.tsx`
- `src/app/design-studio/[botId]/page.tsx`
*(Extensively used across almost all features in `/app/dashboard/` and `/app/design-studio/` and their respective UI components).*

## 6. Custom Invitation Mutations (invite, accept)

From `convex/members.ts`:

```typescript
// Accept an invitation
export const accept = mutation({
    args: { inviteId: v.id("project_members") },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Not authenticated");

        const invite = await ctx.db.get(args.inviteId);
        if (!invite) throw new Error("Invitation not found");
        if (invite.inviteStatus === "rejected") throw new Error("Invitation was rejected");

        await ctx.db.patch(args.inviteId, {
            userId: identity.subject,
            inviteStatus: "accepted",
            status: "available",
        });

        await ctx.runMutation(internal.activityLogs.logActivityInternal, {
            projectId: invite.projectId,
            actorId: identity.subject,
            actorName: identity.name ?? identity.email ?? "Unknown",
            action: "teammate_accepted",
            targetType: "teammate",
            targetId: identity.email ?? identity.subject,
            metadata: { role: invite.role },
        });
    },
});

export const invite = mutation({
    args: {
        projectId: v.id("projects"),
        invitedEmail: v.string(),
        role: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Not authenticated");

        const memberId = await ctx.db.insert("project_members", {
            projectId: args.projectId,
            role: args.role ?? "agent",
            status: "available",
            invitedEmail: args.invitedEmail,
            invitedAt: Date.now(),
        });

        await ctx.runMutation(internal.activityLogs.logActivityInternal, {
            projectId: args.projectId,
            actorId: identity.subject,
            actorName: identity.name ?? identity.email ?? "Unknown",
            action: "teammate_invited",
            targetType: "teammate",
            targetId: args.invitedEmail,
            metadata: { email: args.invitedEmail, role: args.role ?? "agent" },
        });

        return memberId;
    },
});
```

## 7. Middleware File

File: `src/middleware.ts`

```typescript
import { clerkMiddleware } from "@clerk/nextjs/server";

export default clerkMiddleware();

export const config = {
    matcher: [
        // Skip Next.js internals and all static files, unless found in search params
        "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
        // Always run for API routes
        "/(api|trpc)(.*)",
    ],
};
```

## 8. ConvexClientProvider

File: `src/components/ConvexClientProvider.tsx`

```tsx
"use client";

import { ConvexProvider, ConvexReactClient } from "convex/react";
import { ClerkProvider, useAuth } from "@clerk/nextjs";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { ReactNode } from "react";

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export function ConvexClientProvider({ children }: { children: ReactNode }) {
    return (
        <ClerkProvider>
            <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
                {children}
            </ConvexProviderWithClerk>
        </ClerkProvider>
    );
}
```
