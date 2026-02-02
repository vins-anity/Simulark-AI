"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Icon } from "@iconify/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createProjectFromTemplate } from "@/actions/projects";
import { cn } from "@/lib/utils";

interface Template {
    id: string;
    title: string;
    description: string;
    tags: string[];
    icon: string;
    difficulty: "Beginner" | "Intermediate" | "Advanced";
    id_code: string;
}

const templates: Template[] = [
    {
        id: "saas-starter",
        title: "SaaS Starter Kit",
        description: "Complete B2B SaaS architecture with Auth, Stripe Billing, and Multi-tenancy.",
        tags: ["Next.js", "Supabase", "Stripe"],
        icon: "lucide:rocket",
        difficulty: "Intermediate",
        id_code: "TMP-001"
    },
    {
        id: "e-commerce",
        title: "E-Commerce Platform",
        description: "Scalable online store backend with Product Catalog, Cart, and Order processing.",
        tags: ["Microservices", "Redis", "PostgreSQL"],
        icon: "lucide:shopping-bag",
        difficulty: "Advanced",
        id_code: "TMP-002"
    },
    {
        id: "iot-dashboard",
        title: "IoT Data Pipeline",
        description: "Real-time data ingestion architecture for IoT devices using MQTT and TimescaleDB.",
        tags: ["MQTT", "TimescaleDB", "WebSockets"],
        icon: "lucide:cpu",
        difficulty: "Advanced",
        id_code: "TMP-003"
    },
    {
        id: "blog-cms",
        title: "Headless CMS Blog",
        description: "Simple yet powerful content management system architecture for media-heavy blogs.",
        tags: ["Strapi", "S3", "CDN"],
        icon: "lucide:file-text",
        difficulty: "Beginner",
        id_code: "TMP-004"
    },
    {
        id: "chat-app",
        title: "Real-time Chat App",
        description: "Scalable WebSocket-based chat application with message persistence and presence.",
        tags: ["Socket.io", "Redis", "MongoDB"],
        icon: "lucide:message-circle",
        difficulty: "Intermediate",
        id_code: "TMP-005"
    },
    {
        id: "ai-rag",
        title: "RAG AI Agent",
        description: "Retrieval-Augmented Generation pipeline for custom knowledge base AI assistants.",
        tags: ["Vector DB", "OpenAI", "LangChain"],
        icon: "lucide:brain-circuit",
        difficulty: "Advanced",
        id_code: "TMP-006"
    }
];

export default function TemplatesPage() {
    const router = useRouter();
    const [cloningId, setCloningId] = useState<string | null>(null);

    const handleClone = async (templateId: string) => {
        setCloningId(templateId);

        try {
            const template = templates.find(t => t.id === templateId);
            const name = template ? `${template.title} (Clone)` : "New Project";

            const result = await createProjectFromTemplate(templateId, name);

            if (result.success && result.data) {
                toast.success("Blueprint Initialized", {
                    description: "Redirecting to editor...",
                });
                router.push(`/projects/${result.data.id}`);
            } else {
                toast.error("Failed to clone template", {
                    description: result.error || "Unknown error",
                });
            }
        } catch (error) {
            toast.error("An error occurred");
        } finally {
            setCloningId(null);
        }
    };

    return (
        <div className="font-sans flex flex-col min-h-screen">
            {/* Header */}
            <div className="max-w-4xl mb-16 space-y-6">
                <div className="flex items-center gap-2 mb-2">
                    <span className="w-2 h-2 bg-brand-orange animate-pulse" />
                    <span className="font-mono text-xs uppercase tracking-widest text-brand-charcoal/60">
                        Archive Access: Granted
                    </span>
                </div>
                <h1 className="text-4xl md:text-6xl font-poppins font-bold tracking-tight text-brand-charcoal">
                    Blueprint Archive
                </h1>
                <p className="text-xl text-brand-gray-mid font-lora italic max-w-2xl leading-relaxed">
                    Pre-configured architectural patterns for rapid deployment. Select a blueprint to initialize your project.
                </p>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {templates.map((template) => (
                    <div
                        key={template.id}
                        className="group relative bg-white border border-brand-charcoal/10 hover:border-brand-charcoal transition-all duration-300 flex flex-col min-h-[280px]"
                    >
                        {/* Header Band */}
                        <div className="h-1 bg-brand-charcoal w-full transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300" />

                        <div className="p-8 flex flex-col flex-1">
                            <div className="flex justify-between items-start mb-6">
                                <div className="p-0 text-brand-charcoal opacity-60 group-hover:text-brand-orange group-hover:opacity-100 transition-colors">
                                    <Icon icon={template.icon} className="w-8 h-8" />
                                </div>
                                <span className="font-mono text-[10px] uppercase text-brand-charcoal/30">
                                    {template.id_code}
                                </span>
                            </div>

                            <h3 className="font-poppins font-bold text-xl text-brand-charcoal mb-2 group-hover:translate-x-1 transition-transform">
                                {template.title}
                            </h3>
                            <p className="text-sm font-lora text-brand-gray-mid mb-6 line-clamp-3">
                                {template.description}
                            </p>

                            <div className="mt-auto pt-6 border-t border-brand-charcoal/5">
                                <div className="flex flex-wrap gap-2 mb-6">
                                    {template.tags.map(tag => (
                                        <span key={tag} className="text-[10px] px-2 py-0.5 border border-brand-charcoal/10 text-brand-charcoal/60 font-mono uppercase tracking-wide">
                                            {tag}
                                        </span>
                                    ))}
                                </div>

                                <Button
                                    className={cn(
                                        "w-full rounded-none h-10 font-mono uppercase tracking-widest text-[10px] transition-all border",
                                        "bg-white text-brand-charcoal border-brand-charcoal hover:bg-brand-charcoal hover:text-white"
                                    )}
                                    onClick={() => handleClone(template.id)}
                                    disabled={!!cloningId}
                                >
                                    {cloningId === template.id ? (
                                        <>
                                            <Icon icon="lucide:loader-2" className="mr-2 h-3 w-3 animate-spin" />
                                            Initializing...
                                        </>
                                    ) : (
                                        "Initialize Blueprint"
                                    )}
                                </Button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
