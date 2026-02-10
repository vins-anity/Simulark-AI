import { NextRequest, NextResponse } from "next/server";
import { getUserProjects, createProject } from "@/actions/projects";

/**
 * GET /api/projects
 * List all projects for the authenticated user.
 */
export async function GET() {
  try {
    const result = await getUserProjects();
    if (result.success) {
      return NextResponse.json(result.data);
    } else {
      return NextResponse.json({ error: result.error }, { status: 401 });
    }
  } catch (error) {
    console.error("[API Projects GET] Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}

/**
 * POST /api/projects
 * Create a new project.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, provider } = body;

    if (!name) {
      return NextResponse.json(
        { error: "Project name is required" },
        { status: 400 },
      );
    }

    const result = await createProject(name, provider);
    if (result.success) {
      return NextResponse.json(result.data, { status: 201 });
    } else {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }
  } catch (error) {
    console.error("[API Projects POST] Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
