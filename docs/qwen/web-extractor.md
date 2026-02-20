The web extractor tool fetches and extracts content from specified URLs, providing models with web information.

## **Usage**

Web extractor supports three invocation methods, each with different configuration parameters:

## OpenAI-compatible Responses API

To use web extractor, add both `web_search` and `web_extractor` to `tools`.

> When using qwen3-max-2026-01-23, `enable_thinking` must be true.

> For the best results, especially in case of mathematical calculations or data analytics, use also the `code_interpreter` to improve the accuracy.

```
# Import dependencies and create client...
response = client.responses.create(
    model="qwen3-max-2026-01-23",
    input="Please visit the official Alibaba Cloud Model Studio documentation, find the code interpreter topic and summarize it",
    tools=[
        {"type": "web_search"},
        {"type": "web_extractor"},
        {"type": "code_interpreter"}
    ],
    extra_body={
      "enable_thinking": True
    }
)

print(response.output_text)
```

## OpenAI-Compatible Chat Completions API

Set `enable_search` and `enable_thinking` to true, and set `search_strategy` to `agent_max`.

> Non-streaming output is not supported.

```
# Import dependencies and create client...
completion = client.chat.completions.create(
    model="qwen3-max-2026-01-23",
    messages=[{"role": "user", "content": "Please visit the official Alibaba Cloud Model Studio documentation, find the code interpreter topic and summarize it"}],
    extra_body={
        "enable_thinking": True,
        "enable_search": True,
        "search_options": {"search_strategy": "agent_max"}
    },
    stream=True
)
```

## **DashScope**

Set `enable_search` and `enable_thinking` to true, and set `search_strategy` to `agent_max`.

> Non-streaming output is not supported.

```
from dashscope import Generation

response = Generation.call(
    model="qwen3-max-2026-01-23",
    messages=[{"role": "user", "content": "Please visit the official Alibaba Cloud Model Studio documentation, find the code interpreter topic and summarize it"}],
    enable_search=True,
    search_options={"search_strategy": "agent_max"},
    enable_thinking=True,
    result_format="message",
    stream=True,
    incremental_output=True
)
```

## **Availability**

Supports `qwen3-max` in thinking mode, `qwen3-max-2026-01-23` in thinking mode, `qwen3.5-plus`, `qwen3.5-plus-2026-02-15`, and `qwen3.5-397b-a17b`.

## **Getting started**

Call the web extractor tool via the Responses API and automatically summarize a technical document.

> First, [get an API key](/help/en/model-studio/get-api-key) and [export the API key as an environment variable](/help/en/model-studio/configure-api-key-through-environment-variables).

Python

```
import os
from openai import OpenAI

client = OpenAI(
    # If you haven't configured an environment variable, replace the following line with: api_key="sk-xxx",
    api_key=os.getenv("DASHSCOPE_API_KEY"),
    base_url="https://dashscope-intl.aliyuncs.com/api/v2/apps/protocols/compatible-mode/v1"
)

response = client.responses.create(
    model="qwen3-max-2026-01-23",
    input="Please visit the official Alibaba Cloud Model Studio documentation, find the code interpreter topic and summarize it",
    tools=[
        {
            "type": "web_search"
        },
        {
            "type": "web_extractor"
        },
        {
            "type": "code_interpreter"
        }
    ],
    extra_body = {
        "enable_thinking": True
    }
)
# Uncomment the following line to view intermediate output
# print(response.output)
print("="*20+"Response"+"="*20)
print(response.output_text)
# Print tool invocation count
usage = response.usage
print("="*20+"Tool Invocation Count"+"="*20)
if hasattr(usage, 'x_tools') and usage.x_tools:
    print(f"\nWeb Extractor invocations: {usage.x_tools.get('web_extractor', {}).get('count', 0)}")
```

Node.js

