import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
    NavigationMenu,
    NavigationMenuContent,
    NavigationMenuItem,
    NavigationMenuLink,
    NavigationMenuList,
    NavigationMenuTrigger,
    navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu"
import { MobileNav } from "./MobileNav"
import { cn } from "@/lib/utils"

export function Header() {
    return (
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-16 items-center justify-between">
                <div className="flex items-center gap-6 md:gap-10">
                    <Link href="/" className="flex items-center space-x-2">
                        <span className="text-xl font-bold">Yoosr</span>
                    </Link>
                    <nav className="hidden md:flex gap-6">
                        <Link href="#features" className="text-sm font-medium hover:text-primary transition-colors">
                            Features
                        </Link>
                        <Link href="#solutions" className="text-sm font-medium hover:text-primary transition-colors">
                            Solutions
                        </Link>
                        <Link href="#how-it-works" className="text-sm font-medium hover:text-primary transition-colors">
                            How it Works
                        </Link>
                        <Link href="#testimonials" className="text-sm font-medium hover:text-primary transition-colors">
                            Customers
                        </Link>
                        <Link href="#pricing" className="text-sm font-medium hover:text-primary transition-colors">
                            Pricing
                        </Link>
                    </nav>
                </div>
                <div className="flex items-center gap-4">
                    <div className="hidden md:flex items-center gap-2">
                        <Button variant="ghost" asChild>
                            <Link href="/login">Sign In</Link>
                        </Button>
                        <Button asChild>
                            <Link href="/signup">Get Started</Link>
                        </Button>
                    </div>
                    <MobileNav />
                </div>
            </div>
        </header>
    )
}

function BasicNav() {
    return (
        <NavigationMenu>
            {/* Products */}
            <NavigationMenuList>
                <NavigationMenuItem>
                    <NavigationMenuTrigger>Products</NavigationMenuTrigger>
                    <NavigationMenuContent>
                        <ul className="grid gap-3 p-6 md:w-[400px] lg:w-[500px] lg:grid-cols-[.75fr_1fr]">
                            <li className="row-span-3">
                                <NavigationMenuLink asChild>
                                    <a
                                        className="flex h-full w-full select-none flex-col justify-end rounded-md bg-gradient-to-b from-muted/50 to-muted p-6 no-underline outline-none focus:shadow-md"
                                        href="/"
                                    >
                                        <div className="mb-2 mt-4 text-lg font-medium">
                                            Yoosr Design Studio
                                        </div>
                                        <p className="text-sm leading-tight text-muted-foreground">
                                            Visually design your AI agents and conversation flows. No code required.
                                        </p>
                                    </a>
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
                    <NavigationMenuTrigger>Solutions</NavigationMenuTrigger>
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
                    <Link href="/pricing" legacyBehavior passHref>
                        <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                            Pricing
                        </NavigationMenuLink>
                    </Link>
                </NavigationMenuItem>

                {/* Resources */}
                <NavigationMenuItem>
                    <Link href="/resources" legacyBehavior passHref>
                        <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                            Resources
                        </NavigationMenuLink>
                    </Link>
                </NavigationMenuItem>

            </NavigationMenuList>
        </NavigationMenu>
    )
}

const ListItem = ({ className, title, children, href, ...props }: any) => {
    return (
        <li>
            <NavigationMenuLink asChild>
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
            </NavigationMenuLink>
        </li>
    )
}
