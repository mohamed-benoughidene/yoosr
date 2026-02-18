"use client"

import Link from "next/link"
import { SignIn } from "@clerk/nextjs"

export default function LoginPage() {
    return (
        <div className="container flex h-screen w-screen flex-col items-center justify-center">
            <Link
                href="/"
                className="absolute left-4 top-4 md:left-8 md:top-8 flex items-center text-lg font-bold tracking-tight"
            >
                <div className="h-6 w-6 rounded-md bg-primary flex items-center justify-center mr-2">
                    <span className="text-primary-foreground font-bold text-xs">Y</span>
                </div>
                Yoosr
            </Link>
            <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[400px]">
                <div className="flex flex-col space-y-2 text-center">
                    <h1 className="text-2xl font-semibold tracking-tight">
                        Welcome back
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Sign in to your account
                    </p>
                </div>
                <div className="flex justify-center">
                    <SignIn
                        appearance={{
                            elements: {
                                rootBox: "w-full",
                                cardBox: "w-full shadow-none",
                                card: "shadow-none w-full",
                            },
                        }}
                        routing="hash"
                        forceRedirectUrl="/projects"
                    />
                </div>
                <p className="px-8 text-center text-sm text-muted-foreground">
                    <Link
                        href="/signup"
                        className="hover:text-brand underline underline-offset-4"
                    >
                        Don&apos;t have an account? Sign Up
                    </Link>
                </p>
            </div>
        </div>
    )
}
