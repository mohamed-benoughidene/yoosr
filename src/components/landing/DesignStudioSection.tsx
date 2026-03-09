import React from "react";

const studioFeatures = [
    {
        icon: "🎨",
        title: "Visual Builder",
        desc: "Drag and drop blocks to build any conversation flow. No coding knowledge required.",
    },
    {
        icon: "🔀",
        title: "19 Block Types",
        desc: "Reply, Condition, AI Task, Ask KB, Web Request, Wait, HITL Handoff, Apply Label and more.",
    },
    {
        icon: "⚡",
        title: "Live Execution",
        desc: "Flows run server-side in real time. No delays, no dropped messages, no polling.",
    },
    {
        icon: "🧪",
        title: "Built-in Debugger",
        desc: "Step through every block execution and inspect state at each node as it runs.",
    },
];

export function DesignStudioSection() {
    return (
        <section className="border-t border-border py-24">
            <div className="container mx-auto px-4">
                {/* Centered Header */}
                <div className="max-w-2xl mx-auto text-center mb-16">
                    <div className="flex items-center justify-center gap-3 mb-4">
                        <div className="w-8 h-px bg-primary" />
                        <span className="text-xs font-mono uppercase tracking-widest text-primary font-medium">
                            Design Studio
                        </span>
                    </div>
                    <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground">
                        Build any conversation flow without code
                    </h2>
                    <p className="text-lg text-muted-foreground mt-3 leading-relaxed">
                        Connect blocks visually. Every flow is executed server-side in real time — no delays, no dropped messages.
                    </p>
                </div>

                {/* 4-card Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {studioFeatures.map((feature, index) => (
                        <div
                            key={index}
                            className="border border-border rounded-xl bg-card p-6 flex flex-col gap-3 hover:-translate-y-0.5 hover:shadow-md transition-all duration-300"
                        >
                            <div className="w-10 h-10 rounded-lg bg-muted border border-border flex items-center justify-center text-lg flex-shrink-0 mb-1">
                                {feature.icon}
                            </div>
                            <div>
                                <h3 className="text-sm font-semibold text-foreground mb-1">
                                    {feature.title}
                                </h3>
                                <p className="text-xs text-muted-foreground leading-relaxed">
                                    {feature.desc}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
