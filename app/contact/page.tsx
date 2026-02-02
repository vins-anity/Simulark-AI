import { MarketingLayout } from "@/components/marketing/MarketingLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea"; // Assuming this exists or using standard textarea
import { Mail, MapPin, Phone } from "lucide-react";

export default function ContactPage() {
    return (
        <MarketingLayout>
            <div className="bg-[#faf9f5] min-h-screen">
                <div className="pt-32 pb-20 px-6 max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <h1 className="text-5xl font-poppins font-bold text-brand-charcoal mb-6">Get in Touch</h1>
                        <p className="text-xl text-brand-gray-mid font-lora italic">We'd love to hear from you. Here's how you can reach us.</p>
                    </div>

                    <div className="grid lg:grid-cols-2 gap-16 items-start">
                        {/* Contact Information */}
                        <div className="space-y-12">
                            <div className="bg-white p-8 rounded-3xl border border-brand-charcoal/5 shadow-sm space-y-8">
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 bg-brand-orange/10 rounded-full flex items-center justify-center text-brand-orange shrink-0">
                                        <Mail className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h3 className="font-poppins font-bold text-xl text-brand-charcoal mb-1">Email Us</h3>
                                        <p className="text-brand-gray-mid font-lora mb-2">For general inquiries and support.</p>
                                        <a href="mailto:hello@simulark.com" className="text-brand-orange hover:text-brand-orange/80 transition-colors font-medium">hello@simulark.com</a>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 bg-brand-blue/10 rounded-full flex items-center justify-center text-brand-blue shrink-0">
                                        <MapPin className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h3 className="font-poppins font-bold text-xl text-brand-charcoal mb-1">Visit Us</h3>
                                        <p className="text-brand-gray-mid font-lora mb-2">Our headquarters.</p>
                                        <address className="not-italic text-brand-charcoal/80">
                                            123 Innovation Drive<br />
                                            San Francisco, CA 94103
                                        </address>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Contact Form */}
                        <div className="bg-white p-8 md:p-10 rounded-3xl shadow-lg shadow-brand-charcoal/5 border border-brand-charcoal/5">
                            <h3 className="font-poppins font-bold text-2xl text-brand-charcoal mb-6">Send us a message</h3>
                            <form className="space-y-6">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label htmlFor="first-name" className="text-sm font-medium text-brand-charcoal">First Name</label>
                                        <Input id="first-name" placeholder="Jane" className="bg-[#faf9f5] border-brand-charcoal/10 focus:border-brand-orange/50 transition-colors" />
                                    </div>
                                    <div className="space-y-2">
                                        <label htmlFor="last-name" className="text-sm font-medium text-brand-charcoal">Last Name</label>
                                        <Input id="last-name" placeholder="Doe" className="bg-[#faf9f5] border-brand-charcoal/10 focus:border-brand-orange/50 transition-colors" />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label htmlFor="email" className="text-sm font-medium text-brand-charcoal">Email</label>
                                    <Input id="email" type="email" placeholder="jane@example.com" className="bg-[#faf9f5] border-brand-charcoal/10 focus:border-brand-orange/50 transition-colors" />
                                </div>

                                <div className="space-y-2">
                                    <label htmlFor="message" className="text-sm font-medium text-brand-charcoal">Message</label>
                                    <textarea
                                        id="message"
                                        className="flex min-h-[120px] w-full rounded-md border border-brand-charcoal/10 bg-[#faf9f5] px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 focus:border-brand-orange/50 transition-colors"
                                        placeholder="How can we help you?"
                                    />
                                </div>

                                <Button size="lg" className="w-full bg-brand-charcoal text-brand-sand-light hover:bg-brand-charcoal/90 rounded-xl">
                                    Send Message
                                </Button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </MarketingLayout>
    );
}
