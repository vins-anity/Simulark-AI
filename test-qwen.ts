import { createOpenAI } from "@ai-sdk/openai";

const qwenClient = createOpenAI({
  baseURL: "https://dashscope-intl.aliyuncs.com/compatible-mode/v1",
  apiKey: "dummy",
});

const model = qwenClient("qwen:qwen3-coder-flash");
console.log(model);
