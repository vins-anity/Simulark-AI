import { randomUUID } from "node:crypto";
import { type NextRequest, NextResponse } from "next/server";
import * as v from "valibot";
import { extractTextFromPdfBuffer } from "@/lib/pdf-extractor";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

const MAX_FILE_BYTES = 10 * 1024 * 1024;
const DOCUMENT_BUCKET = "project-documents";

const ProjectDocumentQuerySchema = v.object({
  projectId: v.pipe(v.string(), v.uuid()),
});

function sanitizeFileName(fileName: string): string {
  return fileName
    .trim()
    .replace(/[^\w.-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^[-.]+|[-.]+$/g, "")
    .slice(0, 120);
}

async function ensureProjectOwnership(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  projectId: string,
): Promise<boolean> {
  const { data, error } = await supabase
    .from("projects")
    .select("id")
    .eq("id", projectId)
    .eq("user_id", userId)
    .single();
  return !error && Boolean(data?.id);
}

export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const projectId = req.nextUrl.searchParams.get("projectId");
  const parsed = v.safeParse(ProjectDocumentQuerySchema, { projectId });
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid projectId query" },
      { status: 400 },
    );
  }

  const owned = await ensureProjectOwnership(
    supabase,
    user.id,
    parsed.output.projectId,
  );
  if (!owned) {
    return NextResponse.json(
      { error: "Project not found or access denied" },
      { status: 404 },
    );
  }

  const { data, error } = await supabase
    .from("project_documents")
    .select(
      "id, project_id, file_name, mime_type, size_bytes, extraction_status, extraction_error, created_at",
    )
    .eq("project_id", parsed.output.projectId)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Supabase error loading documents:", error);
    return NextResponse.json(
      { error: error.message || "Failed to load documents" },
      { status: 500 },
    );
  }

  return NextResponse.json({ documents: data || [] });
}

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await req.formData();
  const projectId = formData.get("projectId");
  const file = formData.get("file");

  const parsed = v.safeParse(ProjectDocumentQuerySchema, { projectId });
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid projectId" }, { status: 400 });
  }

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "File is required" }, { status: 400 });
  }

  const isPdf =
    file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
  if (!isPdf) {
    return NextResponse.json(
      { error: "Only PDF files are supported" },
      { status: 400 },
    );
  }

  if (file.size <= 0 || file.size > MAX_FILE_BYTES) {
    return NextResponse.json(
      {
        error: `PDF must be between 1 byte and ${Math.round(MAX_FILE_BYTES / (1024 * 1024))}MB`,
      },
      { status: 400 },
    );
  }

  const owned = await ensureProjectOwnership(
    supabase,
    user.id,
    parsed.output.projectId,
  );
  if (!owned) {
    return NextResponse.json(
      { error: "Project not found or access denied" },
      { status: 404 },
    );
  }

  const cleanName = sanitizeFileName(file.name || "document.pdf");
  const path = `${user.id}/${parsed.output.projectId}/${Date.now()}-${randomUUID()}-${cleanName}`;

  const uploadResult = await supabase.storage
    .from(DOCUMENT_BUCKET)
    .upload(path, file, {
      contentType: "application/pdf",
      upsert: false,
    });

  if (uploadResult.error) {
    return NextResponse.json(
      {
        error:
          uploadResult.error.message ||
          "Failed to upload PDF to storage bucket",
      },
      { status: 500 },
    );
  }

  let extractedText = "";
  let extractionStatus: "completed" | "failed" = "completed";
  let extractionError: string | null = null;
  let pageCount = 0;
  let truncated = false;

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const extraction = await extractTextFromPdfBuffer(buffer);
    extractedText = extraction.text;
    pageCount = extraction.pageCount;
    truncated = extraction.truncated;
  } catch (error: any) {
    extractionStatus = "failed";
    extractionError =
      error?.message || "Failed to extract readable text from PDF";
  }

  const { data, error } = await supabase
    .from("project_documents")
    .insert({
      project_id: parsed.output.projectId,
      user_id: user.id,
      file_name: cleanName,
      mime_type: "application/pdf",
      size_bytes: file.size,
      storage_path: path,
      extracted_text: extractedText,
      extraction_status: extractionStatus,
      extraction_error: extractionError,
    })
    .select(
      "id, project_id, file_name, mime_type, size_bytes, extraction_status, extraction_error, created_at",
    )
    .single();

  if (error) {
    await supabase.storage.from(DOCUMENT_BUCKET).remove([path]);
    return NextResponse.json(
      { error: error.message || "Failed to save document metadata" },
      { status: 500 },
    );
  }

  return NextResponse.json({
    document: data,
    extraction: {
      status: extractionStatus,
      pageCount,
      truncated,
      preview: extractedText.slice(0, 500),
    },
  });
}

export async function DELETE(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const id = req.nextUrl.searchParams.get("id");
  if (!id) {
    return NextResponse.json(
      { error: "Document id is required" },
      { status: 400 },
    );
  }

  const { data: document, error: fetchError } = await supabase
    .from("project_documents")
    .select("id, storage_path")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (fetchError || !document) {
    return NextResponse.json({ error: "Document not found" }, { status: 404 });
  }

  await supabase.storage.from(DOCUMENT_BUCKET).remove([document.storage_path]);
  const { error } = await supabase
    .from("project_documents")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    return NextResponse.json(
      { error: error.message || "Failed to delete document" },
      { status: 500 },
    );
  }

  return NextResponse.json({ success: true });
}
