Enable the built-in Python code interpreter when calling models to let the model write and run Python code in a sandbox environment, solving complex problems such as mathematical calculations and data analysis.

## **Usage**

The code interpreter supports three calling methods, each with different enablement parameters:

## OpenAI compatible - Responses API

Enable the code interpreter through the `tools` parameter by adding the `code_interpreter` tool.

> For optimal results, we recommend enabling `code_interpreter`, `web_search`, and `web_extractor` tools together.

```
# Import dependencies and create a client...
response = client.responses.create(
    model="qwen3-max-2026-01-23",
    input="What is 123 to the power of 21?",
    tools=[
        {"type": "code_interpreter"},
        {"type": "web_search"},
        {"type": "web_extractor"},
    ],
    extra_body={
        "enable_thinking": True
    }
)

print(response.output_text)
```

## OpenAI compatible - Chat Completions API

Pass `enable_code_interpreter: true` in your API request to enable the code interpreter.

```
# Import dependencies and create a client...
completion = client.chat.completions.create(
    # Use a model that supports the code interpreter
    model="qwen3-max-2026-01-23",
    messages=[{"role": "user", "content": "What is 123 to the power of 21?"}],
    # Because enable_code_interpreter is not a standard OpenAI parameter, pass it through extra_body when using the Python SDK (pass it as a top-level parameter when using the Node.js SDK)
    extra_body={
        "enable_code_interpreter": True,
        # Code interpreter requires thinking mode
        "enable_thinking": True,
    },
    # Streaming output only
    stream=True
)
```

> The OpenAI-compatible protocol does not return the code executed by the interpreter.

## DashScope

Set `enable_code_interpreter` to `true` in your API request to enable the code interpreter.

```
# Import dependencies...
response = dashscope.Generation.call(
    # If you have not configured environment variables, replace the next line with your Model Studio API key: api_key="sk-xxx",
    api_key=os.getenv("DASHSCOPE_API_KEY"),
    model="qwen3-max-2026-01-23",
    messages=[{"role": "user", "content": "What is 123 to the power of 21?"}],
    # Enable the code interpreter
    enable_code_interpreter=True,
    # Code interpreter requires thinking mode
    enable_thinking=True,
    result_format="message",
    # Streaming output only
    stream=True
)
```

The code executed by the interpreter is returned in the `tool_info` field.

Once enabled, the model processes the request in stages:

1.  **Thinking**: The model analyzes the user request and generates ideas and steps to solve the problem.
    
2.  **Code execution**: The model generates and executes Python code.
    
3.  **Result integration**: The model receives the execution result and plans the next steps.
    
4.  **Response**: The model generates a natural language response.
    

> Steps 2 and 3 may execute multiple times in a loop.

Different APIs return different fields:

-   Responses API: Thinking content is returned in output objects with type="reasoning", code execution in type="code\_interpreter\_call", and responses in type="message".
    
-   Chat Completions API / DashScope: Thinking content is returned in the reasoning\_content field, and responses in the content field. DashScope additionally supports the tool\_info field for code content.
    

## **Availability**

## International

-   qwen3-max and qwen3-max-2026-01-23 in thinking mode
    
-   qwen3.5-plus, qwen3.5-plus-2026-02-15, qwen3.5-397b-a17b
    

## China

qwen3-max, qwen3-max-2026-01-23, and qwen3-max-preview in thinking mode

qwen3.5-plus, qwen3.5-plus-2026-02-15, qwen3.5-397b-a17b

> The Responses API is not currently supported.

## **Getting started**

The following examples demonstrate how the code interpreter efficiently solves mathematical calculation problems.

## **OpenAI compatible - Responses API**

> Supported only for qwen3-coder-next and qwen3-max-2026-01-23 in thinking mode.

> For optimal results, we recommend enabling `code_interpreter`, `web_search`, and `web_extractor` tools together.

Python

