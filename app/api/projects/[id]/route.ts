import { NextRequest, NextResponse } from "next/server";
import { getProject, saveProject } from "@/actions/projects";
import { createClient } from "@/lib/supabase/server";

/**
 * GET /api/projects/[id]
 * Retrieve a specific project by ID.
 */
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const result = await getProject(id);
        if (result.success) {
            return NextResponse.json(result.data);
        } else {
            return NextResponse.json({ error: result.error }, { status: 404 });
        }
    } catch (error) {
        console.error("[API Project GET] Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

/**
 * PATCH /api/projects/[id]
 * Update project nodes and edges (architecture).
 */
export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const { nodes, edges } = await request.json();

        if (!nodes || !edges) {
            return NextResponse.json({ error: "Nodes and edges are required" }, { status: 400 });
        }

        const result = await saveProject(id, { nodes, edges });
        if (result.success) {
            return NextResponse.json(result.data);
        } else {
            return NextResponse.json({ error: result.error }, { status: 400 });
        }
    } catch (error) {
        console.error("[API Project PATCH] Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

/**
 * DELETE /api/projects/[id]
 * Delete a specific project.
 */
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const supabase = await createClient();

        // Check if user is owner via RLS or explicit check
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

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
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
