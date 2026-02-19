import { type NextRequest, NextResponse } from "next/server";

// In a real app, we'd fetch the latest project state from DB or pass it in body.
// For live context from external tools, they might query by Project ID.
// However, since state is client-side in Editor mostly until saved,
// this endpoint might be for fetching SAVED context.

import { generateLiveContext } from "@/lib/bridge/context-generator";
import { createClient } from "@/lib/supabase/server";

export async function GET(req: NextRequest) {
  const projectId = req.nextUrl.searchParams.get("projectId");

  if (!projectId) {
    return NextResponse.json({ error: "Project ID required" }, { status: 400 });
  }

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
    .eq("id", projectId)
    .single();

  if (error || !project) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }
  if (project.user_id !== user.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Parse JSON columns
  const nodes =
    typeof project.nodes === "string"
      ? JSON.parse(project.nodes)
      : project.nodes;
  const edges =
    typeof project.edges === "string"
      ? JSON.parse(project.edges)
      : project.edges;

  const context = generateLiveContext(nodes || [], edges || []);

  return NextResponse.json(context);
}