```
import os
from openai import OpenAI

client = OpenAI(
    # If you have not configured environment variables, replace the next line with your Model Studio API key: api_key="sk-xxx",
    api_key=os.getenv("DASHSCOPE_API_KEY"),
    base_url="https://dashscope-intl.aliyuncs.com/api/v2/apps/protocols/compatible-mode/v1"
)

response = client.responses.create(
    model="qwen3-max-2026-01-23",
    input="What is 12 to the power of 3?",
    tools=[
        {
            "type": "code_interpreter"
        },
        {
            "type": "web_search"
        },
        {
            "type": "web_extractor"
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
print("="*20+"Token usage and tool calls"+"="*20)
print(response.usage)
```

Node.js

```
import OpenAI from "openai";
import process from 'process';

const openai = new OpenAI({
    // If you have not configured environment variables, replace the next line with your Model Studio API key: apiKey: "sk-xxx",
    apiKey: process.env.DASHSCOPE_API_KEY,
    baseURL: "https://dashscope-intl.aliyuncs.com/api/v2/apps/protocols/compatible-mode/v1"
});

async function main() {
    const response = await openai.responses.create({
        model: "qwen3-max-2026-01-23",
        input: "What is 12 to the power of 3?",
        tools: [
            { type: "code_interpreter" },
            { type: "web_search" },
            { type: "web_extractor" }
        ],
        enable_thinking: true
    });

    console.log("====================Response====================");
    console.log(response.output_text);

    // Print tool call count
    console.log("====================Token usage and tool calls====================");
    if (response.usage && response.usage.x_tools) {
        console.log(`Code interpreter runs: ${response.usage.x_tools.code_interpreter?.count || 0}`);
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
    "input": "What is 12 to the power of 3?",
    "tools": [
        {"type": "code_interpreter"},
        {"type": "web_search"},
        {"type": "web_extractor"}
    ],
    "enable_thinking": true
}'
```

###### **Response example**

```
====================Response====================
12 to the power of 3 equals **1728**.

Calculation:
12³ = 12 × 12 × 12 = 144 × 12 = 1728
====================Token usage and tool calls====================
ResponseUsage(input_tokens=1160, input_tokens_details=InputTokensDetails(cached_tokens=0), output_tokens=195, output_tokens_details=OutputTokensDetails(reasoning_tokens=105), total_tokens=1355, x_tools={'code_interpreter': {'count': 1}})
```

## **OpenAI compatible - Chat Completions API**

##### **Python**

```
from openai import OpenAI
import os

# Initialize the OpenAI client
client = OpenAI(
    # If you have not configured environment variables, replace the next line with your Model Studio API key: api_key="sk-xxx"
    api_key=os.getenv("DASHSCOPE_API_KEY"),
    # For international regions, use "https://dashscope-intl.aliyuncs.com/compatible-mode/v1"
    base_url="https://dashscope.aliyuncs.com/compatible-mode/v1",
)

messages = [{"role": "user", "content": "What is 123 to the power of 21?"}]

completion = client.chat.completions.create(
    model="qwen3-max-2026-01-23",
    messages=messages,
    extra_body={"enable_thinking": True, "enable_code_interpreter": True},
    stream=True,
    stream_options={
        "include_usage": True
    },
)

reasoning_content = ""  # Complete thinking process
answer_content = ""  # Complete response
is_answering = False  # Flag to check if the response stage has started
print("\n" + "=" * 20 + "Thinking process" + "=" * 20 + "\n")

for chunk in completion:
    if not chunk.choices:
        print("\nUsage:")
        print(chunk.usage)
        continue

    delta = chunk.choices[0].delta

    # Collect only the thinking content
    if hasattr(delta, "reasoning_content") and delta.reasoning_content is not None:
        if not is_answering:
            print(delta.reasoning_content, end="", flush=True)
        reasoning_content += delta.reasoning_content

    # When content is received, start the response
    if hasattr(delta, "content") and delta.content:
        if not is_answering:
            print("\n" + "=" * 20 + "Complete response" + "=" * 20 + "\n")
            is_answering = True
        print(delta.content, end="", flush=True)
        answer_content += delta.content
```

###### **Response example**

