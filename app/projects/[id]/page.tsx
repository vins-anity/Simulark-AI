"use client";

import { Icon } from "@iconify/react";
import { Activity } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { getProject, saveProject } from "@/actions/projects";
import { AIAssistantPanel } from "@/components/canvas/AIAssistantPanel";
import { FlowEditor, type FlowEditorRef } from "@/components/canvas/FlowEditor";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import type { Project } from "@/lib/schema/graph";
import { useSimulationStore } from "@/lib/store";
import { enrichNodesWithTech } from "@/lib/tech-normalizer";
import { cn } from "@/lib/utils";

// Workstation Components
// Workstation Components
function WorkstationHeader({
  project,
  saving,
  isTerminalOpen,
  onToggleTerminal,
  onExport,
  onExportSkill,
  onAutolayout, // Renamed from onAutofix
}: {
  project: Project | null;
  saving: boolean;
  isTerminalOpen?: boolean;
  onToggleTerminal?: () => void;
  onExport: (format: "mermaid" | "png" | "pdf" | "svg") => void;
  onExportSkill: () => void;
  onAutolayout: (direction: "DOWN" | "RIGHT") => void;
}) {
  const { chaosMode, setChaosMode } = useSimulationStore();
  if (!project)
    return (
      <div className="h-14 border-b border-brand-charcoal/10 bg-[#faf9f5]" />
    );

  return (
    <header className="h-14 border-b border-brand-charcoal/10 bg-[#faf9f5] flex items-center justify-between px-4 shrink-0 z-20 relative">
      <div className="flex items-center gap-4">
        {/* Navigation */}
        <Link
          href="/dashboard"
          className="text-brand-charcoal/40 hover:text-brand-charcoal transition-colors p-1"
          title="Back to Dashboard"
        >
          <Icon icon="lucide:arrow-left" className="w-4 h-4" />
        </Link>
        <div className="h-4 w-px bg-brand-charcoal/10" />

        {/* Project Identity */}
        <div className="flex items-center gap-2 mr-4">
          <Icon icon="lucide:box" className="w-4 h-4 text-brand-orange" />
          <span className="font-poppins font-bold text-sm text-brand-charcoal tracking-tight">
            {project.name}
          </span>
          <Badge
            variant="outline"
            className="hidden lg:flex rounded-none border-brand-charcoal/20 text-[9px] h-5 px-1 font-mono uppercase tracking-widest text-brand-charcoal/60 bg-transparent"
          >
            Draft
          </Badge>
        </div>

        {/* Main Menu Bar */}
        <div className="flex items-center gap-1">
          {/* File Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-xs font-medium text-brand-charcoal/70 hover:bg-brand-charcoal/5 hover:text-brand-charcoal rounded-sm"
              >
                File
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="start"
              className="w-48 font-mono text-xs"
            >
              <DropdownMenuItem
                onClick={() => {}}
                className="cursor-not-allowed opacity-50"
              >
                New Project...
              </DropdownMenuItem>
              <div className="h-px bg-slate-100 my-1" />
              <DropdownMenuItem
                onClick={onExportSkill}
                className="cursor-pointer"
              >
                <Icon
                  icon="lucide:file-code"
                  className="w-3.5 h-3.5 mr-2 text-brand-orange"
                />{" "}
                Export as Skill
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onExport("mermaid")}
                className="cursor-pointer"
              >
                <Icon icon="lucide:download" className="w-3.5 h-3.5 mr-2" />{" "}
                Export Mermaid
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onExport("png")}
                className="cursor-pointer"
              >
                <Icon icon="lucide:image" className="w-3.5 h-3.5 mr-2" /> Export
                Image (PNG)
              </DropdownMenuItem>
              <div className="h-px bg-slate-100 my-1" />
              <DropdownMenuItem className="cursor-pointer font-bold text-brand-orange">
                <Icon icon="lucide:save" className="w-3.5 h-3.5 mr-2" /> Save
                Version
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* View Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-xs font-medium text-brand-charcoal/70 hover:bg-brand-charcoal/5 hover:text-brand-charcoal rounded-sm"
              >
                View
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="start"
              className="w-48 font-mono text-xs"
            >
              <DropdownMenuItem
                onClick={onToggleTerminal}
                className="cursor-pointer"
              >
                <Icon
                  icon={
                    isTerminalOpen ? "lucide:check" : "lucide:terminal-square"
                  }
                  className="w-3.5 h-3.5 mr-2"
                />
                Terminal Panel
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {}}
                className="cursor-not-allowed opacity-50"
              >
                Toggle Grid
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Layout Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-xs font-medium text-brand-charcoal/70 hover:bg-brand-charcoal/5 hover:text-brand-charcoal rounded-sm"
              >
                Layout
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="start"
              className="w-48 font-mono text-xs"
            >
              <DropdownMenuItem
                onClick={() => onAutolayout("DOWN")}
                className="cursor-pointer"
              >
                <Icon icon="lucide:arrow-down" className="w-3.5 h-3.5 mr-2" />{" "}
                Auto-Layout (Vertical)
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onAutolayout("RIGHT")}
                className="cursor-pointer"
              >
                <Icon icon="lucide:arrow-right" className="w-3.5 h-3.5 mr-2" />{" "}
                Auto-Layout (Horizontal)
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Simulation Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-xs font-medium text-brand-charcoal/70 hover:bg-brand-charcoal/5 hover:text-brand-charcoal rounded-sm"
              >
                Simulation
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="start"
              className="w-48 font-mono text-xs"
            >
              <DropdownMenuItem
                onClick={() => setChaosMode(!chaosMode)}
                className="cursor-pointer"
              >
                <Icon
                  icon={chaosMode ? "lucide:check" : "lucide:zap"}
                  className={cn(
                    "w-3.5 h-3.5 mr-2",
                    chaosMode && "text-red-500",
                  )}
                />
                Chaos Mode {chaosMode ? "(Active)" : ""}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="hidden lg:flex items-center gap-2 mr-2 text-[10px] font-mono text-brand-charcoal/40 uppercase tracking-widest">
          <div className="flex items-center gap-1.5 px-2 py-1 bg-brand-charcoal/5 rounded-sm">
            <span
              className={cn(
                "w-1.5 h-1.5 rounded-full",
                saving ? "bg-amber-400 animate-pulse" : "bg-green-400",
              )}
            />
            {saving ? "SAVING..." : "SYSTEM ONLINE"}
          </div>
          <span>Lat: 12ms</span>
        </div>

        <div className="h-4 w-px bg-brand-charcoal/10" />

        {/* Deploy Action */}
        <Button
          size="sm"
          className="h-8 rounded-none bg-brand-charcoal text-white font-mono text-[10px] uppercase tracking-widest hover:bg-brand-orange transition-all shadow-sm"
        >
          <Icon icon="lucide:rocket" className="w-3 h-3 mr-2" />
          Deploy
        </Button>

        {/* Share Action */}
        <Button
          variant="outline"
          size="sm"
          className="h-8 w-8 p-0 rounded-none border-brand-charcoal/20 text-brand-charcoal/60 hover:text-brand-charcoal hover:border-brand-charcoal/40"
          onClick={() => navigator.clipboard.writeText(window.location.href)}
          title="Copy Link"
        >
          <Icon icon="lucide:share-2" className="w-3.5 h-3.5" />
        </Button>
      </div>
    </header>
  );
}

