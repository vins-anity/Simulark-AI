"use client";

import { getProject } from "@/actions/projects";
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
      <div className="flex flex-col h-[calc(100vh-64px)] overflow-hidden -m-8 lg:-m-12">
        {/* Project Header - overlay or integrated? Keeping it simple for now */}
        {/* <div className="absolute top-4 left-4 z-10 p-4 pointer-events-none">
          <h1 className="text-xl font-poppins font-bold tracking-tight text-foreground bg-white/50 backdrop-blur-md px-4 py-2 rounded-xl inline-block pointer-events-auto shadow-sm">
            {project.name}
          </h1>
        </div> */}

        <ResizablePanelGroup direction="horizontal" className="h-full w-full">
          {/* AI Assistant Panel (Left) */}
          <ResizablePanel defaultSize={25} minSize={20} maxSize={40} className="bg-white/50 backdrop-blur-sm border-r border-white/20">
            <AIAssistantPanel
              projectId={id}
              onGenerationSuccess={handleGenerationSuccess}
              isResizable={true} // Prop to disable internal layout logic
            />
          </ResizablePanel>

          <ResizableHandle withHandle />

          {/* Editor Area (Right) */}
          <ResizablePanel defaultSize={75}>
            <div className="h-full w-full relative bg-[#faf9f5]">
              <FlowEditor
                ref={flowEditorRef}
                initialNodes={project.nodes}
                initialEdges={project.edges}
                projectId={id}
              />
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </DashboardLayout>
  );
}
