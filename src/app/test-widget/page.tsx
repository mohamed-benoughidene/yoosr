"use client"

import { useEffect, useState } from "react"
import { useProject } from "@/context/ProjectContext"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Rocket, Zap, Shield, Globe, ChevronRight } from "lucide-react"
import Link from "next/link"

declare global {
    interface Window {
        yoosrSettings?: {
            projectId: string;
        };
    }
}

export default function TestWidgetPage() {
    const { activeProject, isLoading: isProjectLoading } = useProject()

    useEffect(() => {
        if (!activeProject?._id) return

        // 1. Set settings
        window.yoosrSettings = {
            projectId: activeProject._id
        }

        // 2. Inject script
        const script = document.createElement("script")
        script.src = "/widget.js"
        script.async = true
        script.id = "yoosr-widget-script"
        document.body.appendChild(script)

        // 3. Cleanup
        return () => {
            const existingScript = document.getElementById("yoosr-widget-script")
            if (existingScript) {
                document.body.removeChild(existingScript)
            }
            // Remove the widget container if it exists (assuming it adds a div)
            const widgetContainer = document.querySelector(".yoosr-widget-container")
            if (widgetContainer) {
                widgetContainer.remove()
            }
            delete window.yoosrSettings
        }
    }, [activeProject?._id])

    if (isProjectLoading) {
        return (
            <div className="flex h-screen w-screen items-center justify-center bg-white">
                <div className="flex flex-col items-center gap-4">
                    <div className="h-12 w-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                    <p className="text-zinc-500 font-medium">Preparing Acme Corp Preview...</p>
                </div>
            </div>
        )
    }

    if (!activeProject) {
        return (
            <div className="flex h-screen w-screen items-center justify-center bg-white p-6">
                <div className="text-center space-y-4">
                    <h1 className="text-2xl font-bold text-zinc-900">Project Not Found</h1>
                    <p className="text-zinc-500 max-w-sm">
                        Go back to your dashboard and select a project to see the widget in action.
                    </p>
                    <Button asChild>
                        <Link href="/dashboard">Return to Dashboard</Link>
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
                            <a href="#" className="hover:text-zinc-900 transition-colors">Home</a>
                            <a href="#" className="hover:text-zinc-900 transition-colors">Products</a>
                            <a href="#" className="hover:text-zinc-900 transition-colors">Pricing</a>
                            <a href="#" className="hover:text-zinc-900 transition-colors">Contact</a>
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
                                Engineering the <span className="text-indigo-600">Future</span> of Scale.
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
                            <h3 className="text-xl font-bold mb-3">Lightning Fast</h3>
                            <p className="text-zinc-500 leading-relaxed">
                                Our edge network ensures your application is delivered with minimum latency, anywhere in the world.
                            </p>
                        </div>
                        <div className="p-8 rounded-2xl border border-zinc-100 hover:border-indigo-100 hover:shadow-xl hover:shadow-indigo-500/5 transition-all group">
                            <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                <Shield className="h-6 w-6" />
                            </div>
                            <h3 className="text-xl font-bold mb-3">Military Grade</h3>
                            <p className="text-zinc-500 leading-relaxed">
                                Security isn't an afterthought. Every layer of our stack is hardened against modern cyber threats.
                            </p>
                        </div>
                        <div className="p-8 rounded-2xl border border-zinc-100 hover:border-indigo-100 hover:shadow-xl hover:shadow-indigo-500/5 transition-all group">
                            <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                <Globe className="h-6 w-6" />
                            </div>
                            <h3 className="text-xl font-bold mb-3">Global Scale</h3>
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
                        <a href="#" className="hover:text-zinc-900 transition-colors">Privacy</a>
                        <a href="#" className="hover:text-zinc-900 transition-colors">Terms</a>
                    </div>
                </div>
            </footer>
        </div>
    )
}
