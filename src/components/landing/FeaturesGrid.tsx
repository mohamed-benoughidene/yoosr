import React from "react"
import { getTranslations } from "next-intl/server"

export async function FeaturesGrid() {
    const t = await getTranslations("landing")
    const features = t.raw("features.items") as Array<{
        title: string
        description: string
        tag: string
        emoji: string
    }>

    return (
        <section className="container py-12 md:py-24">
            <div className="flex flex-col items-center text-center mb-16">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-[1px] bg-primary"></div>
                    <span className="text-[11px] font-mono font-bold uppercase tracking-widest text-primary">
                        {t("features.badge")}
                    </span>
                </div>
                <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-foreground mb-4">
                    {t("features.headline")}
                </h2>
                <p className="max-w-2xl text-muted-foreground text-lg">
                    {t("features.description")}
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
