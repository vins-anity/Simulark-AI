Text generation models generate clear and coherent text from input prompts.

You can provide simple keywords, a one-sentence summary, or more complex instructions and context as input to a text generation model. These models learn language patterns from massive datasets and support various use cases, such as:

-   **Content creation**: Generate news articles, product descriptions, and short-video scripts.
    
-   **Customer service**: Power chatbots that provide 24/7 support and answer common questions.
    
-   **Text translation**: Translate between languages quickly and accurately.
    
-   **Summarization**: Extract key points from long documents, reports, or emails.
    
-   **Legal document drafting**: Generate templates for contracts and foundational legal opinions.
    

## **Model Selection Guide**

### **Service Region**

Alibaba Cloud Model Studio provides model services in the [Singapore](https://modelstudio.console.alibabacloud.com/?tab=doc#/doc/?type=model&url=2840914), [Virginia](https://modelstudio.console.alibabacloud.com/us-east-1?tab=doc#/doc/?type=model&url=2840914), and [Beijing](https://bailian.console.alibabacloud.com/?tab=model#/model-market) regions. Each region uses a unique API key. To minimize network latency, call the service from the region nearest to your location. For more information, see [Choose a Deployment Mode](/help/en/model-studio/regions/).

### **General-Purpose Models**

Qwen text generation models are [OpenAI compatible](/help/en/model-studio/compatibility-of-openai-with-dashscope#28f6fd00cfp2q). They are well-suited for intelligent customer service, text creation, content polishing, and summarization.

-   [QwenPlus](/help/en/model-studio/models#bb1e0794618ty): It offers a balance of performance, speed, and cost, making it the **recommended choice** for most use cases.
    
    > The latest Qwen3.5-Plus series excels at language understanding, logical reasoning, code generation, agent tasks, image understanding, video understanding, and graphical user interface (GUI) tasks. It supports built-in [tool calling](/help/en/model-studio/tool-calls/). Its text capabilities match those of Qwen3-Max, and we recommend this model.
    
-   [QwenMax](/help/en/model-studio/models#131ff25c87sj6): This is the highest-performing model in the Qwen3 series. Use it for complex, multi-step tasks.
    
-   [QwenFlash](/help/en/model-studio/models#c299c2b53eyoh): This is the fastest and lowest-cost model in the Qwen3 series. Use it for simple tasks.
    

### **Specialized Models**

For specific business needs, Alibaba Cloud Model Studio offers optimized models for [code generation](/help/en/model-studio/models#4f6fa69743l4j), [long-context processing](/help/en/model-studio/models#af20ce1633zut), [translation](/help/en/model-studio/models#a794de0a15ajo), [data mining](/help/en/model-studio/models#55013b0caagpp), [intention recognition](/help/en/model-studio/models#4f2054106eh3l), [role assumption](/help/en/model-studio/models#269738a1dc6k1), and [in-depth research](/help/en/model-studio/models#250ba55f81j2k).

### **Multimodal Models**

-   [QwenPlus](/help/en/model-studio/models#bb1e0794618ty) (text + image/video → text): The Qwen3.5-Plus series accepts both visual and text inputs. It performs exceptionally well in language understanding, logical reasoning, code generation, agent tasks, image understanding, video understanding, and graphical user interface (GUI) tasks. Its visual reasoning capability represents a major leap over the [QwenVL](/help/en/model-studio/models#5540e6e52e1xx) series.
    
-   [QwenOmni](/help/en/model-studio/models#d77d57d3436d2) (omni-modal → text + audio): This model accepts video, audio, images, and text as input. It generates both text and speech output to handle complex cross-modal tasks.
    
-   [Speech Recognition Model](/help/en/model-studio/models#f79e90076dram) (audio → text): This model transcribes spoken audio into text. It supports Chinese (including Cantonese and other dialects), English, Japanese, Korean, and more.
    

### **Third-Party Models**

Alibaba Cloud Model Studio supports well-known third-party large language models, including [DeepSeek](/help/en/model-studio/kimi-api) and [Kimi](/help/en/model-studio/models#82d3721d122dy). For the full list, see [Text Generation – Third-Party Models](/help/en/model-studio/models#e0c090751drei).

## Core Concepts

A text generation model takes a prompt as input. A prompt consists of one or more message objects, each with a role and content:

-   **System message**: Sets the model's role or instructions. If not specified, the default role is "You are a helpful assistant".
    
-   **User message**: This is the question or instruction from the user.
    
-   **Assistant message**: This is the model's response.
    

When calling a model, you can build an array named `messages` with these message objects. A typical request includes one `system` message to define behavior and one `user` message with the instruction.

> `system` messages are optional but recommended. They help ensure stable and consistent output by defining the model's role and behavior.

```
[
    {"role": "system", "content": "You are a helpful assistant who provides accurate, efficient, and insightful responses. You are ready to help users with any task or question."},
    {"role": "user", "content": "Who are you?"}
]
```

The response object contains the model's reply within an `assistant` message.

```
{
    "role": "assistant",
    "content": "Hello! I am Qwen, a large language model developed by Tongyi Lab at Alibaba Group. I can help you answer questions, write text, perform logical reasoning, and code. I understand and generate multiple languages, support multi-turn conversations, and handle complex tasks. Let me know if you need help!"
}
```

## Getting Started

To use the API, you must first obtain an [API key](/help/en/model-studio/get-api-key) and [set it as an environment variable](/help/en/model-studio/configure-api-key-through-environment-variables). If you use an SDK, install the [OpenAI or DashScope SDK](/help/en/model-studio/install-sdk#8833b9274f4v8).

## OpenAI Compatible – Responses API

The Responses API is the next-generation Chat Completions API. For usage instructions, code examples, and migration guidance, see [OpenAI Compatible – Responses](/help/en/model-studio/compatibility-with-openai-responses-api).

## Python

```
import os
from openai import OpenAI

try:
    client = OpenAI(
        # API keys differ by region. Get your API key: https://www.alibabacloud.com/help/zh/model-studio/get-api-key
        # If you have not set an environment variable, replace the line below with: api_key="sk-xxx",
        api_key=os.getenv("DASHSCOPE_API_KEY"),
        base_url="https://dashscope-intl.aliyuncs.com/api/v2/apps/protocols/compatible-mode/v1",
    )

    response = client.responses.create(
        model="qwen3.5-plus",
        input="Briefly introduce what you can do?"
    )

    print(response.output_text)
except Exception as e:
    print(f"Error: {e}")
    print("See documentation: https://www.alibabacloud.com/help/zh/model-studio/error-code")
```

#### **Response**

```
Hello! I'm an AI assistant with knowledge current up to 2026. Here's a brief overview of what I can do:

*   **Content Creation:** Write emails, articles, stories, scripts, and more.
*   **Coding & Tech:** Generate, debug, and explain code across various programming languages.
*   **Analysis & Summarization:** Process documents, interpret data, and extract key insights.
*   **Problem Solving:** Assist with math, logic, reasoning, and strategic planning.
*   **Learning & Translation:** Explain complex topics simply or translate between multiple languages.

Feel free to ask me anything or give me a task to get started!
```

## Node.js

```
// Requires Node.js v18+ and runs in an ES Module environment
import OpenAI from "openai";

const openai = new OpenAI({
    // API keys differ by region. Get your API key: https://www.alibabacloud.com/help/zh/model-studio/get-api-key
    // If you have not set an environment variable, replace the line below with: apiKey: "sk-xxx",
    apiKey: process.env.DASHSCOPE_API_KEY,
    baseURL: "https://dashscope-intl.aliyuncs.com/api/v2/apps/protocols/compatible-mode/v1"
});

async function main() {
    try {
        const response = await openai.responses.create({
            model: "qwen3.5-plus",
            input: "Briefly introduce what you can do?"
        });

        // Get model response
        console.log(response.output_text);
    } catch (error) {
        console.error("Error:", error);
    }
}

main();
```

#### **Response**

```
Hello! I am Qwen3.5, a large language model developed by Alibaba Cloud with knowledge up to 2026, designed to assist you with complex reasoning, creative tasks, and multilingual conversations.
```

## curl

```
curl -X POST https://dashscope-intl.aliyuncs.com/api/v2/apps/protocols/compatible-mode/v1/responses \
-H "Authorization: Bearer $DASHSCOPE_API_KEY" \
-H "Content-Type: application/json" \
-d '{
    "model": "qwen3.5-plus",
    "input": "Briefly introduce what you can do?",
    "enable_thinking": false
}'
```

#### **Response**

```
{
    "created_at": 1771165900.0,
    "id": "f75c28fb-4064-48ed-90da-4d2cc4362xxx",
    "model": "qwen3.5-plus",
    "object": "response",
    "output": [
        {
            "content": [
                {
                    "annotations": [],
                    "text": "Hello! I am Qwen3.5, a large language model developed by Alibaba Cloud with knowledge up to 2026, designed to assist you with complex reasoning, creative tasks, and multilingual conversations.",
                    "type": "output_text"
                }
            ],
            "id": "msg_89ad23e6-f128-4d4c-b7a1-a786e7880xxx",
            "role": "assistant",
            "status": "completed",
            "type": "message"
        }
    ],
    "parallel_tool_calls": false,
    "status": "completed",
    "tool_choice": "auto",
    "tools": [],
    "usage": {
        "input_tokens": 57,
        "input_tokens_details": {
            "cached_tokens": 0
        },
        "output_tokens": 44,
        "output_tokens_details": {
            "reasoning_tokens": 0
        },
        "total_tokens": 101,
        "x_details": [
            {
                "input_tokens": 57,
                "output_tokens": 44,
                "total_tokens": 101,
                "x_billing_type": "response_api"
            }
        ]
    }
}
```

## OpenAI Compatible – Chat Completions API

## Python

```
import os
from openai import OpenAI

try:
    client = OpenAI(
        # API keys differ by region. Get your API key: https://www.alibabacloud.com/help/zh/model-studio/get-api-key
        # If you have not set an environment variable, replace the line below with: api_key="sk-xxx",
        api_key=os.getenv("DASHSCOPE_API_KEY"),
        # Base URLs differ by region
        base_url="https://dashscope-intl.aliyuncs.com/compatible-mode/v1",
    )

    completion = client.chat.completions.create(
        # Model list: https://www.alibabacloud.com/help/zh/model-studio/models
        model="qwen3.5-plus",
        messages=[
            {"role": "system", "content": "You are a helpful assistant."},
            {"role": "user", "content": "Who are you?"},
        ],
    )
    print(completion.choices[0].message.content)
    # Uncomment the following line to view the full response
    # print(completion.model_dump_json())
except Exception as e:
    print(f"Error: {e}")
    print("See documentation: https://www.alibabacloud.com/help/zh/model-studio/error-code")
```

#### **Response**

```
I am Qwen, a large language model developed by Tongyi Lab at Alibaba Group. I can answer questions, create text such as stories, official documents, emails, scripts, logical reasoning, and code. I can also express opinions and play games. If you have any questions or need help, feel free to ask!
```

## Java

```
// Use OpenAI Java SDK version >= 3.5.0
import com.openai.client.OpenAIClient;
import com.openai.client.okhttp.OpenAIOkHttpClient;
import com.openai.models.chat.completions.ChatCompletion;
import com.openai.models.chat.completions.ChatCompletionCreateParams;

public class Main {
    public static void main(String[] args) {
        try {
            OpenAIClient client = OpenAIOkHttpClient.builder()
                    // If you have not set an environment variable, replace the line below with .apiKey("sk-xxx")
                    // API keys differ by region. Get your API key: https://www.alibabacloud.com/help/zh/model-studio/get-api-key
                    .apiKey(System.getenv("DASHSCOPE_API_KEY"))
                    // Base URLs differ by region
                    .baseUrl("https://dashscope-intl.aliyuncs.com/compatible-mode/v1")
                    .build();

            // Create ChatCompletion parameters
            ChatCompletionCreateParams params = ChatCompletionCreateParams.builder()
                    .model("qwen3.5-plus")  // Specify model
                    .addSystemMessage("You are a helpful assistant.")
                    .addUserMessage("Who are you?")
                    .build();

            // Send request and get response
            ChatCompletion chatCompletion = client.chat().completions().create(params);
            String content = chatCompletion.choices().get(0).message().content().orElse("No valid content returned");
            System.out.println(content);
            
        } catch (Exception e) {
            System.err.println("Error: " + e.getMessage());
            System.out.println("See documentation: https://www.alibabacloud.com/help/zh/model-studio/error-code");
        }
    }
}
```

#### **Response**

```
I am Qwen, a large language model developed by Tongyi Lab at Alibaba Group. I can answer questions, create text such as stories, official documents, emails, scripts, logical reasoning, and code. I can also express opinions and play games. If you have any questions or need help, feel free to ask!
```

## Node.js

```
// Requires Node.js v18+ and runs in an ES Module environment
import OpenAI from "openai";

const openai = new OpenAI(
    {
        // API keys differ by region. Get your API key: https://www.alibabacloud.com/help/zh/model-studio/get-api-key
        // If you have not set an environment variable, replace the line below with: apiKey: "sk-xxx",
        apiKey: process.env.DASHSCOPE_API_KEY,
        // Base URLs differ by region
        baseURL: "https://dashscope-intl.aliyuncs.com/compatible-mode/v1"
        
    }
);
const completion = await openai.chat.completions.create({
    model: "qwen3.5-plus",  // Model list: https://www.alibabacloud.com/help/zh/model-studio/models
    messages: [
        { role: "system", content: "You are a helpful assistant." },
        { role: "user", content: "Who are you?" }
    ],
});
console.log(completion.choices[0].message.content);
// Uncomment the following line to view the full response
// console.log(JSON.stringify(completion, null, 4));
```

#### **Response**

```
I am Qwen, a large language model developed by Tongyi Lab at Alibaba Group. I can answer questions, create text such as stories, official documents, emails, scripts, logical reasoning, and code. I can also express opinions and play games. If you have any questions or need help, feel free to ask!
```

## Go

```
// OpenAI Go SDK version must be at least v2.4.0
package main

import (
	"context"
	// Uncomment the following lines to view the full response
	// "encoding/json"
	"fmt"
	"os"

	"github.com/openai/openai-go/v2"
	"github.com/openai/openai-go/v2/option"
)

func main() {
	// If you have not set an environment variable, replace the line below with: apiKey := "sk-xxx"
	apiKey := os.Getenv("DASHSCOPE_API_KEY")
	client := openai.NewClient(
		option.WithAPIKey(apiKey),
		// API keys differ by region. Get your API key: https://www.alibabacloud.com/help/zh/model-studio/get-api-key
		// Base URLs differ by region
		option.WithBaseURL("https://dashscope-intl.aliyuncs.com/compatible-mode/v1"),
	)
	chatCompletion, err := client.Chat.Completions.New(
		context.TODO(), openai.ChatCompletionNewParams{
			Messages: []openai.ChatCompletionMessageParamUnion{
				openai.SystemMessage("You are a helpful assistant."),
				openai.UserMessage("Who are you?"),
			},
			Model: "qwen3.5-plus",
		},
	)

	if err != nil {
		fmt.Fprintf(os.Stderr, "Request failed: %v\n", err)
		// See documentation for more error details: https://www.alibabacloud.com/help/zh/model-studio/error-code
		os.Exit(1)
	}

	if len(chatCompletion.Choices) > 0 {
		fmt.Println(chatCompletion.Choices[0].Message.Content)
	}
	// Uncomment the following lines to view the full response
	// jsonData, _ := json.MarshalIndent(chatCompletion, "", "  ")
	// fmt.Println(string(jsonData))

}
```

#### **Response**

```
I am Qwen, a large language model developed by Tongyi Lab at Alibaba Group. I can answer questions, create text such as stories, official documents, emails, scripts, logical reasoning, and code. I can also express opinions and play games. If you have any questions or need help, feel free to ask!
```

## C# (HTTP)

```
using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;

class Program
{
    private static readonly HttpClient httpClient = new HttpClient();

    static async Task Main(string[] args)
    {
        // If you have not set an environment variable, replace the line below with: string? apiKey = "sk-xxx";
        string? apiKey = Environment.GetEnvironmentVariable("DASHSCOPE_API_KEY");
        // Base URLs differ by region
        string url = "https://dashscope-intl.aliyuncs.com/compatible-mode/v1/chat/completions";
        // Model list: https://www.alibabacloud.com/help/zh/model-studio/getting-started/models
        string jsonContent = @"{
            ""model"": ""qwen3.5-plus"",
            ""messages"": [
                {
                    ""role"": ""system"",
                    ""content"": ""You are a helpful assistant.""
                },
                {
                    ""role"": ""user"", 
                    ""content"": ""Who are you?""
                }
            ]
        }";

        // Send request and get response
        string result = await SendPostRequestAsync(url, jsonContent, apiKey);
        
        // Uncomment the following line to view the full response
        // Console.WriteLine(result);

        // Parse JSON and output only the content
        using JsonDocument doc = JsonDocument.Parse(result);
        JsonElement root = doc.RootElement;
        
        if (root.TryGetProperty("choices", out JsonElement choices) && 
            choices.GetArrayLength() > 0)
        {
            JsonElement firstChoice = choices[0];
            if (firstChoice.TryGetProperty("message", out JsonElement message) &&
                message.TryGetProperty("content", out JsonElement content))
            {
                Console.WriteLine(content.GetString());
            }
        }
    }

    private static async Task<string> SendPostRequestAsync(string url, string jsonContent, string apiKey)
    {
        using (var content = new StringContent(jsonContent, Encoding.UTF8, "application/json"))
        {
            httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", apiKey);
            httpClient.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));
            HttpResponseMessage response = await httpClient.PostAsync(url, content);
            if (response.IsSuccessStatusCode)
            {
                return await response.Content.ReadAsStringAsync();
            }
            else
            {   
                // See documentation for more error details: https://www.alibabacloud.com/help/zh/model-studio/error-code
                return $"Request failed: {response.StatusCode}";
            }
        }
    }
}
```

#### **Response**

```
I am Qwen, a large language model developed by Tongyi Lab at Alibaba Group. I can answer questions, create text such as stories, official documents, emails, scripts, logical reasoning, and code. I can also express opinions and play games. If you have any questions or need help, feel free to ask!
```

## PHP (HTTP)

```
<?php
// Set the request URL
// Base URLs differ by region
$url = 'https://dashscope-intl.aliyuncs.com/compatible-mode/v1/chat/completions';
// API keys differ by region. Get your API key: https://www.alibabacloud.com/help/zh/model-studio/get-api-key
// If you have not set an environment variable, replace the line below with: $apiKey = "sk-xxx";
$apiKey = getenv('DASHSCOPE_API_KEY');
// Set request headers
$headers = [
    'Authorization: Bearer '.$apiKey,
    'Content-Type: application/json'
];
// Set request body
$data = [
    "model" => "qwen3.5-plus",
    "messages" => [
        [
            "role" => "system",
            "content" => "You are a helpful assistant."
        ],
        [
            "role" => "user",
            "content" => "Who are you?"
        ]
    ]
];
// Initialize cURL session
$ch = curl_init();
// Set cURL options
curl_setopt($ch, CURLOPT_URL, $url);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
// Execute cURL session
$response = curl_exec($ch);
// Check for errors
// See documentation for more error details: https://www.alibabacloud.com/help/zh/model-studio/error-code
if (curl_errno($ch)) {
    echo 'Curl error: ' . curl_error($ch);
}
// Close cURL resource
curl_close($ch);
// Output response
$dataObject = json_decode($response);
$content = $dataObject->choices[0]->message->content;
echo $content;
// Uncomment the following line to view the full response
//echo $response;
?>
```

#### **Response**

```
I am Qwen, a large language model developed by Tongyi Lab at Alibaba Group. I can answer questions, create text such as stories, official documents, emails, scripts, logical reasoning, and code. I can also express opinions and play games. If you have any questions or need help, feel free to ask!
```

## curl

Base URLs and API keys differ by region. For details, see [OpenAI Chat](/help/en/model-studio/qwen-api-via-openai-chat-completions) and [Get an API Key](/help/en/model-studio/get-api-key).

```
curl -X POST https://dashscope-intl.aliyuncs.com/compatible-mode/v1/chat/completions \
-H "Authorization: Bearer $DASHSCOPE_API_KEY" \
-H "Content-Type: application/json" \
-d '{
    "model": "qwen3.5-plus",
    "messages": [
        {
            "role": "system",
            "content": "You are a helpful assistant."
        },
        {
            "role": "user", 
            "content": "Who are you?"
        }
    ]
}'
```

#### **Response**

```
{
    "choices": [
        {
            "message": {
                "role": "assistant",
                "content": "I am Qwen, a large language model developed by Tongyi Lab at Alibaba Group. I can answer questions, create text such as stories, official documents, emails, scripts, logical reasoning, and code. I can also express opinions and play games. If you have any questions or need help, feel free to ask!"
            },
            "finish_reason": "stop",
            "index": 0,
            "logprobs": null
        }
    ],
    "object": "chat.completion",
    "usage": {
        "prompt_tokens": 26,
        "completion_tokens": 66,
        "total_tokens": 92
    },
    "created": 1726127645,
    "system_fingerprint": null,
    "model": "qwen3.5-plus",
    "id": "chatcmpl-81951b98-28b8-9659-ab07-xxxxxx"
}
```

## DashScope

> The DashScope API for Qwen3.5 uses a multimodal interface; the examples below will cause a `url error`. See [Image and Video Processing](#270b260cb6or2) for correct usage.

## Python

```
import json
import os
from dashscope import Generation
import dashscope

# Base URLs differ by region
dashscope.base_http_api_url = "https://dashscope-intl.aliyuncs.com/api/v1"

messages = [
    {"role": "system", "content": "You are a helpful assistant."},
    {"role": "user", "content": "Who are you?"},
]
response = Generation.call(
    # API keys differ by region. Get your API key: https://www.alibabacloud.com/help/zh/model-studio/get-api-key
    # If you have not set an environment variable, replace the line below with: api_key = "sk-xxx",
    api_key=os.getenv("DASHSCOPE_API_KEY"),
    model="qwen-plus",
    messages=messages,
    result_format="message",
)

if response.status_code == 200:
    print(response.output.choices[0].message.content)
    # Uncomment the following line to view the full response
    # print(json.dumps(response, default=lambda o: o.__dict__, indent=4))
else:
    print(f"HTTP status code: {response.status_code}")
    print(f"Error code: {response.code}")
    print(f"Error: {response.message}")
    print("See documentation: https://www.alibabacloud.com/help/zh/model-studio/error-code")
```

#### **Response**

```
I am Qwen, a large language model developed by Tongyi Lab at Alibaba Group. I can answer questions, create text such as stories, official documents, emails, scripts, logical reasoning, and code. I can also express opinions and play games. If you have any questions or need help, feel free to ask!
```

## Java

```
import java.util.Arrays;
import java.lang.System;
import com.alibaba.dashscope.aigc.generation.Generation;
import com.alibaba.dashscope.aigc.generation.GenerationParam;
import com.alibaba.dashscope.aigc.generation.GenerationResult;
import com.alibaba.dashscope.common.Message;
import com.alibaba.dashscope.common.Role;
import com.alibaba.dashscope.exception.ApiException;
import com.alibaba.dashscope.exception.InputRequiredException;
import com.alibaba.dashscope.exception.NoApiKeyException;
import com.alibaba.dashscope.protocol.Protocol;
import com.alibaba.dashscope.utils.JsonUtils;

public class Main {
    public static GenerationResult callWithMessage() throws ApiException, NoApiKeyException, InputRequiredException {
        // Base URLs differ by region
        Generation gen = new Generation(Protocol.HTTP.getValue(), "https://dashscope-intl.aliyuncs.com/api/v1");
        Message systemMsg = Message.builder()
                .role(Role.SYSTEM.getValue())
                .content("You are a helpful assistant.")
                .build();
        Message userMsg = Message.builder()
                .role(Role.USER.getValue())
                .content("Who are you?")
                .build();
        GenerationParam param = GenerationParam.builder()
                // API keys differ by region. Get your API key: https://www.alibabacloud.com/help/zh/model-studio/get-api-key
                // If you have not set an environment variable, replace the line below with: .apiKey("sk-xxx")
                .apiKey(System.getenv("DASHSCOPE_API_KEY"))
                .model("qwen-plus")
                .messages(Arrays.asList(systemMsg, userMsg))
                .resultFormat(GenerationParam.ResultFormat.MESSAGE)
                .build();
        return gen.call(param);
    }
    public static void main(String[] args) {
        try {
            GenerationResult result = callWithMessage();
            System.out.println(result.getOutput().getChoices().get(0).getMessage().getContent());
            // Uncomment the following line to view the full response
            // System.out.println(JsonUtils.toJson(result));
        } catch (ApiException | NoApiKeyException | InputRequiredException e) {
            System.err.println("Error: "+e.getMessage());
            System.out.println("See documentation: https://www.alibabacloud.com/help/zh/model-studio/error-code");
        }
    }
}
```

#### **Response**

```
I am Qwen, a large language model developed by Tongyi Lab at Alibaba Group. I can answer questions, create text such as stories, official documents, emails, scripts, logical reasoning, and code. I can also express opinions and play games. If you have any questions or need help, feel free to ask!
```

## Node.js (HTTP)

```
// Requires Node.js v18+
// If you have not set an environment variable, replace the line below with: const apiKey = "sk-xxx";
const apiKey = process.env.DASHSCOPE_API_KEY;

const data = {
    model: "qwen-plus",
    input: {
        messages: [
            {
                role: "system",
                content: "You are a helpful assistant."
            },
            {
                role: "user",
                content: "Who are you?"
            }
        ]
    },
    parameters: {
        result_format: "message"
    }
};

async function callApi() {
    try {
            // Base URLs differ by region
            const response = await fetch('https://dashscope-intl.aliyuncs.com/api/v1/services/aigc/text-generation/generation', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        const result = await response.json();
        console.log(result.output.choices[0].message.content);
        // Uncomment the following line to view the full response
        // console.log(JSON.stringify(result));
    } catch (error) {
        // See documentation for more error details: https://www.alibabacloud.com/help/zh/model-studio/error-code
        console.error('Call failed:', error.message);
    }
}

callApi();
```

#### **Response**

```
I am Qwen, a large language model developed by Tongyi Lab at Alibaba Group. I can answer questions, create text such as stories, official documents, emails, scripts, logical reasoning, and code. I can also express opinions and play games. If you have any questions or need help, feel free to ask!
```

## Go (HTTP)

```
package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
)

func main() {
	requestBody := map[string]interface{}{
		"model": "qwen-plus",
		"input": map[string]interface{}{
			"messages": []map[string]string{
				{
					"role":    "system",
					"content": "You are a helpful assistant.",
				},
				{
					"role":    "user",
					"content": "Who are you?",
				},
			},
		},
		"parameters": map[string]string{
			"result_format": "message",
		},
	}

	// Serialize to JSON
	jsonData, _ := json.Marshal(requestBody)

	// Create HTTP client and request
	client := &http.Client{}
	// Base URLs differ by region
	req, _ := http.NewRequest("POST", "https://dashscope-intl.aliyuncs.com/api/v1/services/aigc/text-generation/generation", bytes.NewBuffer(jsonData))

	// Set request headers
	apiKey := os.Getenv("DASHSCOPE_API_KEY")
	req.Header.Set("Authorization", "Bearer "+apiKey)
	req.Header.Set("Content-Type", "application/json")

	// Send request
	resp, err := client.Do(req)
	if err != nil {
		log.Fatal(err)
	}
	defer resp.Body.Close()

	// Read response body
	bodyText, _ := io.ReadAll(resp.Body)

	// Parse JSON and output content
	var result map[string]interface{}
	json.Unmarshal(bodyText, &result)
	content := result["output"].(map[string]interface{})["choices"].([]interface{})[0].(map[string]interface{})["message"].(map[string]interface{})["content"].(string)
	fmt.Println(content)

	// Uncomment the following line to view the full response
	// fmt.Printf("%s\n", bodyText)
}
```

#### **Response**

```
I am Qwen, a large language model developed by Tongyi Lab at Alibaba Group. I can answer questions, create text such as stories, official documents, emails, scripts, logical reasoning, and code. I can also express opinions and play games. If you have any questions or need help, feel free to ask!
```

## C# (HTTP)

```
using System.Net.Http.Headers;
using System.Text;

class Program
{
    private static readonly HttpClient httpClient = new HttpClient();

    static async Task Main(string[] args)
    {
        // API keys differ by region. Get your API key: https://www.alibabacloud.com/help/zh/model-studio/get-api-key
        // If you have not set an environment variable, replace the line below with: string? apiKey = "sk-xxx";
        string? apiKey = Environment.GetEnvironmentVariable("DASHSCOPE_API_KEY");
        // Set request URL and content
        // Base URLs differ by region
        string url = "https://dashscope-intl.aliyuncs.com/api/v1/services/aigc/text-generation/generation";
        string jsonContent = @"{
            ""model"": ""qwen-plus"",
            ""input"": {
                ""messages"": [
                    {
                        ""role"": ""system"",
                        ""content"": ""You are a helpful assistant.""
                    },
                    {
                        ""role"": ""user"",
                        ""content"": ""Who are you?""
                    }
                ]
            },
            ""parameters"": {
                ""result_format"": ""message""
            }
        }";

        // Send request and get response
        string result = await SendPostRequestAsync(url, jsonContent, apiKey);
        var jsonResult = System.Text.Json.JsonDocument.Parse(result);
        var content = jsonResult.RootElement.GetProperty("output").GetProperty("choices")[0].GetProperty("message").GetProperty("content").GetString();
        Console.WriteLine(content);
        // Uncomment the following line to view the full response
        // Console.WriteLine(result);
    }

    private static async Task<string> SendPostRequestAsync(string url, string jsonContent, string apiKey)
    {
        using (var content = new StringContent(jsonContent, Encoding.UTF8, "application/json"))
        {
            // Set request headers
            httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", apiKey);
            httpClient.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

            // Send request and get response
            HttpResponseMessage response = await httpClient.PostAsync(url, content);

            // Handle response
            if (response.IsSuccessStatusCode)
            {
                return await response.Content.ReadAsStringAsync();
            }
            else
            {
                return $"Request failed: {response.StatusCode}";
            }
        }
    }
}
```

#### **Response**

```
{
    "output": {
        "choices": [
            {
                "finish_reason": "stop",
                "message": {
                    "role": "assistant",
                    "content": "I am Qwen, a large language model developed by Tongyi Lab at Alibaba Group. I can answer questions, create text such as stories, official documents, emails, scripts, logical reasoning, and code. I can also express opinions and play games. If you have any questions or need help, feel free to ask!"
                }
            }
        ]
    },
    "usage": {
        "total_tokens": 92,
        "output_tokens": 66,
        "input_tokens": 26
    },
    "request_id": "09dceb20-ae2e-999b-85f9-xxxxxx"
}
```

## PHP (HTTP)

```
<?php
// Base URLs differ by region
$url = "https://dashscope-intl.aliyuncs.com/api/v1/services/aigc/text-generation/generation";
// Get your API key: https://www.alibabacloud.com/help/zh/model-studio/get-api-key
$apiKey = getenv('DASHSCOPE_API_KEY');

$data = [
    "model" => "qwen-plus",
    "input" => [
        "messages" => [
            [
                "role" => "system",
                "content" => "You are a helpful assistant."
            ],
            [
                "role" => "user",
                "content" => "Who are you?"
            ]
        ]
    ],
    "parameters" => [
        "result_format" => "message"
    ]
];

$jsonData = json_encode($data);

$ch = curl_init($url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, $jsonData);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    "Authorization: Bearer $apiKey",
    "Content-Type: application/json"
]);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);

if ($httpCode == 200) {
    $jsonResult = json_decode($response, true);
    $content = $jsonResult['output']['choices'][0]['message']['content'];
    echo $content;
    // Uncomment the following line to view the full response
    // echo "Model response: " . $response;
} else {
    echo "Request error: " . $httpCode . " - " . $response;
}

curl_close($ch);
?>
```

#### **Response**

```
I am Qwen, a large language model developed by Tongyi Lab at Alibaba Group. I can answer questions, create text such as stories, official documents, emails, scripts, logical reasoning, and code. I can also express opinions and play games. If you have any questions or need help, feel free to ask!
```

## curl

Base URLs and API keys differ by region. For details, see [DashScope](/help/en/model-studio/qwen-api-via-dashscope) and [Get an API Key](/help/en/model-studio/get-api-key).

```
curl --location "https://dashscope-intl.aliyuncs.com/api/v1/services/aigc/text-generation/generation" \
--header "Authorization: Bearer $DASHSCOPE_API_KEY" \
--header "Content-Type: application/json" \
--data '{
    "model": "qwen-plus",
    "input":{
        "messages":[      
            {
                "role": "system",
                "content": "You are a helpful assistant."
            },
            {
                "role": "user",
                "content": "Who are you?"
            }
        ]
    },
    "parameters": {
        "result_format": "message"
    }
}'
```

#### **Response**

```
{
    "output": {
        "choices": [
            {
                "finish_reason": "stop",
                "message": {
                    "role": "assistant",
                    "content": "I am Qwen, a large language model developed by Tongyi Lab at Alibaba Group. I can answer questions, create text such as stories, official documents, emails, scripts, logical reasoning, and code. I can also express opinions and play games. If you have any questions or need help, feel free to ask!"
                }
            }
        ]
    },
    "usage": {
        "total_tokens": 92,
        "output_tokens": 66,
        "input_tokens": 26
    },
    "request_id": "09dceb20-ae2e-999b-85f9-xxxxxx"
}
```

## **Image and Video Processing**

Multimodal models accept non-text data, such as images and videos. They support tasks such as visual question answering and event detection. Their usage differs from text-only models in two main ways:

-   **How to construct user messages**: User messages for multimodal models include text along with images, audio, or other modalities.
    
-   **DashScope SDK interfaces**: When using the DashScope Python SDK, call the `MultiModalConversation` interface. When using the DashScope Java SDK, call the `MultiModalConversation` class.
    

> For image and video file limits, see [Image and Video Understanding](/help/en/model-studio/vision#430cb5ea4cety).

## OpenAI Compatible – Chat Completions API

## Python

```
from openai import OpenAI
import os

client = OpenAI(
    # API keys differ by region. Get your API key: https://www.alibabacloud.com/help/zh/model-studio/get-api-key
    # If you have not set an environment variable, replace the line below with: api_key="sk-xxx"
    api_key=os.getenv("DASHSCOPE_API_KEY"),
    # Base URLs differ by region
    base_url="https://dashscope-intl.aliyuncs.com/compatible-mode/v1"
)
messages = [
    {
        "role": "user",
        "content": [
            {
                "type": "image_url",
                "image_url": {
                    "url": "https://help-static-aliyun-doc.aliyuncs.com/file-manage-files/zh-CN/20251031/ownrof/f26d201b1e3f4e62ab4a1fc82dd5c9bb.png"
                },
            },
            {"type": "text", "text": "What products are shown in the image?"},
        ],
    }
]
completion = client.chat.completions.create(
    model="qwen3.5-plus",  # Replace with another multimodal model as needed, and update the messages accordingly
    messages=messages,
)
print(completion.choices[0].message.content)
```

## Node.js

```
import OpenAI from "openai";

const openai = new OpenAI(
    {
        // API keys differ by region. Get your API key: https://www.alibabacloud.com/help/zh/model-studio/get-api-key
        // If you have not set an environment variable, replace the line below with: apiKey: "sk-xxx",
        apiKey: process.env.DASHSCOPE_API_KEY,
        // Base URLs differ by region
        baseURL: "https://dashscope-intl.aliyuncs.com/compatible-mode/v1"
    }
);

let messages = [
    {
        role: "user",
        content: [
            { type: "image_url", image_url: { "url": "https://help-static-aliyun-doc.aliyuncs.com/file-manage-files/zh-CN/20251031/ownrof/f26d201b1e3f4e62ab4a1fc82dd5c9bb.png" } },
            { type: "text", text: "What products are shown in the image?" },
        ]
    }]
async function main() {
    let response = await openai.chat.completions.create({
        model: "qwen3.5-plus",   // Replace with another multimodal model as needed, and update the messages accordingly
        messages: messages
    });
    console.log(response.choices[0].message.content);
}

main()
```

## curl

Base URLs and API keys differ by region. For details, see [OpenAI Chat](/help/en/model-studio/qwen-api-via-openai-chat-completions) and [Get an API Key](/help/en/model-studio/get-api-key).

```
curl -X POST https://dashscope-intl.aliyuncs.com/compatible-mode/v1/chat/completions \
-H "Authorization: Bearer $DASHSCOPE_API_KEY" \
-H 'Content-Type: application/json' \
-d '{
  "model": "qwen3.5-plus",
  "messages": [
    {
      "role": "user",
      "content": [
        {
          "type": "image_url",
          "image_url": {
            "url": "https://help-static-aliyun-doc.aliyuncs.com/file-manage-files/zh-CN/20251031/ownrof/f26d201b1e3f4e62ab4a1fc82dd5c9bb.png"
          }
        },
        {
          "type": "text",
          "text": "What products are shown in the image?"
        }
      ]
    }
  ]
}'
```

## DashScope

## Python

```
import os
from dashscope import MultiModalConversation
import dashscope
# Base URLs differ by region
dashscope.base_http_api_url = 'https://dashscope-intl.aliyuncs.com/api/v1'

messages = [
    {
        "role": "user",
        "content": [
            {
                "image": "https://help-static-aliyun-doc.aliyuncs.com/file-manage-files/zh-CN/20251031/ownrof/f26d201b1e3f4e62ab4a1fc82dd5c9bb.png"
            },
            {"text": "What products are shown in the image?"},
        ],
    }
]
response = MultiModalConversation.call(
    # API keys differ by region. Get your API key: https://www.alibabacloud.com/help/zh/model-studio/get-api-key
    # If you have not set an environment variable, replace the line below with: api_key="sk-xxx",
    api_key=os.getenv('DASHSCOPE_API_KEY'),
    model='qwen3.5-plus',  # Replace with another multimodal model as needed, and update the messages accordingly
    messages=messages
)

print(response.output.choices[0].message.content[0]['text'])
```

## Java

```
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;

import com.alibaba.dashscope.aigc.multimodalconversation.MultiModalConversation;
import com.alibaba.dashscope.aigc.multimodalconversation.MultiModalConversationParam;
import com.alibaba.dashscope.aigc.multimodalconversation.MultiModalConversationResult;
import com.alibaba.dashscope.common.MultiModalMessage;
import com.alibaba.dashscope.common.Role;
import com.alibaba.dashscope.exception.ApiException;
import com.alibaba.dashscope.exception.NoApiKeyException;
import com.alibaba.dashscope.exception.UploadFileException;
import com.alibaba.dashscope.utils.Constants;

public class Main {
    static {
        // Base URLs differ by region
        Constants.baseHttpApiUrl = "https://dashscope-intl.aliyuncs.com/api/v1";
    }

    private static final String modelName = "qwen3.5-plus";  // Replace with another multimodal model as needed, and update the messages accordingly

    public static void MultiRoundConversationCall() throws ApiException, NoApiKeyException, UploadFileException {
        MultiModalConversation conv = new MultiModalConversation();
        MultiModalMessage userMessage = MultiModalMessage.builder().role(Role.USER.getValue())
                .content(Arrays.asList(Collections.singletonMap("image", "https://help-static-aliyun-doc.aliyuncs.com/file-manage-files/zh-CN/20251031/ownrof/f26d201b1e3f4e62ab4a1fc82dd5c9bb.png"),
                        Collections.singletonMap("text", "What products are shown in the image?"))).build();
        List<MultiModalMessage> messages = new ArrayList<>();
        messages.add(userMessage);
        MultiModalConversationParam param = MultiModalConversationParam.builder()
                // API keys differ by region. Get your API key: https://www.alibabacloud.com/help/zh/model-studio/get-api-key
                // If you have not set an environment variable, replace the line below with: .apiKey("sk-xxx")
                .apiKey(System.getenv("DASHSCOPE_API_KEY"))
                .model(modelName)
                .messages(messages)
                .build();
        MultiModalConversationResult result = conv.call(param);
        System.out.println(result.getOutput().getChoices().get(0).getMessage().getContent().get(0).get("text"));        // add the result to conversation
    }

    public static void main(String[] args) {
        try {
            MultiRoundConversationCall();
        } catch (ApiException | NoApiKeyException | UploadFileException e) {
            System.out.println(e.getMessage());
        }
        System.exit(0);
    }
}
```

## curl

Base URLs and API keys differ by region. For details, see [DashScope](/help/en/model-studio/qwen-api-via-dashscope) and [Get an API Key](/help/en/model-studio/get-api-key).

```
curl -X POST https://dashscope-intl.aliyuncs.com/api/v1/services/aigc/multimodal-generation/generation \
-H "Authorization: Bearer $DASHSCOPE_API_KEY" \
-H 'Content-Type: application/json' \
-d '{
    "model": "qwen3.5-plus",
    "input":{
        "messages":[
            {
                "role": "user",
                "content": [
                    {"image": "https://help-static-aliyun-doc.aliyuncs.com/file-manage-files/zh-CN/20251031/ownrof/f26d201b1e3f4e62ab4a1fc82dd5c9bb.png"},
                    {"text": "What products are shown in the image?"}
                ]
            }
        ]
    }
}'
```

## **Asynchronous Model Calls**

Asynchronous APIs improve throughput for high-concurrency requests.

## OpenAI Compatible – Chat Completions API

## Python

```
import os
import asyncio
from openai import AsyncOpenAI
import platform

# Create an asynchronous client instance
client = AsyncOpenAI(
    # API keys differ by region. Get your API key: https://www.alibabacloud.com/help/zh/model-studio/get-api-key
    # If you have not set an environment variable, replace the line below with: api_key="sk-xxx",
    api_key=os.getenv("DASHSCOPE_API_KEY"),
    # Base URLs differ by region
    base_url="https://dashscope-intl.aliyuncs.com/compatible-mode/v1"
)

# Define an asynchronous task list
async def task(question):
    print(f"Send question: {question}")
    response = await client.chat.completions.create(
        messages=[
            {"role": "user", "content": question}
        ],
        model="qwen-plus",  # Model list: https://www.alibabacloud.com/help/zh/model-studio/getting-started/models
    )
    print(f"Model response: {response.choices[0].message.content}")

# Main asynchronous function
async def main():
    questions = ["Who are you?", "What can you do?", "What is the weather like?"]
    tasks = [task(q) for q in questions]
    await asyncio.gather(*tasks)

if __name__ == '__main__':
    # Set event loop policy
    if platform.system() == 'Windows':
        asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())
    # Run the main coroutine
    asyncio.run(main(), debug=False)
    
```

## Java

```
import com.openai.client.OpenAIClientAsync;
import com.openai.client.okhttp.OpenAIOkHttpClientAsync;
import com.openai.models.chat.completions.ChatCompletionCreateParams;

import java.util.Arrays;
import java.util.List;
import java.util.concurrent.CompletableFuture;

public class Main {
    public static void main(String[] args) {
        // Create an OpenAI client connected to DashScope's compatibility endpoint
        OpenAIClientAsync client = OpenAIOkHttpClientAsync.builder()
                // API keys differ by region. Get your API key: https://www.alibabacloud.com/help/zh/model-studio/get-api-key
                // If you have not set an environment variable, replace the line below with .apiKey("sk-xxx")
                .apiKey(System.getenv("DASHSCOPE_API_KEY"))
                // Base URLs differ by region
                .baseUrl("https://dashscope-intl.aliyuncs.com/compatible-mode/v1")
                .build();

        // Define a list of questions
        List<String> questions = Arrays.asList("Who are you?", "What can you do?", "What is the weather like?");

        // Create a list of asynchronous tasks
        CompletableFuture<?>[] futures = questions.stream()
                .map(question -> CompletableFuture.supplyAsync(() -> {
                    System.out.println("Send question: " + question);
                    // Create ChatCompletion parameters
                    ChatCompletionCreateParams params = ChatCompletionCreateParams.builder()
                            .model("qwen-plus")  // Specify model
                            .addSystemMessage("You are a helpful assistant.")
                            .addUserMessage(question)
                            .build();

                    // Send asynchronous request and handle response
                    return client.chat().completions().create(params)
                        .thenAccept(chatCompletion -> {
                            String content = chatCompletion.choices().get(0).message().content().orElse("No response content");
                            System.out.println("Model response: " + content);
                        })
                        .exceptionally(e -> {
                            System.err.println("Error: " + e.getMessage());
                            System.out.println("See documentation: https://www.alibabacloud.com/help/zh/model-studio/error-code");
                            return null;
                        });
                }).thenCompose(future -> future))
                .toArray(CompletableFuture[]::new);

        // Wait for all asynchronous operations to complete
        CompletableFuture.allOf(futures).join();
    }
}
```

## DashScope

The DashScope SDK supports asynchronous text generation calls only in Python.

```
# DashScope Python SDK version must be at least 1.19.0
import asyncio
import platform
from dashscope.aigc.generation import AioGeneration
import os
import dashscope
# Base URLs differ by region
dashscope.base_http_api_url = 'https://dashscope-intl.aliyuncs.com/api/v1'

# Define an asynchronous task list
async def task(question):
    print(f"Send question: {question}")
    response = await AioGeneration.call(
        # If you have not set an environment variable, replace the line below with: api_key="sk-xxx",
        api_key=os.getenv("DASHSCOPE_API_KEY"),
        model="qwen-plus",  # Model list: https://www.alibabacloud.com/help/zh/model-studio/models
        messages=[{"role": "system", "content": "You are a helpful assistant."},
                  {"role": "user", "content": question}],
        result_format="message",
    )
    print(f"Model response: {response.output.choices[0].message.content}")

# Main asynchronous function
async def main():
    questions = ["Who are you?", "What can you do?", "What is the weather like?"]
    tasks = [task(q) for q in questions]
    await asyncio.gather(*tasks)

if __name__ == '__main__':
    # Set event loop policy
    if platform.system() == 'Windows':
        asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())
    # Run the main coroutine
    asyncio.run(main(), debug=False)
```

**Response**

> Because the call is asynchronous, the order of the responses may differ from the example.

```
Send question: Who are you?
Send question: What can you do?
Send question: What is the weather like?
Model response: Hello! I am Qwen, a large language model developed by Tongyi Lab at Alibaba Group. I can answer questions, create text such as stories, official documents, emails, scripts, logical reasoning, and code. I can also express opinions and play games. If you have any questions or need help, feel free to ask!
Model response: I cannot access real-time weather information. Please tell me your city or region, and I will try to provide general weather advice. Or check a weather app for live conditions.
Model response: I have many skills, such as:

1. **Answer questions**: I can help with academic, everyday, or professional questions.
2. **Create text**: I can write stories, official documents, emails, scripts, and more.
3. **Logical reasoning**: I can solve math problems, riddles, and logic puzzles.
4. **Programming**: I can help write, debug, and optimize code.
5. **Multilingual support**: I support Chinese, English, French, Spanish, and more.
6. **Express opinions**: I can provide views and suggestions to help you decide.
7. **Play games**: We can play word games like riddles or idiom chains.

Let me know if you need help with anything specific!
```

## Going Live

### **Build High-Quality Context**

Feeding raw data directly to a large language model increases costs and reduces quality because of context-length limits. Context engineering improves output quality and efficiency by dynamically loading precise knowledge. The core techniques include the following:

-   **Prompt engineering**: Design and refine text instructions (prompts) to guide the model toward the desired outputs. For more information, see [Text-to-Text Prompt Guide](/help/en/model-studio/prompt-engineering-guide)
    
-   [Retrieval-augmented generation (RAG)](/help/en/model-studio/rag-knowledge-base): Use this technique when the model must answer questions using external knowledge bases, such as product documentation or technical manuals.
    
-   [Tool calling](/help/en/model-studio/tool-calls/): Allows the model to fetch real-time data, such as weather or traffic, or perform actions, such as calling an API or sending an email.
    
-   **Memory mechanisms**: Provide the model with short-term and long-term memory to understand conversation history.
    

### **Control Response Diversity**

The `temperature` and `top_p` parameters control the diversity of the generated text. Higher values increase diversity, and lower values increase predictability. To assess the effects of these parameters, adjust only one at a time.

-   `**temperature**`: A value in the range of \[0, 2) that adjusts randomness.
    
-   `**top_p**`: A value in the range of \[0, 1\] that filters responses by a probability threshold.
    

The following examples show how different settings affect the output. The prompt is: "Write a three-sentence story starring a cat and a sunbeam."

-   **High diversity** (for example, `temperature`\=0.9): Use this setting for creative writing, brainstorming, or marketing copy where novelty and imagination are important.
    
    ```
    Sunlight sliced through the window, and the ginger cat crept toward the glowing square, its fur instantly gilded like molten honey.  
    It tapped the light with a paw, sinking into warmth as if stepping into a sunlit pool, and the golden tide flowed up its spine.  
    The afternoon grew heavy—the cat curled in liquid gold, hearing time melt softly in its purr.
    ```
    
-   **High predictability** (for example, `temperature`\=0.1): Use this setting for factual Q&A, code generation, or legal text where accuracy and consistency are critical.
    
    ```
    An old cat napped on the windowsill, counting sunbeams.  
    The sunlight hopped across its mottled back like pages turning in an old photo album.  
    Dust rose and settled, whispering: you were young once, and I burned bright.
    ```
    

**How it works**

**temperature**:

-   A higher temperature flattens the token probability distribution. This makes high-probability tokens less likely and low-probability tokens more likely, which causes the model to be more random when it chooses the next token.
    
-   A lower temperature sharpens the token probability distribution. This makes high-probability tokens even more likely and low-probability tokens less likely, which causes the model to favor high-probability tokens.
    

**top\_p**:

Top-p sampling selects from the smallest set of top tokens whose cumulative probability exceeds a specified threshold, such as 0.8. This method sorts all possible next tokens by probability and then accumulates the probabilities from highest to lowest until the sum reaches the threshold. The model then randomly selects one token from this set.

-   A higher top\_p value considers more tokens, which increases diversity.
    
-   A lower top\_p value considers fewer tokens, which increases focus and predictability.
    

**Parameter settings for common scenarios**

```
# Recommended parameter settings for different scenarios
SCENARIO_CONFIGS = {
    # Creative writing
    "creative_writing": {
        "temperature": 0.9,
        "top_p": 0.95
    },
    # Code generation
    "code_generation": {
        "temperature": 0.2,
        "top_p": 0.8
    },
    # Factual Q&A
    "factual_qa": {
        "temperature": 0.1,
        "top_p": 0.7
    },
    # Translation
    "translation": {
        "temperature": 0.3,
        "top_p": 0.8
    }
}

# OpenAI usage example
# completion = client.chat.completions.create(
#     model="qwen-plus",
#     messages=[{"role": "user", "content": "Write a poem about the moon"}],
#     **SCENARIO_CONFIGS["creative_writing"]
# )
# DashScope usage example
# response = Generation.call(
#     # If you have not set an environment variable, replace the line below with: api_key = "sk-xxx",
#     api_key=os.getenv("DASHSCOPE_API_KEY"),
#     model="qwen-plus",
#     messages=[{"role": "user", "content": "Write a Python function that checks if input n is prime. Output only code."}],
#     result_format="message",
#     **SCENARIO_CONFIGS["code_generation"]
# )
```

### **More features**

The previous sections cover basic interactions. For complex scenarios, see the following topics:

-   [Multi-turn conversations](/help/en/model-studio/multi-round-conversation): Use this feature for follow-up questions or information gathering that requires continuous dialogue.
    
-   [Streaming output](/help/en/model-studio/stream): Use this feature for chatbots or real-time code generation to improve the user experience and avoid timeouts caused by long responses.
    
-   [Deep thinking](/help/en/model-studio/deep-thinking): Use this feature for complex reasoning or policy analysis that requires high-quality, structured answers.
    
-   [Structured output](/help/en/model-studio/qwen-structured-output): Use this feature when you need the model to reply in a stable JSON format for programmatic use or data parsing.
    
-   [Partial mode](/help/en/model-studio/partial-mode): Use this feature for code completion or long-form writing where the model continues from existing text.
    

## API Reference

For a complete list of model invocation parameters, see [OpenAI Compatible API Reference](/help/en/model-studio/qwen-api-reference/#d397bcc41eu3q) and [DashScope API Reference](/help/en/model-studio/qwen-api-reference/#69cac67a477k2).

## **FAQ**

### **Q: Why can't the Qwen API analyze web links?**

A: The Qwen API cannot directly access or parse web links. You can use [Function Calling](/help/en/model-studio/qwen-function-calling), or combine them with web scraping tools such as Python's Beautiful Soup to read webpage content.

### **Q: Why do responses from the** [**Qwen web app**](https://tongyi.aliyun.com/qianwen/) **differ from those of the Qwen API?**

A: The Qwen web app includes additional engineering optimizations beyond the Qwen API, enabling features such as webpage parsing, web search, image drawing, and PPT creation. These capabilities are not part of the core large language model API. You can replicate them using [Function Calling](/help/en/model-studio/qwen-function-calling) to enhance model performance.

### **Q: Can the model directly generate Word, Excel, PDF, or PPT files?**

A: No, they cannot. Alibaba Cloud Model Studio text generation models output only plain text. You can convert the text to your desired format using code or third-party libraries.