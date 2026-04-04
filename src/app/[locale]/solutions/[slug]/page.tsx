import type { Metadata } from "next"
import { Button } from "@/components/ui/button"

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
    const { slug } = await params
    const formattedSlug = slug.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://yoosr.co"
    const desc = `See how Yoosr helps ${slug.replace(/-/g, ' ')} businesses manage customer support.`
    const ogUrl = `${baseUrl}/og/image?title=${encodeURIComponent(`${formattedSlug} Solutions`)}&description=${encodeURIComponent(desc)}`
    return {
        title: `${formattedSlug} Solutions — Yoosr`,
        description: desc,
        openGraph: {
            images: [{ url: ogUrl, width: 1200, height: 630, alt: `${formattedSlug} Solutions` }],
        },
        twitter: {
            images: [ogUrl],
        },
    }
}
import Link from "next/link"
import { ArrowLeft, CheckCircle2 } from "lucide-react"
import { setRequestLocale as unstable_setRequestLocale } from "next-intl/server"

const solutionContent: Record<string, { title: string; subtitle: string; benefits: string[] }> = {
    "customer-service": {
        title: "AI for Customer Service",
        subtitle: "Automate 80% of support requests and let your team focus on complex issues.",
        benefits: [
            "24/7 Instant Responses",
            "Seamless Human Handoff",
            "Ticket Automation",
            "Multi-language Support",
            "CSAT Improvement"
        ]
    },
    "marketing": {
        title: "AI for Marketing & Sales",
        subtitle: "Turn conversations into conversions. Qualify leads automatically and book meetings.",
        benefits: [
            "Lead Qualification",
            "Meeting Scheduling",
            "Proactive Engagement",
            "Campaign Automation",
            "CRM Integration"
        ]
    },
    "ecommerce": {
        title: "AI for E-Commerce",
        subtitle: "Boost sales and reduce cart abandonment with personalized shopping assistants.",
        benefits: [
            "Product Recommendations",
            "Order Tracking",
            "Return Management",
            "Personalized Offers",
            "Inventory Checks"
        ]
    },
    "education": {
        title: "AI for Education",
        subtitle: "Support students and staff with instant access to information and resources.",
        benefits: [
            "Course Information",
            "Enrollment Support",
            "Campus FAQ",
            "Library Assistance",
            "Student Onboarding"
        ]
    }
}

export default async function SolutionPage({ params }: { params: Promise<{ slug: string ; locale: string }> }) {
    const { locale } = await params;
    unstable_setRequestLocale(locale);
    const { slug } = await params
    const content = solutionContent[slug]

    if (!content) {
        return (
            <div className="container py-20 text-center">
                <h1 className="text-4xl font-bold mb-4">Solution Not Found</h1>
                <p className="text-muted-foreground mb-8">The solution you are looking for does not exist.</p>
                <Button asChild>
                    <Link href="/">Back to Home</Link>
                </Button>
            </div>
        )
    }

    return (
        <div className="container py-12 md:py-20 lg:py-24">
            <Link href="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-8">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Home
            </Link>

            <div className="grid lg:grid-cols-2 gap-12 items-center">
                <div>
                    <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl mb-6">{content.title}</h1>
                    <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
                        {content.subtitle}
                    </p>
                    <div className="flex gap-4 mb-12">
                        <Button size="lg" asChild>
                            <Link href="/signup">Get Started Free</Link>
                        </Button>
                        <Button size="lg" variant="outline" asChild>
                            <Link href="/contact">Talk to Sales</Link>
                        </Button>
                    </div>
                </div>
                <div className="bg-muted p-8 rounded-2xl border shadow-sm">
                    <h3 className="text-xl font-bold mb-6">Why Choose Yoosr?</h3>
                    <ul className="space-y-4">
                        {content.benefits.map((benefit) => (
                            <li key={benefit} className="flex items-start">
                                <CheckCircle2 className="mr-3 h-6 w-6 text-primary flex-shrink-0" />
                                <span className="text-lg">{benefit}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    )
}