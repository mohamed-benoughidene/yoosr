import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, Monitor, MessageSquare, Bot, BarChart3, Database, Settings, ShieldAlert, Globe, MessageCircle } from "lucide-react"

export function Hero() {
    return (
        <section className="relative overflow-hidden pt-24 md:pt-32 lg:pt-40 pb-32 flex flex-col items-center">
            {/* 1. Animated Badge */}
            <div className="animate-fade-in inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary mb-8 hover:bg-primary/20 transition-colors cursor-default">
                <span className="relative flex h-2 w-2 mr-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                </span>
                Now live — Web, Telegram, Facebook & Instagram
            </div>

            {/* 2. H1 Heading */}
            <h1 className="animate-fade-in [animation-delay:200ms] text-5xl font-extrabold tracking-tight sm:text-6xl md:text-7xl lg:text-8xl max-w-5xl text-center leading-[1.05] mb-8 text-foreground">
                The customer support platform <br />
                <span className="text-primary italic">built for MENA</span>
            </h1>

            {/* 3. Subtext */}
            <p className="animate-fade-in [animation-delay:400ms] max-w-[52rem] text-center text-muted-foreground sm:text-lg md:text-xl leading-relaxed mb-10 px-4">
                Automate conversations with AI bots, manage your team&apos;s inbox in real time, and close every ticket — <span className="text-foreground font-medium underline decoration-primary/30 underline-offset-4">in Arabic or English</span> — across every channel.
            </p>

            {/* 4. Buttons */}
            <div className="animate-fade-in [animation-delay:600ms] flex flex-wrap justify-center gap-4 mb-20 px-4">
                <Button size="lg" className="h-14 px-8 text-lg font-semibold bg-primary text-primary-foreground shadow-lg shadow-primary/20 hover:shadow-xl hover:-translate-y-0.5 transition-all" asChild>
                    <Link href="/signup">
                        Start for free
                        <ArrowRight className="ml-2 h-5 w-5" />
                    </Link>
                </Button>
                <Button size="lg" variant="outline" className="h-14 px-8 text-lg font-medium border-border bg-transparent text-foreground hover:bg-muted/50 transition-colors" asChild>
                    <Link href="/demo">
                        See a live demo
                    </Link>
                </Button>
            </div>

            {/* 5. Stats Row */}
            <div className="animate-fade-in [animation-delay:800ms] grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-16 items-center justify-center mb-24 px-4 w-full max-w-5xl">
                <div className="flex flex-col items-center text-center">
                    <span className="text-3xl md:text-4xl font-bold text-foreground">19+</span>
                    <span className="text-[10px] md:text-xs font-semibold text-muted-foreground uppercase tracking-widest font-mono mt-2">Bot block types</span>
                </div>
                <div className="flex flex-col items-center text-center">
                    <span className="text-3xl md:text-4xl font-bold text-foreground">4</span>
                    <span className="text-[10px] md:text-xs font-semibold text-muted-foreground uppercase tracking-widest font-mono mt-2">Live channels</span>
                </div>
                <div className="flex flex-col items-center text-center">
                    <span className="text-3xl md:text-4xl font-bold text-foreground">5min</span>
                    <span className="text-[10px] md:text-xs font-semibold text-muted-foreground uppercase tracking-widest font-mono mt-2">To go live</span>
                </div>
                <div className="flex flex-col items-center text-center">
                    <span className="text-3xl md:text-4xl font-bold text-foreground">100%</span>
                    <span className="text-[10px] md:text-xs font-semibold text-muted-foreground uppercase tracking-widest font-mono mt-2">Realtime</span>
                </div>
            </div>

            {/* 6. Dashboard Mockup */}
            <div className="animate-fade-in [animation-delay:1000ms] w-full max-w-6xl px-4 perspective-1000">
                <div className="relative border border-border rounded-2xl bg-card shadow-2xl overflow-hidden transform transition-all duration-700 hover:rotate-x-1 hover:rotate-y-1">
                    {/* BROWSER CHROME BAR */}
                    <div className="bg-muted border-b border-border px-4 py-2.5 flex items-center gap-2">
                        <div className="flex gap-1.5">
                            <div className="w-3 h-3 rounded-full bg-red-400" />
                            <div className="w-3 h-3 rounded-full bg-yellow-400" />
                            <div className="w-3 h-3 rounded-full bg-green-400" />
                        </div>
                        <div className="ml-3 font-mono text-[11px] text-muted-foreground bg-background border border-border px-3 py-0.5 rounded-full text-center flex-1 max-w-[200px]">
                            app.yoosr.io/monitor
                        </div>
                    </div>

                    {/* INNER GRID */}
                    <div className="grid grid-cols-[200px_1fr_260px] h-[420px] overflow-hidden">
                        {/* SIDEBAR */}
                        <aside className="bg-muted border-r border-border flex flex-col">
                            <div className="px-4 py-3 border-b border-border">
                                <span className="text-sm font-bold text-foreground">Yoosr</span>
                            </div>
                            <nav className="flex-1 py-2">
                                {[
                                    { label: "Monitor", active: true },
                                    { label: "Chat" },
                                    { label: "Requests" },
                                    { label: "Bots" },
                                    { label: "Analytics" },
                                    { label: "Settings" },
                                ].map((item) => (
                                    <div
                                        key={item.label}
                                        className={`flex items-center gap-2.5 px-4 py-2 text-xs ${
                                            item.active
                                                ? "bg-primary/10 text-primary border-l-2 border-primary font-medium"
                                                : "text-muted-foreground"
                                        }`}
                                    >
                                        <div className="w-3 h-3 rounded-sm bg-current opacity-40" />
                                        <span>{item.label}</span>
                                    </div>
                                ))}
                            </nav>
                        </aside>

                        {/* MAIN AREA */}
                        <main className="bg-background flex flex-col">
                            {/* Header */}
                            <header className="px-4 py-2.5 border-b border-border flex items-center justify-between">
                                <span className="text-xs font-semibold text-foreground">Live Monitor</span>
                                <div className="inline-flex gap-1.5">
                                    <span className="bg-blue-500/10 text-blue-600 font-mono text-[9px] px-1.5 py-0.5 rounded">14 open</span>
                                    <span className="bg-purple-500/10 text-purple-600 font-mono text-[9px] px-1.5 py-0.5 rounded">9 bot</span>
                                    <span className="bg-amber-500/10 text-amber-600 font-mono text-[9px] px-1.5 py-0.5 rounded">2 SLA</span>
                                </div>
                            </header>

                            {/* Search bar */}
                            <div className="px-3 py-2 border-b border-border">
                                <div className="rounded-md border border-border bg-muted/50 h-7 flex items-center px-2 gap-2">
                                    <div className="w-3 h-3 bg-muted-foreground/30 rounded" />
                                    <span className="text-[10px] text-muted-foreground">Search conversations...</span>
                                </div>
                            </div>

                            {/* Conversation rows */}
                            <div className="flex-1 overflow-y-auto py-1">
                                {/* Row 1: Ahmed Al-Rashid (selected/active) */}
                                <div className="bg-accent border border-border rounded-lg mx-2 my-1 p-2.5">
                                    <div className="flex justify-between items-start mb-1">
                                        <div className="flex gap-2.5">
                                            <div className="h-8 w-8 rounded-full border bg-primary/10 text-primary text-[10px] font-bold flex items-center justify-center shrink-0">
                                                AR
                                            </div>
                                            <div>
                                                <div className="text-xs font-semibold text-foreground">Ahmed Al-Rashid</div>
                                                <div className="flex items-center gap-1">
                                                    <div className="w-2.5 h-2.5 rounded-sm bg-sky-500" />
                                                    <span className="text-[10px] text-muted-foreground capitalize">telegram</span>
                                                </div>
                                            </div>
                                        </div>
                                        <span className="text-[10px] text-muted-foreground font-mono">now</span>
                                    </div>
                                    <div className="ml-10 flex flex-col gap-1.5">
                                        <span className="w-fit bg-amber-500/10 text-amber-600 font-mono text-[9px] px-1.5 py-0.5 rounded uppercase font-bold">18m left</span>
                                        <p className="text-[10px] text-muted-foreground line-clamp-1">
                                            I need help tracking my order #KW-2847...
                                        </p>
                                    </div>
                                </div>

                                {/* Row 2: Fatima Hassan */}
                                <div className="hover:bg-muted/50 rounded-lg mx-2 my-1 p-2.5 flex flex-col gap-1 cursor-pointer">
                                    <div className="flex justify-between items-start">
                                        <div className="flex gap-2.5">
                                            <div className="h-8 w-8 rounded-full border bg-muted text-muted-foreground text-[10px] font-bold flex items-center justify-center shrink-0">
                                                FH
                                            </div>
                                            <div>
                                                <div className="text-xs font-semibold text-foreground">Fatima Hassan</div>
                                                <div className="flex items-center gap-1">
                                                    <div className="w-2.5 h-2.5 rounded-sm bg-sky-500" />
                                                    <span className="text-[10px] text-muted-foreground capitalize">telegram</span>
                                                    <span className="bg-orange-500 text-white text-[9px] px-1 rounded uppercase font-bold ml-1">High</span>
                                                </div>
                                            </div>
                                        </div>
                                        <span className="text-[10px] text-muted-foreground font-mono">2m</span>
                                    </div>
                                    <p className="text-[10px] text-muted-foreground line-clamp-1 ml-10">
                                        Can I change my delivery address?
                                    </p>
                                </div>

                                {/* Row 3: Omar Khalil */}
                                <div className="hover:bg-muted/50 rounded-lg mx-2 my-1 p-2.5 flex flex-col gap-1 cursor-pointer">
                                    <div className="flex justify-between items-start">
                                        <div className="flex gap-2.5">
                                            <div className="h-8 w-8 rounded-full border bg-muted text-muted-foreground text-[10px] font-bold flex items-center justify-center shrink-0">
                                                OK
                                            </div>
                                            <div>
                                                <div className="text-xs font-semibold text-foreground">Omar Khalil</div>
                                                <div className="flex items-center gap-1">
                                                    <Globe className="w-2.5 h-2.5 text-muted-foreground" />
                                                    <span className="text-[10px] text-muted-foreground capitalize">web</span>
                                                    <span className="bg-secondary text-secondary-foreground text-[10px] px-1.5 py-0.5 rounded ml-1">tech-support</span>
                                                </div>
                                            </div>
                                        </div>
                                        <span className="text-[10px] text-muted-foreground font-mono">5m</span>
                                    </div>
                                    <p className="text-[10px] text-muted-foreground line-clamp-1 ml-10">
                                        Website keeps showing an error on checkout
                                    </p>
                                </div>

                                {/* Row 4: Sara Mansour */}
                                <div className="hover:bg-muted/50 rounded-lg mx-2 my-1 p-2.5 flex flex-col gap-1 cursor-pointer">
                                    <div className="flex justify-between items-start">
                                        <div className="flex gap-2.5">
                                            <div className="h-8 w-8 rounded-full border bg-muted text-muted-foreground text-[10px] font-bold flex items-center justify-center shrink-0">
                                                SM
                                            </div>
                                            <div>
                                                <div className="text-xs font-semibold text-foreground">Sara Mansour</div>
                                                <div className="flex items-center gap-1">
                                                    <div className="w-2.5 h-2.5 rounded-sm bg-pink-500" />
                                                    <span className="text-[10px] text-muted-foreground capitalize">instagram</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-[10px] text-muted-foreground font-mono">12m</span>
                                            <div className="h-2 w-2 rounded-full bg-blue-600" />
                                        </div>
                                    </div>
                                    <p className="text-[10px] text-muted-foreground line-clamp-1 ml-10">
                                        What are your hours during Eid al-Adha?
                                    </p>
                                </div>
                            </div>
                        </main>

                        {/* RIGHT PANEL */}
                        <aside className="bg-muted border-l border-border flex flex-col p-3 gap-3">
                            <div className="flex flex-col items-center text-center gap-2 py-2">
                                <div className="h-10 w-10 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center">
                                    AR
                                </div>
                                <div>
                                    <div className="text-sm font-semibold text-foreground">Ahmed Al-Rashid</div>
                                    <div className="text-xs text-muted-foreground text-center">Kuwait City · Telegram</div>
                                </div>
                            </div>

                            <div className="flex flex-col">
                                {[
                                    { label: "Status", value: "Active", color: "text-green-600 font-medium" },
                                    { label: "Department", value: "Support" },
                                    { label: "Assigned", value: "Nour A." },
                                    { label: "Priority", value: "High", color: "text-orange-500 font-medium" },
                                    { label: "SLA", value: "18 min left", color: "text-amber-600 font-medium" },
                                ].map((row) => (
                                    <div key={row.label} className="flex justify-between text-xs py-1 border-b border-border last:border-b-0">
                                        <span className="text-muted-foreground">{row.label}</span>
                                        <span className={row.color || "text-foreground"}>{row.value}</span>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-1">
                                <div className="text-[10px] text-muted-foreground mb-1.5">Labels</div>
                                <div className="flex gap-1.5">
                                    <span className="bg-primary/10 text-primary text-[10px] px-2 py-0.5 rounded">order-tracking</span>
                                    <span className="bg-secondary text-secondary-foreground text-[10px] px-2 py-0.5 rounded">kuwait</span>
                                </div>
                            </div>
                        </aside>
                    </div>
                </div>
            </div>

            {/* Background Decorations */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -z-10 h-[1000px] w-full max-w-7xl blur-[120px] opacity-20 dark:opacity-40">
                <div className="absolute top-[-10%] left-[-10%] h-[500px] w-[500px] rounded-full bg-primary/30" />
                <div className="absolute top-[20%] right-[-10%] h-[600px] w-[600px] rounded-full bg-primary/20" />
            </div>
            <div className="absolute inset-0 -z-20 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/5 via-background to-background" />
        </section>
    )
}