```
====================Thinking process====================

The user is asking for 123 to the power of 21. This is a mathematical calculation problem. I need to calculate 123^21.

I can use the code interpreter to calculate this value. I need to call the code_interpreter function and pass in the Python code to calculate 123**21.

Let me construct this function call.
The user asked for 123 to the power of 21, and I used Python code to calculate the result. The result shows that 123 to the power of 21 equals 77269364466549865653073473388030061522211723. This is a very large number. I should provide this directly
====================Complete response====================

123 to the power of 21 is: 77269364466549865653073473388030061522211723
Usage:
CompletionUsage(completion_tokens=245, prompt_tokens=719, total_tokens=964, completion_tokens_details=CompletionTokensDetails(accepted_prediction_tokens=None, audio_tokens=None, reasoning_tokens=153, rejected_prediction_tokens=None), prompt_tokens_details=None)
```

##### **Node.js**

```
import OpenAI from "openai";
import process from 'process';

// Initialize the OpenAI client
const openai = new OpenAI({
    apiKey: process.env.DASHSCOPE_API_KEY, // Read from environment variables
    // For international regions, use https://dashscope-intl.aliyuncs.com/compatible-mode/v1
    baseURL: 'https://dashscope.aliyuncs.com/compatible-mode/v1'
});

let reasoningContent = '';
let answerContent = '';
let isAnswering = false;

async function main() {
    try {
        const messages = [{ role: 'user', content: 'What is 123 to the power of 21?' }];
        const stream = await openai.chat.completions.create({
            model: 'qwen3-max-2026-01-23',
            messages,
            stream: true,
            enable_thinking: true,
            enable_code_interpreter: true
        });
        console.log('\n' + '='.repeat(20) + 'Thinking process' + '='.repeat(20) + '\n');

        for await (const chunk of stream) {
            if (!chunk.choices?.length) {
                console.log('\nUsage:');
                console.log(chunk.usage);
                continue;
            }

            const delta = chunk.choices[0].delta;

            // Collect only the thinking content
            if (delta.reasoning_content !== undefined && delta.reasoning_content !== null) {
                if (!isAnswering) {
                    process.stdout.write(delta.reasoning_content);
                }
                reasoningContent += delta.reasoning_content;
            }

            // When content is received, start the response
            if (delta.content !== undefined && delta.content) {
                if (!isAnswering) {
                    console.log('\n' + '='.repeat(20) + 'Complete response' + '='.repeat(20) + '\n');
                    isAnswering = true;
                }
                process.stdout.write(delta.content);
                answerContent += delta.content;
            }
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

main();
```

###### **Response example**

```
====================Thinking process====================

  The user is asking for the value of 123 raised to the power of 21. This is a mathematical calculation that I can perform using Python's code interpreter. I'll use the exponentiation operator ** to calculate this.

  Let me write the code to compute 123**21.The calculation has been completed successfully. The result of 123 raised to the power of 21 is a very large number: 77269364466549865653073473388030061522211723.

  I should present this result clearly to the user.

  ====================Complete response====================

  123 to the power of 21 is: 77269364466549865653073473388030061522211723
```

##### **curl**

```
# For international regions, use https://dashscope-intl.aliyuncs.com/compatible-mode/v1/chat/completions
curl -X POST https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions \
-H "Authorization: Bearer $DASHSCOPE_API_KEY" \
-H "Content-Type: application/json" \
-d '{
    "model": "qwen3-max-2026-01-23",
    "messages": [
        {
            "role": "user",
            "content": "What is 123 to the power of 21?"
        }
    ],
    "enable_code_interpreter": true,
    "enable_thinking": true,
    "stream": true
}'
```

#### **Response example**

