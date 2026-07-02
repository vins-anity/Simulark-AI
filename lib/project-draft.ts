"use client";

const DRAFT_PREFIX = "simulark:draft:";

export interface ProjectDraft {
  projectId: string;
  nodes: unknown[];
  edges: unknown[];
  savedAt: number;
}

function draftKey(projectId: string): string {
  return `${DRAFT_PREFIX}${projectId}`;
}

export function readProjectDraft(projectId: string): ProjectDraft | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const raw = localStorage.getItem(draftKey(projectId));
    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw) as ProjectDraft;
    if (
      parsed?.projectId !== projectId ||
      !Array.isArray(parsed.nodes) ||
      !Array.isArray(parsed.edges)
    ) {
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
}

export function writeProjectDraft(
  projectId: string,
  nodes: unknown[],
  edges: unknown[],
): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    const draft: ProjectDraft = {
      projectId,
      nodes,
      edges,
      savedAt: Date.now(),
    };
    localStorage.setItem(draftKey(projectId), JSON.stringify(draft));
  } catch {
    // localStorage may be full or disabled — ignore
  }
}

export function clearProjectDraft(projectId: string): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    localStorage.removeItem(draftKey(projectId));
  } catch {
    // ignore
  }
}
