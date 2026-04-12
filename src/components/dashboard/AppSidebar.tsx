"use client"

import {
  Activity, BarChart3, BookOpen, Bot, ChevronsUpDown,
  History, LayoutDashboard, LogOut, MessageSquare,
  MonitorPlay, Settings, Ticket, Users, ShoppingBag, Sun, Moon
} from "lucide-react"
import * as React from "react"
import { useState, useEffect } from "react"
import { useLocale, useTranslations } from "next-intl"
import { Link, usePathname, useRouter } from "@/i18n/navigation"
import { OrganizationSwitcher, useUser, useClerk } from "@clerk/nextjs"
import { useProject } from "@/context/ProjectContext"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { LanguageSwitcher } from "@/components/LanguageSwitcher"
import { useTheme } from "next-themes"
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
import { FeedbackModal } from "@/components/feedback/FeedbackModal"

interface NavItem {
  labelKey: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
}

interface NavGroup {
  title: string;
  items: NavItem[];
}

const navGroups: NavGroup[] = [
  {
    title: "",
    items: [
      { labelKey: "dashboard", icon: LayoutDashboard, href: "/dashboard" },
      { labelKey: "monitor", icon: MonitorPlay, href: "/dashboard/monitor" },
      { labelKey: "chat", icon: MessageSquare, href: "/dashboard/chat" },
      { labelKey: "requests", icon: Ticket, href: "/dashboard/requests" },
      { labelKey: "orders", icon: ShoppingBag, href: "/dashboard/orders" },
    ],
  },
  {
    title: "group_ai",
    items: [
      { labelKey: "bots", icon: Bot, href: "/dashboard/bots" },
      { labelKey: "knowledge_base", icon: BookOpen, href: "/dashboard/kb" },
    ],
  },
  {
    title: "group_data",
    items: [
      { labelKey: "analytics", icon: BarChart3, href: "/dashboard/analytics" },
      { labelKey: "activities", icon: Activity, href: "/dashboard/activities" },
      { labelKey: "history", icon: History, href: "/dashboard/history" },
      { labelKey: "contacts", icon: Users, href: "/dashboard/contacts" },
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
                  organizationSwitcherTriggerIcon: "ms-auto text-muted-foreground",
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
  const t = useTranslations("nav")
  const tFeedback = useTranslations("dashboard.feedback")
  const locale = useLocale()
  const { user } = useUser()
  const { signOut, openUserProfile } = useClerk()
  const { activeProject } = useProject()
  const router = useRouter()
  const [feedbackOpen, setFeedbackOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const { setTheme, resolvedTheme } = useTheme()

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 0)
    return () => clearTimeout(timer)
  }, [])

  const isAdmin = activeProject?.userRole === "org:admin"
  const initial = user?.firstName?.charAt(0)?.toUpperCase() ?? "?"
  const fullName = user?.fullName ?? user?.firstName ?? "Account"
  const email = user?.emailAddresses?.[0]?.emailAddress ?? ""
  const isDark = resolvedTheme === "dark"

  const toggleTheme = () => setTheme(isDark ? "light" : "dark")
  return (
    <>
      <SidebarMenu>
        <SidebarMenuItem>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <SidebarMenuButton size="lg" className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground" suppressHydrationWarning>
                <Avatar className="size-8 rounded-lg">
                  <AvatarImage src={user?.imageUrl} alt={fullName} />
                  <AvatarFallback className="rounded-lg text-xs font-semibold">{initial}</AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">{fullName}</span>
                  <span className="truncate text-xs text-muted-foreground">{email}</span>
                </div>
                <ChevronsUpDown className="ms-auto size-4" />
              </SidebarMenuButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg" side="bottom" align="end" sideOffset={4}>
              <DropdownMenuLabel className="p-0 font-normal">
                <div
                  className="flex items-center gap-2 px-1 py-1.5 text-sm cursor-pointer hover:bg-sidebar-accent transition-colors rounded-t-lg"
                  onClick={() => openUserProfile()}
                >
                  <Avatar className="size-8 rounded-lg">
                    <AvatarImage src={user?.imageUrl} alt={fullName} />
                    <AvatarFallback className="rounded-lg text-xs">{initial}</AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-medium">{fullName}</span>
                    <span className="truncate text-xs text-muted-foreground">{email}</span>
                  </div>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <div className={isAdmin ? "" : "hidden"}>
                <DropdownMenuItem onClick={() => router.push("/dashboard/settings")}>
                  <Settings className="me-2 size-4" />{t("settings")}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
              </div>
              <LanguageSwitcher />
              <DropdownMenuSeparator />
              {mounted && (
                <DropdownMenuItem onClick={toggleTheme}>
                  {isDark ? <Sun className="me-2 size-4" /> : <Moon className="me-2 size-4" />}
                  {isDark ? "Light Mode" : "Dark Mode"}
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setFeedbackOpen(true)}>
                <MessageSquare className="me-2 size-4" />{tFeedback("menuItem")}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => signOut({ redirectUrl: `/${locale}` })}>
                <LogOut className="me-2 size-4" />Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>
      </SidebarMenu>
      <FeedbackModal open={feedbackOpen} onClose={() => setFeedbackOpen(false)} />
    </>
  )
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const t = useTranslations("nav")
  const locale = useLocale()
  const pathname = usePathname()
  const { activeProject } = useProject()
  const isAdmin = activeProject?.userRole === "org:admin"
  const side = locale === "ar" ? "right" : "left"
  const dir = locale === "ar" ? "rtl" : "ltr"

  return (
    <Sidebar variant="inset" side={side} dir={dir} {...props}>
      <SidebarHeader><OrgSwitcher /></SidebarHeader>
      <SidebarContent className="overflow-hidden">
        <ScrollArea className="min-h-0 flex-1">
          {navGroups.map((group) => (
            <SidebarGroup key={group.title}>
              <SidebarGroupLabel dir="auto">{group.title ? t(group.title) : null}</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {group.items.map((item) => {
                    const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname?.startsWith(item.href + "/"))
                    const isHidden = item.labelKey === "analytics" && !isAdmin
                    return (
                      <SidebarMenuItem key={item.href} className={isHidden ? "hidden" : ""}>
                        <SidebarMenuButton asChild isActive={isActive} tooltip={t(item.labelKey)}>
                          <Link href={item.href}>
                            <item.icon className="size-4" />
                            <span>{t(item.labelKey)}</span>
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