function ToolRail() {
  return (
    <div className="w-14 border-r border-brand-charcoal/10 bg-[#faf9f5] flex flex-col items-center py-4 gap-4 shrink-0 z-20 relative">
      <div className="flex flex-col gap-2">
        {[
          { icon: "lucide:mouse-pointer-2", label: "Select" },
          { icon: "lucide:hand", label: "Pan" },
          { icon: "lucide:crop", label: "Slice" },
        ].map((tool, i) => (
          <button
            key={i}
            className={cn(
              "w-9 h-9 flex items-center justify-center rounded-sm transition-all hover:bg-brand-charcoal/5 text-brand-charcoal/60 hover:text-brand-charcoal",
              i === 0 && "bg-brand-charcoal/10 text-brand-charcoal",
            )}
            title={tool.label}
          >
            <Icon icon={tool.icon} className="w-4 h-4" />
          </button>
        ))}
      </div>

      <div className="w-8 h-px bg-brand-charcoal/10" />

      <div className="flex flex-col gap-2">
        {[
          { icon: "lucide:square", label: "Node" },
          { icon: "lucide:type", label: "Text" },
          { icon: "lucide:image", label: "Image" },
        ].map((tool, i) => (
          <button
            key={i}
            className="w-9 h-9 flex items-center justify-center rounded-sm transition-all hover:bg-brand-charcoal/5 text-brand-charcoal/60 hover:text-brand-charcoal"
            title={tool.label}
          >
            <Icon icon={tool.icon} className="w-4 h-4" />
          </button>
        ))}
      </div>

      <div className="mt-auto flex flex-col gap-2">
        <button
          className="w-9 h-9 flex items-center justify-center rounded-sm transition-all hover:bg-brand-charcoal/5 text-brand-charcoal/60 hover:text-brand-charcoal"
          title="Settings"
        >
          <Icon icon="lucide:settings-2" className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

interface ProjectPageProps {
  params: Promise<{
    id: string;
  }>;
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
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-[#faf9f5] font-sans selection:bg-brand-orange/20 selection:text-brand-charcoal">
      <WorkstationHeader
        project={project}
        saving={false}
        isTerminalOpen={isTerminalOpen}
        onToggleTerminal={() => setIsTerminalOpen(!isTerminalOpen)}
        onExport={handleExport}
        onExportSkill={handleExportSkill}
        onAutolayout={handleAutolayout}
      />

      <div className="flex-1 flex overflow-hidden relative">
        <ToolRail />

        <div className="flex-1 flex h-full relative">
          {/* Canvas Area */}
          <div className="flex-1 relative bg-[#e5e5e5]">
            <div className="absolute inset-0 pattern-dots pattern-brand-charcoal/5 pattern-bg-transparent pattern-size-4 pattern-opacity-100" />

            <FlowEditor
              ref={flowEditorRef}
              initialNodes={project.nodes}
              initialEdges={project.edges}
              projectId={id}
            />

            {/* Overlay Canvas Controls */}
            <div className="absolute bottom-6 left-6 p-1 bg-white border border-brand-charcoal/10 shadow-sm flex items-center gap-1 rounded-sm z-10">
              <button className="w-8 h-8 flex items-center justify-center hover:bg-brand-charcoal/5 text-brand-charcoal/60">
                <Icon icon="lucide:minus" className="w-4 h-4" />
              </button>
              <span className="font-mono text-[10px] w-12 text-center text-brand-charcoal/60">
                100%
              </span>
              <button className="w-8 h-8 flex items-center justify-center hover:bg-brand-charcoal/5 text-brand-charcoal/60">
                <Icon icon="lucide:plus" className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Terminal Sidebar (Fixed Width, Collapsible) */}
          <div
            className={cn(
              "bg-white border-l border-brand-charcoal/10 flex flex-col transition-all duration-300 ease-in-out absolute right-0 top-0 bottom-0 shadow-xl z-20",
              isTerminalOpen
                ? "w-[400px] translate-x-0"
                : "w-[400px] translate-x-full",
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
            />
          </div>
        </div>
      </div>
    </div>
  );
}