```
import OpenAI from "openai";
import process from 'process';

const openai = new OpenAI({
    // If you haven't configured an environment variable, replace the following line with: apiKey: "sk-xxx",
    apiKey: process.env.DASHSCOPE_API_KEY,
    baseURL: "https://dashscope-intl.aliyuncs.com/api/v2/apps/protocols/compatible-mode/v1"
});

async function main() {
    const response = await openai.responses.create({
        model: "qwen3-max-2026-01-23",
        input: "Please visit the official Alibaba Cloud Model Studio documentation, find the code interpreter topic and summarize it",
        tools: [
            { type: "web_search" },
            { type: "web_extractor" },
            { type: "code_interpreter" }
        ],
        enable_thinking: true
    });

    console.log("====================Response====================");
    console.log(response.output_text);

    // Print tool invocation count
    console.log("====================Tool Invocation Count====================");
    if (response.usage && response.usage.x_tools) {
        console.log(`Web Extractor invocations: ${response.usage.x_tools.web_extractor?.count || 0}`);
        console.log(`Web Search invocations: ${response.usage.x_tools.web_search?.count || 0}`);
    }
    // Uncomment the following line to view intermediate output
    // console.log(JSON.stringify(response.output[0], null, 2));
}

main();
```

curl

```
curl -X POST https://dashscope-intl.aliyuncs.com/api/v2/apps/protocols/compatible-mode/v1/responses \
-H "Authorization: Bearer $DASHSCOPE_API_KEY" \
-H "Content-Type: application/json" \
-d '{
    "model": "qwen3-max-2026-01-23",
    "input": "Please visit the official Alibaba Cloud Model Studio documentation, find the code interpreter topic and summarize it",
    "tools": [
        {"type": "web_search"},
        {"type": "web_extractor"},
        {"type": "code_interpreter"}
    ],
    "enable_thinking": true
}'
```

Running the code above produces a response similar to:

```
====================Response====================
Based on the official Alibaba Cloud Model Studio documentation, here is a summary of the **Code Interpreter** feature:

## Overview

...

> **Source**: Alibaba Cloud Model Studio Official Documentation - [Qwen Code Interpreter](https://www.alibabacloud.com/help/zh/model-studio/qwen-code-interpreter) and [Assistant API Code Interpreter](https://www.alibabacloud.com/help/zh/model-studio/code-interpreter) (Last updated: December 2025)
====================Tool Invocation Count====================

Web Extractor invocations: 1
```

## **Streaming output**

Web extraction can take some time. Use streaming output to receive intermediate results in real time.

> We recommend using the Responses API to retrieve the intermediate execution status of the tool.

## OpenAI-Compatible Responses API

Python

```
import os
from openai import OpenAI

client = OpenAI(
    # If you haven't configured an environment variable, replace the following line with: api_key="sk-xxx",
    api_key=os.getenv("DASHSCOPE_API_KEY"),
    base_url="https://dashscope.aliyuncs.com/api/v2/apps/protocols/compatible-mode/v1"
)

stream = client.responses.create(
    model="qwen3-max-2026-01-23",
    input="Please visit the official Alibaba Cloud Model Studio documentation, find the code interpreter topic and summarize it",
    tools=[
        {"type": "web_search"},
        {"type": "web_extractor"},
        {"type": "code_interpreter"}
    ],
    stream=True,
    extra_body={"enable_thinking": True}
)

reasoning_started = False
output_started = False

for chunk in stream:
    # Print reasoning process
    if chunk.type == 'response.reasoning_summary_text.delta':
        if not reasoning_started:
            print("="*20 + "Reasoning Process" + "="*20)
            reasoning_started = True
        print(chunk.delta, end='', flush=True)
    # Print tool invocation completion
    elif chunk.type == 'response.output_item.done':
        if hasattr(chunk, 'item') and hasattr(chunk.item, 'type'):
            if chunk.item.type == 'web_extractor_call':
                print("\n" + "="*20 + "Tool Invocation" + "="*20)
                print(chunk.item.goal)
                print(chunk.item.output)
            elif chunk.item.type == 'reasoning':
                reasoning_started = False
    # Print response content
    elif chunk.type == 'response.output_text.delta':
        if not output_started:
            print("\n" + "="*20 + "Response" + "="*20)
            output_started = True
        print(chunk.delta, end='', flush=True)
    # Response completed, print tool invocation count
    elif chunk.type == 'response.completed':
        print("\n" + "="*20 + "Tool Invocation Count" + "="*20)
        usage = chunk.response.usage
        if hasattr(usage, 'x_tools') and usage.x_tools:
            print(f"Web Extractor invocations: {usage.x_tools.get('web_extractor', {}).get('count', 0)}")
            print(f"Web Search invocations: {usage.x_tools.get('web_search', {}).get('count', 0)}")
```

