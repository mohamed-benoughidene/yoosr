import { Sheet, SheetContent, SheetTrigger, SheetClose, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Menu } from "lucide-react"
import Link from "next/link"

export function MobileNav() {
    return (
        <Sheet>
            <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                    <Menu className="h-6 w-6" />
                    <span className="sr-only">Toggle menu</span>
                </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[300px] sm:w-[400px]">
                <SheetHeader>
                    <SheetTitle className="sr-only">Menu</SheetTitle>
                    <SheetDescription className="sr-only">
                        Navigation links for Yoosr landing page.
                    </SheetDescription>
                </SheetHeader>
                <nav className="flex flex-col gap-4">
                    <Link href="/" className="text-lg font-bold">
                        Yoosr
                    </Link>
                    <div className="flex flex-col gap-3 mt-4">
                        <SheetClose asChild>
                            <Link href="#features" className="text-sm font-medium hover:text-primary transition-colors py-2">
                                Features
                            </Link>
                        </SheetClose>
                        <SheetClose asChild>
                            <Link href="#solutions" className="text-sm font-medium hover:text-primary transition-colors py-2">
                                Solutions
                            </Link>
                        </SheetClose>
                        <SheetClose asChild>
                            <Link href="#how-it-works" className="text-sm font-medium hover:text-primary transition-colors py-2">
                                How it Works
                            </Link>
                        </SheetClose>
                        <SheetClose asChild>
                            <Link href="#testimonials" className="text-sm font-medium hover:text-primary transition-colors py-2">
                                Customers
                            </Link>
                        </SheetClose>
                        <div className="flex items-center gap-2 py-2 opacity-50 cursor-not-allowed">
                            <span className="text-sm font-medium">Pricing</span>
                            <span className="text-[10px] bg-muted px-1.5 py-0.5 rounded-full border border-border whitespace-nowrap">
                                Early Access
                            </span>
                        </div>
                    </div>

                    <div className="mt-8 flex flex-col gap-2">
                        <Button variant="ghost" asChild>
                            <Link href="/login">Sign In</Link>
                        </Button>
                        <Button asChild>
                            <Link href="/signup">Get Started</Link>
                        </Button>
                    </div>
                </nav>
            </SheetContent>
        </Sheet>
    )
}
