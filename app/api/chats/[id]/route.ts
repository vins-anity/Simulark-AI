import { type NextRequest, NextResponse } from "next/server";
import * as v from "valibot";
import { createClient } from "@/lib/supabase/server";

const ParamsSchema = v.object({
  id: v.pipe(v.string(), v.uuid()),
});

const UpdateChatSchema = v.object({
  title: v.pipe(v.string(), v.minLength(1), v.maxLength(200)),
});

// GET /api/chats/[id] - Get chat with messages
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const supabase = await createClient();
  const parsedParams = v.safeParse(ParamsSchema, await params);
  if (!parsedParams.success) {
    return NextResponse.json({ error: "Invalid chat id" }, { status: 400 });
  }
  const { id } = parsedParams.output;

  // Get chat
  const { data: chat, error: chatError } = await supabase
    .from("chats")
    .select("*, projects(user_id)")
    .eq("id", id)
    .single();

  if (chatError || !chat) {
    return NextResponse.json({ error: "Chat not found" }, { status: 404 });
  }

  // Verify ownership
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || user.id !== chat.projects.user_id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Get messages
  const { data: messages, error: messagesError } = await supabase
    .from("chat_messages")
    .select("*")
    .eq("chat_id", id)
    .order("created_at", { ascending: true });

  if (messagesError) {
    return NextResponse.json({ error: messagesError.message }, { status: 500 });
  }

  return NextResponse.json({ chat, messages: messages || [] });
}

// PATCH /api/chats/[id] - Update chat (title)
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const supabase = await createClient();
  const parsedParams = v.safeParse(ParamsSchema, await params);
  if (!parsedParams.success) {
    return NextResponse.json({ error: "Invalid chat id" }, { status: 400 });
  }
  const { id } = parsedParams.output;

  const parsedBody = v.safeParse(UpdateChatSchema, await req.json());
  if (!parsedBody.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }
  const { title } = parsedBody.output;

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

  const { data: updatedChat, error } = await supabase
    .from("chats")
    .update({ title })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ chat: updatedChat });
}

// DELETE /api/chats/[id] - Delete chat
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const supabase = await createClient();
  const parsedParams = v.safeParse(ParamsSchema, await params);
  if (!parsedParams.success) {
    return NextResponse.json({ error: "Invalid chat id" }, { status: 400 });
  }
  const { id } = parsedParams.output;

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

  const { error } = await supabase.from("chats").delete().eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
