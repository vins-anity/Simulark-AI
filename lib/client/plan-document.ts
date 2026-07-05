import {
  buildInitialPromptFromPlan,
  isPlanDocumentFile,
  PLAN_DOCUMENT_MAX_BYTES,
} from "@/lib/plan-document";

export interface UploadPlanDocumentResult {
  document: {
    id: string;
    file_name: string;
    extraction_status: string;
  };
  extraction?: {
    status: string;
    preview?: string;
    pageCount?: number;
    truncated?: boolean;
  };
}

export async function uploadProjectPlanDocument(
  projectId: string,
  file: File,
): Promise<UploadPlanDocumentResult> {
  if (!isPlanDocumentFile(file)) {
    throw new Error("Only PDF and TXT plan files are supported");
  }

  if (file.size <= 0 || file.size > PLAN_DOCUMENT_MAX_BYTES) {
    throw new Error(
      `File must be between 1 byte and ${Math.round(PLAN_DOCUMENT_MAX_BYTES / (1024 * 1024))}MB`,
    );
  }

  const formData = new FormData();
  formData.append("projectId", projectId);
  formData.append("file", file);

  const response = await fetch("/api/project-documents", {
    method: "POST",
    body: formData,
  });

  const payload = await response.json().catch(() => ({ error: "Upload failed" }));

  if (!response.ok) {
    throw new Error(payload.error || "Failed to upload plan document");
  }

  return payload as UploadPlanDocumentResult;
}

export async function readTxtFilePreview(file: File, maxChars = 400): Promise<string> {
  const text = await file.text();
  return text.trim().slice(0, maxChars);
}

export { buildInitialPromptFromPlan, isPlanDocumentFile };
