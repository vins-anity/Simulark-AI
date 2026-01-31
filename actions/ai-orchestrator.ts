"use server";

import OpenAI from "openai";
import * as v from "valibot";
import { env } from "@/env";
import {
  type ArchitectureGraph,
  ArchitectureGraphSchema,
  ProjectSchema,
} from "@/lib/schema/graph";
import { createClient } from "@/lib/supabase/server";

// --- Configuration ---

const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: env.OPENROUTER_API_KEY,
  defaultHeaders: {
    "HTTP-Referer": "https://simulark.app", // Required by OpenRouter
    "X-Title": "Simulark",
  },
});

// Models
const MODEL_AGGREGATOR = "upstage/solar-pro-3-tokenizer"; // Using user suggestion or fallback
const MODEL_GENERATOR = "mistralai/mistral-small-24b-instruct-2501"; // Good balance for JSON gen

// --- Types ---

const UserPromptSchema = v.object({
  prompt: v.string(),
  provider: v.optional(
    v.picklist(["AWS", "GCP", "Azure", "Generic"]),
    "Generic",
  ),
});

// --- Aggregator Agent (Thinking) ---
async function runAggregator(prompt: string): Promise<string> {
  console.log("[Aggregator] Thinking about:", prompt);

  try {
    const completion = await openai.chat.completions.create({
      model: MODEL_AGGREGATOR,
      messages: [
        {
          role: "system",
          content:
            "You are an Expert System Architect. Analyze the user request and outline a high-level architectural plan. Be concise and focus on components (Gateway, Service, DB) and connections. Do not output JSON.",
        },
        { role: "user", content: prompt },
      ],
    });

    return (
      completion.choices[0]?.message?.content || "Failed to generate plan."
    );
  } catch (error) {
    console.error("[Aggregator] Error:", error);
    // Fallback for demo/dev if API fails
    return `Fallback Plan: Design a simple architecture for ${prompt} with a Service and Database.`;
  }
}

// --- Generator Agent (Coding) ---
async function runGenerator(
  plan: string,
  provider: string,
): Promise<ArchitectureGraph> {
  console.log(
    "[Generator] Generating JSON for plan:",
    plan,
    "Provider:",
    provider,
  );

  const systemPrompt = `
    You are an Infrastructure as Code generator. Output strictly valid JSON matching this schema:
    {
      "nodes": [ { "id": "string", "type": "gateway" | "service" | "database" | "queue", "position": { "x": number, "y": number }, "data": { "label": "string", "serviceType": "string", "validationStatus": "valid" | "warning" | "error", "costEstimate": number } } ],
      "edges": [ { "id": "string", "source": "string", "target": "string", "animated": boolean, "data": { "protocol": "http" | "queue" | "stream" } } ]
    }
    Use the ${provider} cloud provider context where applicable.
    Ensure "nodes" and "edges" arrays are always present.
    Return ONLY JSON. No markdown formatting.
  `;

  try {
    const completion = await openai.chat.completions.create({
      model: MODEL_GENERATOR,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Plan: ${plan}` },
      ],
      response_format: { type: "json_object" },
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) throw new Error("No content received from Generator");

    const json = JSON.parse(content);
    return json as ArchitectureGraph;
  } catch (error) {
    console.error("[Generator] Error:", error);
    // Return safe fallback matching schema
    return {
      nodes: [
        {
          id: "1",
          type: "gateway",
          position: { x: 250, y: 50 },
          data: {
            label: "API Gateway (Fallback)",
            serviceType: "gateway",
            validationStatus: "valid",
            costEstimate: 0,
          },
        },
        {
          id: "2",
          type: "service",
          position: { x: 250, y: 200 },
          data: {
            label: "Core Service",
            serviceType: "service",
            validationStatus: "valid",
            costEstimate: 10,
          },
        },
        {
          id: "3",
          type: "database",
          position: { x: 250, y: 350 },
          data: {
            label: "Primary DB",
            serviceType: "database",
            validationStatus: "valid",
            costEstimate: 20,
          },
        },
      ],
      edges: [
        {
          id: "e1-2",
          source: "1",
          target: "2",
          animated: true,
          data: { protocol: "http" },
        },
        {
          id: "e2-3",
          source: "2",
          target: "3",
          animated: true,
          data: { protocol: "http" },
        },
      ],
    };
  }
}

// --- Main Orchestrator Action ---

export async function generateArchitecture(
  input: v.InferInput<typeof UserPromptSchema>,
) {
  // 1. Validate Input
  const result = v.safeParse(UserPromptSchema, input);
  if (!result.success) {
    return { success: false, error: "Invalid input" };
  }

  const { prompt, provider } = result.output;

  try {
    // 2. Run Aggregator (Thinking)
    const architecturalPlan = await runAggregator(prompt);

    // 3. Run Generator (Coding)
    const graphJson = await runGenerator(architecturalPlan, provider);

    // 4. Validate Output against Graph Schema
    const graphValidation = v.safeParse(ArchitectureGraphSchema, graphJson);

    if (!graphValidation.success) {
      console.error(
        "[Orchestrator] Validation Failed:",
        v.flatten(graphValidation.issues),
      );
      console.error("Invalid JSON:", JSON.stringify(graphJson, null, 2));
      return {
        success: false,
        error: "Generated architecture failed validation",
      };
    }

    // 5. Log to DB
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      await supabase.from("ai_generations").insert({
        user_id: user.id,
        prompt: prompt,
        model_aggregator: MODEL_AGGREGATOR,
        model_generator: MODEL_GENERATOR,
        success: true,
        tokens_used: 0,
      });
    }

    return {
      success: true,
      data: graphValidation.output,
      plan: architecturalPlan,
    };
  } catch (error: any) {
    console.error("[Orchestrator] Error:", error);

    // Log failure
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser(); // Re-fetch user or move up
    if (user) {
      await supabase.from("ai_generations").insert({
        user_id: user.id,
        prompt: prompt,
        model_aggregator: MODEL_AGGREGATOR,
        model_generator: MODEL_GENERATOR,
        success: false,
        error_message: error.message || "Unknown error",
      });
    }

    return { success: false, error: "Internal server error during generation" };
  }
}
