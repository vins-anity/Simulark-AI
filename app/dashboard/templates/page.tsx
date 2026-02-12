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
  metrics: {
    complexity: string;
    nodes: number;
    uptime: string;
  };
  accent: string;
}

const templates: Template[] = [
  {
    id: "saas-starter",
    title: "SaaS Starter Kit",
    description:
      "Complete B2B SaaS architecture with Auth, Stripe Billing, and Multi-tenancy.",
    tags: ["Next.js", "Supabase", "Stripe"],
    icon: "lucide:rocket",
    difficulty: "Intermediate",
    id_code: "TMP-001",
    metrics: {
      complexity: "O(log N)",
      nodes: 12,
      uptime: "99.99%",
    },
    accent: "#FF5733",
  },
  {
    id: "e-commerce",
    title: "E-Commerce Platform",
    description:
      "Scalable online store backend with Product Catalog, Cart, and Order processing.",
    tags: ["Microservices", "Redis", "PostgreSQL"],
    icon: "lucide:shopping-bag",
    difficulty: "Advanced",
    id_code: "TMP-002",
    metrics: {
      complexity: "O(N^2)",
      nodes: 24,
      uptime: "99.95%",
    },
    accent: "#33FF57",
  },
  {
    id: "iot-dashboard",
    title: "IoT Data Pipeline",
    description:
      "Real-time data ingestion architecture for IoT devices using MQTT and TimescaleDB.",
    tags: ["MQTT", "TimescaleDB", "WebSockets"],
    icon: "lucide:cpu",
    difficulty: "Advanced",
    id_code: "TMP-003",
    metrics: {
      complexity: "O(N log N)",
      nodes: 42,
      uptime: "99.999%",
    },
    accent: "#3357FF",
  },
  {
    id: "blog-cms",
    title: "Headless CMS Blog",
    description:
      "Simple yet powerful content management system architecture for media-heavy blogs.",
    tags: ["Strapi", "S3", "CDN"],
    icon: "lucide:file-text",
    difficulty: "Beginner",
    id_code: "TMP-004",
    metrics: {
      complexity: "O(1)",
      nodes: 4,
      uptime: "99.9%",
    },
    accent: "#F333FF",
  },
  {
    id: "chat-app",
    title: "Real-time Chat App",
    description:
      "Scalable WebSocket-based chat application with message persistence and presence.",
    tags: ["Socket.io", "Redis", "MongoDB"],
    icon: "lucide:message-circle",
    difficulty: "Intermediate",
    id_code: "TMP-005",
    metrics: {
      complexity: "O(N)",
      nodes: 18,
      uptime: "99.99%",
    },
    accent: "#FFBD33",
  },
  {
    id: "ai-rag",
    title: "RAG AI Agent",
    description:
      "Retrieval-Augmented Generation pipeline for custom knowledge base AI assistants.",
    tags: ["Vector DB", "OpenAI", "LangChain"],
    icon: "lucide:brain-circuit",
    difficulty: "Advanced",
    id_code: "TMP-006",
    metrics: {
      complexity: "O(K * N)",
      nodes: 8,
      uptime: "99.5%",
    },
    accent: "#33FFF3",
  },
];

