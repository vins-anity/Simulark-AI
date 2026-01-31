"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Icon } from "@iconify/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createProjectFromTemplate } from "@/actions/projects";

interface Template {
    id: string;
    title: string;
    description: string;
    tags: string[];
    icon: string;
    color: string;
    difficulty: "Beginner" | "Intermediate" | "Advanced";
}

const templates: Template[] = [
    {
        id: "saas-starter",
        title: "SaaS Starter Kit",
        description: "Complete B2B SaaS architecture with Auth, Stripe Billing, and Multi-tenancy.",
        tags: ["Next.js", "Supabase", "Stripe"],
        icon: "lucide:rocket",
        color: "bg-blue-500/10 text-blue-500",
        difficulty: "Intermediate",
    },
    {
        id: "e-commerce",
        title: "E-Commerce Platform",
        description: "Scalable online store backend with Product Catalog, Cart, and Order processing.",
        tags: ["Microservices", "Redis", "PostgreSQL"],
        icon: "lucide:shopping-bag",
        color: "bg-green-500/10 text-green-500",
        difficulty: "Advanced",
    },
    {
        id: "iot-dashboard",
        title: "IoT Data Pipeline",
        description: "Real-time data ingestion architecture for IoT devices using MQTT and TimescaleDB.",
        tags: ["MQTT", "TimescaleDB", "WebSockets"],
        icon: "lucide:cpu",
        color: "bg-orange-500/10 text-orange-500",
        difficulty: "Advanced",
    },
    {
        id: "blog-cms",
        title: "Headless CMS Blog",
        description: "Simple yet powerful content management system architecture for media-heavy blogs.",
        tags: ["Strapi", "S3", "CDN"],
        icon: "lucide:file-text",
        color: "bg-purple-500/10 text-purple-500",
        difficulty: "Beginner",
    },
    {
        id: "chat-app",
        title: "Real-time Chat App",
        description: "Scalable WebSocket-based chat application with message persistence and presence.",
        tags: ["Socket.io", "Redis", "MongoDB"],
        icon: "lucide:message-circle",
        color: "bg-pink-500/10 text-pink-500",
        difficulty: "Intermediate",
    },
    {
        id: "ai-rag",
        title: "RAG AI Agent",
        description: "Retrieval-Augmented Generation pipeline for custom knowledge base AI assistants.",
        tags: ["Vector DB", "OpenAI", "LangChain"],
        icon: "lucide:brain-circuit",
        color: "bg-indigo-500/10 text-indigo-500",
        difficulty: "Advanced",
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
                toast.success("Template Cloned", {
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
        <div className="font-sans selection:bg-brand-orange/20 selection:text-brand-charcoal">
            <div className="max-w-4xl mx-auto text-center mb-12 space-y-4">
                <Badge variant="outline" className="bg-brand-orange/10 text-brand-orange border-brand-orange/20 px-4 py-1 rounded-full uppercase tracking-widest text-xs font-semibold">
                    Architecture Gallery
                </Badge>
                <h1 className="text-4xl md:text-5xl font-poppins font-bold tracking-tight text-brand-charcoal">
                    Start with a Blueprint
                </h1>
                <p className="text-xl text-brand-gray-mid font-lora italic">
                    Don't start from scratch. Choose a production-ready template.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
                {templates.map((template) => (
                    <Card key={template.id} className="group border-brand-charcoal/5 shadow-sm hover:shadow-xl transition-all duration-300 bg-white/50 backdrop-blur-sm hover:-translate-y-1">
                        <CardHeader>
                            <div className="flex justify-between items-start mb-2">
                                <div className={`p-3 rounded-xl ${template.color} transition-colors group-hover:bg-opacity-20`}>
                                    <Icon icon={template.icon} className="w-6 h-6" />
                                </div>
                                <Badge variant="secondary" className="bg-brand-charcoal/5 text-brand-charcoal/70 font-normal">
                                    {template.difficulty}
                                </Badge>
                            </div>
                            <CardTitle className="font-poppins text-lg">{template.title}</CardTitle>
                            <CardDescription className="line-clamp-2 h-10">{template.description}</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-wrap gap-2">
                                {template.tags.map(tag => (
                                    <span key={tag} className="text-xs px-2 py-1 rounded-md bg-brand-charcoal/5 text-brand-charcoal/70 font-mono">
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button
                                className="w-full bg-white border border-brand-charcoal/10 text-brand-charcoal hover:bg-brand-charcoal hover:text-brand-sand-light transition-all shadow-sm"
                                onClick={() => handleClone(template.id)}
                                disabled={!!cloningId}
                            >
                                {cloningId === template.id ? (
                                    <>
                                        <Icon icon="lucide:loader-2" className="mr-2 h-4 w-4 animate-spin" />
                                        Cloning...
                                    </>
                                ) : (
                                    <>
                                        <Icon icon="lucide:copy" className="mr-2 h-4 w-4" />
                                        Use Template
                                    </>
                                )}
                            </Button>
                        </CardFooter>
                    </Card>
                ))}
            </div>
        </div>
    );
}
