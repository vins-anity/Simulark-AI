import { type NextRequest, NextResponse } from "next/server";
import * as v from "valibot";
import { CreateChatSchema } from "@/lib/schema/api";
import { createClient } from "@/lib/supabase/server";

const ChatsQuerySchema = v.object({
  projectId: v.pipe(v.string(), v.uuid()),
});

// GET /api/chats?projectId=xxx - Get all chats for a project
export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const parsedQuery = v.safeParse(ChatsQuerySchema, {
    projectId: req.nextUrl.searchParams.get("projectId"),
  });

  if (!parsedQuery.success) {
    return NextResponse.json({ error: "Project ID required" }, { status: 400 });
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { projectId } = parsedQuery.output;

  const { data: chats, error } = await supabase
    .from("chats")
    .select(
      "id, project_id, title, created_at, updated_at, projects!inner(user_id)",
    )
    .eq("project_id", projectId)
    .eq("projects.user_id", user.id)
    .order("updated_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    chats: (chats || []).map((chat) => ({
      id: chat.id,
      project_id: chat.project_id,
      title: chat.title,
      created_at: chat.created_at,
      updated_at: chat.updated_at,
    })),
  });
}

// POST /api/chats - Create a new chat
export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const parsedBody = v.safeParse(CreateChatSchema, await req.json());
  if (!parsedBody.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { projectId, title = "New Chat" } = parsedBody.output;

  const { data: project, error: projectError } = await supabase
    .from("projects")
    .select("id")
    .eq("id", projectId)
    .eq("user_id", user.id)
    .single();

  if (projectError || !project) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
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
