/**
 * Hook to manage active project selection via URL search params.
 * Falls back to first project if no projectId is specified.
 */
import { useSearchParams, useRouter, usePathname } from "next/navigation"
import { useCallback } from "react"
import { Id } from "../../convex/_generated/dataModel"

export function useProjectId() {
    const searchParams = useSearchParams()
    const router = useRouter()
    const pathname = usePathname()

    const projectId = searchParams.get("projectId") as Id<"projects"> | null

    const setProjectId = useCallback(
        (id: Id<"projects">) => {
            const params = new URLSearchParams(searchParams.toString())
            params.set("projectId", id)
            router.replace(`${pathname}?${params.toString()}`, { scroll: false })
        },
        [searchParams, router, pathname]
    )

    const clearProjectId = useCallback(() => {
        router.replace(pathname, { scroll: false })
    }, [router, pathname])

    return { projectId, setProjectId, clearProjectId }
}
