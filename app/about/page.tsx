import { MarketingLayout } from "@/components/marketing/MarketingLayout";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";

export default function AboutPage() {
    return (
        <MarketingLayout>
            <div className="bg-[#faf9f5]">
                {/* Hero */}
                <div className="pt-32 pb-20 px-6 text-center max-w-4xl mx-auto">
                    <Badge variant="outline" className="mb-6 bg-brand-charcoal/5 text-brand-charcoal border-brand-charcoal/20 px-4 py-1 rounded-full uppercase tracking-widest text-xs font-semibold">
                        Our Story
                    </Badge>
                    <h1 className="text-5xl md:text-7xl font-poppins font-bold tracking-tight text-brand-charcoal leading-tight mb-8">
                        Building the future of <span className="font-serif italic text-brand-orange">infrastructure</span>.
                    </h1>
                    <p className="text-xl text-brand-gray-mid font-lora max-w-2xl mx-auto leading-relaxed">
                        We started Simulark with a simple question: Why is setting up backend architecture still so hard?
                    </p>
                </div>

                {/* Mission Section */}
                <section className="py-20 px-6 bg-white">
                    <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-16 items-center">
                        <div className="space-y-6">
                            <h2 className="text-3xl font-poppins font-bold text-brand-charcoal">Our Mission</h2>
                            <div className="w-16 h-1 bg-brand-orange/60 rounded-full" />
                            <p className="font-lora text-lg text-brand-gray-mid leading-relaxed">
                                At Simulark, we believe that creativity shouldn't be bottlenecked by configuration.
                                Architects and developers spend too much time wrestling with YAML files, cloud consoles,
                                and dependency graphs.
                            </p>
                            <p className="font-lora text-lg text-brand-gray-mid leading-relaxed">
                                Our mission is to provide an intelligent layer that translates high-level intent into
                                rock-solid, deployable infrastructure. We empower you to design with the speed of thought
                                and deploy with the precision of a machine.
                            </p>
                        </div>
                        <div className="relative h-[400px] bg-brand-charcoal rounded-2xl overflow-hidden flex items-center justify-center p-8">
                            {/* Abstract Art / Visualization */}
                            <div className="absolute inset-0 bg-grid-white/[0.05]" />
                            <div className="absolute w-64 h-64 bg-brand-orange/20 rounded-full blur-3xl rounded-tr-none" />
                            <blockquote className="relative z-10 text-brand-sand-light font-poppins text-2xl font-light italic text-center">
                                "The best code is the code you don't have to write."
                            </blockquote>
                        </div>
                    </div>
                </section>

                {/* Values Section */}
                <section className="py-24 px-6 bg-[#faf9f5]">
                    <div className="max-w-7xl mx-auto">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl font-poppins font-bold text-brand-charcoal">Our Values</h2>
                        </div>
                        <div className="grid md:grid-cols-3 gap-8">
                            {[
                                { title: "Precision", text: "We don't guess. We verify. Every generated architecture is validated against industry standards." },
                                { title: "Transparency", text: "No black boxes. We provide clean, exportable code that you can audit, own, and modify." },
                                { title: "Innovation", text: "We constantly push the boundaries of what AI can facilitate in software engineering." }
                            ].map((val, i) => (
                                <div key={i} className="bg-white p-8 rounded-xl border border-brand-charcoal/5 shadow-sm">
                                    <h3 className="text-xl font-bold font-poppins text-brand-charcoal mb-4">{val.title}</h3>
                                    <p className="text-brand-gray-mid font-lora">{val.text}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            </div>
        </MarketingLayout>
    );
}
