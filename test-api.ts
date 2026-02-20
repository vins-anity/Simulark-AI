import { validatePrompt } from "./lib/prompt-engineering"; // just a dummy import to check ts compile
console.log("Starting test");
const res = await fetch("http://localhost:3000/api/chat", {
  method: "POST",
  headers: {
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    messages: [{ role: "user", content: "a todo app" }],
    model: "qwen:qwen-plus",
    mode: "startup"
  })
});
console.log(res.status);
console.log(await res.text());
