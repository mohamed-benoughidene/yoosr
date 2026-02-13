import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

const testimonials = [
    {
        quote: "Yoosr has completely transformed how we handle customer support. Our response times dropped by 80%.",
        author: "Sarah J.",
        role: "Head of Support at TechFlow",
        avatar: "S",
    },
    {
        quote: "The visual flow builder is a game changer. We built complex conversational agents without writing a single line of code.",
        author: "Michael Chen",
        role: "CTO at StartUp Inc.",
        avatar: "M",
    },
    {
        quote: "Open source and on-premise deployment were critical for us. Yoosr delivered exactly what we needed for data privacy.",
        author: "Elena R.",
        role: "Director of IT at FinCorp",
        avatar: "E",
    },
]

export function Testimonials() {
    return (
        <section className="container py-12 md:py-24 lg:py-32 bg-background border-t">
            <div className="mx-auto flex max-w-[58rem] flex-col items-center justify-center gap-4 text-center mb-16">
                <h2 className="font-extrabold text-3xl leading-[1.1] sm:text-3xl md:text-5xl">
                    Loved by developers and teams
                </h2>
                <p className="max-w-[85%] leading-normal text-muted-foreground sm:text-lg sm:leading-7">
                    Join thousands of companies building the future of customer experience with Yoosr.
                </p>
            </div>

            <div className="grid gap-8 md:grid-cols-3">
                {testimonials.map((t, index) => (
                    <div key={index} className="flex flex-col justify-between rounded-lg border bg-muted/20 p-8 shadow-sm hover:shadow-md transition-all">
                        <p className="mb-8 text-lg leading-relaxed italic text-muted-foreground">"{t.quote}"</p>
                        <div className="flex items-center gap-4 mt-auto">
                            <Avatar>
                                <AvatarFallback>{t.avatar}</AvatarFallback>
                            </Avatar>
                            <div>
                                <p className="text-sm font-semibold">{t.author}</p>
                                <p className="text-xs text-muted-foreground">{t.role}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    )
}
