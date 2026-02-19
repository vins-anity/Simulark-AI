import { type NextRequest, NextResponse } from "next/server";
import * as v from "valibot";
import { createProject, getUserProjects } from "@/actions/projects";
import { CreateProjectSchema } from "@/lib/schema/api";

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
    const parsed = v.safeParse(CreateProjectSchema, body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid project payload" },
        { status: 400 },
      );
    }
    const { name, provider } = parsed.output;

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
