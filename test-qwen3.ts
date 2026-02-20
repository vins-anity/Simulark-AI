import OpenAI from "openai";

const openai = new OpenAI({
  baseURL: "https://dashscope-intl.aliyuncs.com/compatible-mode/v1",
  apiKey: process.env.QWEN_API_KEY,
});

console.log("API Key loaded:", process.env.QWEN_API_KEY ? "✓" : "✗ MISSING");
console.log("");

async function testModel(modelName: string) {
  try {
    const res = await openai.chat.completions.create({
      model: modelName,
      messages: [{ role: "user", content: "Say 'ok' in one word." }],
    });
    const reply = res.choices[0]?.message?.content?.trim();
    console.log(`✅ ${modelName}: "${reply}"`);
  } catch (e: any) {
    console.log(`❌ ${modelName}: [${e.status}] ${e.error?.message || e.message}`);
  }
}

async function main() {
  // The 3 registered Qwen models (bare names sent to Dashscope API)
  await testModel("qwen3-max");    // qwen:qwen3-max  — hot_tag (3x)
  await testModel("qwen3.5-plus"); // qwen:qwen3.5-plus — balance_tag (10x)
  await testModel("qwen-flash");   // qwen:qwen-flash — (15x)
}

main().catch(console.error);

