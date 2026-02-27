import type { Edge, Node } from "@xyflow/react";
import { type NextRequest, NextResponse } from "next/server";
import * as v from "valibot";
import { analyzeArchitectureQuality } from "@/lib/architecture-quality";
import { logger } from "@/lib/logger";
import {
  type ExportSkillRequestInput,
  ExportSkillRequestSchema,
} from "@/lib/schema/api";
import { generateSkillContent, packageSkill } from "@/lib/skill-generator";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = v.safeParse(ExportSkillRequestSchema, body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid export payload" },
        { status: 400 },
      );
    }
    const { projectName, projectDescription, nodes, edges } =
      parsed.output as ExportSkillRequestInput & {
        nodes: Node[];
        edges: Edge[];
      };

    logger.info("Generating skill export", {
      projectName,
      nodeCount: nodes.length,
      edgeCount: edges.length,
      userId: user.id,
    });

    const quality = analyzeArchitectureQuality(nodes, edges);
    if (quality.isExportBlocked) {
      return NextResponse.json(
        {
          error: "Skill export blocked by architecture quality gate",
          quality,
        },
        { status: 422 },
      );
    }

    // Generate skill content
    const skill = generateSkillContent({
      projectName,
      projectDescription,
      nodes,
      edges,
      quality,
    });

    // Package into ZIP
    const zipBlob = await packageSkill(skill);

    // Convert blob to buffer for response
    const buffer = Buffer.from(await zipBlob.arrayBuffer());

    const safeFileName =
      skill.metadata.name.replace(/[^a-z0-9-]/gi, "-").toLowerCase() ||
      "architecture-skill";

    // Return ZIP file
    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="${safeFileName}-skill.zip"`,
        "X-Simulark-Skill-Version": skill.metadata.version,
        "X-Simulark-Quality-Score": quality.score.toString(),
      },
    });
  } catch (error: any) {
    logger.error("[Export Skill] Error", error);
    return NextResponse.json(
      { error: error.message || "Failed to generate skill" },
      { status: 500 },
    );
  }
}