Node.js

```
import OpenAI from "openai";
import process from 'process';

const openai = new OpenAI({
    // If you haven't configured an environment variable, replace the following line with: apiKey: "sk-xxx",
    apiKey: process.env.DASHSCOPE_API_KEY,
    baseURL: "https://dashscope.aliyuncs.com/api/v2/apps/protocols/compatible-mode/v1"
});

async function main() {
    const stream = await openai.responses.create({
        model: "qwen3-max-2026-01-23",
        input: "Please visit the official Alibaba Cloud Model Studio documentation, find the code interpreter topic and summarize it",
        tools: [
            { type: "web_search" },
            { type: "web_extractor" },
            { type: "code_interpreter" }
        ],
        stream: true,
        enable_thinking: true
    });

    let reasoningStarted = false;
    let outputStarted = false;

    for await (const chunk of stream) {
        // Print reasoning process
        if (chunk.type === 'response.reasoning_summary_text.delta') {
            if (!reasoningStarted) {
                console.log("====================Reasoning Process====================");
                reasoningStarted = true;
            }
            process.stdout.write(chunk.delta);
        }
        // Print tool invocation completion
        else if (chunk.type === 'response.output_item.done') {
            if (chunk.item && chunk.item.type === 'web_extractor_call') {
                console.log("\n" + "====================Tool Invocation====================");
                console.log(chunk.item.goal);
                console.log(chunk.item.output);
            } else if (chunk.item && chunk.item.type === 'reasoning') {
                reasoningStarted = false;
            }
        }
        // Print response content
        else if (chunk.type === 'response.output_text.delta') {
            if (!outputStarted) {
                console.log("\n" + "====================Response====================");
                outputStarted = true;
            }
            process.stdout.write(chunk.delta);
        }
        // Response completed, print tool invocation count
        else if (chunk.type === 'response.completed') {
            console.log("\n" + "====================Tool Invocation Count====================");
            const usage = chunk.response.usage;
            if (usage && usage.x_tools) {
                console.log(`Web Extractor invocations: ${usage.x_tools.web_extractor?.count || 0}`);
                console.log(`Web Search invocations: ${usage.x_tools.web_search?.count || 0}`);
            }
        }
    }
}

main();
```

curl

```
curl -X POST https://dashscope.aliyuncs.com/api/v2/apps/protocols/compatible-mode/v1/responses \
-H "Authorization: Bearer $DASHSCOPE_API_KEY" \
-H "Content-Type: application/json" \
-d '{
    "model": "qwen3-max-2026-01-23",
    "input": "Please visit the official Alibaba Cloud Model Studio documentation, find the code interpreter topic and summarize it",
    "tools": [
        {"type": "web_search"},
        {"type": "web_extractor"},
        {"type": "code_interpreter"}
    ],
    "enable_thinking": true,
    "stream": true
}'
```

## OpenAI-Compatible Chat Completions API

Python

```
import os
from openai import OpenAI

client = OpenAI(
    # If you haven't configured an environment variable, replace the following line with: api_key="sk-xxx",
    api_key=os.getenv("DASHSCOPE_API_KEY"),
    base_url="https://dashscope.aliyuncs.com/compatible-mode/v1"
)

stream = client.chat.completions.create(
    model="qwen3-max-2026-01-23",
    messages=[
        {"role": "user", "content": "Please visit the official Alibaba Cloud Model Studio documentation, find the code interpreter topic and summarize it"}
    ],
    extra_body={
        "enable_search": True,
        "search_options": {"search_strategy": "agent_max"}
    },
    stream=True
)

for chunk in stream:
    print(chunk)
```

Node.js

