import type { ArchitectureGraph } from "@/lib/schema/graph";

export interface SaveProjectGraphInput {
  nodes?: ArchitectureGraph["nodes"];
  edges?: ArchitectureGraph["edges"];
  metadata?: Record<string, unknown>;
}

export interface SaveProjectGraphResult {
  success: boolean;
  error?: string;
  data?: unknown;
}

/**
 * Persist project graph changes via REST instead of Server Actions.
 * Avoids UnrecognizedActionError when the client bundle is stale after deploy.
 */
export async function saveProjectGraph(
  projectId: string,
  input: SaveProjectGraphInput,
): Promise<SaveProjectGraphResult> {
  const response = await fetch(`/api/projects/${projectId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
    credentials: "same-origin",
  });

  const payload = (await response.json().catch(() => ({}))) as {
    error?: string;
  };

  if (!response.ok) {
    return {
      success: false,
      error: payload.error || `Save failed (${response.status})`,
    };
  }

  return { success: true, data: payload };
}