```
data: {"choices":[{"delta":{"content":null,"role":"assistant","reasoning_content":""},"index":0,"logprobs":null,"finish_reason":null}],"object":"chat.completion.chunk","usage":null,"created":1761899724,"system_fingerprint":null,"model":"qwen3-max-2026-01-23","id":"chatcmpl-2f96ef0b-5924-4dfc-b768-4d53ec538b4e"}

data: {"choices":[{"finish_reason":null,"logprobs":null,"delta":{"content":null,"reasoning_content":"The user"},"index":0}],"object":"chat.completion.chunk","usage":null,"created":1761899724,"system_fingerprint":null,"model":"qwen3-max-2026-01-23","id":"chatcmpl-2f96ef0b-5924-4dfc-b768-4d53ec538b4e"}

data: {"choices":[{"delta":{"content":null,"reasoning_content":" is asking"},"finish_reason":null,"index":0,"logprobs":null}],"object":"chat.completion.chunk","usage":null,"created":1761899724,"system_fingerprint":null,"model":"qwen3-max-2026-01-23","id":"chatcmpl-2f96ef0b-5924-4dfc-b768-4d53ec538b4e"}

data: {"choices":[{"delta":{"content":null,"reasoning_content":" for"},"finish_reason":null,"index":0,"logprobs":null}],"object":"chat.completion.chunk","usage":null,"created":1761899724,"system_fingerprint":null,"model":"qwen3-max-2026-01-23","id":"chatcmpl-2f96ef0b-5924-4dfc-b768-4d53ec538b4e"}

...

data: {"choices":[{"delta":{"content":"a very large number, with a total","reasoning_content":null},"finish_reason":null,"index":0,"logprobs":null}],"object":"chat.completion.chunk","usage":null,"created":1761899724,"system_fingerprint":null,"model":"qwen3-max-2026-01-23","id":"chatcmpl-2f96ef0b-5924-4dfc-b768-4d53ec538b4e"}

data: {"choices":[{"delta":{"content":" of 43 digits","reasoning_content":null},"finish_reason":null,"index":0,"logprobs":null}],"object":"chat.completion.chunk","usage":null,"created":1761899724,"system_fingerprint":null,"model":"qwen3-max-2026-01-23","id":"chatcmpl-2f96ef0b-5924-4dfc-b768-4d53ec538b4e"}

data: {"choices":[{"delta":{"content":".","reasoning_content":null},"finish_reason":null,"index":0,"logprobs":null}],"object":"chat.completion.chunk","usage":null,"created":1761899724,"system_fingerprint":null,"model":"qwen3-max-2026-01-23","id":"chatcmpl-2f96ef0b-5924-4dfc-b768-4d53ec538b4e"}

data: {"choices":[{"finish_reason":"stop","delta":{"content":"","reasoning_content":null},"index":0,"logprobs":null}],"object":"chat.completion.chunk","usage":null,"created":1761899724,"system_fingerprint":null,"model":"qwen3-max-2026-01-23","id":"chatcmpl-2f96ef0b-5924-4dfc-b768-4d53ec538b4e"}

data: [DONE]
```

## **DashScope**

> The Java SDK is not supported.

##### **Python**

```
import os
import dashscope

# For international regions, uncomment the following line
# dashscope.base_http_api_url = 'https://dashscope-intl.aliyuncs.com/api/v1'

messages = [
    {"role": "user", "content": "What is 123 to the power of 21?"},
]

response = dashscope.Generation.call(
    # If you have not configured environment variables, replace the next line with your Model Studio API key: api_key="sk-xxx",
    api_key=os.getenv("DASHSCOPE_API_KEY"),
    model="qwen3-max-2026-01-23",
    messages=messages,
    enable_code_interpreter=True,
    enable_thinking=True,
    result_format="message",
    # Streaming output only
    stream=True
)

for chunk in response:
    output = chunk["output"]
    print(output)
```

###### **Response example**

