# Audit Report

## 1. Complete content of `src/app/dashboard/layout.tsx`

```tsx
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/dashboard/AppSidebar"
import { SiteHeader } from "@/components/dashboard/SiteHeader"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    return (
        <SidebarProvider>
            <AppSidebar />
            <SidebarInset>
                <SiteHeader />
                <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
                    {children}
                </div>
            </SidebarInset>
        </SidebarProvider>
    )
}
```

## 2. className of the outer div in `SidebarProvider` (`src/components/ui/sidebar.tsx`)

```tsx
cn(
  "group/sidebar-wrapper flex min-h-svh w-full has-[[data-variant=inset]]:bg-sidebar",
  className
)
```

## 3. Complete className string of `SidebarInset` (`src/components/ui/sidebar.tsx`)

```tsx
cn(
  "relative flex w-full flex-1 flex-col bg-background",
  "md:peer-data-[variant=inset]:m-2 md:peer-data-[state=collapsed]:peer-data-[variant=inset]:ml-2 md:peer-data-[variant=inset]:ml-0 md:peer-data-[variant=inset]:rounded-xl md:peer-data-[variant=inset]:shadow",
  className
)
```

## 4. Exact props on the `<Sidebar>` component opening tag (`src/components/dashboard/AppSidebar.tsx`)

```tsx
<Sidebar variant="inset" {...props}>
```

## 5. Complete return JSX in `src/components/dashboard/SiteHeader.tsx`

```tsx
    return (
        <header className="flex h-16 shrink-0 items-center gap-2 px-4">
            <div className="flex items-center gap-2">
                <SidebarTrigger className="-ml-1" />
                <Separator orientation="vertical" className="mr-2 data-[orientation=vertical]:h-4" />
                <span className="text-sm font-medium">{pageLabel}</span>
            </div>
            <div className="ml-auto flex items-center gap-3">
                <div className="flex items-center gap-2">
                    <Switch
                        id="availability"
                        checked={isAvailable}
                        onCheckedChange={(val) => { setIsAvailable(val); console.log("availability:", val) }}
                    />
                    <label htmlFor="availability" className={`cursor-pointer select-none text-sm font-medium ${isAvailable ? "text-green-600" : "text-muted-foreground"}`}>
                        Available
                    </label>
                </div>
            </div>
        </header>
    )
```
