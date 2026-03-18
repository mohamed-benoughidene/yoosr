import Link from "next/link"
import { Facebook, Twitter, Instagram, Linkedin, Github } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

import { getTranslations } from "next-intl/server"

export async function Footer() {
    const t = await getTranslations("landing.footer")

    return (
        <footer className="bg-muted/30 border-t">
            <div className="container py-12 md:py-16 lg:py-20">
                <div className="grid grid-cols-2 gap-8 md:grid-cols-3 lg:grid-cols-6 mb-12">
                    <div className="col-span-2 lg:col-span-2 lg:pr-8">
                        <Link href="/" className="text-2xl font-black tracking-tight flex items-center gap-2 mb-6">
                            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                                <span className="text-primary-foreground font-bold">Y</span>
                            </div>
                            Yoosr
                        </Link>
                        <p className="text-sm leading-relaxed text-muted-foreground max-w-sm">
                            {t("tagline")}
                        </p>
                        <div className="mt-8 flex space-x-4">
                            <SocialLink href="#" icon={Twitter} label="Twitter" />
                            <SocialLink href="#" icon={Github} label="GitHub" />
                            <SocialLink href="#" icon={Linkedin} label="LinkedIn" />
                            <SocialLink href="#" icon={Facebook} label="Facebook" />
                            <SocialLink href="#" icon={Instagram} label="Instagram" />
                        </div>
                    </div>

                    <div>
                        <h3 className="text-sm font-bold tracking-wide uppercase text-foreground mb-4">{t("categories.product")}</h3>
                        <ul className="space-y-3 text-sm text-muted-foreground">
                            <FooterLink href="/products/design-studio">Design Studio</FooterLink>
                            <FooterLink href="/products/knowledge-base">Knowledge Base</FooterLink>
                            <FooterLink href="/products/integrations">Integrations</FooterLink>
                            <FooterLink href="/features">Features</FooterLink>
                            <li className="flex items-center gap-2 opacity-50 cursor-default">
                                <span className="text-sm">Pricing</span>
                                <span className="text-[10px] bg-muted px-1 py-0.5 rounded border border-border whitespace-nowrap">
                                    Early Access
                                </span>
                            </li>
                            <FooterLink href="/changelog">Changelog</FooterLink>
                            <FooterLink href="/roadmap">Roadmap</FooterLink>
                        </ul>
                    </div>

                    <div>
                        <h3 className="text-sm font-bold tracking-wide uppercase text-foreground mb-4">{t("categories.solutions")}</h3>
                        <ul className="space-y-3 text-sm text-muted-foreground">
                            <FooterLink href="/solutions/customer-service">Customer Service</FooterLink>
                            <FooterLink href="/solutions/marketing">Marketing & Sales</FooterLink>
                            <FooterLink href="/solutions/ecommerce">E-Commerce</FooterLink>
                            <FooterLink href="/solutions/education">Education</FooterLink>
                        </ul>
                    </div>

                    <div>
                        <h3 className="text-sm font-bold tracking-wide uppercase text-foreground mb-4">{t("categories.developers")}</h3>
                        <ul className="space-y-3 text-sm text-muted-foreground">
                            <FooterLink href="/docs">Documentation</FooterLink>
                            <FooterLink href="/api">API Reference</FooterLink>
                            <FooterLink href="/sdk">SDKs</FooterLink>
                            <FooterLink href="/community">Community</FooterLink>
                            <FooterLink href="https://github.com/yoosr">GitHub</FooterLink>
                            <FooterLink href="/status">System Status</FooterLink>
                        </ul>
                    </div>

                    <div>
                        <h3 className="text-sm font-bold tracking-wide uppercase text-foreground mb-4">{t("categories.company")}</h3>
                        <ul className="space-y-3 text-sm text-muted-foreground">
                            <FooterLink href="/about">About Us</FooterLink>
                            <FooterLink href="/careers">Careers</FooterLink>
                            <FooterLink href="/contact">Contact</FooterLink>
                            <FooterLink href="/partners">Partners</FooterLink>
                            <FooterLink href="/legal/privacy">{t("legal.privacy")}</FooterLink>
                            <FooterLink href="/legal/terms">{t("legal.terms")}</FooterLink>
                        </ul>
                    </div>
                </div>

                <div className="mt-16 border-t pt-8">
                    <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 items-end">
                        <div className="flex flex-col gap-4">
                            <h3 className="text-sm font-semibold">{t("newsletter.label")}</h3>
                            <p className="text-sm text-muted-foreground max-w-md">{t("tagline")}</p>
                            <div className="flex gap-2 max-w-md">
                                <Input placeholder={t("newsletter.placeholder")} className="bg-background" />
                                <Button>{t("newsletter.button")}</Button>
                            </div>
                        </div>
                        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-muted-foreground lg:justify-end">
                            <div className="flex flex-col gap-1 items-center sm:items-end">
                                <p>&copy; {new Date().getFullYear()} {t("copyright")}</p>
                                <p className="text-xs text-muted-foreground text-center sm:text-right">
                                    {t("disclaimer")}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    )
}

function SocialLink({ href, icon: Icon, label }: any) {
    return (
        <Link href={href} className="text-muted-foreground hover:text-primary transition-colors">
            <Icon className="h-5 w-5" />
            <span className="sr-only">{label}</span>
        </Link>
    )
}

function FooterLink({ href, children }: any) {
    return (
        <li>
            <Link href={href} className="hover:text-primary transition-colors">
                {children}
            </Link>
        </li>
    )
}