```
{"text": null, "finish_reason": null, "choices": [{"finish_reason": "null", "message": {"role": "assistant", "content": "", "reasoning_content": "The"}}]}
{"text": null, "finish_reason": null, "choices": [{"finish_reason": "null", "message": {"role": "assistant", "content": "", "reasoning_content": " user is asking"}}]}
{"text": null, "finish_reason": null, "choices": [{"finish_reason": "null", "message": {"role": "assistant", "content": "", "reasoning_content": " me"}}]}
...
{"text": null, "finish_reason": null, "choices": [{"finish_reason": "null", "message": {"role": "assistant", "content": "", "reasoning_content": " I'll write a"}}]}
{"text": null, "finish_reason": null, "choices": [{"finish_reason": "null", "message": {"role": "assistant", "content": "", "reasoning_content": " simple Python program to calculate"}}]}
{"text": null, "finish_reason": null, "choices": [{"finish_reason": "null", "message": {"role": "assistant", "content": "", "reasoning_content": ""}}]}
{"text": null, "finish_reason": null, "choices": [{"finish_reason": "null", "message": {"role": "assistant", "content": "", "reasoning_content": ""}}]}
{"text": null, "finish_reason": null, "choices": [{"finish_reason": "null", "message": {"role": "assistant", "content": "", "reasoning_content": ""}}]}
{"text": null, "finish_reason": null, "choices": [{"finish_reason": "null", "message": {"role": "assistant", "content": "", "reasoning_content": ""}}]}
{"text": null, "finish_reason": null, "choices": [{"finish_reason": "null", "message": {"role": "assistant", "content": "", "reasoning_content": ""}}]}
{"text": null, "finish_reason": null, "choices": [{"finish_reason": "null", "message": {"role": "assistant", "content": "", "reasoning_content": ""}}], "tool_info": [{"code_interpreter": {"code": "123**21"}, "type": "code_interpreter"}]}
{"text": null, "finish_reason": null, "choices": [{"finish_reason": "null", "message": {"role": "assistant", "content": "", "reasoning_content": "The"}}], "tool_info": [{"code_interpreter": {"code": "123**21"}, "type": "code_interpreter"}]}
{"text": null, "finish_reason": null, "choices": [{"finish_reason": "null", "message": {"role": "assistant", "content": "", "reasoning_content": " user"}}], "tool_info": [{"code_interpreter": {"code": "123**21"}, "type": "code_interpreter"}]}
{"text": null, "finish_reason": null, "choices": [{"finish_reason": "null", "message": {"role": "assistant", "content": "", "reasoning_content": " asked"}}], "tool_info": [{"code_interpreter": {"code": "123**21"}, "type": "code_interpreter"}]}
...
{"text": null, "finish_reason": null, "choices": [{"finish_reason": "null", "message": {"role": "assistant", "content": "", "reasoning_content": " I should present this result"}}], "tool_info": [{"code_interpreter": {"code": "123**21"}, "type": "code_interpreter"}]}
{"text": null, "finish_reason": null, "choices": [{"finish_reason": "null", "message": {"role": "assistant", "content": "", "reasoning_content": " to the user in"}}], "tool_info": [{"code_interpreter": {"code": "123**21"}, "type": "code_interpreter"}]}
{"text": null, "finish_reason": null, "choices": [{"finish_reason": "null", "message": {"role": "assistant", "content": "", "reasoning_content": " a clear format."}}], "tool_info": [{"code_interpreter": {"code": "123**21"}, "type": "code_interpreter"}]}
{"text": null, "finish_reason": null, "choices": [{"finish_reason": "null", "message": {"role": "assistant", "content": "123 to the power of ", "reasoning_content": ""}}], "tool_info": [{"code_interpreter": {"code": "123**21"}, "type": "code_interpreter"}]}
{"text": null, "finish_reason": null, "choices": [{"finish_reason": "null", "message": {"role": "assistant", "content": "21 is:\n\n", "reasoning_content": ""}}], "tool_info": [{"code_interpreter": {"code": "123**21"}, "type": "code_interpreter"}]}
{"text": null, "finish_reason": null, "choices": [{"finish_reason": "null", "message": {"role": "assistant", "content": "772693", "reasoning_content": ""}}], "tool_info": [{"code_interpreter": {"code": "123**21"}, "type": "code_interpreter"}]}
{"text": null, "finish_reason": null, "choices": [{"finish_reason": "null", "message": {"role": "assistant", "content": "644665", "reasoning_content": ""}}], "tool_info": [{"code_interpreter": {"code": "123**21"}, "type": "code_interpreter"}]}
{"text": null, "finish_reason": null, "choices": [{"finish_reason": "null", "message": {"role": "assistant", "content": "498656", "reasoning_content": ""}}], "tool_info": [{"code_interpreter": {"code": "123**21"}, "type": "code_interpreter"}]}
{"text": null, "finish_reason": null, "choices": [{"finish_reason": "null", "message": {"role": "assistant", "content": "530734", "reasoning_content": ""}}], "tool_info": [{"code_interpreter": {"code": "123**21"}, "type": "code_interpreter"}]}
{"text": null, "finish_reason": null, "choices": [{"finish_reason": "null", "message": {"role": "assistant", "content": "733880", "reasoning_content": ""}}], "tool_info": [{"code_interpreter": {"code": "123**21"}, "type": "code_interpreter"}]}
{"text": null, "finish_reason": null, "choices": [{"finish_reason": "null", "message": {"role": "assistant", "content": "300615", "reasoning_content": ""}}], "tool_info": [{"code_interpreter": {"code": "123**21"}, "type": "code_interpreter"}]}
{"text": null, "finish_reason": null, "choices": [{"finish_reason": "null", "message": {"role": "assistant", "content": "222117", "reasoning_content": ""}}], "tool_info": [{"code_interpreter": {"code": "123**21"}, "type": "code_interpreter"}]}
{"text": null, "finish_reason": null, "choices": [{"finish_reason": "null", "message": {"role": "assistant", "content": "23", "reasoning_content": ""}}], "tool_info": [{"code_interpreter": {"code": "123**21"}, "type": "code_interpreter"}]}
{"text": null, "finish_reason": null, "choices": [{"finish_reason": "stop", "message": {"role": "assistant", "content": "", "reasoning_content": ""}}], "tool_info": [{"code_interpreter": {"code": "123**21"}, "type": "code_interpreter"}]}
```

