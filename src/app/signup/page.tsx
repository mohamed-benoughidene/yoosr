"use client"

import Link from "next/link"
import { SignUp } from "@clerk/nextjs"

export default function SignupPage() {
    return (
        <div className="container relative h-screen flex-col items-center justify-center grid lg:max-w-none lg:grid-cols-2 lg:px-0">
            <Link
                href="/login"
                className="absolute right-4 top-4 md:right-8 md:top-8"
            >
                Login
            </Link>
            <div className="relative hidden h-full flex-col bg-muted p-10 text-white dark:border-r lg:flex">
                <div className="absolute inset-0 bg-zinc-900" />
                <Link href="/" className="relative z-20 flex items-center text-lg font-medium">
                    <div className="h-6 w-6 rounded-md bg-primary flex items-center justify-center mr-2">
                        <span className="text-primary-foreground font-bold text-xs">Y</span>
                    </div>
                    Yoosr
                </Link>
                <div className="relative z-20 mt-auto">
                    <blockquote className="space-y-2">
                        <p className="text-lg">
                            &ldquo;Yoosr has saved us countless hours of development time and allowed us to deliver feature-rich AI agents to our clients faster than ever before.&rdquo;
                        </p>
                        <footer className="text-sm">Sofia Davis</footer>
                    </blockquote>
                </div>
            </div>
            <div className="lg:p-8">
                <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[400px]">
                    <div className="flex flex-col space-y-2 text-center">
                        <h1 className="text-2xl font-semibold tracking-tight">
                            Create an account
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Enter your details below to create your account
                        </p>
                    </div>
                    <div className="flex justify-center">
                        <SignUp
                            appearance={{
                                elements: {
                                    rootBox: "w-full",
                                    cardBox: "w-full shadow-none",
                                    card: "shadow-none w-full",
                                },
                            }}
                            routing="hash"
                            forceRedirectUrl="/onboarding"
                        />
                    </div>
                    <p className="px-8 text-center text-sm text-muted-foreground">
                        By clicking continue, you agree to our{" "}
                        <Link
                            href="/terms"
                            className="underline underline-offset-4 hover:text-primary"
                        >
                            Terms of Service
                        </Link>{" "}
                        and{" "}
                        <Link
                            href="/privacy"
                            className="underline underline-offset-4 hover:text-primary"
                        >
                            Privacy Policy
                        </Link>
                        .
                    </p>
                </div>
            </div>
        </div>
    )
}
