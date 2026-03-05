"use client"

import {
  Activity, BarChart3, BookOpen, Bot, ChevronsUpDown,
  History, LayoutDashboard, LogOut, MessageSquare,
  MonitorPlay, Settings, Ticket, Users, ShoppingBag
} from "lucide-react"
import * as React from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { OrganizationSwitcher, useUser, useClerk } from "@clerk/nextjs"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Sidebar, SidebarContent, SidebarFooter, SidebarGroup,
  SidebarGroupContent, SidebarGroupLabel, SidebarHeader,
  SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarRail,
} from "@/components/ui/sidebar"

const navGroups = [
  {
    title: "",
    items: [
      { label: "Home", icon: LayoutDashboard, href: "/dashboard" },
      { label: "Monitor", icon: MonitorPlay, href: "/dashboard/monitor" },
      { label: "Chat", icon: MessageSquare, href: "/dashboard/chat" },
      { label: "Requests", icon: Ticket, href: "/dashboard/requests" },
      { label: "Orders", icon: ShoppingBag, href: "/dashboard/orders" },
    ],
  },
  {
    title: "AI",
    items: [
      { label: "Bots", icon: Bot, href: "/dashboard/bots" },
      { label: "Knowledge Base", icon: BookOpen, href: "/dashboard/kb" },
    ],
  },
  {
    title: "Data",
    items: [
      { label: "Analytics", icon: BarChart3, href: "/dashboard/analytics" },
      { label: "Activities", icon: Activity, href: "/dashboard/activities" },
      { label: "History", icon: History, href: "/dashboard/history" },
      { label: "Contacts", icon: Users, href: "/dashboard/contacts" },
    ],
  },
]

function OrgSwitcher() {
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton size="lg" asChild className="p-0 hover:bg-transparent">
          <div>
            <OrganizationSwitcher
              hidePersonal
              appearance={{
                elements: {
                  rootBox: "w-full",
                  organizationSwitcherTrigger: "flex w-full items-center gap-2 rounded-md px-2 py-1.5 hover:bg-sidebar-accent transition-colors text-sidebar-foreground",
                  organizationPreviewAvatarBox: "size-8 shrink-0",
                  organizationPreviewMainIdentifier: "text-sm font-semibold",
                  organizationPreviewSecondaryIdentifier: "text-xs text-muted-foreground",
                  organizationSwitcherTriggerIcon: "ml-auto text-muted-foreground",
                },
              }}
            />
          </div>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}

function NavUser() {
  const { user } = useUser()
  const { signOut } = useClerk()
  const router = useRouter()
  const initial = user?.firstName?.charAt(0)?.toUpperCase() ?? "?"
  const fullName = user?.fullName ?? user?.firstName ?? "Account"
  const email = user?.emailAddresses?.[0]?.emailAddress ?? ""
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton size="lg" className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground">
              <Avatar className="size-8 rounded-lg">
                <AvatarFallback className="rounded-lg text-xs font-semibold">{initial}</AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{fullName}</span>
                <span className="truncate text-xs text-muted-foreground">{email}</span>
              </div>
              <ChevronsUpDown className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg" side="bottom" align="end" sideOffset={4}>
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-sm">
                <Avatar className="size-8 rounded-lg">
                  <AvatarFallback className="rounded-lg text-xs">{initial}</AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">{fullName}</span>
                  <span className="truncate text-xs text-muted-foreground">{email}</span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => router.push("/dashboard/settings")}>
              <Settings className="mr-2 size-4" />Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => signOut({ redirectUrl: "/sign-in" })}>
              <LogOut className="mr-2 size-4" />Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname()
  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader><OrgSwitcher /></SidebarHeader>
      <SidebarContent className="overflow-hidden">
        <ScrollArea className="min-h-0 flex-1">
          {navGroups.map((group) => (
            <SidebarGroup key={group.title}>
              {group.title && <SidebarGroupLabel>{group.title}</SidebarGroupLabel>}
              <SidebarGroupContent>
                <SidebarMenu>
                  {group.items.map((item) => {
                    const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname?.startsWith(item.href + "/"))
                    return (
                      <SidebarMenuItem key={item.href}>
                        <SidebarMenuButton asChild isActive={isActive} tooltip={item.label}>
                          <Link href={item.href}>
                            <item.icon className="size-4" />
                            <span>{item.label}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    )
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          ))}
        </ScrollArea>
      </SidebarContent>
      <SidebarFooter><NavUser /></SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
