import Link from "next/link"
import {
    NavigationMenu,
    NavigationMenuContent,
    NavigationMenuItem,
    NavigationMenuLink,
    NavigationMenuList,
    NavigationMenuTrigger,
    navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu"
import { NavbarCTA } from "./NavbarCTA"
import { MobileNav } from "./MobileNav"
import { cn } from "@/lib/utils"
import { getTranslations } from "next-intl/server"

export async function Header() {
    const t = await getTranslations("landing.header")

    return (
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-16 items-center justify-between">
                <div className="flex items-center gap-6 md:gap-10">
                    <Link href="/" className="flex items-center gap-2">
                        <img 
                            src="/yoosr-light.svg" 
                            alt="Yoosr" 
                            className="h-8 w-auto"
                        />
                        <span className="hidden sm:inline-flex items-center rounded-full border border-border bg-muted px-2 py-0.5 text-[10px] font-mono font-medium text-muted-foreground tracking-wide">
                            {t("badge")}
                        </span>
                    </Link>
                    <nav className="hidden md:flex gap-6">
                        <Link href="#features" className="text-sm font-medium hover:text-primary transition-colors">
                            {t("nav.features")}
                        </Link>
                        <Link href="#solutions" className="text-sm font-medium hover:text-primary transition-colors">
                            {t("nav.solutions")}
                        </Link>
                        <Link href="#how-it-works" className="text-sm font-medium hover:text-primary transition-colors">
                            {t("nav.howItWorks")}
                        </Link>
                        <Link href="#testimonials" className="text-sm font-medium hover:text-primary transition-colors">
                            {t("nav.customers")}
                        </Link>
                        <div className="flex items-center gap-2 opacity-50 cursor-not-allowed group relative">
                            <span className="text-sm font-medium">{t("nav.pricing")}</span>
                            <span className="text-[10px] bg-muted px-1.5 py-0.5 rounded-full border border-border">
                                {t("badge") || "Early Access"}
                            </span>
                        </div>
                    </nav>
                </div>
                <div className="flex items-center gap-4">
                    <div className="hidden md:flex items-center gap-2">
                        <NavbarCTA />
                    </div>
                    <MobileNav />
                </div>
            </div>
        </header>
    )
}

async function BasicNav() {
    const t = await getTranslations("landing.header")
    return (
        <NavigationMenu>
            {/* Products */}
            <NavigationMenuList>
                <NavigationMenuItem>
                    <NavigationMenuTrigger>{t("dropdowns.products")}</NavigationMenuTrigger>
                    <NavigationMenuContent>
                        <ul className="grid gap-3 p-6 md:w-[400px] lg:w-[500px] lg:grid-cols-[.75fr_1fr]">
                            <li className="row-span-3">
                                <NavigationMenuLink asChild>
                                    <Link
                                        className="flex h-full w-full select-none flex-col justify-end rounded-md bg-gradient-to-b from-muted/50 to-muted p-6 no-underline outline-none focus:shadow-md"
                                        href="/"
                                    >
                                        <div className="mb-2 mt-4 text-lg font-medium">
                                            Yoosr Design Studio
                                        </div>
                                        <p className="text-sm leading-tight text-muted-foreground">
                                            Visually design your AI agents and conversation flows. No code required.
                                        </p>
                                    </Link>
                                </NavigationMenuLink>
                            </li>
                            <ListItem href="/products/knowledge-base" title="Knowledge Base">
                                Connect your data sources and documents instantly.
                            </ListItem>
                            <ListItem href="/products/integrations" title="Integrations">
                                Connect with WhatsApp, Messenger, and more.
                            </ListItem>
                            <ListItem href="/products/analytics" title="Analytics">
                                Real-time insights into your agent performance.
                            </ListItem>
                        </ul>
                    </NavigationMenuContent>
                </NavigationMenuItem>

                {/* Solutions */}
                <NavigationMenuItem>
                    <NavigationMenuTrigger>{t("nav.solutions")}</NavigationMenuTrigger>
                    <NavigationMenuContent>
                        <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px] ">
                            <ListItem href="/solutions/customer-service" title="Customer Service">
                                Automate support and reduce response times.
                            </ListItem>
                            <ListItem href="/solutions/marketing" title="Marketing & Sales">
                                Capture leads and qualify prospects 24/7.
                            </ListItem>
                            <ListItem href="/solutions/ecommerce" title="E-Commerce">
                                Personalized product recommendations and support.
                            </ListItem>
                            <ListItem href="/solutions/education" title="Education">
                                Student support and course information automation.
                            </ListItem>
                        </ul>
                    </NavigationMenuContent>
                </NavigationMenuItem>

                {/* Pricing */}
                <NavigationMenuItem>
                    <div className={cn(navigationMenuTriggerStyle(), "opacity-50 cursor-not-allowed flex items-center gap-2")}>
                        {t("nav.pricing")}
                        <span className="text-[10px] bg-muted px-1 py-0.5 rounded border border-border whitespace-nowrap">
                            Early Access
                        </span>
                    </div>
                </NavigationMenuItem>

                {/* Resources */}
                <NavigationMenuItem>
                    <Link href="/resources" legacyBehavior passHref>
                        <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                            {t("dropdowns.resources")}
                        </NavigationMenuLink>
                    </Link>
                </NavigationMenuItem>

            </NavigationMenuList>
        </NavigationMenu>
    )
}

const ListItem = ({ className, title, children, href, ...props }: any) => {
    const isInternal = href?.startsWith("/") || href?.startsWith("#")

    return (
        <li>
            <NavigationMenuLink asChild>
                {isInternal ? (
                    <Link
                        href={href}
                        className={cn(
                            "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
                            className
                        )}
                        {...props}
                    >
                        <div className="text-sm font-medium leading-none">{title}</div>
                        <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                            {children}
                        </p>
                    </Link>
                ) : (
                    <a
                        href={href}
                        className={cn(
                            "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
                            className
                        )}
                        {...props}
                    >
                        <div className="text-sm font-medium leading-none">{title}</div>
                        <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                            {children}
                        </p>
                    </a>
                )}
            </NavigationMenuLink>
        </li>
    )
}
