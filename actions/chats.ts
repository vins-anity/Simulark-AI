"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

// Types
export interface Chat {
  id: string;
  project_id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

export interface ChatMessage {
  id: string;
  chat_id: string;
  role: "user" | "assistant";
  content: string;
  reasoning?: string;
  created_at: string;
}

// Get all chats for a project
export async function getProjectChats(
  projectId: string,
): Promise<{ chats: Chat[]; error?: string }> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("chats")
    .select("*")
    .eq("project_id", projectId)
    .order("updated_at", { ascending: false });

  if (error) {
    console.error("Error fetching chats:", error);
    return { chats: [], error: error.message };
  }

  return { chats: data || [] };
}

// Get a single chat with its messages
export async function getChatWithMessages(
  chatId: string,
): Promise<{ chat?: Chat; messages: ChatMessage[]; error?: string }> {
  const supabase = await createClient();

  // Get chat
  const { data: chat, error: chatError } = await supabase
    .from("chats")
    .select("*")
    .eq("id", chatId)
    .single();

  if (chatError) {
    console.error("Error fetching chat:", chatError);
    return { messages: [], error: chatError.message };
  }

  // Get messages
  const { data: messages, error: messagesError } = await supabase
    .from("chat_messages")
    .select("*")
    .eq("chat_id", chatId)
    .order("created_at", { ascending: true });

  if (messagesError) {
    console.error("Error fetching messages:", messagesError);
    return { chat, messages: [], error: messagesError.message };
  }

  return { chat, messages: messages || [] };
}

// Create a new chat
export async function createChat(
  projectId: string,
  title: string = "New Chat",
): Promise<{ chat?: Chat; error?: string }> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("chats")
    .insert({ project_id: projectId, title })
    .select()
    .single();

  if (error) {
    console.error("Error creating chat:", error);
    return { error: error.message };
  }

  revalidatePath(`/projects/${projectId}`);
  return { chat: data };
}

// Update chat title
export async function updateChatTitle(
  chatId: string,
  title: string,
): Promise<{ error?: string }> {
  const supabase = await createClient();

  const { error } = await supabase
    .from("chats")
    .update({ title })
    .eq("id", chatId);

  if (error) {
    console.error("Error updating chat:", error);
    return { error: error.message };
  }

  return {};
}

// Delete a chat
export async function deleteChat(
  chatId: string,
  projectId: string,
): Promise<{ error?: string }> {
  const supabase = await createClient();

  const { error } = await supabase.from("chats").delete().eq("id", chatId);

  if (error) {
    console.error("Error deleting chat:", error);
    return { error: error.message };
  }

  revalidatePath(`/projects/${projectId}`);
  return {};
}

// Add a message to a chat
export async function addMessage(
  chatId: string,
  role: "user" | "assistant",
  content: string,
  reasoning?: string,
): Promise<{ message?: ChatMessage; error?: string }> {
  const supabase = await createClient();

  // Insert message
  const { data: message, error: messageError } = await supabase
    .from("chat_messages")
    .insert({ chat_id: chatId, role, content, reasoning: reasoning || "" })
    .select()
    .single();

  if (messageError) {
    console.error("Error adding message:", messageError);
    return { error: messageError.message };
  }

  // Update chat's updated_at timestamp
  await supabase
    .from("chats")
    .update({ updated_at: new Date().toISOString() })
    .eq("id", chatId);

  return { message };
}

// Add multiple messages at once (for batch saving)
export async function addMessages(
  chatId: string,
  messages: {
    role: "user" | "assistant";
    content: string;
    reasoning?: string;
  }[],
): Promise<{ error?: string }> {
  const supabase = await createClient();

  const messagesToInsert = messages.map((m) => ({
    chat_id: chatId,
    role: m.role,
    content: m.content,
    reasoning: m.reasoning || "",
  }));

  const { error } = await supabase
    .from("chat_messages")
    .insert(messagesToInsert);

  if (error) {
    console.error("Error adding messages:", error);
    return { error: error.message };
  }

  // Update chat's updated_at timestamp
  await supabase
    .from("chats")
    .update({ updated_at: new Date().toISOString() })
    .eq("id", chatId);

  return {};
}

// Get or create default chat for a project
export async function getOrCreateDefaultChat(
  projectId: string,
): Promise<{ success: true; chat: Chat } | { success: false; error: string }> {
  const supabase = await createClient();

  // Try to get the most recent chat
  const { data: existingChats, error: fetchError } = await supabase
    .from("chats")
    .select("*")
    .eq("project_id", projectId)
    .order("updated_at", { ascending: false })
    .limit(1);

  if (fetchError) {
    console.error("Error fetching default chat:", fetchError);
    return { success: false, error: fetchError.message };
  }

  // If a chat exists, return it
  if (existingChats && existingChats.length > 0) {
    return { success: true, chat: existingChats[0] };
  }

  // Otherwise, create a new default chat
  const { data: newChat, error: createError } = await supabase
    .from("chats")
    .insert({ project_id: projectId, title: "Chat 1" })
    .select()
    .single();

  if (createError) {
    console.error("Error creating default chat:", createError);
    return { success: false, error: createError.message };
  }

  if (!newChat) {
    return { success: false, error: "Failed to create chat" };
  }

  return { success: true, chat: newChat };
}