##### **curl**

```
curl -X POST https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation \
-H "Authorization: Bearer $DASHSCOPE_API_KEY" \
-H "Content-Type: application/json" \
-H "X-DashScope-SSE: enable" \
-d '{
    "model": "qwen3-max-2026-01-23",
    "input":{
        "messages":[
            {
                "role": "user",
                "content": "What is 123 to the power of 21?"
            }
        ]
    },
    "parameters": {
        "enable_code_interpreter": true,
        "enable_thinking": true,
        "result_format": "message"
    }
}'
```

#### **Response example**

> <...text content...> is an explanatory comment that identifies the processing stage and is not part of the actual API response.

```
id:1
event:result
:HTTP_STATUS/200
data:{"output":{"choices":[{"message":{"content":"","reasoning_content":"The","role":"assistant"},"finish_reason":"null"}]},"usage":{"total_tokens":290,"output_tokens":3,"input_tokens":287,"output_tokens_details":{"reasoning_tokens":1}},"request_id":"a1959ad1-2637-4672-a21f-4d351371d254"}

id:2
event:result
:HTTP_STATUS/200
data:{"output":{"choices":[{"message":{"content":"","reasoning_content":" user is asking","role":"assistant"},"finish_reason":"null"}]},"usage":{"total_tokens":293,"output_tokens":6,"input_tokens":287,"output_tokens_details":{"reasoning_tokens":4}},"request_id":"a1959ad1-2637-4672-a21f-4d351371d254"}

...Thinking stage...

id:21
event:result
:HTTP_STATUS/200
data:{"output":{"choices":[{"message":{"content":"","reasoning_content":"","role":"assistant"},"finish_reason":"null"}]},"usage":{"total_tokens":388,"output_tokens":101,"input_tokens":287,"output_tokens_details":{"reasoning_tokens":68}},"request_id":"a1959ad1-2637-4672-a21f-4d351371d254"}

...Thinking ends, code interpreter starts...

id:22
event:result
:HTTP_STATUS/200
data:{"output":{"choices":[{"message":{"content":"","reasoning_content":"","role":"assistant"},"finish_reason":"null"}],"tool_info":[{"code_interpreter":{"code":"123**21"},"type":"code_interpreter"}]},"usage":{"total_tokens":388,"output_tokens":101,"input_tokens":287,"output_tokens_details":{"reasoning_tokens":68},"plugins":{"code_interpreter":{"count":1}}},"request_id":"a1959ad1-2637-4672-a21f-4d351371d254"}

...Thinking starts after code interpreter runs...

id:23
event:result
:HTTP_STATUS/200
data:{"output":{"choices":[{"message":{"content":"","reasoning_content":"The","role":"assistant"},"finish_reason":"null"}],"tool_info":[{"code_interpreter":{"code":"123**21"},"type":"code_interpreter"}]},"usage":{"total_tokens":838,"output_tokens":104,"input_tokens":734,"output_tokens_details":{"reasoning_tokens":69},"plugins":{"code_interpreter":{"count":1}}},"request_id":"a1959ad1-2637-4672-a21f-4d351371d254"}

id:24
event:result
:HTTP_STATUS/200
data:{"output":{"choices":[{"message":{"content":"","reasoning_content":" user","role":"assistant"},"finish_reason":"null"}],"tool_info":[{"code_interpreter":{"code":"123**21"},"type":"code_interpreter"}]},"usage":{"total_tokens":839,"output_tokens":105,"input_tokens":734,"output_tokens_details":{"reasoning_tokens":70},"plugins":{"code_interpreter":{"count":1}}},"request_id":"a1959ad1-2637-4672-a21f-4d351371d254"}

...Thinking stage...

id:43
event:result
:HTTP_STATUS/200
data:{"output":{"choices":[{"message":{"content":"","reasoning_content":" a clear format.","role":"assistant"},"finish_reason":"null"}],"tool_info":[{"code_interpreter":{"code":"123**21"},"type":"code_interpreter"}]},"usage":{"total_tokens":942,"output_tokens":208,"input_tokens":734,"output_tokens_details":{"reasoning_tokens":171},"plugins":{"code_interpreter":{"count":1}}},"request_id":"a1959ad1-2637-4672-a21f-4d351371d254"}

...Thinking ends, response starts...

id:44
event:result
:HTTP_STATUS/200
data:{"output":{"choices":[{"message":{"content":"123 to the power of ","reasoning_content":"","role":"assistant"},"finish_reason":"null"}],"tool_info":[{"code_interpreter":{"code":"123**21"},"type":"code_interpreter"}]},"usage":{"total_tokens":947,"output_tokens":213,"input_tokens":734,"output_tokens_details":{"reasoning_tokens":171},"plugins":{"code_interpreter":{"count":1}}},"request_id":"a1959ad1-2637-4672-a21f-4d351371d254"}

...

id:53
event:result
:HTTP_STATUS/200
data:{"output":{"choices":[{"message":{"content":"23","reasoning_content":"","role":"assistant"},"finish_reason":"null"}],"tool_info":[{"code_interpreter":{"code":"123**21"},"type":"code_interpreter"}]},"usage":{"total_tokens":997,"output_tokens":263,"input_tokens":734,"output_tokens_details":{"reasoning_tokens":171},"plugins":{"code_interpreter":{"count":1}}},"request_id":"a1959ad1-2637-4672-a21f-4d351371d254"}

id:54
event:result
:HTTP_STATUS/200
data:{"output":{"choices":[{"message":{"content":"","reasoning_content":"","role":"assistant"},"finish_reason":"stop"}],"tool_info":[{"code_interpreter":{"code":"123**21"},"type":"code_interpreter"}]},"usage":{"total_tokens":997,"output_tokens":263,"input_tokens":734,"output_tokens_details":{"reasoning_tokens":171},"plugins":{"code_interpreter":{"count":1}}},"request_id":"a1959ad1-2637-4672-a21f-4d351371d254"}
```

