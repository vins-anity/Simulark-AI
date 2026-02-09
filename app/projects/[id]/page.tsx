"use client";

import { getProject, saveProject } from "@/actions/projects";
import { FlowEditor, type FlowEditorRef } from "@/components/canvas/FlowEditor";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { AIAssistantPanel } from "@/components/canvas/AIAssistantPanel";
import { notFound } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { type Project } from "@/lib/schema/graph";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Icon } from "@iconify/react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useSimulationStore } from "@/lib/store";
import { Activity } from "lucide-react";

// Workstation Components
function WorkstationHeader({
  project,
  saving,
  isTerminalOpen,
  onToggleTerminal,
  onExport,
  onExportSkill,
  onAutolayout // Renamed from onAutofix
}: {
  project: Project | null,
  saving: boolean,
  isTerminalOpen?: boolean,
  onToggleTerminal?: () => void,
  onExport: (format: 'mermaid' | 'png' | 'pdf' | 'svg') => void,
  onExportSkill: () => void,
  onAutolayout: (direction: "DOWN" | "RIGHT") => void
}) {
  const { chaosMode, setChaosMode } = useSimulationStore();
  if (!project) return <div className="h-14 border-b border-brand-charcoal/10 bg-[#faf9f5]" />;

  return (
    <header className="h-14 border-b border-brand-charcoal/10 bg-[#faf9f5] flex items-center justify-between px-4 shrink-0 z-20 relative">
      <div className="flex items-center gap-4">
        <Link href="/dashboard" className="text-brand-charcoal/40 hover:text-brand-charcoal transition-colors">
          <Icon icon="lucide:arrow-left" className="w-4 h-4" />
        </Link>
        <div className="h-4 w-px bg-brand-charcoal/10" />
        <div className="flex items-center gap-2">
          <Icon icon="lucide:box" className="w-4 h-4 text-brand-orange" />
          <span className="font-poppins font-bold text-sm text-brand-charcoal tracking-tight">{project.name}</span>
        </div>
        <Badge variant="outline" className="rounded-none border-brand-charcoal/20 text-[10px] font-mono uppercase tracking-widest text-brand-charcoal/60 bg-transparent">
          Draft Protocol
        </Badge>
      </div>

      <div className="flex items-center gap-2">
        <div className="hidden md:flex items-center gap-2 mr-4 text-[10px] font-mono text-brand-charcoal/40 uppercase tracking-widest">
          <span>Mem: 42%</span>
          <div className="h-2 w-px bg-brand-charcoal/10" />
          <span>Lat: 12ms</span>
        </div>

        {/* Autolayout Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 rounded-none text-brand-charcoal/60 hover:text-brand-orange hover:bg-brand-orange/5 font-mono text-[10px] uppercase tracking-widest hidden sm:flex"
            >
              <Icon icon="lucide:layout-dashboard" className="w-3.5 h-3.5 mr-2" />
              AUTOLAYOUT
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48 font-mono text-xs bg-white border border-brand-charcoal/20 shadow-xl">
            <DropdownMenuItem onClick={() => onAutolayout('DOWN')} className="cursor-pointer">
              <Icon icon="lucide:arrow-down" className="w-3.5 h-3.5 mr-2" /> Hierarchical
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onAutolayout('RIGHT')} className="cursor-pointer">
              <Icon icon="lucide:arrow-right" className="w-3.5 h-3.5 mr-2" /> Tiered (Tech)
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Share / Export Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="h-8 rounded-none border-brand-charcoal/20 bg-white font-mono text-[10px] uppercase tracking-widest hover:bg-brand-charcoal hover:text-white transition-all hidden sm:flex"
            >
              <Icon icon="lucide:share-2" className="w-3 h-3 mr-2" />
              SHARE
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 font-mono text-xs p-0 bg-white border border-brand-charcoal/20 shadow-xl">
            <div className="px-2 py-1.5 text-[10px] uppercase tracking-widest text-brand-charcoal/40 bg-brand-charcoal/5 border-b border-brand-charcoal/10">
              Export Protocol
            </div>
            <DropdownMenuItem onClick={onExportSkill} className="cursor-pointer px-3 py-2">
              <Icon icon="lucide:file-code" className="w-3.5 h-3.5 mr-2 text-brand-orange" /> .cursorrules
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onExport('mermaid')} className="cursor-pointer px-3 py-2">
              <Icon icon="lucide:download" className="w-3.5 h-3.5 mr-2" /> Mermaid.js
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => {
              navigator.clipboard.writeText(window.location.href);
              // toast.success("Link copied!"); // defined elsewhere or assume toast works
            }} className="cursor-pointer px-3 py-2">
              <Icon icon="lucide:link" className="w-3.5 h-3.5 mr-2" /> Live Context Link
            </DropdownMenuItem>

            <div className="h-px bg-brand-charcoal/10" />

            <div className="px-2 py-1.5 text-[10px] uppercase tracking-widest text-brand-charcoal/40 bg-brand-charcoal/5 border-b border-brand-charcoal/10">
              Visuals
            </div>
            <DropdownMenuItem onClick={() => onExport('png')} className="cursor-pointer px-3 py-2">
              <Icon icon="lucide:image" className="w-3.5 h-3.5 mr-2" /> PNG Image
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onExport('pdf')} className="cursor-pointer px-3 py-2">
              <Icon icon="lucide:file-text" className="w-3.5 h-3.5 mr-2" /> PDF Document
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Button
          size="sm"
          className="h-8 rounded-none bg-brand-charcoal text-white font-mono text-[10px] uppercase tracking-widest hover:bg-brand-orange transition-all"
        >
          <Icon icon="lucide:save" className={cn("w-3 h-3 mr-2", saving && "animate-spin")} />
          {saving ? "Saving..." : "Deploy"}
        </Button>

        <div className="h-4 w-px bg-brand-charcoal/10 mx-2" />

        {/* Chaos Toggle */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setChaosMode(!chaosMode)}
          className={cn(
            "h-8 rounded-none font-mono text-[10px] uppercase tracking-widest transition-all gap-2",
            chaosMode
              ? "bg-red-50 text-red-500 hover:bg-red-100 border border-red-200"
              : "text-brand-charcoal/40 hover:text-brand-charcoal"
          )}
        >
          <Activity className={cn("w-3.5 h-3.5", chaosMode && "animate-pulse")} />
          <span className="hidden lg:inline">{chaosMode ? "CHAOS: ACTIVE" : "SIM: STABLE"}</span>
        </Button>

        <div className="h-4 w-px bg-brand-charcoal/10 mx-2" />

        <button
          onClick={onToggleTerminal}
          className={cn(
            "w-8 h-8 flex items-center justify-center rounded-sm transition-all hover:bg-brand-charcoal/5",
            isTerminalOpen ? "bg-brand-orange/10 text-brand-orange" : "text-brand-charcoal/40 hover:text-brand-charcoal"
          )}
          title="Toggle Terminal"
        >
          <Icon icon="lucide:terminal-square" className="w-4 h-4" />
        </button>
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
          <button key={i} className={cn(
            "w-9 h-9 flex items-center justify-center rounded-sm transition-all hover:bg-brand-charcoal/5 text-brand-charcoal/60 hover:text-brand-charcoal",
            i === 0 && "bg-brand-charcoal/10 text-brand-charcoal"
          )} title={tool.label}>
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
          <button key={i} className="w-9 h-9 flex items-center justify-center rounded-sm transition-all hover:bg-brand-charcoal/5 text-brand-charcoal/60 hover:text-brand-charcoal" title={tool.label}>
            <Icon icon={tool.icon} className="w-4 h-4" />
          </button>
        ))}
      </div>

      <div className="mt-auto flex flex-col gap-2">
        <button className="w-9 h-9 flex items-center justify-center rounded-sm transition-all hover:bg-brand-charcoal/5 text-brand-charcoal/60 hover:text-brand-charcoal" title="Settings">
          <Icon icon="lucide:settings-2" className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}

