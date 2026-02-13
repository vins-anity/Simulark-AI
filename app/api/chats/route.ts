import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// GET /api/chats?projectId=xxx - Get all chats for a project
export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const projectId = req.nextUrl.searchParams.get("projectId");

  if (!projectId) {
    return NextResponse.json({ error: "Project ID required" }, { status: 400 });
  }

  // Verify user owns this project
  const { data: project, error: projectError } = await supabase
    .from("projects")
    .select("user_id")
    .eq("id", projectId)
    .single();

  if (projectError || !project) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || user.id !== project.user_id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: chats, error } = await supabase
    .from("chats")
    .select("*")
    .eq("project_id", projectId)
    .order("updated_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ chats: chats || [] });
}

// POST /api/chats - Create a new chat
export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { projectId, title = "New Chat" } = await req.json();

  if (!projectId) {
    return NextResponse.json({ error: "Project ID required" }, { status: 400 });
  }

  // Verify user owns this project
  const { data: project, error: projectError } = await supabase
    .from("projects")
    .select("user_id")
    .eq("id", projectId)
    .single();

  if (projectError || !project) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || user.id !== project.user_id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: chat, error } = await supabase
    .from("chats")
    .insert({ project_id: projectId, title })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ chat });
}
