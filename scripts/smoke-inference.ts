/**
 * Live DashScope smoke test — run with:
 *   bun --env-file=.env.local scripts/smoke-inference.ts
 */
import OpenAI from "openai";
import { getDashScopeApiKey, getDashScopeBaseUrl } from "../lib/dashscope";
import {
  DASHSCOPE_FALLBACK_MODEL,
  getInferenceModelChain,
} from "../lib/inference-fallback";
import {
  getInferenceTierConfig,
  INFERENCE_TIERS,
} from "../lib/inference-tier";
import {
  isDashScopeConfigured,
  streamDashScopeInference,
} from "../lib/deepseek-stream";

interface SmokeResult {
  name: string;
  ok: boolean;
  detail: string;
  ms?: number;
}

async function probeModel(model: string): Promise<SmokeResult> {
  const start = Date.now();
  const client = new OpenAI({
    baseURL: getDashScopeBaseUrl(),
    apiKey: getDashScopeApiKey(),
  });

  try {
    const completion = await client.chat.completions.create({
      model,
      messages: [{ role: "user", content: "Reply with exactly: OK" }],
      max_completion_tokens: 16,
      temperature: 0,
      stream: true,
      stream_options: { include_usage: true },
    } as Parameters<typeof client.chat.completions.create>[0]);

    let text = "";
    for await (const chunk of completion as AsyncIterable<{
      choices?: Array<{
        delta?: { content?: string; reasoning_content?: string };
      }>;
    }>) {
      const delta = chunk.choices?.[0]?.delta;
      if (delta?.content) text += delta.content;
      if (delta?.reasoning_content) text += delta.reasoning_content;
    }

    return {
      name: `model:${model}`,
      ok: text.trim().length > 0,
      detail: text.trim().slice(0, 80) || "(empty)",
      ms: Date.now() - start,
    };
  } catch (error) {
    return {
      name: `model:${model}`,
      ok: false,
      detail: error instanceof Error ? error.message : String(error),
      ms: Date.now() - start,
    };
  }
}

async function probeStreamTier(tier: "flash" | "pro"): Promise<SmokeResult> {
  const start = Date.now();
  const tierConfig = getInferenceTierConfig(tier);

  try {
    const { fullStream, meta } = await streamDashScopeInference({
      tierConfig,
      systemPrompt: "You are a test assistant. Be extremely brief.",
      messages: [{ role: "user", content: "Say OK only." }],
    });

    let text = "";
    for await (const part of fullStream) {
      if (part.type === "text-delta") {
        text += part.text;
      }
    }

    return {
      name: `stream:${tier}`,
      ok: text.trim().length > 0,
      detail: `model=${meta.modelUsed} fallback=${meta.fallbackUsed} text=${text.trim().slice(0, 40)}`,
      ms: Date.now() - start,
    };
  } catch (error) {
    return {
      name: `stream:${tier}`,
      ok: false,
      detail: error instanceof Error ? error.message : String(error),
      ms: Date.now() - start,
    };
  }
}

async function main(): Promise<void> {
  const results: SmokeResult[] = [];

  results.push({
    name: "config",
    ok: isDashScopeConfigured(),
    detail: isDashScopeConfigured() ? "DASHSCOPE_API_KEY set" : "missing key",
  });

  const flashChain = getInferenceModelChain("flash");
  const proChain = getInferenceModelChain("pro");
  results.push({
    name: "chain:flash",
    ok:
      flashChain[0] === INFERENCE_TIERS.flash.dashscopeModel &&
      flashChain.at(-1) === DASHSCOPE_FALLBACK_MODEL,
    detail: flashChain.join(" → "),
  });
  results.push({
    name: "chain:pro",
    ok:
      proChain[0] === INFERENCE_TIERS.pro.dashscopeModel &&
      proChain.at(-1) === DASHSCOPE_FALLBACK_MODEL,
    detail: proChain.join(" → "),
  });

  if (!isDashScopeConfigured()) {
    printReport(results);
    process.exit(1);
  }

  results.push(await probeModel(INFERENCE_TIERS.flash.dashscopeModel));
  results.push(await probeModel(DASHSCOPE_FALLBACK_MODEL));
  results.push(await probeStreamTier("flash"));

  printReport(results);

  const failed = results.filter((r) => !r.ok);
  process.exit(failed.length > 0 ? 1 : 0);
}

function printReport(results: SmokeResult[]): void {
  console.log("\n=== Simulark inference smoke test ===\n");
  for (const r of results) {
    const status = r.ok ? "PASS" : "FAIL";
    const timing = r.ms != null ? ` (${r.ms}ms)` : "";
    console.log(`${status}  ${r.name}${timing}`);
    console.log(`      ${r.detail}`);
  }
  const passed = results.filter((r) => r.ok).length;
  console.log(`\n${passed}/${results.length} checks passed\n`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
