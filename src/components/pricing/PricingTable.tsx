"use client"

import { useState } from "react"
import { Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"

const plans = [
    {
        name: "Free",
        price: { monthly: 0, yearly: 0 },
        description: "Perfect for testing and small personal projects.",
        features: ["1 Seat", "200 Conversations/mo", "Basic Analytics", "Community Support", "Yoosr Branding"],
        cta: "Start for free",
        popular: false,
    },
    {
        name: "Pro",
        price: { monthly: 29, yearly: 290 },
        description: "For growing businesses that need advanced features.",
        features: [
            "3 Seats",
            "2,000 Conversations/mo",
            "Advanced Analytics",
            "Email Support",
            "Remove Branding",
            "Departments",
            "Canned Responses"
        ],
        cta: "Start free trial",
        popular: true,
    },
    {
        name: "Business",
        price: { monthly: 99, yearly: 990 },
        description: "Scale your customer support with more seats and power.",
        features: [
            "10 Seats",
            "15,000 Conversations/mo",
            "Everything in Pro",
            "Priority Email Support",
            "Operating Hours",
            "Zapier Integration",
            "Webhooks"
        ],
        cta: "Start free trial",
        popular: false,
    },
    {
        name: "Enterprise",
        price: { monthly: "Custom", yearly: "Custom" },
        description: "For large organizations with custom requirements.",
        features: [
            "Unlimited Seats",
            "Unlimited Conversations",
            "Dedicated Success Manager",
            "SLA Support",
            "On-premise Deployment",
            "SSO & 2FA",
            "Custom Integrations"
        ],
        cta: "Contact Sales",
        popular: false,
    },
]

export function PricingTable() {
    const [isYearly, setIsYearly] = useState(false)

    return (
        <div className="py-12 md:py-20 lg:py-32">
            <div className="text-center mb-12">
                <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl md:text-5xl mb-4">Pricing plans for teams of all sizes</h2>
                <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">Choose the plan that's right for your business. No hidden fees.</p>

                <div className="flex items-center justify-center space-x-4 bg-muted/50 p-2 rounded-full inline-flex mx-auto border">
                    <span className={`text-sm px-3 py-1 rounded-full cursor-pointer transition-all ${!isYearly ? "font-bold bg-background shadow-sm" : "text-muted-foreground"}`} onClick={() => setIsYearly(false)}>Monthly</span>
                    <Switch
                        checked={isYearly}
                        onCheckedChange={setIsYearly}
                    />
                    <span className={`text-sm px-3 py-1 rounded-full cursor-pointer transition-all ${isYearly ? "font-bold bg-background shadow-sm" : "text-muted-foreground"}`} onClick={() => setIsYearly(true)}>
                        Yearly <span className="text-xs text-primary font-bold ml-1">-20%</span>
                    </span>
                </div>
            </div>

            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4 max-w-[1400px] mx-auto px-4">
                {plans.map((plan) => (
                    <Card key={plan.name} className={`flex flex-col relative transition-all duration-300 hover:-translate-y-1 ${plan.popular ? "border-primary shadow-xl ring-2 ring-primary/10" : "hover:shadow-md"}`}>
                        {plan.popular && (
                            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-lg">
                                Most Popular
                            </div>
                        )}
                        <CardHeader>
                            <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
                            <CardDescription className="min-h-[40px]">{plan.description}</CardDescription>
                        </CardHeader>
                        <CardContent className="flex-1">
                            <div className="mb-6">
                                <span className="text-4xl font-extrabold tracking-tight">
                                    {typeof plan.price.monthly === "number" ? (
                                        <>
                                            ${isYearly ? ((plan.price.yearly as number) / 12).toFixed(0) : plan.price.monthly}
                                        </>
                                    ) : (
                                        plan.price.monthly
                                    )}
                                </span>
                                {typeof plan.price.monthly === "number" && (
                                    <span className="text-muted-foreground ml-1">/mo</span>
                                )}
                            </div>
                            <ul className="space-y-4">
                                {plan.features.map((feature) => (
                                    <li key={feature} className="flex items-start text-sm text-muted-foreground">
                                        <Check className="mr-3 h-5 w-5 text-primary flex-shrink-0" />
                                        <span>{feature}</span>
                                    </li>
                                ))}
                            </ul>
                        </CardContent>
                        <CardFooter>
                            <Button className="w-full font-semibold" size="lg" variant={plan.popular ? "default" : "outline"}>
                                {plan.cta}
                            </Button>
                        </CardFooter>
                    </Card>
                ))}
            </div>
        </div>
    )
}
