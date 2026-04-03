"use client"

import { useState } from "react"
import { useProject } from "@/context/ProjectContext"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Rocket, Zap, Shield, Globe, ChevronRight, MessageSquare, X } from "lucide-react"
import Link from "next/link"
import { useTranslations } from "next-intl"

export function TestWidgetClient({ locale }: { locale: string }) {
    const t = useTranslations("testWidget")
    const { activeProject, isLoading: isProjectLoading } = useProject()
    const [isOpen, setIsOpen] = useState(false)

    if (isProjectLoading) {
        return (
            <div className="flex h-screen w-screen items-center justify-center bg-white">
                <div className="flex flex-col items-center gap-4">
                    <div className="h-12 w-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                    <p className="text-zinc-500 font-medium">{t("preparing")}</p>
                </div>
            </div>
        )
    }

    if (!activeProject) {
        return (
            <div className="flex h-screen w-screen items-center justify-center bg-white p-6">
                <div className="text-center space-y-4">
                    <h1 className="text-2xl font-bold text-zinc-900">{t("projectNotFound")}</h1>
                    <p className="text-zinc-500 max-w-sm">
                        Go back to your dashboard and select a project to see the widget in action.
                    </p>
                    <Button asChild>
                        <Link href="/dashboard">{t("returnToDashboard")}</Link>
                    </Button>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-white text-zinc-900 font-sans selection:bg-indigo-100 selection:text-indigo-900">
            {/* Navbar */}
            <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md border-b border-zinc-100 z-[100]">
                <div className="container mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-10">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-xl">
                                A
                            </div>
                            <span className="font-bold text-xl tracking-tight">Acme Corp</span>
                        </div>
                        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-zinc-500">
                            <button type="button" className="hover:text-zinc-900 transition-colors bg-transparent border-none cursor-pointer text-sm font-medium text-zinc-500">Home</button>
                            <button type="button" className="hover:text-zinc-900 transition-colors bg-transparent border-none cursor-pointer text-sm font-medium text-zinc-500">Products</button>
                            <button type="button" className="hover:text-zinc-900 transition-colors bg-transparent border-none cursor-pointer text-sm font-medium text-zinc-500">Pricing</button>
                            <button type="button" className="hover:text-zinc-900 transition-colors bg-transparent border-none cursor-pointer text-sm font-medium text-zinc-500">Contact</button>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <Link
                            href="/dashboard/settings/widget"
                            className="text-xs text-zinc-400 hover:text-indigo-600 flex items-center gap-1.5 transition-colors mr-4"
                        >
                            <ArrowLeft className="h-3 w-3" />
                            Back to Dashboard
                        </Link>
                        <Button size="sm">Get Started</Button>
                    </div>
                </div>
            </nav>

            <main className="pt-32 pb-20">
                {/* Hero Section */}
                <section className="container mx-auto px-6">
                    <div className="grid lg:grid-cols-2 gap-16 items-center">
                        <div className="space-y-8">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-semibold">
                                <Zap className="h-3 w-3 fill-indigo-700" />
                                <span>Version 2.0 is now live</span>
                            </div>
                            <h1 className="text-5xl md:text-6xl font-extrabold leading-tight tracking-tight text-zinc-900">
                                {t("tagline").split(' ').map((word, i, arr) => (
                                    <span key={`word-${i}-${word}`}>
                                        {word === "Future" ? (
                                            <span className="text-indigo-600">{word}</span>
                                        ) : (
                                            word
                                        )}
                                        {i < arr.length - 1 && ' '}
                                    </span>
                                ))}
                                .
                            </h1>
                            <p className="text-xl text-zinc-500 leading-relaxed max-w-xl">
                                Acme Corp provides the infrastructure needed to build, deploy, and scale world-class applications in record time.
                            </p>
                            <div className="flex flex-wrap gap-4">
                                <Button size="lg" className="h-14 px-8 text-lg gap-2">
                                    Start Building <ChevronRight className="h-4 w-4" />
                                </Button>
                                <Button size="lg" variant="outline" className="h-14 px-8 text-lg">
                                    View Documentation
                                </Button>
                            </div>
                        </div>

                        <div className="relative">
                            <div className="aspect-[4/3] rounded-3xl bg-gradient-to-br from-indigo-500 to-purple-600 overflow-hidden shadow-2xl relative">
                                <div className="absolute inset-0 bg-white/10 backdrop-blur-[2px]" />
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="w-[80%] h-[70%] bg-zinc-950/40 rounded-2xl border border-white/20 shadow-inner p-4">
                                        <div className="flex gap-1.5 mb-4">
                                            <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
                                            <div className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
                                            <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
                                        </div>
                                        <div className="space-y-2">
                                            <div className="h-2 w-1/2 bg-white/20 rounded-full" />
                                            <div className="h-2 w-3/4 bg-white/10 rounded-full" />
                                            <div className="h-2 w-2/3 bg-white/10 rounded-full" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                            {/* Decorative Blobs */}
                            <div className="absolute -top-10 -right-10 w-40 h-40 bg-indigo-400/20 rounded-full blur-3xl -z-10" />
                            <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-purple-400/20 rounded-full blur-3xl -z-10" />
                        </div>
                    </div>
                </section>

                {/* Features Row */}
                <section className="container mx-auto px-6 mt-32">
                    <div className="grid md:grid-cols-3 gap-8">
                        <div className="p-8 rounded-2xl border border-zinc-100 hover:border-indigo-100 hover:shadow-xl hover:shadow-indigo-500/5 transition-all group">
                            <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                <Rocket className="h-6 w-6" />
                            </div>
                            <h3 className="text-xl font-bold mb-3">{t("feature1")}</h3>
                            <p className="text-zinc-500 leading-relaxed">
                                Our edge network ensures your application is delivered with minimum latency, anywhere in the world.
                            </p>
                        </div>
                        <div className="p-8 rounded-2xl border border-zinc-100 hover:border-indigo-100 hover:shadow-xl hover:shadow-indigo-500/5 transition-all group">
                            <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                <Shield className="h-6 w-6" />
                            </div>
                            <h3 className="text-xl font-bold mb-3">{t("feature2")}</h3>
                            <p className="text-zinc-500 leading-relaxed">
                                Security isn't an afterthought. Every layer of our stack is hardened against modern cyber threats.
                            </p>
                        </div>
                        <div className="p-8 rounded-2xl border border-zinc-100 hover:border-indigo-100 hover:shadow-xl hover:shadow-indigo-500/5 transition-all group">
                            <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                <Globe className="h-6 w-6" />
                            </div>
                            <h3 className="text-xl font-bold mb-3">{t("feature3")}</h3>
                            <p className="text-zinc-500 leading-relaxed">
                                Deploy across multiple regions with a single click. We handle the complexity of distributed systems.
                            </p>
                        </div>
                    </div>
                </section>
            </main>

            {/* Footer */}
            <footer className="border-t border-zinc-100 py-12">
                <div className="container mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-2 opacity-50">
                        <div className="w-6 h-6 bg-zinc-900 rounded flex items-center justify-center text-white font-bold text-xs">
                            A
                        </div>
                        <span className="font-bold text-sm">Acme Corp</span>
                    </div>
                    <p className="text-sm text-zinc-400">
                        © {new Date().getFullYear()} Acme Corp International. All rights reserved.
                    </p>
                    <div className="flex items-center gap-6 text-sm text-zinc-400 font-medium">
                        <button type="button" className="hover:text-zinc-900 transition-colors bg-transparent border-none cursor-pointer text-sm text-zinc-400 font-medium">Privacy</button>
                        <button type="button" className="hover:text-zinc-900 transition-colors bg-transparent border-none cursor-pointer text-sm text-zinc-400 font-medium">Terms</button>
                    </div>
                </div>
            </footer>

            {/* Widget Launcher Button */}
            <button
                className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg flex items-center justify-center cursor-pointer z-[9999] transition-all duration-200 hover:scale-110 hover:shadow-xl active:scale-95"
                style={{ backgroundColor: (activeProject?.widgetConfig as { primaryColor?: string } | undefined)?.primaryColor ?? "#6366f1" }}
                onClick={() => setIsOpen(!isOpen)}
                aria-label={isOpen ? "Close chat widget" : "Open chat widget"}
            >
                <MessageSquare
                    className={`text-white h-6 w-6 absolute transition-all duration-200 ${isOpen ? "scale-0 opacity-0" : "scale-100 opacity-100"}`}
                />
                <X
                    className={`text-white h-6 w-6 absolute transition-all duration-200 ${isOpen ? "scale-100 opacity-100" : "scale-0 opacity-0"}`}
                />
            </button>

            {/* Widget Iframe */}
            {isOpen && (
                <div className="fixed bottom-[104px] right-6 w-[380px] h-[min(580px,calc(100vh-120px))] rounded-2xl shadow-2xl border border-border overflow-hidden z-[9999] bg-white animate-in fade-in slide-in-from-bottom-4 duration-200">
                    <iframe
                        src={`/widget?projectId=${activeProject?._id}`}
                        className="w-full h-full border-0"
                        title="Yoosr Widget"
                    />
                </div>
            )}
        </div>
    )
}
