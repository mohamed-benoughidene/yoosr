# Settings Section Audit Report

This report documents the structure and implementation of the settings section as of February 28, 2026.

## 1. Settings Layout File
**File Path**: `src/app/dashboard/settings/layout.tsx`
This file wraps all sub-pages under `/dashboard/settings/*`. It defines the core grid structure, including the sidebar area and the main content area.

```tsx
import { Metadata } from "next"
import Image from "next/image"

import { Separator } from "@/components/ui/separator"
import { SettingsSidebar } from "@/components/settings/SettingsSidebar"

export const metadata: Metadata = {
    title: "Settings",
    description: "Manage your project settings and configuration.",
}

export const dynamic = "force-dynamic"

interface SettingsLayoutProps {
    children: React.ReactNode
}

export default function SettingsLayout({ children }: SettingsLayoutProps) {
    return (
        <div className="hidden space-y-6 p-10 pb-16 md:block">
            <div className="space-y-0.5">
                <h2 className="text-2xl font-bold tracking-tight">Settings</h2>
                <p className="text-muted-foreground">
                    Manage your project settings and configuration.
                </p>
            </div>
            <Separator className="my-6" />
            <div className="flex flex-col space-y-8 lg:flex-row lg:space-x-12 lg:space-y-0">
                <aside className="-mx-4 lg:w-1/5">
                    <SettingsSidebar />
                </aside>
                <div className="flex-1 lg:max-w-2xl">{children}</div>
            </div>
        </div>
    )
}
```

## 2. Settings Sidebar (Sub-Navigation)
**File Path**: `src/components/settings/SettingsSidebar.tsx`
This component is rendered within the `aside` tag of the layout above and handles the left-column navigation using a vertical list of buttons.

```tsx
"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"
import {
    Settings,
    MessageSquare,
    LayoutTemplate,
    Building2,
    UserPlus,
    Tag,
    Clock,
    Plug,
    ShoppingBag,
    Webhook,
} from "lucide-react"

const sidebarNavItems = [
    {
        title: "Project Settings",
        href: "/dashboard/settings/general",
        icon: Settings
    },
    {
        title: "Widget Setup",
        href: "/dashboard/settings/widget",
        icon: LayoutTemplate
    },
    {
        title: "Departments",
        href: "/dashboard/settings/departments",
        icon: Building2
    },
    {
        title: "Teammates",
        href: "/dashboard/settings/teammates",
        icon: UserPlus
    },
    {
        title: "Canned Responses",
        href: "/dashboard/settings/canned-responses",
        icon: MessageSquare
    },
    {
        title: "Labels",
        href: "/dashboard/settings/labels",
        icon: Tag
    },
    {
        title: "Operating Hours",
        href: "/dashboard/settings/operating-hours",
        icon: Clock
    },
    {
        title: "Webhooks",
        href: "/dashboard/settings/webhooks",
        icon: Webhook
    },
    {
        title: "Integrations",
        href: "/dashboard/settings/integrations",
        icon: Plug
    },
    {
        title: "App Store",
        href: "/dashboard/settings/app-store",
        icon: ShoppingBag
    },
]

interface SettingsSidebarProps extends React.HTMLAttributes<HTMLElement> { }

export function SettingsSidebar({ className, ...props }: SettingsSidebarProps) {
    const pathname = usePathname()

    return (
        <nav
            className={cn(
                "flex space-x-2 lg:flex-col lg:space-x-0 lg:space-y-1",
                className
            )}
            {...props}
        >
            {sidebarNavItems.map((item) => (
                <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                        buttonVariants({ variant: "ghost" }),
                        pathname === item.href
                            ? "bg-muted hover:bg-muted"
                            : "hover:bg-transparent hover:underline",
                        "justify-start"
                    )}
                >
                    <item.icon className="mr-2 h-4 w-4" />
                    {item.title}
                </Link>
            ))}
        </nav>
    )
}
```

## 3. Settings Sub-Page Structure (Example: Departments)
**File Path**: `src/app/dashboard/settings/departments/page.tsx`
The sub-pages are rendered inside the `flex-1 lg:max-w-2xl` container from the layout. They follow a consistent internal spacing pattern.

**Outermost container and padding structure**:
```tsx
export default function DepartmentsPage() {
    // ... logic ...

    return (
        <TooltipProvider>
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-lg font-medium">Departments</h3>
                        <p className="text-sm text-muted-foreground">
                            Organize your team into groups (e.g., Sales, Support).
                        </p>
                    </div>
                </div>
                <Separator />

                <Card>
                    {/* ... Content ... */}
                </Card>
            </div>
        </TooltipProvider>
    )
}
```

## Summary of Design Patterns
- **Root Padding**: `p-10 pb-16` within the settings layout.
- **Navigation Width**: Managed by `lg:w-1/5` for the sidebar.
- **Content Constraint**: Content is limited to `lg:max-w-2xl` to ensure readability.
- **Component Spacing**: Heavy use of `space-y-6` for vertical stacking and `Separator` for clear sectioning.
