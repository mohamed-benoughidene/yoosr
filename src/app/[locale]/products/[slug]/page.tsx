import type { Metadata } from "next"
import { Button } from "@/components/ui/button"
import { Breadcrumb } from "@/components/ui/breadcrumb"

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
    const { slug } = await params
    const formattedSlug = slug.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://yoosr.io"
    const ogUrl = `${baseUrl}/og/image?title=${encodeURIComponent(formattedSlug)}&description=${encodeURIComponent(`Learn about ${formattedSlug} from Yoosr`)}`
    return {
        title: formattedSlug,
        description: `Learn about ${formattedSlug} from Yoosr.`,
        openGraph: {
            images: [{ url: ogUrl, width: 1200, height: 630, alt: formattedSlug }],
        },
        twitter: {
            images: [ogUrl],
        },
    }
}
import Link from "next/link"
import { setRequestLocale as unstable_setRequestLocale } from "next-intl/server"

const productContent: Record<string, { title: string; description: string; features: string[] }> = {
    "design-studio": {
        title: "Visual Design Studio",
        description: "Design conversational flows with a drag-and-drop interface. No coding skills required.",
        features: [
            "Drag-and-drop builder",
            "Pre-built templates",
            "Multi-channel preview",
            "Logic branching",
            "Variable management"
        ]
    },
    "knowledge-base": {
        title: "Knowledge Base AI",
        description: "Connect your data sources and documents instantly. Let AI answer customer queries based on your knowledge.",
        features: [
            "PDF & Text ingestion",
            "Website crawling",
            "Context-aware answers",
            "Hallucination control",
            "Source citing"
        ]
    },
    "integrations": {
        title: "Integrations",
        description: "Seamlessly connect Yoosr with your existing tech stack.",
        features: [
            "WhatsApp Business",
            "Facebook Messenger",
            "Telegram",
            "Shopify",
            "HubSpot",
            "Salesforce",
            "Zapier / Make"
        ]
    },
    "analytics": {
        title: "Analytics",
        description: "Gain deep insights into your agent's performance and customer satisfaction.",
        features: [
            "Real-time dashboard",
            "Conversation metrics",
            "Sentiment analysis",
            "User retention tracking",
            "Custom reports"
        ]
    }
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string ; locale: string }> }) {
    const { locale } = await params;
    unstable_setRequestLocale(locale);
    const { slug } = await params
    const content = productContent[slug]

    if (!content) {
        return (
            <div className="container py-20 text-center">
                <h1 className="text-4xl font-bold mb-4">Product Not Found</h1>
                <p className="text-muted-foreground mb-8">The product you are looking for does not exist.</p>
                <Button asChild>
                    <Link href="/">Back to Home</Link>
                </Button>
            </div>
        )
    }

    return (
        <div className="container py-12 md:py-20 lg:py-24">
            <Breadcrumb
                items={[
                    { label: "Home", href: "/" },
                    { label: "Products", href: "/" },
                    { label: content.title },
                ]}
                className="mb-8"
            />

            <div className="max-w-3xl">
                <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl mb-6">{content.title}</h1>
                <p className="text-xl text-muted-foreground mb-10 leading-relaxed">
                    {content.description}
                </p>

                <div className="bg-muted/30 rounded-xl p-8 border">
                    <h2 className="text-2xl font-bold mb-6">Key Features</h2>
                    <ul className="grid sm:grid-cols-2 gap-4">
                        {content.features.map((feature) => (
                            <li key={feature} className="flex items-center">
                                <span className="mr-2 h-2 w-2 rounded-full bg-primary" />
                                {feature}
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="mt-12 flex gap-4">
                    <Button size="lg" asChild>
                        <Link href="/signup">Get Started</Link>
                    </Button>
                    <Button size="lg" variant="outline" asChild>
                        <Link href="/demo">Schedule Demo</Link>
                    </Button>
                </div>
            </div>
        </div>
    )
}