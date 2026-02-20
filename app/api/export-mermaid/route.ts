import { randomUUID } from "crypto";
import { type NextRequest, NextResponse } from "next/server";
import { createAIClient } from "@/lib/ai-client";
import { createLogger } from "@/lib/logger";
import { createClient } from "@/lib/supabase/server";

const logger = createLogger("api:export-mermaid");

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

    const { nodes, edges } = await req.json();

    if (!nodes || !edges) {
      return NextResponse.json(
        { error: "Nodes and edges are required" },
        { status: 400 },
      );
    }

    const { client, config } = createAIClient("qwen");

    const systemPrompt = `You are an expert architecture diagram designer. Your task is to take a JSON representation of an application's architecture (nodes and edges) and convert it into a perfectly formatted, clean, and highly readable Mermaid \`flowchart TD\` diagram.

Instructions:
1. ONLY return the final Mermaid code block starting with \`\`\`mermaid and ending with \`\`\`. Do not include any reasoning, conversational text, or explanations.
2. Group related nodes into subgraphs where it makes semantic sense (e.g., grouping all frontend nodes, backend services, or database clusters).
3. Use appropriate Mermaid node shapes based on the node types (e.g., [(Database)] for databases, {{Queue}} for message brokers, etc.).
4. Ensure edges have clear directional arrows (-->) and include labels if the original edges have them.
5. Make sure node IDs are alphanumeric and do not break mermaid syntax.
6. The diagram should flow beautifully from top to bottom (\`flowchart TD\`).`;

    const userPrompt = `Here is the architecture JSON data:
Nodes:
${JSON.stringify(nodes, null, 2)}

Edges:
${JSON.stringify(edges, null, 2)}
`;

    const response = await client.chat.completions.create({
      model: config.model,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.2, // Low temperature for deterministic output
    });

    let mermaidCode = response.choices[0]?.message?.content || "";

    // Clean up the markdown formatting if it exists
    mermaidCode = mermaidCode.trim();
    if (mermaidCode.startsWith("\`\`\`mermaid")) {
      mermaidCode = mermaidCode.slice(10);
    } else if (mermaidCode.startsWith("\`\`\`")) {
      mermaidCode = mermaidCode.slice(3);
    }
    if (mermaidCode.endsWith("\`\`\`")) {
      mermaidCode = mermaidCode.slice(0, -3);
    }

    timer.end({ success: true, contentLength: mermaidCode.length });

    return NextResponse.json({ mermaid: mermaidCode.trim() });
  } catch (error: any) {
    timer.end({ success: false });
    logger.error("Failed to export mermaid via AI", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 },
    );
  }
}
