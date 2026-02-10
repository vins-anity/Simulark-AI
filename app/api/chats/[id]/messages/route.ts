import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// POST /api/chats/[id]/messages - Add a message to a chat
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const supabase = await createClient();
  const { id } = await params;
  const { role, content, reasoning } = await req.json();

  if (!role || !content) {
    return NextResponse.json(
      { error: "Role and content required" },
      { status: 400 },
    );
  }

  // Verify ownership
  const { data: chat } = await supabase
    .from("chats")
    .select("*, projects(user_id)")
    .eq("id", id)
    .single();

  if (!chat) {
    return NextResponse.json({ error: "Chat not found" }, { status: 404 });
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || user.id !== chat.projects.user_id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Insert message
  const { data: message, error: messageError } = await supabase
    .from("chat_messages")
    .insert({
      chat_id: id,
      role,
      content,
      reasoning: reasoning || "",
    })
    .select()
    .single();

  if (messageError) {
    return NextResponse.json({ error: messageError.message }, { status: 500 });
  }

  // Update chat's updated_at timestamp
  await supabase
    .from("chats")
    .update({ updated_at: new Date().toISOString() })
    .eq("id", id);

  return NextResponse.json({ message });
}

// GET /api/chats/[id]/messages - Get all messages for a chat
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const supabase = await createClient();
  const { id } = await params;

  // Verify ownership
  const { data: chat } = await supabase
    .from("chats")
    .select("*, projects(user_id)")
    .eq("id", id)
    .single();

  if (!chat) {
    return NextResponse.json({ error: "Chat not found" }, { status: 404 });
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || user.id !== chat.projects.user_id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: messages, error } = await supabase
    .from("chat_messages")
    .select("*")
    .eq("chat_id", id)
    .order("created_at", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ messages: messages || [] });
}
