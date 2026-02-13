import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, Bot, Users, PlayCircle, Code } from "lucide-react"

export function Hero() {
    return (
        <section className="relative overflow-hidden pt-24 md:pt-32 lg:pt-40 pb-32">
            <div className="container relative z-10 flex flex-col items-center text-center">
                <div className="inline-flex items-center rounded-full border px-3 py-1 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-primary/10 text-primary hover:bg-primary/20 mb-8">
                    <span className="mr-2 px-1.5 py-0.5 rounded-full bg-background text-[10px] font-extrabold uppercase tracking-wider text-foreground">New</span>
                    Yoosr Agentic AI Operating System is here
                </div>

                <h1 className="text-5xl font-black tracking-tight sm:text-6xl md:text-7xl lg:text-8xl max-w-5xl leading-[1.1] mb-8">
                    Your Agentic AI <br />
                    <span className="text-primary relative px-2">
                        Operating System
                        <svg className="absolute w-full h-3 -bottom-1 left-0 text-primary/20 -z-10" viewBox="0 0 100 10" preserveAspectRatio="none">
                            <path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="8" fill="none" />
                        </svg>
                    </span>
                </h1>

                <p className="max-w-[48rem] leading-relaxed text-muted-foreground sm:text-xl sm:leading-9 mb-10">
                    Automate everything — from Multi-channel Customer Support to Information Retrieval. One platform. No code. <span className="text-foreground font-semibold">Open source.</span>
                </p>

                <div className="flex flex-wrap justify-center gap-4 mb-12">
                    <Button size="lg" className="h-14 px-8 text-lg font-semibold shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5" asChild>
                        <Link href="/signup">
                            Try for free
                            <ArrowRight className="ml-2 h-5 w-5" />
                        </Link>
                    </Button>
                    <Button size="lg" variant="outline" className="h-14 px-8 text-lg font-medium" asChild>
                        <Link href="/demo">
                            Schedule a demo
                        </Link>
                    </Button>
                </div>

                <div className="flex items-center justify-center space-x-8 text-sm font-medium text-muted-foreground mb-20">
                    <div className="flex items-center">
                        <Bot className="mr-2 h-5 w-5 text-primary" />
                        <span>AI Agents</span>
                    </div>
                    <div className="flex items-center">
                        <Users className="mr-2 h-5 w-5 text-primary" />
                        <span>Humans in the loop</span>
                    </div>
                    <div className="flex items-center">
                        <Code className="mr-2 h-5 w-5 text-primary" />
                        <span>Open Source</span>
                    </div>
                </div>

                {/* Trusted By Section */}
                <div className="w-full max-w-4xl mx-auto mb-20">
                    <p className="text-sm font-semibold text-muted-foreground mb-6 uppercase tracking-widest">Trusted by 10,000+ companies</p>
                    <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
                        {/* Placeholders for logos - using text for now but styled to look like logos */}
                        <span className="text-xl font-bold font-serif">Gartner</span>
                        <span className="text-xl font-bold font-mono">Universita</span>
                        <span className="text-xl font-extrabold italic">Honda</span>
                        <span className="text-xl font-bold tracking-tighter">Iberostar</span>
                        <span className="text-xl font-semibold">Engie</span>
                    </div>
                </div>

                <div className="w-full max-w-6xl rounded-2xl border bg-muted/50 p-2 shadow-2xl lg:rounded-3xl hover:shadow-primary/10 transition-shadow duration-500">
                    <div className="aspect-video w-full rounded-xl bg-background border flex items-center justify-center relative overflow-hidden group cursor-pointer">
                        <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 via-transparent to-primary/5" />
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="relative">
                                <div className="absolute inset-0 bg-primary/30 rounded-full blur-xl animate-pulse" />
                                <PlayCircle className="h-24 w-24 text-primary relative z-10 hover:scale-110 transition-transform duration-300" />
                            </div>
                        </div>
                        <span className="absolute bottom-10 text-lg font-medium text-muted-foreground">Watch how Yoosr works</span>
                    </div>
                </div>
            </div>

            {/* Background decoration */}
            <div className="absolute top-0 left-1/2 -z-10 h-[800px] w-[100vw] -translate-x-1/2 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-background to-background" />
        </section>
    )
}
