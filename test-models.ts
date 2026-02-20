import OpenAI from "openai";
import { env } from "./lib/env";

const openai = new OpenAI({
  baseURL: "https://dashscope-intl.aliyuncs.com/compatible-mode/v1",
  apiKey: env.QWEN_API_KEY,
});

async function testModel(modelName: string) {
  try {
    const res = await openai.chat.completions.create({
      model: modelName,
      messages: [{ role: "user", content: "hi" }]
    });
    console.log(`${modelName}: SUCCESS`);
  } catch (e: any) {
    console.log(`${modelName}: ERROR ${e.status} ${e.error?.message || e.message}`);
  }
}

await testModel("qwen-plus");
await testModel("qwen3.5-plus");
await testModel("qwen-max");
await testModel("qwen3.5-max");
await testModel("qwen-coder-flash");
await testModel("qwen3-coder-flash");
