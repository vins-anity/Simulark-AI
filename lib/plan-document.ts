const MAX_EXTRACTED_CHARACTERS = 120000;

export const PLAN_DOCUMENT_ACCEPT =
  ".pdf,.txt,text/plain,application/pdf";

export const PLAN_DOCUMENT_MAX_BYTES = 10 * 1024 * 1024;

export function isPlanDocumentFile(file: File): boolean {
  const name = file.name.toLowerCase();
  return (
    file.type === "application/pdf" ||
    file.type === "text/plain" ||
    name.endsWith(".pdf") ||
    name.endsWith(".txt")
  );
}

export function planDocumentKind(
  file: File,
): "pdf" | "txt" | null {
  if (!isPlanDocumentFile(file)) return null;
  const name = file.name.toLowerCase();
  if (file.type === "text/plain" || name.endsWith(".txt")) {
    return "txt";
  }
  return "pdf";
}

function normalizeExtractedText(text: string): string {
  return text
    .replace(/\r\n/g, "\n")
    .replaceAll("\0", "")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export function truncatePlanText(text: string): {
  text: string;
  truncated: boolean;
} {
  const normalized = normalizeExtractedText(text);
  const truncated = normalized.length > MAX_EXTRACTED_CHARACTERS;
  return {
    text: truncated
      ? `${normalized.slice(0, MAX_EXTRACTED_CHARACTERS)}\n\n[TRUNCATED]`
      : normalized,
    truncated,
  };
}

export async function extractTextFromTxtBuffer(buffer: Buffer): Promise<{
  text: string;
  pageCount: number;
  truncated: boolean;
}> {
  const { text, truncated } = truncatePlanText(buffer.toString("utf-8"));
  return { text, pageCount: 0, truncated };
}

export async function extractTextFromPdfBuffer(buffer: Buffer): Promise<{
  text: string;
  pageCount: number;
  truncated: boolean;
}> {
  const module = await import("pdf-parse");
  const parsePdf = (module as unknown as { default?: any }).default || module;
  const parsed = await parsePdf(buffer);

  const { text, truncated } = truncatePlanText(parsed?.text || "");

  return {
    text,
    pageCount: Number(parsed?.numpages || 0),
    truncated,
  };
}

export async function extractPlanDocumentBuffer(
  buffer: Buffer,
  file: Pick<File, "name" | "type">,
): Promise<{
  text: string;
  pageCount: number;
  truncated: boolean;
  mimeType: string;
}> {
  const kind = planDocumentKind(file as File);
  if (kind === "txt") {
    const result = await extractTextFromTxtBuffer(buffer);
    return { ...result, mimeType: "text/plain" };
  }
  if (kind === "pdf") {
    const result = await extractTextFromPdfBuffer(buffer);
    return { ...result, mimeType: "application/pdf" };
  }
  throw new Error("Unsupported file type");
}

/** User-facing initial chat prompt when a plan file is attached. */
export function buildInitialPromptFromPlan(params: {
  userPrompt?: string;
  fileName: string;
  excerpt?: string;
}): string {
  const typed = params.userPrompt?.trim();
  if (typed) {
    return `${typed}\n\n(Uploaded plan: ${params.fileName})`;
  }

  const excerpt = params.excerpt?.trim().slice(0, 400);
  if (excerpt) {
    return `Design the system architecture from my uploaded plan (${params.fileName}).\n\nPlan excerpt:\n${excerpt}${params.excerpt && params.excerpt.length > 400 ? "…" : ""}`;
  }

  return `Design the system architecture described in my uploaded plan: ${params.fileName}. Use the full document context for requirements and constraints.`;
}

export function projectNameFromPlan(fileName: string, userPrompt?: string): string {
  const typed = userPrompt?.trim();
  if (typed) {
    return typed.length > 50 ? `${typed.slice(0, 50)}...` : typed;
  }
  const base = fileName.replace(/\.(pdf|txt)$/i, "").trim();
  return base.length > 50 ? `${base.slice(0, 50)}...` : base || "Uploaded Plan";
}
