"use client";

import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MarketingLayout } from "@/components/marketing/MarketingLayout";
import { SUBSCRIPTION_PLANS } from "@/lib/subscription";
import { cn } from "@/lib/utils";

export default function PricingPage() {
    const plans = Object.values(SUBSCRIPTION_PLANS);

    return (
        <MarketingLayout>
            <div className="bg-[#faf9f5]">
                <div className="pt-32 pb-20 px-6">
                    <div className="max-w-7xl mx-auto space-y-16">
                        {/* Header */}
                        <div className="text-center space-y-4 max-w-2xl mx-auto">
                            <Badge variant="outline" className="bg-brand-orange/10 text-brand-orange border-brand-orange/20 px-4 py-1 rounded-full uppercase tracking-widest text-xs font-semibold">
                                Pricing Plans
                            </Badge>
                            <h1 className="text-4xl md:text-6xl font-poppins font-bold tracking-tight text-brand-charcoal">
                                Choose the plan that fits your ambition.
                            </h1>
                            <p className="text-xl text-brand-gray-mid font-lora italic">
                                Transparent pricing for every stage of your architectural journey.
                            </p>
                        </div>

                        {/* Pricing Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                            {plans.map((plan) => (
                                <Card key={plan.id} className={cn(
                                    "relative flex flex-col border-brand-charcoal/5 shadow-sm bg-white/50 backdrop-blur-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-2",
                                    plan.id === 'pro' && "border-brand-orange/50 ring-1 ring-brand-orange/20 shadow-brand-orange/10"
                                )}>
                                    {plan.id === 'pro' && (
                                        <Badge className="absolute -top-3 right-4 bg-brand-orange text-white hover:bg-brand-orange/90">
                                            Most Popular
                                        </Badge>
                                    )}
                                    <CardHeader>
                                        <CardTitle className="font-poppins text-2xl">{plan.name}</CardTitle>
                                        <CardDescription className="font-lora italic">{plan.description}</CardDescription>
                                    </CardHeader>
                                    <CardContent className="flex-1 space-y-6">
                                        <div className="flex items-baseline gap-1">
                                            {plan.price !== null ? (
                                                <>
                                                    <span className="text-4xl font-bold font-poppins text-brand-charcoal">${plan.price}</span>
                                                    <span className="text-brand-gray-mid">/month</span>
                                                </>
                                            ) : (
                                                <span className="text-4xl font-bold font-poppins text-brand-charcoal">Custom</span>
                                            )}
                                        </div>
                                        <ul className="space-y-3 text-sm">
                                            {plan.features.map((feature) => (
                                                <li key={feature} className="flex items-start gap-3 text-brand-charcoal/80">
                                                    <Check className="w-5 h-5 text-brand-orange shrink-0" />
                                                    <span>{feature}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </CardContent>
                                    <CardFooter>
                                        <Button className={cn(
                                            "w-full transition-all duration-300",
                                            plan.id === 'pro'
                                                ? "bg-brand-charcoal text-brand-sand-light hover:bg-brand-charcoal/90"
                                                : "bg-white text-brand-charcoal border border-brand-charcoal/10 hover:bg-brand-charcoal hover:text-brand-sand-light"
                                        )}>
                                            {plan.id === 'business' ? 'Contact Sales' : 'Get Started'}
                                        </Button>
                                    </CardFooter>
                                </Card>
                            ))}
                        </div>

                        {/* Strategic Plan Section (Research Based) */}
                        <div className="bg-white/60 backdrop-blur-md rounded-3xl p-8 md:p-12 border border-brand-charcoal/5 text-center max-w-4xl mx-auto mt-20">
                            <h2 className="text-2xl font-poppins font-bold mb-4">Our Commitment to Value</h2>
                            <div className="grid md:grid-cols-3 gap-8 text-left mt-8">
                                <div>
                                    <h3 className="font-bold text-brand-charcoal mb-2">Freemium Access</h3>
                                    <p className="text-sm text-brand-gray-mid">
                                        We believe in democratizing architecture. Our "Sandbox" plan allows anyone to learn and experiment with core nodes without barriers.
                                    </p>
                                </div>
                                <div>
                                    <h3 className="font-bold text-brand-charcoal mb-2">Scalable Growth</h3>
                                    <p className="text-sm text-brand-gray-mid">
                                        From "Sketch" to "Blueprint", our tiers are designed to scale with your project's complexity, offering chaos engineering and advanced export options only when you need them.
                                    </p>
                                </div>
                                <div>
                                    <h3 className="font-bold text-brand-charcoal mb-2">Enterprise Grade</h3>
                                    <p className="text-sm text-brand-gray-mid">
                                        For large organizations, our "Launch" tier ensures compliance, security (SSO/Audit), and dedicated support for mission-critical infrastructure.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </MarketingLayout>
    );
}