```
import OpenAI from "openai";
import process from 'process';

const openai = new OpenAI({
    // If you haven't configured an environment variable, replace the following line with: apiKey: "sk-xxx",
    apiKey: process.env.DASHSCOPE_API_KEY,
    baseURL: "https://dashscope.aliyuncs.com/compatible-mode/v1"
});

async function main() {
    const stream = await openai.chat.completions.create({
        model: "qwen3-max-2026-01-23",
        messages: [
            { role: "user", content: "Please visit the official Alibaba Cloud Model Studio documentation, find the code interpreter topic and summarize it" }
        ],
        enable_search: true,
        search_options: { search_strategy: "agent_max" },
        stream: true
    });

    for await (const chunk of stream) {
        console.log(chunk);
    }
}

main();
```

curl

```
curl -X POST https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions \
-H "Authorization: Bearer $DASHSCOPE_API_KEY" \
-H "Content-Type: application/json" \
-d '{
    "model": "qwen3-max-2026-01-23",
    "messages": [
        {"role": "user", "content": "Please visit the official Alibaba Cloud Model Studio documentation, find the code interpreter topic and summarize it"}
    ],
    "enable_search": true,
    "search_options": {"search_strategy": "agent_max"},
    "stream": true
}'
```

## DashScope

> Java SDK is not supported.

Python

```
import os
import dashscope
from dashscope import Generation

# If you haven't configured an environment variable, replace the following line with: dashscope.api_key = "sk-xxx"
dashscope.api_key = os.getenv("DASHSCOPE_API_KEY")

response = Generation.call(
    model="qwen3-max-2026-01-23",
    messages=[
        {"role": "user", "content": "Please visit the official Alibaba Cloud Model Studio documentation, find the code interpreter topic and summarize it"}
    ],
    enable_search=True,
    search_options={"search_strategy": "agent_max"},
    enable_thinking=True,
    result_format="message",
    stream=True,
    incremental_output=True
)

reasoning_started = False
output_started = False
last_usage = None

for chunk in response:
    if chunk.status_code == 200:
        message = chunk.output.choices[0].message

        # Print reasoning process
        if hasattr(message, 'reasoning_content') and message.reasoning_content:
            if not reasoning_started:
                print("="*20 + "Reasoning Process" + "="*20)
                reasoning_started = True
            print(message.reasoning_content, end='', flush=True)

        # Print response content
        if hasattr(message, 'content') and message.content:
            if not output_started:
                print("\n" + "="*20 + "Response" + "="*20)
                output_started = True
            print(message.content, end='', flush=True)

        # Save the last usage info
        if hasattr(chunk, 'usage') and chunk.usage:
            last_usage = chunk.usage

# Print tool invocation count
if last_usage:
    print("\n" + "="*20 + "Tool Invocation Count" + "="*20)
    if hasattr(last_usage, 'plugins') and last_usage.plugins:
        print(f"Web Extractor invocations: {last_usage.plugins.get('web_extractor', {}).get('count', 0)}")
```

curl

```
curl -X POST https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation \
-H "Authorization: Bearer $DASHSCOPE_API_KEY" \
-H "X-DashScope-SSE: enable" \
-H "Content-Type: application/json" \
-d '{
    "model": "qwen3-max-2026-01-23",
    "input": {
        "messages": [
            {
                "role": "user",
                "content": "Please visit the official Alibaba Cloud Model Studio documentation, find the code interpreter topic and summarize it"
            }
        ]
    },
    "parameters": {
        "enable_thinking": true,
        "enable_search": true,
        "search_options": {
            "search_strategy": "agent_max"
        },
        "result_format": "message"
    }
}'
```

## **Billing**

-   **Model cost**: Extracted web content is appended to the prompt, increasing the model's input tokens. This is billed at the model's standard price, listed in [Models](/help/en/model-studio/models).
    
-   **Tool cost**: Includes charges for both web extractor and web search.
    
    -   Web search pricing per 1,000 invocations:
        
        -   Mainland China: $0.57341.
            
        -   International: $10.00.
            
    -   Web extractor tool is currently free for a limited time.