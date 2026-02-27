import { randomUUID } from "node:crypto";
import { type NextRequest, NextResponse } from "next/server";
import * as v from "valibot";
import { analyzeArchitectureQuality } from "@/lib/architecture-quality";
import { createLogger } from "@/lib/logger";
import { generateMermaidCode } from "@/lib/mermaid-export";
import { createClient } from "@/lib/supabase/server";

const logger = createLogger("api:export-mermaid");

const ExportMermaidRequestSchema = v.object({
  nodes: v.pipe(v.array(v.any()), v.minLength(1), v.maxLength(1000)),
  edges: v.pipe(v.array(v.any()), v.maxLength(5000)),
  mode: v.optional(
    v.union([
      v.literal("default"),
      v.literal("startup"),
      v.literal("enterprise"),
    ]),
  ),
});

export async function POST(req: NextRequest) {
  const requestId = randomUUID();
  const timer = logger.time("export-mermaid");

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      logger.warn("Unauthorized access attempt", { requestId });
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const parsedBody = v.safeParse(ExportMermaidRequestSchema, body);
    if (!parsedBody.success) {
      return NextResponse.json(
        { error: "Invalid Mermaid export payload" },
        { status: 400 },
      );
    }

    const { nodes, edges, mode } = parsedBody.output;
    const quality = analyzeArchitectureQuality(nodes, edges, mode);
    if (quality.isExportBlocked) {
      return NextResponse.json(
        {
          error: "Export blocked by architecture quality gate",
          quality,
        },
        { status: 422 },
      );
    }

    const mermaidCode = generateMermaidCode(nodes, edges);

    timer.end({ success: true, contentLength: mermaidCode.length });
    return NextResponse.json({
      mermaid: mermaidCode.trim(),
      quality,
    });
  } catch (error: any) {
    timer.end({ success: false });
    logger.error("Failed to export mermaid", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 },
    );
  }
}
