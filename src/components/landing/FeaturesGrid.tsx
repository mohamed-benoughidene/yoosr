import { Combine, Database, MessageSquare, Zap } from "lucide-react"

const features = [
    {
        name: "Visual Design Studio",
        description: "Drag-and-drop interface to design complex conversation flows. No coding required.",
        icon: Combine,
    },
    {
        name: "Knowledge Base AI",
        description: "Train your AI on your own data. Upload PDFs, crawl websites, and connect databases.",
        icon: Database,
    },
    {
        name: "Omnichannel Support",
        description: "Deploy once, run everywhere. WhatsApp, Messenger, Telegram, and your website.",
        icon: MessageSquare,
    },
    {
        name: "One-Click Integrations",
        description: "Connect with your favorite tools like HubSpot, Salesforce, and Shopify in seconds.",
        icon: Zap,
    },
]

export function FeaturesGrid() {
    return (
        <section className="container space-y-6 bg-slate-50 py-8 dark:bg-transparent md:py-12 lg:py-24">
            <div className="mx-auto flex max-w-[58rem] flex-col items-center space-y-4 text-center">
                <h2 className="text-3xl font-extrabold leading-[1.1] text-foreground sm:text-3xl md:text-6xl">
                    Everything you need
                </h2>
                <p className="max-w-[85%] leading-normal text-muted-foreground sm:text-lg sm:leading-7">
                    Yoosr provides a complete suite of tools to build, deploy, and manage AI agents at scale.
                </p>
            </div>
            <div className="mx-auto grid justify-center gap-4 sm:grid-cols-2 md:max-w-[64rem] md:grid-cols-2 lg:grid-cols-4">
                {features.map((feature) => (
                    <div
                        key={feature.name}
                        className="feature-card relative overflow-hidden rounded-lg border bg-background p-2 transition-all hover:shadow-lg hover:-translate-y-1 duration-300"
                    >
                        <div className="flex h-[180px] flex-col justify-between rounded-md p-6">
                            <feature.icon className="h-12 w-12 text-primary" />
                            <div className="space-y-2">
                                <h3 className="font-bold">{feature.name}</h3>
                                <p className="text-sm text-muted-foreground">
                                    {feature.description}
                                </p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    )
}