## **Response parsing**

The following DashScope Python SDK example demonstrates how to perform two calculations in a single request and return the code along with the total call count.

> The OpenAI Chat Completions API does not return data during the **code execution** stage, creating a response gap between the **thinking** and **result integration** stages. Since both stages return content through `reasoning_content`, they can be processed together as the **thinking** stage. For response parsing examples, see the code in [Getting started](#8a056573f7gw3).

```
import os
from dashscope import Generation
# For international regions, uncomment the following line
# dashscope.base_http_api_url = 'https://dashscope-intl.aliyuncs.com/api/v1'

messages = [{"role": "user", "content": "Run the code interpreter twice: first calculate 123 to the power of 23, then divide that result by 5"}]

response = Generation.call(
    api_key=os.getenv("DASHSCOPE_API_KEY"),
    model="qwen3-max-2026-01-23",
    messages=messages,
    result_format="message",
    enable_thinking=True,
    enable_code_interpreter=True,
    stream=True,
    incremental_output=True,
)

# Status flags: track whether tool info has been printed, whether in the answering stage, and whether in a reasoning section
is_answering = False
in_reasoning_section = False
cur_tools = []

# Print a section with a title
def print_section(title):
    print(f"\n{'=' * 20}{title}{'=' * 20}")

# Initially print the "Thinking process" title
print_section("Thinking process")
in_reasoning_section = True

# Process each data chunk returned by the model in a stream
for chunk in response:
    try:
        # Extract key fields from the response: content, reasoning text, tool call information
        choice = chunk.output.choices[0]
        msg = choice.message
        content = msg.get("content", "")            # Final answer content
        reasoning = msg.get("reasoning_content", "") # Reasoning process text
        tools = chunk.output.get("tool_info", None)  # Tool call information
    except (IndexError, AttributeError, KeyError):
        # Skip chunks with abnormal structures
        continue
    # If there is no valid content, skip the current chunk
    if not content and not reasoning and tools is None:
        continue
    # Output the reasoning process
    if reasoning and not is_answering:
        if not in_reasoning_section:
            print_section("Thinking process")
            in_reasoning_section = True
        print(reasoning, end="", flush=True)
    if tools is not None and tools != cur_tools:
        print_section("Tool information")
        print(tools)
        in_reasoning_section = False
        cur_tools = tools
    # Output the final answer content
    if content:
        if not is_answering:
            print_section("Complete response")
            is_answering = True
            in_reasoning_section = False
        print(content, end="", flush=True)
# Print code interpreter call count
print_section("Code interpreter run count")
print(chunk.usage.plugins)
```

### **Response example**

```
====================Thinking process====================
  The user wants to run the code interpreter twice:
  1. First run: Calculate 123 to the power of 23
  2. Second run: Divide the result by 5

  I need to first call the code interpreter to calculate 123**23, then use that result to call the code interpreter again to divide by 5.

  Let me do the first calculation.

  ====================Tool information====================
  [{'code_interpreter': {'code': '123**23'}, 'type': 'code_interpreter'}]

  ====================Thinking process====================
  The first calculation returned the value of 123 to the power of 23: 1169008215014432917465348578887506800769541157267

  Now for the second run, I need to divide this result by 5. I'll use this exact value for the division
  ====================Tool information====================
  [{'code_interpreter': {'code': '123**23'}, 'type': 'code_interpreter'}, {'code_interpreter': {'code': ''}, 'type': 'code_interpreter'}]

  ====================Tool information====================
  [{'code_interpreter': {'code': '123**23'}, 'type': 'code_interpreter'}, {'code_interpreter': {'code': '1169008215014432917465348578887506800769541157267 / 5'}, 'type': 'code_interpreter'}]

  ====================Thinking process====================
  The user requested running the code interpreter twice:
  1. First, calculate 123 to the power of 23, result: 1169008215014432917465348578887506800769541157267
  2. Second, divide this result by 5, which gives: 2.338016430028866e+47

  Now I need to report these two results to the user
  ====================Complete response====================
  First run result: 123 to the power of 23 = 1169008215014432917465348578887506800769541157267

  Second run result: The above result divided by 5 = 2.338016430028866e+47
  ====================Code interpreter run count====================
  {'code_interpreter': {'count': 2}}
```

## **Notes**

-   Code interpreter and [Function Calling](/help/en/model-studio/qwen-function-calling) are mutually exclusive and cannot be enabled simultaneously.
    
    > Enabling both will result in an error.
    
-   After enabling code interpreter, a single request triggers multiple model inferences. The `usage` field aggregates token consumption across all calls.
    

## **Billing**

Enabling the code interpreter tool is **temporarily free**, but it increases token consumption.