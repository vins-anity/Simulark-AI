import { MarketingLayout } from "@/components/marketing/MarketingLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Zap, Shield, GitBranch, Terminal, Globe, Cpu } from "lucide-react";

export default function FeaturesPage() {
    return (
        <MarketingLayout>
            <div className="bg-[#faf9f5]">
                {/* Hero Section */}
                <div className="relative pt-32 pb-20 px-6 overflow-hidden">
                    <div className="max-w-7xl mx-auto text-center space-y-8 relative z-10">
                        <Badge variant="outline" className="bg-brand-orange/10 text-brand-orange border-brand-orange/20 px-4 py-1 rounded-full uppercase tracking-widest text-xs font-semibold">
                            Features & Capabilities
                        </Badge>
                        <h1 className="text-5xl md:text-7xl font-poppins font-bold tracking-tight text-brand-charcoal leading-tight">
                            Architecture,<br />
                            <span className="font-serif italic text-brand-orange">Reimagined.</span>
                        </h1>
                        <p className="text-xl md:text-2xl text-brand-gray-mid font-lora max-w-3xl mx-auto leading-relaxed">
                            Transform natural language into production-ready infrastructure.
                            Simulark bridges the gap between thought and execution.
                        </p>
                    </div>

                    {/* Abstract Background Decoration */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-brand-orange/5 rounded-full blur-3xl -z-10 opacity-60" />
                </div>

                {/* How It Works Section */}
                <section className="py-24 px-6 bg-white/50 backdrop-blur-sm">
                    <div className="max-w-7xl mx-auto">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl md:text-4xl font-poppins font-bold text-brand-charcoal mb-4">How It Works</h2>
                            <p className="text-lg text-brand-gray-mid font-lora italic">From concept to deployment in three simple steps.</p>
                        </div>

                        <div className="grid md:grid-cols-3 gap-12 relative">
                            {/* Connector Line */}
                            <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-0.5 bg-gradient-to-r from-transparent via-brand-orange/20 to-transparent dashed-line" />

                            {/* Step 1 */}
                            <div className="relative text-center space-y-6 group">
                                <div className="w-24 h-24 mx-auto bg-white rounded-2xl shadow-xl flex items-center justify-center border border-brand-charcoal/5 relative z-10 transition-transform duration-300 group-hover:scale-110">
                                    <span className="font-poppins text-4xl font-bold text-brand-orange">1</span>
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold font-poppins text-brand-charcoal mb-2">Describe</h3>
                                    <p className="text-brand-gray-mid font-lora">Simply describe your backend needs in plain English. No complex configurations required.</p>
                                </div>
                            </div>

                            {/* Step 2 */}
                            <div className="relative text-center space-y-6 group">
                                <div className="w-24 h-24 mx-auto bg-white rounded-2xl shadow-xl flex items-center justify-center border border-brand-charcoal/5 relative z-10 transition-transform duration-300 group-hover:scale-110">
                                    <span className="font-poppins text-4xl font-bold text-brand-orange">2</span>
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold font-poppins text-brand-charcoal mb-2">Visualize</h3>
                                    <p className="text-brand-gray-mid font-lora">Watch as our AI generates a comprehensive architectural diagram and plan.</p>
                                </div>
                            </div>

                            {/* Step 3 */}
                            <div className="relative text-center space-y-6 group">
                                <div className="w-24 h-24 mx-auto bg-white rounded-2xl shadow-xl flex items-center justify-center border border-brand-charcoal/5 relative z-10 transition-transform duration-300 group-hover:scale-110">
                                    <span className="font-poppins text-4xl font-bold text-brand-orange">3</span>
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold font-poppins text-brand-charcoal mb-2">Deploy</h3>
                                    <p className="text-brand-gray-mid font-lora">Export to Terraform, Kubernetes, or direct cloud deployment with a single click.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Deep Dive Features */}
                <section className="py-24 px-6">
                    <div className="max-w-7xl mx-auto">
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {features.map((feature, i) => (
                                <div key={i} className="bg-white p-8 rounded-2xl border border-brand-charcoal/5 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group">
                                    <div className="w-12 h-12 bg-brand-sand-light rounded-xl flex items-center justify-center text-brand-orange mb-6 group-hover:bg-brand-orange group-hover:text-white transition-colors duration-300">
                                        <feature.icon className="w-6 h-6" />
                                    </div>
                                    <h3 className="text-xl font-bold font-poppins text-brand-charcoal mb-3">{feature.title}</h3>
                                    <p className="text-brand-gray-mid font-lora text-sm leading-relaxed">
                                        {feature.description}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* CTA */}
                <section className="py-24 px-6 bg-brand-charcoal text-brand-sand-light">
                    <div className="max-w-4xl mx-auto text-center space-y-8">
                        <h2 className="text-4xl md:text-5xl font-poppins font-bold">Ready to streamline your workflow?</h2>
                        <p className="text-xl opacity-80 font-lora">Join thousands of developers building the future with Simulark.</p>
                        <div className="flex justify-center gap-4 pt-4">
                            <Link href="/auth/signin">
                                <Button size="lg" className="bg-brand-orange hover:bg-brand-orange/90 text-white rounded-full px-8 py-6 text-lg">
                                    Start Building Now
                                </Button>
                            </Link>
                        </div>
                    </div>
                </section>
            </div>
        </MarketingLayout>
    );
}

const features = [
    {
        icon: Zap,
        title: "Instant Architecture",
        description: "Generate complete, production-ready backend architectures in seconds using advanced AI models."
    },
    {
        icon: GitBranch,
        title: "Version Control",
        description: "Track changes, branch ideas, and revert infrastructure updates just like you do with code."
    },
    {
        icon: Shield,
        title: "Security By Design",
        description: "Every generated architecture follows industry standard security best practices and compliance requirements."
    },
    {
        icon: Terminal,
        title: "Infrastructure as Code",
        description: "Export clean, maintainable Terraform, Pulumi, or CloudFormation code that you can own."
    },
    {
        icon: Globe,
        title: "Multi-Cloud Support",
        description: "Seamlessly deploy to AWS, Azure, Google Cloud, or Vercel without changing your workflow."
    },
    {
        icon: Cpu,
        title: "Cost Optimization",
        description: "AI-driven insights to help you choose the most cost-effective resources for your scale."
    }
];