export default function TemplatesPage() {
  const router = useRouter();
  const [cloningId, setCloningId] = useState<string | null>(null);

  const handleClone = async (templateId: string) => {
    setCloningId(templateId);

    try {
      const template = templates.find((t) => t.id === templateId);
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
    <div className="flex flex-col min-h-screen text-brand-charcoal">
      {/* HUD Header */}
      <div className="mb-12 border-l-4 border-brand-charcoal pl-6 py-4 relative group">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex gap-1">
            <div className="w-2 h-2 bg-brand-charcoal" />
            <div className="w-2 h-2 bg-brand-charcoal/20" />
            <div className="w-2 h-2 bg-brand-charcoal/20" />
          </div>
          <span className="font-mono text-[10px] uppercase tracking-widest opacity-40">
            SECURE_ARCHIVE / BLUEPRINT_DATABASE
          </span>
        </div>

        <h1 className="text-5xl md:text-7xl font-poppins font-black tracking-tighter uppercase mb-4">
          The Registry
        </h1>

        <div className="flex flex-wrap items-center gap-x-8 gap-y-2 font-mono text-[11px] uppercase tracking-wider opacity-60">
          <div className="flex items-center gap-2">
            <span className="text-brand-orange text-xs font-bold">●</span>
            <span>SYSTEM_ONLINE</span>
          </div>
          <div>COORD_X: 40.71 / Y: -74.00</div>
          <div>STATUS: ACCESS_GRANTED</div>
          <div className="hidden md:block">ENTRIES: {templates.length}_LOADED</div>
        </div>

        {/* Decorative HUD lines */}
        <div className="absolute top-0 right-0 hidden lg:block opacity-[0.05] pointer-events-none">
          <div className="text-[120px] font-black leading-none select-none">BPRNT</div>
        </div>
      </div>

      {/* Grid Container */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-0 border-t border-l border-brand-charcoal/10">
        {templates.map((template) => (
          <div
            key={template.id}
            className="group relative border-r border-b border-brand-charcoal hover:bg-neutral-50 transition-colors duration-300 flex flex-col min-h-[420px]"
          >
            {/* Template Card Content */}
            <div className="p-8 flex flex-col flex-1 relative overflow-hidden">
              {/* Background ID Code */}
              <div className="absolute -top-4 -right-2 font-mono text-[80px] font-black opacity-[0.03] select-none group-hover:opacity-[0.06] transition-opacity">
                {template.id_code.split("-")[1]}
              </div>

              {/* Card Top: Identifier */}
              <div className="flex justify-between items-start mb-10 relative z-10">
                <div 
                  className="w-12 h-12 border-2 border-brand-charcoal flex items-center justify-center bg-white group-hover:bg-brand-charcoal group-hover:text-white transition-all transform group-hover:-translate-y-1"
                  style={{ boxShadow: `4px 4px 0px 0px ${template.accent}` }}
                >
                  <Icon icon={template.icon} className="w-6 h-6" />
                </div>
                <div className="flex flex-col items-end gap-1 font-mono text-[10px]">
                  <span className="text-brand-charcoal/40 uppercase">Arch_ID</span>
                  <span className="font-bold tracking-widest">{template.id_code}</span>
                </div>
              </div>

              {/* Card Body: Info */}
              <div className="mb-6 relative z-10">
                <h3 className="font-poppins font-black text-2xl uppercase tracking-tighter mb-3 group-hover:text-brand-orange transition-colors">
                  {template.title}
                </h3>
                <p className="text-sm font-mono text-brand-charcoal/70 leading-relaxed max-w-[90%]">
                  {template.description}
                </p>
              </div>

              {/* Technical Readout */}
              <div className="grid grid-cols-3 gap-4 mb-8 border-y border-brand-charcoal/10 py-4 font-mono">
                <div className="flex flex-col gap-1">
                  <span className="text-[9px] uppercase opacity-40">Complexity</span>
                  <span className="text-xs font-bold text-brand-orange">{template.metrics.complexity}</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[9px] uppercase opacity-40">Nodes</span>
                  <span className="text-xs font-bold">{template.metrics.nodes}</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[9px] uppercase opacity-40">Up_Time</span>
                  <span className="text-xs font-bold">{template.metrics.uptime}</span>
                </div>
              </div>

              {/* Footer: Tags & Action */}
              <div className="mt-auto pt-4 relative z-10">
                <div className="flex flex-wrap gap-2 mb-8">
                  {template.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-[9px] px-2 py-1 bg-brand-charcoal/5 text-brand-charcoal font-bold uppercase tracking-widest border border-brand-charcoal/10"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                <Button
                  className={cn(
                    "w-full rounded-none h-12 font-mono uppercase tracking-[0.2em] text-[11px] font-bold transition-all border-2",
                    "bg-white text-brand-charcoal border-brand-charcoal hover:bg-brand-charcoal hover:text-white",
                    "shadow-[4px_4px_0px_0px_rgba(26,26,26,1)] hover:shadow-none translate-x-[-2px] translate-y-[-2px] active:translate-x-0 active:translate-y-0"
                  )}
                  onClick={() => handleClone(template.id)}
                  disabled={!!cloningId}
                >
                  {cloningId === template.id ? (
                    <span className="flex items-center gap-2">
                      <Icon icon="lucide:loader-2" className="h-4 w-4 animate-spin" />
                      STAGING_ARCHITECTURE...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                       [ INITIALIZE_BLUEPRINT ]
                    </span>
                  )}
                </Button>
              </div>
            </div>

            {/* Decorative Corner Bracket */}
            <div className="absolute bottom-0 right-0 w-4 h-4 border-r-2 border-b-2 border-brand-charcoal opacity-0 group-hover:opacity-100 transition-opacity m-2" />
          </div>
        ))}
      </div>
    </div>
  );
}
