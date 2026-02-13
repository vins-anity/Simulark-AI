"use server";

import { revalidatePath } from "next/cache";
import type { ArchitectureGraph, Project } from "@/lib/schema/graph";
import { createClient } from "@/lib/supabase/server";
import { TEMPLATE_GRAPHS } from "@/lib/templates";

// --- Create Project ---
export async function createProject(
  name: string,
  provider: string = "Generic",
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Unauthorized" };
  }

  const { data, error } = await supabase
    .from("projects")
    .insert({
      user_id: user.id,
      name,
      provider,
      nodes: [],
      edges: [],
    })
    .select()
    .single();

  if (error) {
    console.error("Create Project Error:", error);
    return { success: false, error: error.message };
  }

  revalidatePath("/dashboard");
  return { success: true, data };
}

// --- Update Project Name ---
export async function updateProjectName(projectId: string, name: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Unauthorized" };
  }

  const { data, error } = await supabase
    .from("projects")
    .update({
      name,
      updated_at: new Date().toISOString(),
    })
    .eq("id", projectId)
    .select()
    .single();

  if (error) {
    console.error("Update Project Name Error:", error);
    return { success: false, error: error.message };
  }

  revalidatePath(`/projects/${projectId}`);
  revalidatePath("/dashboard");
  return { success: true, data };
}

// --- Save Project (with Versioning) ---
export async function saveProject(
  projectId: string,
  graph: Partial<ArchitectureGraph> & { metadata?: Record<string, unknown> },
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Unauthorized" };
  }

  // 1. Get current project
  const { data: currentProject, error: fetchError } = await supabase
    .from("projects")
    .select("*")
    .eq("id", projectId)
    .single();

  if (fetchError || !currentProject) {
    return { success: false, error: "Project not found" };
  }

  // 2. Create version snapshot of OLD state
  const { error: versionError } = await supabase
    .from("project_versions")
    .insert({
      project_id: projectId,
      version: currentProject.version,
      nodes: currentProject.nodes,
      edges: currentProject.edges,
      // Note: We might want to save metadata in versions too, but keeping it simple for now
    });

  if (versionError) {
    console.error("Version Snapshot Error:", versionError);
    // Proceeding anyway to save latest state, but logging error
  }

  // 3. Update Project with NEW state and increment version
  interface UpdateProjectData {
    version: number;
    updated_at: string;
    nodes?: unknown;
    edges?: unknown;
    metadata?: Record<string, unknown>;
  }

  const updateData: UpdateProjectData = {
    version: currentProject.version + 1,
    updated_at: new Date().toISOString(),
  };

  if (graph.nodes) updateData.nodes = graph.nodes;
  if (graph.edges) updateData.edges = graph.edges;
  if (graph.metadata) {
    // Merge existing metadata with new metadata
    updateData.metadata = { ...currentProject.metadata, ...graph.metadata };
  }

  const { data, error } = await supabase
    .from("projects")
    .update(updateData)
    .eq("id", projectId)
    .select()
    .single();

  if (error) {
    console.error("Save Project Error:", error);
    return { success: false, error: error.message };
  }

  revalidatePath(`/project/${projectId}`);
  return { success: true, data };
}

// --- Get Project ---
export async function getProject(projectId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .eq("id", projectId)
    .single();

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true, data: data as Project };
}

// --- Get User Projects ---
export async function getUserProjects(page = 1, limit = 9) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Unauthorized" };
  }

  // Get total count (approximation is fine for performance)
  const { count, error: countError } = await supabase
    .from("projects")
    .select("*", { count: "exact", head: true });

  if (countError) {
    return { success: false, error: countError.message };
  }

  const from = (page - 1) * limit;
  const to = from + limit - 1;

  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .order("updated_at", { ascending: false })
    .range(from, to);

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true, data: data as Project[], total: count || 0 };
}

// --- Create Project from Template ---
export async function createProjectFromTemplate(
  templateId: string,
  name: string,
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Unauthorized" };
  }

  const template = TEMPLATE_GRAPHS[templateId];
  if (!template) {
    return { success: false, error: "Template not found" };
  }

  const { data, error } = await supabase
    .from("projects")
    .insert({
      user_id: user.id,
      name,
      provider: "Generic", // or derive from template
      nodes: template.nodes,
      edges: template.edges,
    })
    .select()
    .single();

  if (error) {
    console.error("Create Template Project Error:", error);
    return { success: false, error: error.message };
  }

  revalidatePath("/dashboard");
  return { success: true, data };
}
