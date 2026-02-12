"use client";

import { Icon } from "@iconify/react";
import { Activity } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { getProject, saveProject } from "@/actions/projects";
import { AIAssistantPanel } from "@/components/canvas/AIAssistantPanel";
import { FlowEditor, type FlowEditorRef } from "@/components/canvas/FlowEditor";
import { WorkstationHeader } from "@/components/canvas/WorkstationHeader";
import type { LayoutAlgorithm } from "@/lib/layout";
import type { Project } from "@/lib/schema/graph";
import { enrichNodesWithTech } from "@/lib/tech-normalizer";
import { cn } from "@/lib/utils";

interface ProjectPageProps {
  params: Promise<{ id: string }>;
}

export default function ProjectPage({
  params: paramsPromise,
}: ProjectPageProps) {
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [id, setId] = useState<string | null>(null);
  const flowEditorRef = useRef<FlowEditorRef | null>(null);
  const [initialPrompt, setInitialPrompt] = useState<string | null>(null);

  // Terminal State
  const [isTerminalOpen, setIsTerminalOpen] = useState(true);
  const [zoom, setZoom] = useState(1);

  useEffect(() => {
    async function init() {
      const { id: projectId } = await paramsPromise;
      setId(projectId);

      // Check for initial prompt from dashboard
      const prompt = sessionStorage.getItem(`initial-prompt-${projectId}`);
      if (prompt) {
        setInitialPrompt(prompt);
        sessionStorage.removeItem(`initial-prompt-${projectId}`);
      }

      const { data, error } = await getProject(projectId);
      if (error || !data) {
        setLoading(false);
        return;
      }
      setProject(data as Project);
      setLoading(false);
    }
    init();
  }, [paramsPromise]);

  const handleGenerationSuccess = async (data: any) => {
    if (flowEditorRef.current) {
      // Enrich nodes with technology info for proper icon rendering
      const enrichedData = {
        ...data,
        nodes: enrichNodesWithTech(data.nodes),
      };

      // Apply auto-layout to organize the architecture
      const layout = await import("@/lib/layout");
      const layoutResult = layout.applyLayout(
        enrichedData.nodes,
        enrichedData.edges,
        { algorithm: "arch-pattern" },
      );

      flowEditorRef.current.updateGraph({
        ...enrichedData,
        nodes: layoutResult.nodes,
        edges: layoutResult.edges,
      });
    }
    // Persist to database
    if (id && data.nodes && data.edges) {
      await saveProject(id, { nodes: data.nodes, edges: data.edges });
    }
  };

  const handleAutolayout = (direction: "DOWN" | "RIGHT") => {
    flowEditorRef.current?.autoLayout(direction);
  };

  const handleLayoutAlgorithm = (algorithm: LayoutAlgorithm) => {
    flowEditorRef.current?.autoLayoutWithAlgorithm(algorithm);
  };

  const handleExport = (format: "mermaid" | "png" | "pdf" | "svg") => {
    flowEditorRef.current?.exportGraph(format);
  };

  const handleExportSkill = async () => {
    // ... (existing export skill logic)
    if (!flowEditorRef.current || !project) return;

    try {
      const nodes = flowEditorRef.current.nodes;
      const edges = flowEditorRef.current.edges;

      const response = await fetch("/api/export-skill", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          projectName: project.name,
          projectDescription: (project as any).description || undefined,
          nodes,
          edges,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate skill");
      }

      // Download the ZIP file
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${project.name.toLowerCase().replace(/\s+/g, "-")}-skill.zip`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Error exporting skill:", error);
      alert("Failed to export skill. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="h-screen w-screen bg-[#faf9f5] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Icon
            icon="lucide:loader-2"
            className="w-8 h-8 animate-spin text-brand-charcoal/20"
          />
          <span className="font-mono text-[10px] uppercase tracking-widest text-brand-charcoal/40">
            Initializing Workstation...
          </span>
        </div>
      </div>
    );
  }

  if (!project || !id) {
    return notFound();
  }

  return (
    <div className="flex flex-col h-screen w-full max-w-full overflow-hidden bg-[#faf9f5] font-sans selection:bg-brand-orange/20 selection:text-brand-charcoal">
      <WorkstationHeader
        project={project}
        saving={false}
        onExport={handleExport}
        onExportSkill={handleExportSkill}
        onAutolayout={handleAutolayout}
        onLayoutAlgorithm={handleLayoutAlgorithm}
      />

      <div className="flex-1 flex overflow-hidden relative">
        <div className="flex-1 flex h-full relative">
          {/* Canvas Area */}
          <div className="flex-1 relative bg-[#f5f5f5]">
             {/* Architectural Blueprint Background */}
             <div className="absolute inset-0 opacity-[0.012] pointer-events-none" 
                  style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
             <div className="absolute inset-0 opacity-[0.008] pointer-events-none" 
                  style={{ backgroundImage: 'linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)', backgroundSize: '100px 100px' }} />

            <FlowEditor
              ref={flowEditorRef}
              initialNodes={project.nodes}
              initialEdges={project.edges}
              projectId={id}
              onViewportChange={(viewport) => setZoom(viewport.zoom)}
            />

         
            {/* Floating Panel Toggle - Shows when panel is closed */}
            {!isTerminalOpen && (
              <button
                type="button"
                onClick={() => setIsTerminalOpen(true)}
                className="absolute right-6 top-6 z-30 flex items-center justify-center w-12 h-12 bg-white border-2 border-brand-charcoal shadow-[4px_4px_0px_0px_rgba(26,26,26,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all group"
                title="Open Agentic Chat"
              >
                <Icon
                  icon="lucide:message-square"
                  className="w-6 h-6 text-brand-charcoal"
                />
              </button>
            )}

            {/* Overlay HUD Zoom Controls */}
            <div className="absolute bottom-6 left-6 p-0.5 bg-white border border-brand-charcoal/20 flex items-center gap-0 z-10">
              <button
                type="button"
                onClick={() => flowEditorRef.current?.zoomOut()}
                className="w-8 h-8 flex items-center justify-center hover:bg-brand-charcoal/5 transition-colors text-brand-charcoal/40 hover:text-brand-charcoal"
              >
                <Icon icon="lucide:minus" className="w-3.5 h-3.5" />
              </button>
              <div className="h-4 w-px bg-brand-charcoal/10 mx-1" />
              <span className="font-mono text-[9px] w-12 text-center font-bold text-brand-charcoal/40">
                {Math.round(zoom * 100)}%
              </span>
              <div className="h-4 w-px bg-brand-charcoal/10 mx-1" />
              <button
                type="button"
                onClick={() => flowEditorRef.current?.zoomIn()}
                className="w-8 h-8 flex items-center justify-center hover:bg-brand-charcoal/5 transition-colors text-brand-charcoal/40 hover:text-brand-charcoal"
              >
                <Icon icon="lucide:plus" className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Terminal Sidebar (Fixed Width, Collapsible) */}
          <div
            className={cn(
              "bg-white border-l border-brand-charcoal/10 flex flex-col transition-all duration-300 ease-in-out absolute right-0 top-0 bottom-0 shadow-xl z-20",
              isTerminalOpen
                ? "w-full md:w-[420px] translate-x-0"
                : "w-full md:w-[420px] translate-x-full",
            )}
          >
            <AIAssistantPanel
              projectId={id}
              onGenerationSuccess={handleGenerationSuccess}
              isResizable={false}
              getCurrentNodes={() => flowEditorRef.current?.nodes || []}
              getCurrentEdges={() => flowEditorRef.current?.edges || []}
              initialPrompt={initialPrompt || undefined}
              initialMetadata={project.metadata}
              isOpen={isTerminalOpen}
              onToggle={() => setIsTerminalOpen(!isTerminalOpen)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
