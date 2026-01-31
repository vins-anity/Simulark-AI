import { type NextRequest, NextResponse } from "next/server";
import { generateContext } from "@/lib/bridge/context-engine";
import {
  type ArchitectureGraph,
  ArchitectureGraphSchema,
} from "@/lib/schema/graph"; // Use valid schema

// Mock data for now, in real app we fetch from DB
const mockGraph: ArchitectureGraph = {
  nodes: [],
  edges: [],
};

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }, // In Next.js 15, params is a Promise
) {
  const { id } = await params;

  // TODO: Fetch graph from Supabase using `id`
  console.log(`Fetching context for project: ${id}`);

  // For MVP, return a mock or empty graph response transformed into JSON context
  // validArchitectureGraph is required by generateContext, so we'd normally parse db result
  // returning simple JSON for now

  return NextResponse.json({
    id,
    context: generateContext({ nodes: [], edges: [] }, "json"), // Return empty graph context
    timestamp: new Date().toISOString(),
  });
}
