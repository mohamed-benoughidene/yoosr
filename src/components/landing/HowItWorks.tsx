import { MessageSquarePlus, Database, Send } from "lucide-react"

const steps = [
    {
        title: "1. Design your conversation",
        description: "Use our visual drag-and-drop designer to create complex flows. No coding required.",
        icon: MessageSquarePlus,
    },
    {
        title: "2. Connect your knowledge",
        description: "Upload PDFs, crawl your website, or connect your database to train your AI instantly.",
        icon: Database,
    },
    {
        title: "3. Deploy everywhere",
        description: "Publish your agent to WhatsApp, Messenger, Telegram, and your website with one click.",
        icon: Send,
    },
]

export function HowItWorks() {
    return (
        <section className="container py-12 md:py-24 lg:py-32 bg-slate-50 dark:bg-transparent">
            <div className="mx-auto flex max-w-[58rem] flex-col items-center justify-center gap-4 text-center mb-16">
                <h2 className="font-extrabold text-3xl leading-[1.1] sm:text-3xl md:text-5xl">
                    How it works
                </h2>
                <p className="max-w-[85%] leading-normal text-muted-foreground sm:text-lg sm:leading-7">
                    Build your first AI agent in minutes, not months.
                </p>
            </div>

            <div className="grid gap-12 md:grid-cols-3">
                {steps.map((step, index) => (
                    <div key={index} className="relative flex flex-col items-center text-center space-y-4">
                        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary mb-4">
                            <step.icon className="h-8 w-8" />
                        </div>
                        <h3 className="text-xl font-bold">{step.title}</h3>
                        <p className="text-muted-foreground leading-relaxed">
                            {step.description}
                        </p>
                        {/* Connector line for desktop */}
                        {index < steps.length - 1 && (
                            <div className="hidden md:block absolute top-8 left-1/2 w-full h-0.5 bg-border -z-10 translate-x-1/2" />
                        )}
                    </div>
                ))}
            </div>
        </section>
    )
}
