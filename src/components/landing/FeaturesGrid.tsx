import React from "react"

const features = [
    {
        title: "Live Monitor",
        description: "Supervise every open conversation in real time. Filter by department, agent, label, status, or SLA urgency. Join any conversation instantly.",
        tag: "REAL-TIME",
        emoji: "📡"
    },
    {
        title: "AI Bot Studio",
        description: "Build flows with 19 block types — AI reply, knowledge base lookup, web requests, conditions, wait timers, and human handoff. No code required.",
        tag: "NO-CODE",
        emoji: "🤖"
    },
    {
        title: "Knowledge Base",
        description: "Upload your docs and FAQs. Bots retrieve answers via vector search — not keyword matching. Accurate, source-grounded replies.",
        tag: "VECTOR SEARCH",
        emoji: "🧠"
    },
    {
        title: "Analytics",
        description: "Track CSAT scores, token usage per model, and unanswered queries. Date range filters. See exactly where your bot falls short.",
        tag: "INSIGHTS",
        emoji: "📊"
    },
    {
        title: "SLA Tracking",
        description: "Set response deadlines per department. Monitor breach risk in real time. Automatic alerts before SLA expires.",
        tag: "SLA",
        emoji: "⏱️"
    },
    {
        title: "Multi-channel",
        description: "Web chat, Telegram, Facebook Messenger, and Instagram DMs. One inbox for every channel your customers use.",
        tag: "CHANNELS",
        emoji: "💬"
    }
]

export function FeaturesGrid() {
    return (
        <section className="container py-12 md:py-24">
            <div className="flex flex-col items-center text-center mb-16">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-[1px] bg-primary"></div>
                    <span className="text-[11px] font-mono font-bold uppercase tracking-widest text-primary">
                        Core platform
                    </span>
                </div>
                <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-foreground mb-4">
                    Every tool your support team actually needs
                </h2>
                <p className="max-w-2xl text-muted-foreground text-lg">
                    From the first automated reply to the final resolved ticket — everything in one place.
                </p>
            </div>

            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                {features.map((feature) => (
                    <div
                        key={feature.title}
                        className="group relative flex flex-col border border-border rounded-xl bg-card p-7 hover:bg-muted/50 transition-all hover:-translate-y-1 cursor-default shadow-sm hover:shadow-md"
                    >
                        <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-muted mb-5 text-xl">
                            {feature.emoji}
                        </div>
                        <h3 className="text-xl font-semibold text-foreground mb-2">
                            {feature.title}
                        </h3>
                        <p className="text-sm text-muted-foreground leading-relaxed flex-1">
                            {feature.description}
                        </p>
                        <div className="mt-4">
                            <span className="inline-block font-mono text-[10px] font-bold tracking-widest bg-primary/10 text-primary px-3 py-1 rounded-full uppercase">
                                {feature.tag}
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    )
}
