import { type NextRequest, NextResponse } from "next/server";
import * as v from "valibot";
import { createClient } from "@/lib/supabase/server";

const ParamsSchema = v.object({
  id: v.pipe(v.string(), v.uuid()),
});

const CreateMessageSchema = v.object({
  role: v.union([v.literal("user"), v.literal("assistant")]),
  content: v.pipe(v.string(), v.minLength(1), v.maxLength(20000)),
  reasoning: v.optional(v.string()),
});

// POST /api/chats/[id]/messages - Add a message to a chat
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const supabase = await createClient();
  const parsedParams = v.safeParse(ParamsSchema, await params);
  if (!parsedParams.success) {
    return NextResponse.json({ error: "Invalid chat id" }, { status: 400 });
  }
  const { id } = parsedParams.output;

  const parsedBody = v.safeParse(CreateMessageSchema, await req.json());
  if (!parsedBody.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }
  const { role, content, reasoning } = parsedBody.output;

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