interface ProjectPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function ProjectPage({ params: paramsPromise }: ProjectPageProps) {
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
      flowEditorRef.current.updateGraph(data);
    }
    // Persist to database
    if (id && data.nodes && data.edges) {
      await saveProject(id, { nodes: data.nodes, edges: data.edges });
    }
  };

  const handleAutolayout = (direction: "DOWN" | "RIGHT") => {
    flowEditorRef.current?.autoLayout(direction);
  };

  const handleExport = (format: 'mermaid' | 'png' | 'pdf' | 'svg') => {
    flowEditorRef.current?.exportGraph(format);
  };

  const handleExportSkill = async () => {
    // ... (existing export skill logic)
    if (!flowEditorRef.current || !project) return;

    try {
      const nodes = flowEditorRef.current.nodes;
      const edges = flowEditorRef.current.edges;

      const response = await fetch('/api/export-skill', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          projectName: project.name,
          projectDescription: (project as any).description || undefined,
          nodes,
          edges,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate skill');
      }

      // Download the ZIP file
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${project.name.toLowerCase().replace(/\s+/g, '-')}-skill.zip`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error exporting skill:', error);
      alert('Failed to export skill. Please try again.');
    }
  };


  if (loading) {
    return (
      <div className="h-screen w-screen bg-[#faf9f5] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Icon icon="lucide:loader-2" className="w-8 h-8 animate-spin text-brand-charcoal/20" />
          <span className="font-mono text-[10px] uppercase tracking-widest text-brand-charcoal/40">Initializing Workstation...</span>
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
              <button className="w-8 h-8 flex items-center justify-center hover:bg-brand-charcoal/5 text-brand-charcoal/60"><Icon icon="lucide:minus" className="w-4 h-4" /></button>
              <span className="font-mono text-[10px] w-12 text-center text-brand-charcoal/60">100%</span>
              <button className="w-8 h-8 flex items-center justify-center hover:bg-brand-charcoal/5 text-brand-charcoal/60"><Icon icon="lucide:plus" className="w-4 h-4" /></button>
            </div>
          </div>

          {/* Terminal Sidebar (Fixed Width, Collapsible) */}
          <div
            className={cn(
              "bg-white border-l border-brand-charcoal/10 flex flex-col transition-all duration-300 ease-in-out absolute right-0 top-0 bottom-0 shadow-xl z-20",
              isTerminalOpen ? "w-[400px] translate-x-0" : "w-[400px] translate-x-full"
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
