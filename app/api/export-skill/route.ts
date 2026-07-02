import type { Edge, Node } from "@xyflow/react";
import { type NextRequest, NextResponse } from "next/server";
import * as v from "valibot";
import { analyzeArchitectureQuality } from "@/lib/architecture-quality";
import { logger } from "@/lib/logger";
import {
  type ExportSkillRequestInput,
  ExportSkillRequestSchema,
} from "@/lib/schema/api";
import {
  generateSkillContent,
  getSkillDropInPath,
  getSkillInstallHint,
} from "@/lib/skill-generator";
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
      const issues = parsed.issues
        .map((issue) => issue.message)
        .slice(0, 3)
        .join("; ");
      return NextResponse.json(
        { error: "Invalid export payload", details: issues },
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

    const skill = generateSkillContent({
      projectName,
      projectDescription: projectDescription ?? undefined,
      nodes,
      edges,
      quality,
    });

    const skillName = skill.metadata.name;

    return NextResponse.json({
      skill,
      dropInPath: getSkillDropInPath(skillName),
      hint: getSkillInstallHint(skillName),
      fileName: `${skillName}-skill.zip`,
    });
  } catch (error: unknown) {
    logger.error(
      "[Export Skill] Error",
      error instanceof Error ? error : new Error(String(error)),
    );
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to generate skill",
      },
      { status: 500 },
    );
  }
}
