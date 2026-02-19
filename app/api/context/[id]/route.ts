import { type NextRequest, NextResponse } from "next/server";
import { generateContext } from "@/lib/bridge/context-engine";
import type { ArchitectureGraph } from "@/lib/schema/graph"; // Use valid schema
import { createClient } from "@/lib/supabase/server";

// Mock data for now, in real app we fetch from DB
const _mockGraph: ArchitectureGraph = {
  nodes: [],
  edges: [],
};

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }, // In Next.js 15, params is a Promise
) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: project, error } = await supabase
    .from("projects")
    .select("nodes, edges, user_id")
    .eq("id", id)
    .single();

  if (error || !project) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }
  if (project.user_id !== user.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const graph: ArchitectureGraph = {
    nodes: Array.isArray(project.nodes) ? project.nodes : [],
    edges: Array.isArray(project.edges) ? project.edges : [],
  };

  return NextResponse.json({
    id,
    context: generateContext(graph, "json"),
    timestamp: new Date().toISOString(),
  });
}
