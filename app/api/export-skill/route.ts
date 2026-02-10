import { NextRequest, NextResponse } from "next/server";
import { generateSkillContent, packageSkill } from "@/lib/skill-generator";

export async function POST(req: NextRequest) {
  try {
    const { projectName, projectDescription, nodes, edges } = await req.json();

    if (!projectName || !nodes || !edges) {
      return NextResponse.json(
        { error: "Missing required fields: projectName, nodes, edges" },
        { status: 400 },
      );
    }

    console.log(`[Export Skill] Generating skill for: ${projectName}`);

    // Generate skill content
    const skill = generateSkillContent({
      projectName,
      projectDescription,
      nodes,
      edges,
    });

    // Package into ZIP
    const zipBlob = await packageSkill(skill);

    // Convert blob to buffer for response
    const buffer = Buffer.from(await zipBlob.arrayBuffer());

    // Return ZIP file
    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="${skill.metadata.name}-skill.zip"`,
      },
    });
  } catch (error: any) {
    console.error("[Export Skill] Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to generate skill" },
      { status: 500 },
    );
  }
}
