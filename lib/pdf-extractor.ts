const MAX_EXTRACTED_CHARACTERS = 120000;

function normalizeExtractedText(text: string): string {
  return text
    .replace(/\r\n/g, "\n")
    .replaceAll("\0", "")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export async function extractTextFromPdfBuffer(buffer: Buffer): Promise<{
  text: string;
  pageCount: number;
  truncated: boolean;
}> {
  const module = await import("pdf-parse");
  const parsePdf = (module as unknown as { default?: any }).default || module;
  const parsed = await parsePdf(buffer);

  const normalized = normalizeExtractedText(parsed?.text || "");
  const truncated = normalized.length > MAX_EXTRACTED_CHARACTERS;
  const text = truncated
    ? `${normalized.slice(0, MAX_EXTRACTED_CHARACTERS)}\n\n[TRUNCATED]`
    : normalized;

  return {
    text,
    pageCount: Number(parsed?.numpages || 0),
    truncated,
  };
}
