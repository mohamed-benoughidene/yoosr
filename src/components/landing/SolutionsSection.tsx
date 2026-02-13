import Link from "next/link"
import { ArrowRight, Bot, MessageSquareText, ShoppingCart, GraduationCap } from "lucide-react"
import { Button } from "@/components/ui/button"

const solutions = [
    {
        title: "Customer Service",
        description: "Automate support tickets and resolve queries instantly with AI agents.",
        icon: Bot,
        href: "/solutions/customer-service",
        color: "text-blue-500",
        bgColor: "bg-blue-50 dark:bg-blue-950/20",
    },
    {
        title: "Marketing & Sales",
        description: "Qualify leads 24/7 and book meetings automatically.",
        icon: MessageSquareText,
        href: "/solutions/marketing",
        color: "text-purple-500",
        bgColor: "bg-purple-50 dark:bg-purple-950/20",
    },
    {
        title: "E-Commerce",
        description: "Personalized product recommendations and order tracking.",
        icon: ShoppingCart,
        href: "/solutions/ecommerce",
        color: "text-green-500",
        bgColor: "bg-green-50 dark:bg-green-950/20",
    },
    {
        title: "Education",
        description: "Assist students with course info and enrollment queries.",
        icon: GraduationCap,
        href: "/solutions/education",
        color: "text-orange-500",
        bgColor: "bg-orange-50 dark:bg-orange-950/20",
    },
]

export function SolutionsSection() {
    return (
        <section id="solutions" className="container py-12 md:py-24 lg:py-32">
            <div className="mx-auto flex max-w-[58rem] flex-col items-center justify-center gap-4 text-center mb-16">
                <h2 className="font-extrabold text-3xl leading-[1.1] sm:text-3xl md:text-5xl">
                    Solutions for every industry
                </h2>
                <p className="max-w-[85%] leading-normal text-muted-foreground sm:text-lg sm:leading-7">
                    Tailored AI workflows to meet your specific business needs.
                </p>
            </div>

            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
                {solutions.map((solution) => (
                    <div
                        key={solution.title}
                        className="group relative flex flex-col justify-between overflow-hidden rounded-xl border bg-background p-6 hover:shadow-lg transition-all hover:-translate-y-1"
                    >
                        <div>
                            <div className={`mb-6 flex h-12 w-12 items-center justify-center rounded-lg ${solution.bgColor}`}>
                                <solution.icon className={`h-6 w-6 ${solution.color}`} />
                            </div>
                            <h3 className="text-xl font-bold">{solution.title}</h3>
                            <p className="mt-2 text-muted-foreground text-sm leading-relaxed">
                                {solution.description}
                            </p>
                        </div>
                        <div className="mt-6">
                            <Button variant="link" className="p-0 h-auto font-semibold group-hover:text-primary" asChild>
                                <Link href={solution.href} className="flex items-center">
                                    Learn more <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                                </Link>
                            </Button>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    )
}
