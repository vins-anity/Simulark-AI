"use client";

import { getProject } from "@/actions/projects";
import { FlowEditor, type FlowEditorRef } from "@/components/canvas/FlowEditor";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { AIAssistantPanel } from "@/components/canvas/AIAssistantPanel";
import { notFound } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { type Project } from "@/lib/schema/graph";

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

  useEffect(() => {
    async function init() {
      const { id: projectId } = await paramsPromise;
      setId(projectId);
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

  const handleGenerationSuccess = (data: any) => {
    if (flowEditorRef.current) {
      flowEditorRef.current.updateGraph(data);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-full">
          <div className="animate-pulse flex flex-col items-center gap-4">
            <div className="w-12 h-12 bg-brand-gray-light rounded-full" />
            <div className="h-4 w-32 bg-brand-gray-light rounded" />
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!project || !id) {
    return notFound();
  }

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6 h-[calc(100vh-100px)] overflow-hidden">
        {/* Project Header */}
        <div className="flex flex-col gap-1 px-2">
          <h1 className="text-3xl font-poppins font-bold tracking-tight text-foreground">
            {project.name}
          </h1>
          <p className="text-sm font-lora italic text-brand-gray-mid">
            Drafting in {project.provider || "Generic"} environment
          </p>
        </div>

        {/* Main Work Area */}
        <div className="flex-1 flex gap-6 overflow-hidden">
          {/* AI Assistant Panel */}
          <AIAssistantPanel
            projectId={id}
            onGenerationSuccess={handleGenerationSuccess}
          />

          {/* Editor Area */}
          <div className="flex-1 rounded-[2.5rem] overflow-hidden glass-card shadow-2xl shadow-black/5 border-white/40 relative">
            <FlowEditor
              ref={flowEditorRef}
              initialNodes={project.nodes}
              initialEdges={project.edges}
              projectId={id}
            />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
