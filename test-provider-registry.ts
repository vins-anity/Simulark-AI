import { getModel, getProviderConfig, supportsTools } from "./lib/provider-registry";
import { generateText } from "ai";

async function main() {
  console.log("Config for qwen:", getProviderConfig("qwen"));
  console.log("Supports tools:", supportsTools("qwen:qwen3.5-plus"));

  const model = getModel("qwen:qwen3.5-plus");
  console.log("Got model for qwen3.5-plus");

  console.log("Testing text generation...");
  try {
    const { text } = await generateText({
      model,
      prompt: "Hello, who are you? Please answer briefly.",
    });
    console.log("Response:", text);
  } catch (error) {
    console.error("Error during text generation:", error);
  }
}

main().catch(console.error);
