import { type NextRequest, NextResponse } from "next/server";
import * as v from "valibot";
import { getProject, saveProject } from "@/actions/projects";
import type { ArchitectureGraph } from "@/lib/schema/graph";
import { createClient } from "@/lib/supabase/server";

const ParamsSchema = v.object({
  id: v.pipe(v.string(), v.uuid()),
});

const UpdateProjectPayloadSchema = v.object({
  nodes: v.array(v.unknown()),
  edges: v.array(v.unknown()),
});

/**
 * GET /api/projects/[id]
 * Retrieve a specific project by ID.
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const parsedParams = v.safeParse(ParamsSchema, await params);
    if (!parsedParams.success) {
      return NextResponse.json(
        { error: "Invalid project id" },
        { status: 400 },
      );
    }

    const { id } = parsedParams.output;
    const result = await getProject(id);
    if (result.success) {
      return NextResponse.json(result.data);
    } else {
      const status = result.error === "Unauthorized" ? 401 : 404;
      return NextResponse.json({ error: result.error }, { status });
    }
  } catch (error) {
    console.error("[API Project GET] Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}

/**
 * PATCH /api/projects/[id]
 * Update project nodes and edges (architecture).
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const parsedParams = v.safeParse(ParamsSchema, await params);
    if (!parsedParams.success) {
      return NextResponse.json(
        { error: "Invalid project id" },
        { status: 400 },
      );
    }

    const { id } = parsedParams.output;
    const parsed = v.safeParse(
      UpdateProjectPayloadSchema,
      await request.json(),
    );
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid architecture payload" },
        { status: 400 },
      );
    }
    const { nodes, edges } = parsed.output;

    const result = await saveProject(id, {
      nodes: nodes as ArchitectureGraph["nodes"],
      edges: edges as ArchitectureGraph["edges"],
    });
    if (result.success) {
      return NextResponse.json(result.data);
    } else {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }
  } catch (error) {
    console.error("[API Project PATCH] Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}

/**
 * DELETE /api/projects/[id]
 * Delete a specific project.
 */
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const parsedParams = v.safeParse(ParamsSchema, await params);
    if (!parsedParams.success) {
      return NextResponse.json(
        { error: "Invalid project id" },
        { status: 400 },
      );
    }

    const { id } = parsedParams.output;
    const supabase = await createClient();

    // Check if user is owner via RLS or explicit check
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { error } = await supabase
      .from("projects")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("[API Project DELETE] Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
