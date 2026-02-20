import { createOpenAI } from "@ai-sdk/openai";

const qwenClient = createOpenAI({
  baseURL: "https://dashscope-intl.aliyuncs.com/compatible-mode/v1",
  apiKey: "dummy",
});

const model = qwenClient.chat("qwen3-coder-flash");
const completionModel = qwenClient.completion("qwen3-coder-flash");

// Print the expected endpoints
console.log(model);
console.log(completionModel);
