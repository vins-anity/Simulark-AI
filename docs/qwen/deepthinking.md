Deep thinking models perform reasoning before generating a response. This improves accuracy for complex tasks, such as logical reasoning and numerical calculation. This topic describes how to call deep thinking models, such as Qwen and DeepSeek.

![QwQ Logo](https://assets.alicdn.com/g/qwenweb/qwen-webui-fe/0.0.54/static/favicon.png)

Qwen

Show Thinking Process ▼

 Send Virtual Request

@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } } @keyframes blink { 0%, 100% { opacity: 0; } 50% { opacity: 1; } } .arrow-up { transform: rotate(180deg); } .arrow-down { transform: rotate(0deg); } .toggle-thinking:hover { background: #e6e8eb; } .send-button:hover { transform: scale(1.05); box-shadow: 0 2px 8px rgba(79, 118, 227, 0.3); }

## **Implementation guide**

Alibaba Cloud Model Studio provides APIs for various deep thinking models. These models support two modes: hybrid-thinking and thinking-only.

-   **Hybrid-thinking mode**: Use the `enable_thinking` parameter to control whether to enable thinking mode:
    
    -   Set to `true`: The model thinks before it responds.
        
    -   Set to `false`: The model responds directly.
        
    
    ## OpenAI compatible
    
    ```
    # Import dependencies and create a client...
    completion = client.chat.completions.create(
        model="qwen-plus", # Select a model
        messages=[{"role": "user", "content": "Who are you"}],    
        # Because enable_thinking is not a standard OpenAI parameter, pass it using extra_body
        extra_body={"enable_thinking":True},
        # Call in streaming output mode
        stream=True,
        # Make the last data packet of the stream response contain token consumption information
        stream_options={
            "include_usage": True
        }
    )
    ```
    
    ## DashScope
    
    ```
    # Import dependencies...
    
    response = Generation.call(
        # If you have not configured an environment variable, replace the following line with your Model Studio API key: api_key = "sk-xxx",
        api_key=os.getenv("DASHSCOPE_API_KEY"),
        # You can replace this with another deep thinking model as needed
        model="qwen-plus",
        messages=messages,
        result_format="message",
        enable_thinking=True,
        stream=True,
        incremental_output=True
    )
    ```
    
-   **Thinking-only mode**: The model always thinks before responding, and this behavior cannot be disabled. The request format is the same as the hybrid-thinking mode, but the enable\_thinking parameter is not required.
    

The thinking process is returned in the `reasoning_content` field, and the response is returned in the `content` field. Deep thinking models reason before responding, which increases response time. Most of these models only support streaming output. Therefore, the examples in this topic use streaming calls.

## **Supported models**

## Qwen3.5

-   **Commercial edition**
    
    -   **Qwen3.5-Plus series** (hybrid-thinking mode, enabled by default): qwen3.5-plus, qwen3.5-plus-2026-02-15
        
-   **Open-source edition**
    
    -   Hybrid-thinking mode, enabled by default: qwen3.5-397b-a17b
        

## Qwen3

-   **Commercial edition**
    
    -   **Qwen-Max series** (hybrid-thinking mode, disabled by default): qwen3-max, qwen3-max-2026-01-23, qwen3-max-preview
        
    -   **Qwen-Plus series** (hybrid-thinking mode, disabled by default): qwen-plus, qwen-plus-latest, qwen-plus-2025-04-28, and later snapshot models
        
    -   **Qwen3.5 Plus series**: qwen3.5-plus, qwen3.5-plus-2026-02-15, qwen3.5-397b-a17b
        
    -   **Qwen-Flash series** (hybrid-thinking mode, disabled by default): qwen-flash, qwen-flash-2025-07-28, and later snapshot models
        
    -   **Qwen-Turbo series** (hybrid-thinking mode, disabled by default): qwen-turbo, qwen-turbo-latest, qwen-turbo-2025-04-28, and later snapshot models
        
-   **Open-source edition**
    
    -   Hybrid-thinking mode, enabled by default: qwen3-235b-a22b, qwen3-32b, qwen3-30b-a3b, qwen3-14b, qwen3-8b, qwen3-4b, qwen3-1.7b, qwen3-0.6b
        
    -   Thinking-only mode: qwen3-next-80b-a3b-thinking, qwen3-235b-a22b-thinking-2507, qwen3-30b-a3b-thinking-2507
        

## **QwQ (based on Qwen2.5)**

Thinking-only mode: qwq-plus, qwq-plus-latest, qwq-plus-2025-03-05, qwq-32b

## DeepSeek (Beijing region)

-   Hybrid-thinking mode, disabled by default: deepseek-v3.2, deepseek-v3.2-exp, deepseek-v3.1
    
-   Thinking-only mode: deepseek-r1, deepseek-r1-0528, deepseek-r1 distilled model
    

## GLM (Beijing region)

Hybrid-thinking mode, enabled by default: glm-5, glm-4.7, glm-4.6

## Kimi (Beijing region)

Thinking-only mode: kimi-k2-thinking

For more information about model names, context, prices, and snapshot versions, see [Model list](/help/en/model-studio/models). For more information about rate limiting, see [Rate limits](/help/en/model-studio/rate-limit).

## **Getting started**

Prerequisites: [Create an API key](/help/en/model-studio/get-api-key) and [set the API key as an environment variable](/help/en/model-studio/configure-api-key-through-environment-variables). If you use an SDK, you must [install the OpenAI or DashScope SDK](/help/en/model-studio/install-sdk#8833b9274f4v8) (The DashScope SDK for Java must be version 2.19.4 or later).

Run the following code to call the qwen-plus model in thinking mode with streaming output.

## OpenAI compatible

## Python

### **Sample code**

```
from openai import OpenAI
import os

# Initialize the OpenAI client
client = OpenAI(
    # If you have not configured an environment variable, replace the following with your Model Studio API key: api_key="sk-xxx"
    api_key=os.getenv("DASHSCOPE_API_KEY"),
    # The following is the base_url for the Singapore region. If you use a model in the Virginia region, replace the base_url with https://dashscope-us.aliyuncs.com/compatible-mode/v1
    # If you use a model in the Beijing region, replace the base_url with https://dashscope.aliyuncs.com/compatible-mode/v1
    base_url="https://dashscope-intl.aliyuncs.com/compatible-mode/v1",
)

messages = [{"role": "user", "content": "Who are you"}]

completion = client.chat.completions.create(
    model="qwen-plus",  # You can replace this with another deep thinking model as needed
    messages=messages,
    extra_body={"enable_thinking": True},
    stream=True,
    stream_options={
        "include_usage": True
    },
)

reasoning_content = ""  # Full thinking process
answer_content = ""  # Full response
is_answering = False  # Indicates whether the response phase has started
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

    # When content is received, start responding
    if hasattr(delta, "content") and delta.content:
        if not is_answering:
            print("\n" + "=" * 20 + "Full response" + "=" * 20 + "\n")
            is_answering = True
        print(delta.content, end="", flush=True)
        answer_content += delta.content
```

### **Response**

```
====================Thinking process====================

Okay, the user asked "Who are you", so I need to provide an accurate and friendly response. First, I need to confirm my identity, which is Qwen, developed by the Tongyi Lab under Alibaba Group. Next, I should explain my main functions, such as answering questions, creating text, and logical reasoning. At the same time, I should maintain a friendly tone and avoid being too technical to make the user feel at ease. I also need to avoid using complex terminology to ensure the response is concise and clear. In addition, I might need to add some interactive elements, inviting the user to ask questions to encourage further communication. Finally, I will check if I have missed any important information, such as my Chinese name "Qianwen" and English name "Qwen", along with my parent company and lab. I need to ensure the response is comprehensive and meets the user's expectations.
====================Full response====================

Hello! I am Qwen, an ultra-large language model independently developed by the Tongyi Lab under Alibaba Group. I can answer questions, create text, perform logical reasoning, and write code, with the goal of providing users with high-quality information and services. You can call me Qwen. How can I help you?
```

## Node.js

### **Sample code**

```
import OpenAI from "openai";
import process from 'process';

// Initialize the OpenAI client
const openai = new OpenAI({
    apiKey: process.env.DASHSCOPE_API_KEY, // Read from environment variable
    // The following is the base_url for the Singapore region. If you use a model in the Virginia region, replace the base_url with https://dashscope-us.aliyuncs.com/compatible-mode/v1 
    // If you use a model in the Beijing region, replace the base_url with https://dashscope.aliyuncs.com/compatible-mode/v1
    baseURL: 'https://dashscope-intl.aliyuncs.com/compatible-mode/v1'
});

let reasoningContent = '';
let answerContent = '';
let isAnswering = false;

async function main() {
    try {
        const messages = [{ role: 'user', content: 'Who are you' }];
        const stream = await openai.chat.completions.create({
            model: 'qwen-plus',
            messages,
            stream: true,
            enable_thinking: true
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

            // When content is received, start responding
            if (delta.content !== undefined && delta.content) {
                if (!isAnswering) {
                    console.log('\n' + '='.repeat(20) + 'Full response' + '='.repeat(20) + '\n');
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

### **Return result**

```
====================Thinking process====================

Okay, the user asked "Who are you", so I need to answer about my identity. First, I should clearly state that I am Qwen, an ultra-large language model developed by Alibaba Cloud. Next, I can mention my main functions, such as answering questions, creating text, and logical reasoning. I should also emphasize my multilingual support, including Chinese and English, so the user knows I can handle requests in different languages. In addition, I might need to explain my application scenarios, such as helping with study, work, and daily life. However, the user's question is quite direct, so I probably do not need to provide too much detailed information. I should keep it concise and clear. At the same time, I need to ensure a friendly tone and invite the user to ask further questions. I will check if I have missed any important information, such as my version or latest updates, but the user probably does not need that much detail. Finally, I will confirm that the response is accurate and contains no errors.
====================Full response====================

I am Qwen, an ultra-large language model independently developed by the Tongyi Lab under Alibaba Group. I can perform various tasks such as answering questions, creating text, logical reasoning, and coding. I support multiple languages, including Chinese and English. If you have any questions or need help, feel free to let me know!
```

## HTTP

### **Sample code**

## curl

```
# ======= Important =======
# The following is the base_url for Singapore. If you use a model in the Beijing region, replace the base_url with: https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions
# If you use a model in the Virginia region, replace the base_url with: https://dashscope-us.aliyuncs.com/compatible-mode/v1/chat/completions
# === Delete this comment before execution ===
curl -X POST https://dashscope-intl.aliyuncs.com/compatible-mode/v1/chat/completions \
-H "Authorization: Bearer $DASHSCOPE_API_KEY" \
-H "Content-Type: application/json" \
-d '{
    "model": "qwen-plus",
    "messages": [
        {
            "role": "user", 
            "content": "Who are you"
        }
    ],
    "stream": true,
    "stream_options": {
        "include_usage": true
    },
    "enable_thinking": true
}'
```

### **Response**

```
data: {"choices":[{"delta":{"content":null,"role":"assistant","reasoning_content":""},"index":0,"logprobs":null,"finish_reason":null}],"object":"chat.completion.chunk","usage":null,"created":1745485391,"system_fingerprint":null,"model":"qwen-plus","id":"chatcmpl-e2edaf2c-8aaf-9e54-90e2-b21dd5045503"}

.....

data: {"choices":[{"finish_reason":"stop","delta":{"content":"","reasoning_content":null},"index":0,"logprobs":null}],"object":"chat.completion.chunk","usage":null,"created":1745485391,"system_fingerprint":null,"model":"qwen-plus","id":"chatcmpl-e2edaf2c-8aaf-9e54-90e2-b21dd5045503"}

data: {"choices":[],"object":"chat.completion.chunk","usage":{"prompt_tokens":10,"completion_tokens":360,"total_tokens":370},"created":1745485391,"system_fingerprint":null,"model":"qwen-plus","id":"chatcmpl-e2edaf2c-8aaf-9e54-90e2-b21dd5045503"}

data: [DONE]
```

## DashScope

## Python

### **Sample code**

```
import os
from dashscope import Generation
import dashscope

# The following is the base_url for the Singapore region. If you use a model in the Virginia region, replace the base_url with https://dashscope-us.aliyuncs.com/api/v1
# If you use a model in the Beijing region, replace the base_url with https://dashscope.aliyuncs.com/api/v1
dashscope.base_http_api_url = "https://dashscope-intl.aliyuncs.com/api/v1"

messages = [{"role": "user", "content": "Who are you?"}]

completion = Generation.call(
    # If you have not configured an environment variable, replace the following line with your Model Studio API key: api_key = "sk-xxx",
    api_key=os.getenv("DASHSCOPE_API_KEY"),
    model="qwen-plus",
    messages=messages,
    result_format="message",
    enable_thinking=True,
    stream=True,
    incremental_output=True,
)

# Define the full thinking process.
reasoning_content = ""
# Define the full response.
answer_content = ""
# Determine whether the thinking process is finished and the response has started.
is_answering = False

print("=" * 20 + "Thinking process" + "=" * 20)

for chunk in completion:
    # If both the thinking process and the response are empty, ignore.
    if (
        chunk.output.choices[0].message.content == ""
        and chunk.output.choices[0].message.reasoning_content == ""
    ):
        pass
    else:
        # If it is currently the thinking process.
        if (
            chunk.output.choices[0].message.reasoning_content != ""
            and chunk.output.choices[0].message.content == ""
        ):
            print(chunk.output.choices[0].message.reasoning_content, end="", flush=True)
            reasoning_content += chunk.output.choices[0].message.reasoning_content
        # If it is currently the response.
        elif chunk.output.choices[0].message.content != "":
            if not is_answering:
                print("\n" + "=" * 20 + "Full response" + "=" * 20)
                is_answering = True
            print(chunk.output.choices[0].message.content, end="", flush=True)
            answer_content += chunk.output.choices[0].message.content

# To print the full thinking process and response, uncomment and run the following code.
# print("=" * 20 + "Full thinking process" + "=" * 20 + "\n")
# print(f"{reasoning_content}")
# print("=" * 20 + "Full response" + "=" * 20 + "\n")
# print(f"{answer_content}")

```

### **Response**

```
====================Thinking process====================
Okay, the user is asking, "Who are you?" I need to answer this question. First, I must clarify my identity: I am Qwen, a large-scale language model developed by Alibaba Cloud. Next, I need to explain my functions and uses, such as answering questions, creating text, and logical reasoning. I should also emphasize that my goal is to be a helpful assistant to the user, providing help and support.

When responding, I should maintain a conversational tone and avoid technical jargon or complex sentences. I can add friendly phrases, like "Hello there!~", to make the conversation more natural. Also, I must ensure the information is accurate and does not omit key points, such as my developer, main functions, and use cases.

I also need to consider potential follow-up questions from the user, such as specific application examples or technical details. So, I can subtly plant seeds in my response to encourage further questions. For example, mentioning "Whether it's a question about daily life or a professional topic, I can do my best to help" is both comprehensive and open-ended.

Finally, I will check if the response is fluent and free of repetitive or redundant information, ensuring it is concise and clear. I will also maintain a balance between being friendly and professional, so the user finds me both approachable and reliable.
====================Full response====================
Hello there!~ I am Qwen, a large-scale language model developed by Alibaba Cloud. I can answer questions, create text, perform logical reasoning, write code, and more, with the goal of providing help and support to users. Whether you have questions about daily life or professional topics, I will do my best to assist. How can I help you?
```

## Java

### **Sample code**

```
// DashScope SDK version >= 2.19.4
import java.util.Arrays;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import com.alibaba.dashscope.aigc.generation.Generation;
import com.alibaba.dashscope.aigc.generation.GenerationParam;
import com.alibaba.dashscope.aigc.generation.GenerationResult;
import com.alibaba.dashscope.common.Message;
import com.alibaba.dashscope.common.Role;
import com.alibaba.dashscope.exception.ApiException;
import com.alibaba.dashscope.exception.InputRequiredException;
import com.alibaba.dashscope.exception.NoApiKeyException;
import io.reactivex.Flowable;
import java.lang.System;
import com.alibaba.dashscope.utils.Constants;

public class Main {
    static {
        // The following is the base_url for the Singapore region. If you use a model in the Virginia region, replace the base_url with https://dashscope-us.aliyuncs.com/api/v1
        // If you use a model in the Beijing region, replace the base_url with https://dashscope.aliyuncs.com/api/v1
        Constants.baseHttpApiUrl="https://dashscope-intl.aliyuncs.com/api/v1";
    }
    private static final Logger logger = LoggerFactory.getLogger(Main.class);
    private static StringBuilder reasoningContent = new StringBuilder();
    private static StringBuilder finalContent = new StringBuilder();
    private static boolean isFirstPrint = true;

    private static void handleGenerationResult(GenerationResult message) {
        String reasoning = message.getOutput().getChoices().get(0).getMessage().getReasoningContent();
        String content = message.getOutput().getChoices().get(0).getMessage().getContent();

        if (!reasoning.isEmpty()) {
            reasoningContent.append(reasoning);
            if (isFirstPrint) {
                System.out.println("====================Thinking process====================");
                isFirstPrint = false;
            }
            System.out.print(reasoning);
        }

        if (!content.isEmpty()) {
            finalContent.append(content);
            if (!isFirstPrint) {
                System.out.println("\n====================Full response====================");
                isFirstPrint = true;
            }
            System.out.print(content);
        }
    }
    private static GenerationParam buildGenerationParam(Message userMsg) {
        return GenerationParam.builder()
                // If you have not configured an environment variable, replace the following line with your Model Studio API key: .apiKey("sk-xxx")
                .apiKey(System.getenv("DASHSCOPE_API_KEY"))
                .model("qwen-plus")
                .enableThinking(true)
                .incrementalOutput(true)
                .resultFormat("message")
                .messages(Arrays.asList(userMsg))
                .build();
    }
    public static void streamCallWithMessage(Generation gen, Message userMsg)
            throws NoApiKeyException, ApiException, InputRequiredException {
        GenerationParam param = buildGenerationParam(userMsg);
        Flowable<GenerationResult> result = gen.streamCall(param);
        result.blockingForEach(message -> handleGenerationResult(message));
    }

    public static void main(String[] args) {
        try {
            Generation gen = new Generation();
            Message userMsg = Message.builder().role(Role.USER.getValue()).content("Who are you?").build();
            streamCallWithMessage(gen, userMsg);
//             Print the final result.
//            if (reasoningContent.length() > 0) {
//                System.out.println("\n====================Full response====================");
//                System.out.println(finalContent.toString());
//            }
        } catch (ApiException | NoApiKeyException | InputRequiredException e) {
            logger.error("An exception occurred: {}", e.getMessage());
        }
        System.exit(0);
    }
}
```

### **Return value**

```
====================Thinking process====================
Okay, the user is asking "Who are you?", and I need to answer based on my predefined settings. First, my role is Qwen, a large-scale language model from Alibaba Group. I should keep the tone conversational, simple, and easy to understand.

The user might be new to me or wants to confirm my identity. I should first state who I am directly, then briefly explain my functions and uses, such as answering questions, creating text, and coding. I should also mention my multilingual support so the user knows I can handle requests in different languages.

Also, according to the guidelines, I should maintain a human-like persona, so the tone should be friendly. I might use emojis to add a touch of warmth. At the same time, I might need to guide the user to ask more questions or use my features, for example, by asking what they need help with.

I need to be careful not to use complex terminology and avoid being verbose. I will check for any missed key points, such as multilingual support and specific capabilities. I must ensure the response meets all requirements, including being conversational and concise.
====================Full response====================
Hello! I am Qwen, a large-scale language model from Alibaba Group. I can answer questions and create text, such as stories, official documents, emails, and playbooks. I can also perform logical reasoning, write code, express opinions, and play games. I am proficient in multiple languages, including but not limited to Chinese, English, German, French, and Spanish. Is there anything I can help you with?
```

## HTTP

### **Sample code**

## curl

```
# ======= Important =======
# The following is the URL for the Singapore region. If you use a model in the Beijing region, replace the URL with: https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation
# If you use a model in the Virginia region, replace the base_url with: https://dashscope-us.aliyuncs.com/api/v1/services/aigc/text-generation/generation
# === Delete this comment before execution ===
curl -X POST "https://dashscope-intl.aliyuncs.com/api/v1/services/aigc/text-generation/generation" \
-H "Authorization: Bearer $DASHSCOPE_API_KEY" \
-H "Content-Type: application/json" \
-H "X-DashScope-SSE: enable" \
-d '{
    "model": "qwen-plus",
    "input":{
        "messages":[      
            {
                "role": "user",
                "content": "Who are you?"
            }
        ]
    },
    "parameters":{
        "enable_thinking": true,
        "incremental_output": true,
        "result_format": "message"
    }
}'
```

### **Response**

```
id:1
event:result
:HTTP_STATUS/200
data:{"output":{"choices":[{"message":{"content":"","reasoning_content":"Hmm","role":"assistant"},"finish_reason":"null"}]},"usage":{"total_tokens":14,"input_tokens":11,"output_tokens":3},"request_id":"25d58c29-c47b-9e8d-a0f1-d6c309ec58b1"}

id:2
event:result
:HTTP_STATUS/200
data:{"output":{"choices":[{"message":{"content":"","reasoning_content":",","role":"assistant"},"finish_reason":"null"}]},"usage":{"total_tokens":15,"input_tokens":11,"output_tokens":4},"request_id":"25d58c29-c47b-9e8d-a0f1-d6c309ec58b1"}

id:3
event:result
:HTTP_STATUS/200
data:{"output":{"choices":[{"message":{"content":"","reasoning_content":"the user","role":"assistant"},"finish_reason":"null"}]},"usage":{"total_tokens":16,"input_tokens":11,"output_tokens":5},"request_id":"25d58c29-c47b-9e8d-a0f1-d6c309ec58b1"}

id:4
event:result
:HTTP_STATUS/200
data:{"output":{"choices":[{"message":{"content":"","reasoning_content":" asks","role":"assistant"},"finish_reason":"null"}]},"usage":{"total_tokens":17,"input_tokens":11,"output_tokens":6},"request_id":"25d58c29-c47b-9e8d-a0f1-d6c309ec58b1"}

id:5
event:result
:HTTP_STATUS/200
data:{"output":{"choices":[{"message":{"content":"","reasoning_content":" '","role":"assistant"},"finish_reason":"null"}]},"usage":{"total_tokens":18,"input_tokens":11,"output_tokens":7},"request_id":"25d58c29-c47b-9e8d-a0f1-d6c309ec58b1"}
......

id:358
event:result
:HTTP_STATUS/200
data:{"output":{"choices":[{"message":{"content":"help","reasoning_content":"","role":"assistant"},"finish_reason":"null"}]},"usage":{"total_tokens":373,"input_tokens":11,"output_tokens":362},"request_id":"25d58c29-c47b-9e8d-a0f1-d6c309ec58b1"}

id:359
event:result
:HTTP_STATUS/200
data:{"output":{"choices":[{"message":{"content":",","reasoning_content":"","role":"assistant"},"finish_reason":"null"}]},"usage":{"total_tokens":374,"input_tokens":11,"output_tokens":363},"request_id":"25d58c29-c47b-9e8d-a0f1-d6c309ec58b1"}

id:360
event:result
:HTTP_STATUS/200
data:{"output":{"choices":[{"message":{"content":" feel free","reasoning_content":"","role":"assistant"},"finish_reason":"null"}]},"usage":{"total_tokens":375,"input_tokens":11,"output_tokens":364},"request_id":"25d58c29-c47b-9e8d-a0f1-d6c309ec58b1"}

id:361
event:result
:HTTP_STATUS/200
data:{"output":{"choices":[{"message":{"content":" to","reasoning_content":"","role":"assistant"},"finish_reason":"null"}]},"usage":{"total_tokens":376,"input_tokens":11,"output_tokens":365},"request_id":"25d58c29-c47b-9e8d-a0f1-d6c309ec58b1"}

id:362
event:result
:HTTP_STATUS/200
data:{"output":{"choices":[{"message":{"content":" let me know","reasoning_content":"","role":"assistant"},"finish_reason":"null"}]},"usage":{"total_tokens":377,"input_tokens":11,"output_tokens":366},"request_id":"25d58c29-c47b-9e8d-a0f1-d6c309ec58b1"}

id:363
event:result
:HTTP_STATUS/200
data:{"output":{"choices":[{"message":{"content":"!","reasoning_content":"","role":"assistant"},"finish_reason":"null"}]},"usage":{"total_tokens":378,"input_tokens":11,"output_tokens":367},"request_id":"25d58c29-c47b-9e8d-a0f1-d6c309ec58b1"}

id:364
event:result
:HTTP_STATUS/200
data:{"output":{"choices":[{"message":{"content":"","reasoning_content":"","role":"assistant"},"finish_reason":"stop"}]},"usage":{"total_tokens":378,"input_tokens":11,"output_tokens":367},"request_id":"25d58c29-c47b-9e8d-a0f1-d6c309ec58b1"}
```

## **Core capabilities**

### **Switch between thinking and non-thinking modes**

Enabling thinking mode usually improves response quality but increases response latency and cost. When using a model that supports hybrid-thinking mode, you can dynamically switch between thinking and non-thinking modes based on the complexity of the question without changing the model:

-   For tasks that do not require complex reasoning, such as daily chats or simple Q&A pairs, set `enable_thinking` to `false` to disable thinking mode.
    
-   For tasks that require complex reasoning, such as logical reasoning, code generation, or solving mathematical problems, set `enable_thinking` to `true` to enable thinking mode.
    

## OpenAI compatible

**Important**

`enable_thinking` is not a standard OpenAI parameter. If you use the OpenAI Python SDK, pass this parameter using `extra_body`. In the Node.js SDK, pass it as a top-level parameter.

## Python

### **Sample code**

```
from openai import OpenAI
import os

# Initialize the OpenAI client
client = OpenAI(
    # If you have not configured an environment variable, replace the following with your Model Studio API key: api_key="sk-xxx"
    api_key=os.getenv("DASHSCOPE_API_KEY"),
    # The following is the base_url for the Singapore region. If you use a model in the Virginia region, replace the base_url with https://dashscope-us.aliyuncs.com/compatible-mode/v1 # If you use a model in the Beijing region, replace the base_url with https://dashscope.aliyuncs.com/compatible-mode/v1
    # If you use a model in the Beijing region, replace the base_url with https://dashscope.aliyuncs.com/compatible-mode/v1
    base_url="https://dashscope-intl.aliyuncs.com/compatible-mode/v1",
)

messages = [{"role": "user", "content": "Who are you"}]
completion = client.chat.completions.create(
    model="qwen-plus",
    messages=messages,
    # Set enable_thinking through extra_body to enable the thinking process
    extra_body={"enable_thinking": True},
    stream=True,
    stream_options={
        "include_usage": True
    },
)

reasoning_content = ""  # Full thinking process
answer_content = ""  # Full response
is_answering = False  # Indicates whether the response phase has started
print("\n" + "=" * 20 + "Thinking process" + "=" * 20 + "\n")

for chunk in completion:
    if not chunk.choices:
        print("\n" + "=" * 20 + "Token consumption" + "=" * 20 + "\n")
        print(chunk.usage)
        continue

    delta = chunk.choices[0].delta

    # Collect only the thinking content
    if hasattr(delta, "reasoning_content") and delta.reasoning_content is not None:
        if not is_answering:
            print(delta.reasoning_content, end="", flush=True)
        reasoning_content += delta.reasoning_content

    # When content is received, start responding
    if hasattr(delta, "content") and delta.content:
        if not is_answering:
            print("\n" + "=" * 20 + "Full response" + "=" * 20 + "\n")
            is_answering = True
        print(delta.content, end="", flush=True)
        answer_content += delta.content
```

### **Response**

```
====================Thinking process====================

Hmm, the user is asking 'Who are you'. I need to figure out what they want to know. They might be interacting with me for the first time or want to confirm my identity. I should start by introducing myself as Qwen, developed by Tongyi Lab. Then, I should explain my capabilities, such as answering questions, creating text, and programming, so the user understands how I can help. I should also mention that I support multiple languages, so international users know they can communicate in different languages. Finally, I should be friendly and invite them to ask more questions to encourage further interaction. I need to be concise and clear, avoiding too much technical jargon to make it easy for the user to understand. The user probably wants a quick overview of my abilities, so I'll focus on my functions and uses. I should also check if I've missed any information, like mentioning Alibaba Group or more technical details. However, the user probably just needs basic information, not an in-depth explanation. I'll make sure my response is friendly and professional, and encourages the user to keep asking questions.
====================Full response====================

I am Qwen, a large-scale language model developed by Tongyi Lab. I can help you answer questions, create text, write code, and express ideas. I support conversations in multiple languages. How can I help you?
====================Token consumption====================

CompletionUsage(completion_tokens=221, prompt_tokens=10, total_tokens=231, completion_tokens_details=CompletionTokensDetails(accepted_prediction_tokens=None, audio_tokens=None, reasoning_tokens=172, rejected_prediction_tokens=None), prompt_tokens_details=PromptTokensDetails(audio_tokens=None, cached_tokens=0))
```

## Node.js

### **Sample code**

```
import OpenAI from "openai";
import process from 'process';

// Initialize the OpenAI client
const openai = new OpenAI({
    // If you have not configured the environment variable, replace the API key with your Model Studio API key: apiKey: "sk-xxx"
    apiKey: process.env.DASHSCOPE_API_KEY, 
    // The following is the base URL for the Singapore region. If you use a model in the Virginia region, change the base URL to https://dashscope-us.aliyuncs.com/compatible-mode/v1. 
    // If you use a model in the Beijing region, change the base URL to https://dashscope.aliyuncs.com/compatible-mode/v1.
    baseURL: 'https://dashscope-intl.aliyuncs.com/compatible-mode/v1'
});

let reasoningContent = ''; // Complete reasoning process
let answerContent = ''; // Complete response
let isAnswering = false; // Indicates whether the response phase has started

async function main() {
    try {
        const messages = [{ role: 'user', content: 'Who are you?' }];
        
        const stream = await openai.chat.completions.create({
            model: 'qwen-plus',
            messages,
            // In the Node.js SDK, non-standard parameters such as enable_thinking are passed as top-level properties and do not need to be placed in extra_body.
            enable_thinking: true,
            stream: true,
            stream_options: {
                include_usage: true
            },
        });

        console.log('\n' + '='.repeat(20) + 'Reasoning process' + '='.repeat(20) + '\n');

        for await (const chunk of stream) {
            if (!chunk.choices?.length) {
                console.log('\n' + '='.repeat(20) + 'Token usage' + '='.repeat(20) + '\n');
                console.log(chunk.usage);
                continue;
            }

            const delta = chunk.choices[0].delta;
            
            // Collect only reasoning content
            if (delta.reasoning_content !== undefined && delta.reasoning_content !== null) {
                if (!isAnswering) {
                    process.stdout.write(delta.reasoning_content);
                }
                reasoningContent += delta.reasoning_content;
            }

            // When content is received, start responding
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

### **Response**

```
====================Thinking process====================

Hmm, the user is asking 'Who are you'. I need to figure out what they want to know. They might be interacting with me for the first time or want to confirm my identity. I should start by introducing my name and identity, such as Qwen, with the English name Qwen. Then I should state that I am a large-scale language model independently developed by Tongyi Lab under Alibaba Group. Next, I should mention my capabilities, such as answering questions, creating text, programming, and expressing opinions, so the user understands my purpose. I should also mention that I support multiple languages, which international users will find useful. Finally, I should invite them to ask questions and maintain a friendly and open attitude. I need to use simple and easy-to-understand language, avoiding too much technical jargon. The user might need help or just be curious, so the response should be cordial and encourage further interaction. Additionally, I might need to consider if the user has deeper needs, such as testing my abilities or seeking specific help, but the initial response should focus on basic information and guidance. I will keep the tone conversational and avoid complex sentences to make the information more effective.
====================Full response====================

Hello! I am Qwen, a large-scale language model independently developed by Tongyi Lab under Alibaba Group. I can help you answer questions, create text (such as stories, official documents, emails, and playbooks), perform logical reasoning, write code, and even express opinions and play games. I support multiple languages, including but not limited to Chinese, English, German, French, and Spanish.

If you have any questions or need help, feel free to ask me anytime!
====================Token consumption====================

{
  prompt_tokens: 10,
  completion_tokens: 288,
  total_tokens: 298,
  completion_tokens_details: { reasoning_tokens: 188 },
  prompt_tokens_details: { cached_tokens: 0 }
}
```

## HTTP

### **Sample code**

## curl

```
# ======= Important =======
# The following is the base_url for Singapore. If you use a model in the Beijing region, replace the base_url with: https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions
# If you use a model in the Virginia region, replace the base_url with: https://dashscope-us.aliyuncs.com/compatible-mode/v1/chat/completions
# === Delete this comment before execution ===
curl -X POST https://dashscope-intl.aliyuncs.com/compatible-mode/v1/chat/completions \
-H "Authorization: Bearer $DASHSCOPE_API_KEY" \
-H "Content-Type: application/json" \
-d '{
    "model": "qwen-plus",
    "messages": [
        {
            "role": "user", 
            "content": "Who are you"
        }
    ],
    "stream": true,
    "stream_options": {
        "include_usage": true
    },
    "enable_thinking": true
}'
```

## DashScope

## Python

### **Sample code**

```
import os
from dashscope import Generation
import dashscope
# The following is the base_url for the Singapore region. If you use a model in the Virginia region, replace the base_url with https://dashscope-us.aliyuncs.com/api/v1
# If you use a model in the Beijing region, replace the base_url with https://dashscope.aliyuncs.com/api/v1
dashscope.base_http_api_url = "https://dashscope-intl.aliyuncs.com/api/v1/"

# Initialize request parameters
messages = [{"role": "user", "content": "Who are you?"}]

completion = Generation.call(
    # If you have not configured an environment variable, replace the following with your Model Studio API key: api_key="sk-xxx"
    api_key=os.getenv("DASHSCOPE_API_KEY"),
    model="qwen-plus",
    messages=messages,
    result_format="message",  # Set the result format to message
    enable_thinking=True,     # Enable the thinking process
    stream=True,              # Enable streaming output
    incremental_output=True,  # Enable incremental output
)

reasoning_content = ""  # Full thinking process
answer_content = ""     # Full response
is_answering = False    # Indicates whether the response phase has started

print("\n" + "=" * 20 + "Thinking process" + "=" * 20 + "\n")

for chunk in completion:
    message = chunk.output.choices[0].message
    
    # Collect only the thinking content
    if message.reasoning_content:
        if not is_answering:
            print(message.reasoning_content, end="", flush=True)
        reasoning_content += message.reasoning_content

    # When content is received, start responding
    if message.content:
        if not is_answering:
            print("\n" + "=" * 20 + "Full response" + "=" * 20 + "\n")
            is_answering = True
        print(message.content, end="", flush=True)
        answer_content += message.content

print("\n" + "=" * 20 + "Token consumption" + "=" * 20 + "\n")
print(chunk.usage)
# After the loop finishes, the reasoning_content and answer_content variables contain the full content.
# You can perform subsequent processing here as needed.
# print(f"\n\nFull thinking process:\n{reasoning_content}")
# print(f"\nFull response:\n{answer_content}")
```

### **Response**

```
====================Thinking process====================

Hmm, the user is asking 'Who are you?'. I need to figure out what they want to know. They might be interacting with me for the first time or want to confirm my identity. First, I should introduce myself as Qwen and state that I am a large-scale language model developed by Tongyi Lab. Next, I might need to explain my capabilities, such as answering questions, creating text, and programming, so the user understands my purpose. I should also mention that I support multiple languages, so international users know they can communicate in different languages. Finally, I should be friendly and invite them to ask questions to encourage further interaction. I need to use simple and easy-to-understand language, avoiding too much technical jargon. The user might have deeper needs, such as testing my abilities or seeking help, so providing specific examples like writing stories, official documents, or emails would be better. I should also ensure the response is well-structured, perhaps by listing my functions, but a natural transition might be better than using bullets. Additionally, I should emphasize that I am an AI assistant without personal consciousness and all my answers are based on training data to avoid misunderstandings. I might need to check if I've missed any important information, such as multimodal capabilities or recent updates, but based on previous responses, I probably don't need to go too deep. In short, the response should be comprehensive yet concise, friendly, and helpful, making the user feel understood and supported.
====================Full response====================

I am Qwen, a large-scale language model independently developed by Tongyi Lab under Alibaba Group. I can help you with:

1. **Answer questions**: Whether it's academic questions, general knowledge, or domain-specific issues, I can try to provide an answer.
2. **Create text**: I can help you write stories, official documents, emails, playbooks, and more.
3. **Logical reasoning**: I can help you with logical reasoning and problem-solving.
4. **Programming**: I can understand and generate code in various programming languages.
5. **Multilingual support**: I support multiple languages, including but not limited to Chinese, English, German, French, and Spanish.

If you have any questions or need help, feel free to ask me anytime!
====================Token consumption====================

{"input_tokens": 11, "output_tokens": 405, "total_tokens": 416, "output_tokens_details": {"reasoning_tokens": 256}, "prompt_tokens_details": {"cached_tokens": 0}}
```

## Java

### **Sample code**

```
// DashScope SDK version >= 2.19.4
import com.alibaba.dashscope.aigc.generation.Generation;
import com.alibaba.dashscope.aigc.generation.GenerationParam;
import com.alibaba.dashscope.aigc.generation.GenerationResult;
import com.alibaba.dashscope.common.Message;
import com.alibaba.dashscope.common.Role;
import com.alibaba.dashscope.exception.ApiException;
import com.alibaba.dashscope.exception.InputRequiredException;
import com.alibaba.dashscope.exception.NoApiKeyException;
import com.alibaba.dashscope.utils.Constants;
import io.reactivex.Flowable;
import java.lang.System;
import java.util.Arrays;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class Main {
    private static final Logger logger = LoggerFactory.getLogger(Main.class);
    private static StringBuilder reasoningContent = new StringBuilder();
    private static StringBuilder finalContent = new StringBuilder();
    private static boolean isFirstPrint = true;

    private static void handleGenerationResult(GenerationResult message) {
        String reasoning = message.getOutput().getChoices().get(0).getMessage().getReasoningContent();
        String content = message.getOutput().getChoices().get(0).getMessage().getContent();

        if (!reasoning.isEmpty()) {
            reasoningContent.append(reasoning);
            if (isFirstPrint) {
                System.out.println("====================Thinking process====================");
                isFirstPrint = false;
            }
            System.out.print(reasoning);
        }

        if (!content.isEmpty()) {
            finalContent.append(content);
            if (!isFirstPrint) {
                System.out.println("\n====================Full response====================");
                isFirstPrint = true;
            }
            System.out.print(content);
        }
    }
    private static GenerationParam buildGenerationParam(Message userMsg) {
        return GenerationParam.builder()
                // If you have not configured an environment variable, replace the following line with your Model Studio API key: .apiKey("sk-xxx")
                .apiKey(System.getenv("DASHSCOPE_API_KEY"))
                .model("qwen-plus")
                .enableThinking(true)
                .incrementalOutput(true)
                .resultFormat("message")
                .messages(Arrays.asList(userMsg))
                .build();
    }
    public static void streamCallWithMessage(Generation gen, Message userMsg)
            throws NoApiKeyException, ApiException, InputRequiredException {
        GenerationParam param = buildGenerationParam(userMsg);
        Flowable<GenerationResult> result = gen.streamCall(param);
        result.blockingForEach(message -> handleGenerationResult(message));
    }

    public static void main(String[] args) {
        try {
            // The following is the base_url for the Singapore region. If you use a model in the Virginia region, replace the base_url with https://dashscope-us.aliyuncs.com/api/v1
            // If you use a model in the Beijing region, replace the base_url with https://dashscope.aliyuncs.com/api/v1
            Generation gen = new Generation("http", "https://dashscope-intl.aliyuncs.com/api/v1");
            Message userMsg = Message.builder().role(Role.USER.getValue()).content("Who are you?").build();
            streamCallWithMessage(gen, userMsg);
//             Print the final result.
//            if (reasoningContent.length() > 0) {
//                System.out.println("\n====================Full response====================");
//                System.out.println(finalContent.toString());
//            }
        } catch (ApiException | NoApiKeyException | InputRequiredException e) {
            logger.error("An exception occurred: {}", e.getMessage());
        }
        System.exit(0);
    }
}
```

### **Return values**

```
====================Thinking process====================
Hmm, the user is asking 'Who are you?'. I need to figure out what they want to know. They might want to know my identity or are testing my response. First, I should clearly state that I am Qwen, a large-scale language model from Alibaba Group. Then, I might need to briefly introduce my capabilities, such as answering questions, creating text, and programming, so the user understands my purpose. I should also mention that I support multiple languages, so international users know they can communicate in different languages. Finally, I should be friendly and invite them to ask questions, which will make them feel welcome and willing to continue the interaction. I need to make sure the answer is not too long but is comprehensive. The user might have follow-up questions, such as my technical details or use cases, but the initial response should be concise and clear. I will ensure I don't use technical jargon so that all users can understand. I will check if I have missed any important information, such as multilingual support and specific examples of my functions. Okay, this should cover the user's needs.
====================Full response====================
I am Qwen, a large-scale language model from Alibaba Group. I can answer questions, create text (such as stories, official documents, emails, and playbooks), perform logical reasoning, write code, express opinions, play games, and more. I support conversations in multiple languages, including but not limited to Chinese, English, German, French, and Spanish. If you have any questions or need help, feel free to ask me anytime!
```

## HTTP

### **Sample code**

## curl

```
# ======= Important =======
# The following is the URL for the Singapore region. If you use a model in the Beijing region, replace the URL with: https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation
# If you use a model in the Virginia region, replace the base_url with: https://dashscope-us.aliyuncs.com/api/v1/services/aigc/text-generation/generation
# === Delete this comment before execution ===
curl -X POST "https://dashscope-intl.aliyuncs.com/api/v1/services/aigc/text-generation/generation" \
-H "Authorization: Bearer $DASHSCOPE_API_KEY" \
-H "Content-Type: application/json" \
-H "X-DashScope-SSE: enable" \
-d '{
    "model": "qwen-plus",
    "input":{
        "messages":[      
            {
                "role": "user",
                "content": "Who are you?"
            }
        ]
    },
    "parameters":{
        "enable_thinking": true,
        "incremental_output": true,
        "result_format": "message"
    }
}'
```

### **Response**

```
id:1
event:result
:HTTP_STATUS/200
data:{"output":{"choices":[{"message":{"content":"","reasoning_content":"Hmm","role":"assistant"},"finish_reason":"null"}]},"usage":{"total_tokens":14,"input_tokens":11,"output_tokens":3},"request_id":"25d58c29-c47b-9e8d-a0f1-d6c309ec58b1"}

id:2
event:result
:HTTP_STATUS/200
data:{"output":{"choices":[{"message":{"content":"","reasoning_content":",","role":"assistant"},"finish_reason":"null"}]},"usage":{"total_tokens":15,"input_tokens":11,"output_tokens":4},"request_id":"25d58c29-c47b-9e8d-a0f1-d6c309ec58b1"}

id:3
event:result
:HTTP_STATUS/200
data:{"output":{"choices":[{"message":{"content":"","reasoning_content":"the user","role":"assistant"},"finish_reason":"null"}]},"usage":{"total_tokens":16,"input_tokens":11,"output_tokens":5},"request_id":"25d58c29-c47b-9e8d-a0f1-d6c309ec58b1"}

id:4
event:result
:HTTP_STATUS/200
data:{"output":{"choices":[{"message":{"content":"","reasoning_content":" asks","role":"assistant"},"finish_reason":"null"}]},"usage":{"total_tokens":17,"input_tokens":11,"output_tokens":6},"request_id":"25d58c29-c47b-9e8d-a0f1-d6c309ec58b1"}

id:5
event:result
:HTTP_STATUS/200
data:{"output":{"choices":[{"message":{"content":"","reasoning_content":" '","role":"assistant"},"finish_reason":"null"}]},"usage":{"total_tokens":18,"input_tokens":11,"output_tokens":7},"request_id":"25d58c29-c47b-9e8d-a0f1-d6c309ec58b1"}
......

id:358
event:result
:HTTP_STATUS/200
data:{"output":{"choices":[{"message":{"content":"help","reasoning_content":"","role":"assistant"},"finish_reason":"null"}]},"usage":{"total_tokens":373,"input_tokens":11,"output_tokens":362},"request_id":"25d58c29-c47b-9e8d-a0f1-d6c309ec58b1"}

id:359
event:result
:HTTP_STATUS/200
data:{"output":{"choices":[{"message":{"content":",","reasoning_content":"","role":"assistant"},"finish_reason":"null"}]},"usage":{"total_tokens":374,"input_tokens":11,"output_tokens":363},"request_id":"25d58c29-c47b-9e8d-a0f1-d6c309ec58b1"}

id:360
event:result
:HTTP_STATUS/200
data:{"output":{"choices":[{"message":{"content":" feel free","reasoning_content":"","role":"assistant"},"finish_reason":"null"}]},"usage":{"total_tokens":375,"input_tokens":11,"output_tokens":364},"request_id":"25d58c29-c47b-9e8d-a0f1-d6c309ec58b1"}

id:361
event:result
:HTTP_STATUS/200
data:{"output":{"choices":[{"message":{"content":" to","reasoning_content":"","role":"assistant"},"finish_reason":"null"}]},"usage":{"total_tokens":376,"input_tokens":11,"output_tokens":365},"request_id":"25d58c29-c47b-9e8d-a0f1-d6c309ec58b1"}

id:362
event:result
:HTTP_STATUS/200
data:{"output":{"choices":[{"message":{"content":" let me know","reasoning_content":"","role":"assistant"},"finish_reason":"null"}]},"usage":{"total_tokens":377,"input_tokens":11,"output_tokens":366},"request_id":"25d58c29-c47b-9e8d-a0f1-d6c309ec58b1"}

id:363
event:result
:HTTP_STATUS/200
data:{"output":{"choices":[{"message":{"content":"!","reasoning_content":"","role":"assistant"},"finish_reason":"null"}]},"usage":{"total_tokens":378,"input_tokens":11,"output_tokens":367},"request_id":"25d58c29-c47b-9e8d-a0f1-d6c309ec58b1"}

id:364
event:result
:HTTP_STATUS/200
data:{"output":{"choices":[{"message":{"content":"","reasoning_content":"","role":"assistant"},"finish_reason":"stop"}]},"usage":{"total_tokens":378,"input_tokens":11,"output_tokens":367},"request_id":"25d58c29-c47b-9e8d-a0f1-d6c309ec58b1"}
```

In addition, the hybrid-thinking models of the open-source Qwen3 edition, qwen-plus-2025-04-28, and qwen-turbo-2025-04-28 provide a method to dynamically control the thinking mode using prompts. When `enable_thinking` is `true`, you can add `/no_think` to the prompt to disable thinking mode. To re-enable thinking mode in a multi-turn conversation, add `/think` to the latest input prompt. The model follows the most recent `/think` or `/no_think` instruction.

### **Limit thinking length**

Deep thinking models sometimes generate lengthy reasoning processes. This increases wait times and consumes more tokens. Use the `thinking_budget` parameter to limit the maximum number of tokens for the reasoning process. If the limit is exceeded, the model immediately generates a response.

> `thinking_budget` parameter specifies the maximum length of the model's chain-of-thought. For more information, see [Model list](/help/en/model-studio/models).

**Important**

The `thinking_budget` parameter is supported by Qwen3 (in thinking mode) and Kimi models.

## OpenAI compatible

## Python

### **Sample code**

```
from openai import OpenAI
import os

# Initialize the OpenAI client
client = OpenAI(
    # If you have not configured an environment variable, replace the following with your Model Studio API key: api_key="sk-xxx"
    api_key=os.getenv("DASHSCOPE_API_KEY"),
    # The following is the base_url for the Singapore region. If you use a model in the Virginia region, replace the base_url with https://dashscope-us.aliyuncs.com/compatible-mode/v1 # If you use a model in the Beijing region, replace the base_url with https://dashscope.aliyuncs.com/compatible-mode/v1
    # If you use a model in the Beijing region, replace the base_url with https://dashscope.aliyuncs.com/compatible-mode/v1
    base_url="https://dashscope-intl.aliyuncs.com/compatible-mode/v1",
)

messages = [{"role": "user", "content": "Who are you"}]

completion = client.chat.completions.create(
    model="qwen-plus",
    messages=messages,
    # The enable_thinking parameter enables the thinking process, and the thinking_budget parameter sets the maximum number of tokens for the reasoning process.
    extra_body={
        "enable_thinking": True,
        "thinking_budget": 50
        },
    stream=True,
    stream_options={
        "include_usage": True
    },
)

reasoning_content = ""  # Full thinking process
answer_content = ""  # Full response
is_answering = False  # Indicates whether the response phase has started
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

    # When content is received, start responding
    if hasattr(delta, "content") and delta.content:
        if not is_answering:
            print("\n" + "=" * 20 + "Full response" + "=" * 20 + "\n")
            is_answering = True
        print(delta.content, end="", flush=True)
        answer_content += delta.content
```

### **Response**

```
====================Thinking process====================

Okay, the user asked "Who are you", so I need to give a clear and friendly response. First, I should state my identity, which is Qwen, developed by the Tongyi Lab under Alibaba Group. Next, I should explain my main functions, such as answering
====================Full response====================

I am Qwen, a large-scale language model developed by the Tongyi Lab at Alibaba Group. I can answer questions, create text, perform logical reasoning, and write code, with the goal of providing help and convenience to users. How can I help you?
```

## Node.js

### **Sample code**

```
import OpenAI from "openai";
import process from 'process';

// Initialize the OpenAI client
const openai = new OpenAI({
    apiKey: process.env.DASHSCOPE_API_KEY, // Read from environment variable
    // The following is the base_url for the Singapore region. If you use a model in the Virginia region, replace the base_url with https://dashscope-us.aliyuncs.com/compatible-mode/v1 
    // If you use a model in the Beijing region, replace the base_url with https://dashscope.aliyuncs.com/compatible-mode/v1
    baseURL: 'https://dashscope-intl.aliyuncs.com/compatible-mode/v1'
});

let reasoningContent = '';
let answerContent = '';
let isAnswering = false;


async function main() {
    try {
        const messages = [{ role: 'user', content: 'Who are you' }];
        const stream = await openai.chat.completions.create({
            model: 'qwen-plus',
            messages,
            stream: true,
            // The enable_thinking parameter enables the thinking process, and the thinking_budget parameter sets the maximum number of tokens for the reasoning process.
            enable_thinking: true,
            thinking_budget: 50
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

            // When content is received, start responding
            if (delta.content !== undefined && delta.content) {
                if (!isAnswering) {
                    console.log('\n' + '='.repeat(20) + 'Full response' + '='.repeat(20) + '\n');
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

### **Response**

```
====================Thinking process====================

Okay, the user asked "Who are you", so I need to give a clear and accurate response. First, I should introduce my identity, which is Qwen, developed by the Tongyi Lab under Alibaba Group. Next, I should explain my main functions, such as answering questions
====================Full response====================

I am Qwen, an ultra-large language model independently developed by the Tongyi Lab under Alibaba Group. I can perform various tasks such as answering questions, creating text, logical reasoning, and coding. If you have any questions or need help, feel free to let me know!
```

## HTTP

### **Sample code**

## curl

```
# ======= Important =======
# The following is the base_url for Singapore. If you use a model in the Beijing region, replace the base_url with: https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions
# If you use a model in the Virginia region, replace the base_url with: https://dashscope-us.aliyuncs.com/compatible-mode/v1/chat/completions
# === Delete this comment before execution ===
curl -X POST https://dashscope-intl.aliyuncs.com/compatible-mode/v1/chat/completions \
-H "Authorization: Bearer $DASHSCOPE_API_KEY" \
-H "Content-Type: application/json" \
-d '{
    "model": "qwen-plus",
    "messages": [
        {
            "role": "user", 
            "content": "Who are you"
        }
    ],
    "stream": true,
    "stream_options": {
        "include_usage": true
    },
    "enable_thinking": true,
    "thinking_budget": 50
}'
```

### **Response**

```
data: {"choices":[{"delta":{"content":null,"role":"assistant","reasoning_content":""},"index":0,"logprobs":null,"finish_reason":null}],"object":"chat.completion.chunk","usage":null,"created":1745485391,"system_fingerprint":null,"model":"qwen-plus","id":"chatcmpl-e2edaf2c-8aaf-9e54-90e2-b21dd5045503"}

.....

data: {"choices":[{"finish_reason":"stop","delta":{"content":"","reasoning_content":null},"index":0,"logprobs":null}],"object":"chat.completion.chunk","usage":null,"created":1745485391,"system_fingerprint":null,"model":"qwen-plus","id":"chatcmpl-e2edaf2c-8aaf-9e54-90e2-b21dd5045503"}

data: {"choices":[],"object":"chat.completion.chunk","usage":{"prompt_tokens":10,"completion_tokens":360,"total_tokens":370},"created":1745485391,"system_fingerprint":null,"model":"qwen-plus","id":"chatcmpl-e2edaf2c-8aaf-9e54-90e2-b21dd5045503"}

data: [DONE]
```

## DashScope

## Python

### **Sample code**

```
import os
from dashscope import Generation
import dashscope
# The following is the base_url for the Singapore region. If you use a model in the Virginia region, replace the base_url with https://dashscope-us.aliyuncs.com/api/v1
# If you use a model in the Beijing region, replace the base_url with https://dashscope.aliyuncs.com/api/v1
dashscope.base_http_api_url = "https://dashscope-intl.aliyuncs.com/api/v1/"

messages = [{"role": "user", "content": "Who are you?"}]

completion = Generation.call(
    # If you have not configured an environment variable, replace the following line with your Model Studio API key: api_key = "sk-xxx",
    api_key=os.getenv("DASHSCOPE_API_KEY"),
    model="qwen-plus",
    messages=messages,
    result_format="message",
    enable_thinking=True,
    # Set the maximum number of tokens for the reasoning process.
    thinking_budget=50,
    stream=True,
    incremental_output=True,
)

# Define the full thinking process.
reasoning_content = ""
# Define the full response.
answer_content = ""
# Determine whether the thinking process is finished and the response has started.
is_answering = False

print("=" * 20 + "Thinking process" + "=" * 20)

for chunk in completion:
    # If both the thinking process and the response are empty, ignore.
    if (
        chunk.output.choices[0].message.content == ""
        and chunk.output.choices[0].message.reasoning_content == ""
    ):
        pass
    else:
        # If it is currently in the thinking process.
        if (
            chunk.output.choices[0].message.reasoning_content != ""
            and chunk.output.choices[0].message.content == ""
        ):
            print(chunk.output.choices[0].message.reasoning_content, end="", flush=True)
            reasoning_content += chunk.output.choices[0].message.reasoning_content
        # If it is currently in the response stage.
        elif chunk.output.choices[0].message.content != "":
            if not is_answering:
                print("\n" + "=" * 20 + "Full response" + "=" * 20)
                is_answering = True
            print(chunk.output.choices[0].message.content, end="", flush=True)
            answer_content += chunk.output.choices[0].message.content

# To print the full thinking process and the full response, uncomment and run the following code.
# print("=" * 20 + "Full thinking process" + "=" * 20 + "\n")
# print(f"{reasoning_content}")
# print("=" * 20 + "Full response" + "=" * 20 + "\n")
# print(f"{answer_content}")
```

### **Response**

```
====================Thinking process====================
Okay, the user is asking "Who are you?", so I need to give a clear and friendly response. First, I should introduce my identity, which is Qwen, developed by the Tongyi Lab under Alibaba Group. Next, I should explain my main functions, such as
====================Full response====================
I am Qwen, a large-scale language model independently developed by the Tongyi Lab at Alibaba Group. I can answer questions, create text, perform logical reasoning, and write code, with the goal of providing users with comprehensive, accurate, and useful information and assistance. How can I help you?
```

## Java

### **Sample code**

```
// DashScope SDK version >= 2.19.4
import java.util.Arrays;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import com.alibaba.dashscope.aigc.generation.Generation;
import com.alibaba.dashscope.aigc.generation.GenerationParam;
import com.alibaba.dashscope.aigc.generation.GenerationResult;
import com.alibaba.dashscope.common.Message;
import com.alibaba.dashscope.common.Role;
import com.alibaba.dashscope.exception.ApiException;
import com.alibaba.dashscope.exception.InputRequiredException;
import com.alibaba.dashscope.exception.NoApiKeyException;
import io.reactivex.Flowable;
import java.lang.System;
import com.alibaba.dashscope.utils.Constants;

public class Main {
    static {
        // The following is the base_url for the Singapore region. If you use a model in the Virginia region, replace the base_url with https://dashscope-us.aliyuncs.com/api/v1
        // If you use a model in the Beijing region, replace the base_url with https://dashscope.aliyuncs.com/api/v1
        Constants.baseHttpApiUrl="https://dashscope-intl.aliyuncs.com/api/v1";
    }
    private static final Logger logger = LoggerFactory.getLogger(Main.class);
    private static StringBuilder reasoningContent = new StringBuilder();
    private static StringBuilder finalContent = new StringBuilder();
    private static boolean isFirstPrint = true;

    private static void handleGenerationResult(GenerationResult message) {
        String reasoning = message.getOutput().getChoices().get(0).getMessage().getReasoningContent();
        String content = message.getOutput().getChoices().get(0).getMessage().getContent();

        if (!reasoning.isEmpty()) {
            reasoningContent.append(reasoning);
            if (isFirstPrint) {
                System.out.println("====================Thinking process====================");
                isFirstPrint = false;
            }
            System.out.print(reasoning);
        }

        if (!content.isEmpty()) {
            finalContent.append(content);
            if (!isFirstPrint) {
                System.out.println("\n====================Full response====================");
                isFirstPrint = true;
            }
            System.out.print(content);
        }
    }
    private static GenerationParam buildGenerationParam(Message userMsg) {
        return GenerationParam.builder()
                // If you have not configured an environment variable, replace the following line with your Model Studio API key: .apiKey("sk-xxx")
                .apiKey(System.getenv("DASHSCOPE_API_KEY"))
                .model("qwen-plus")
                .enableThinking(true)
                .thinkingBudget(50)
                .incrementalOutput(true)
                .resultFormat("message")
                .messages(Arrays.asList(userMsg))
                .build();
    }
    public static void streamCallWithMessage(Generation gen, Message userMsg)
            throws NoApiKeyException, ApiException, InputRequiredException {
        GenerationParam param = buildGenerationParam(userMsg);
        Flowable<GenerationResult> result = gen.streamCall(param);
        result.blockingForEach(message -> handleGenerationResult(message));
    }

    public static void main(String[] args) {
        try {
            Generation gen = new Generation();
            Message userMsg = Message.builder().role(Role.USER.getValue()).content("Who are you?").build();
            streamCallWithMessage(gen, userMsg);
//             Print the final result.
//            if (reasoningContent.length() > 0) {
//                System.out.println("\n====================Full response====================");
//                System.out.println(finalContent.toString());
//            }
        } catch (ApiException | NoApiKeyException | InputRequiredException e) {
            logger.error("An exception occurred: {}", e.getMessage());
        }
        System.exit(0);
    }
}
```

### **Response**

```
====================Thinking process====================
Okay, the user is asking "Who are you?", so I need to give a clear and friendly response. First, I should introduce my identity, which is Qwen, developed by the Tongyi Lab under Alibaba Group. Next, I should explain my main functions, such as
====================Full response====================
I am Qwen, a large-scale language model independently developed by the Tongyi Lab at Alibaba Group. I can answer questions, create text, perform logical reasoning, and write code, with the goal of providing users with comprehensive, accurate, and useful information and assistance. How can I help you?
```

## HTTP

### **Sample code**

## curl

```
# ======= Important =======
# The following is the URL for the Singapore region. If you use a model in the Beijing region, replace the URL with: https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation
# If you use a model in the Virginia region, replace the base_url with: https://dashscope-us.aliyuncs.com/api/v1/services/aigc/text-generation/generation
# === Delete this comment before execution ===
curl -X POST "https://dashscope-intl.aliyuncs.com/api/v1/services/aigc/text-generation/generation" \
-H "Authorization: Bearer $DASHSCOPE_API_KEY" \
-H "Content-Type: application/json" \
-H "X-DashScope-SSE: enable" \
-d '{
    "model": "qwen-plus",
    "input":{
        "messages":[      
            {
                "role": "user",
                "content": "Who are you?"
            }
        ]
    },
    "parameters":{
        "enable_thinking": true,
        "thinking_budget": 50,
        "incremental_output": true,
        "result_format": "message"
    }
}'
```

### **Return values**

```
id:1
event:result
:HTTP_STATUS/200
data:{"output":{"choices":[{"message":{"content":"","reasoning_content":"Okay","role":"assistant"},"finish_reason":"null"}]},"usage":{"total_tokens":14,"output_tokens":3,"input_tokens":11,"output_tokens_details":{"reasoning_tokens":1}},"request_id":"2ce91085-3602-9c32-9c8b-fe3d583a2c38"}

id:2
event:result
:HTTP_STATUS/200
data:{"output":{"choices":[{"message":{"content":"","reasoning_content":",","role":"assistant"},"finish_reason":"null"}]},"usage":{"total_tokens":15,"output_tokens":4,"input_tokens":11,"output_tokens_details":{"reasoning_tokens":2}},"request_id":"2ce91085-3602-9c32-9c8b-fe3d583a2c38"}

......

id:133
event:result
:HTTP_STATUS/200
data:{"output":{"choices":[{"message":{"content":"!","reasoning_content":"","role":"assistant"},"finish_reason":"null"}]},"usage":{"total_tokens":149,"output_tokens":138,"input_tokens":11,"output_tokens_details":{"reasoning_tokens":50}},"request_id":"2ce91085-3602-9c32-9c8b-fe3d583a2c38"}

id:134
event:result
:HTTP_STATUS/200
data:{"output":{"choices":[{"message":{"content":"","reasoning_content":"","role":"assistant"},"finish_reason":"stop"}]},"usage":{"total_tokens":149,"output_tokens":138,"input_tokens":11,"output_tokens_details":{"reasoning_tokens":50}},"request_id":"2ce91085-3602-9c32-9c8b-fe3d583a2c38"}
```

### **Other features**

-   [Multi-turn conversation](/help/en/model-studio/multi-round-conversation#9c315c95a8omt)
    
-   [Tool calling](/help/en/model-studio/qwen-function-calling#fbf3d739f2q9f)
    
-   [Web search](/help/en/model-studio/web-search#9b41940862qf3)
    

## **Billing details**

-   The thinking process is billed based on output tokens.
    
-   Some hybrid-thinking models have different prices for thinking and non-thinking modes.
    
    > If a model in thinking mode does not output a thinking process, it is billed at the non-thinking mode price.
    

## **FAQ**

### **Q: How do I disable thinking mode?**

Whether you can disable thinking mode depends on the model type:

-   For hybrid-thinking mode models, such as qwen-plus and deepseek-v3.2-exp, set the 'enable\_thinking' parameter to 'false' to disable the mode.
    
-   For thinking-only mode models, such as qwen3-235b-a22b-thinking-2507 and deepseek-r1, you cannot disable the mode.
    

### **Q: Which models support non-streaming output?**

Deep thinking models require more processing time before responding. This increases response times and creates a timeout risk for non-streaming output. We recommend using streaming calls. If you require non-streaming output, use one of the following supported models.

## Qwen3

-   **Commercial edition**
    
    -   **Qwen-Max series**: qwen3-max-preview
        
    -   **Qwen-Plus series**: qwen-plus
        
    -   **Qwen3.5 Plus series**: qwen3.5-plus, qwen3.5-plus-2026-02-15, qwen3.5-397b-a17b
        
    -   **Qwen-Flash series**: qwen-flash, qwen-flash-2025-07-28
        
    -   **Qwen-Turbo series**: qwen-turbo
        
-   **Open-source edition**
    
    -   qwen3-next-80b-a3b-thinking, qwen3-235b-a22b-thinking-2507, qwen3-30b-a3b-thinking-2507
        

## DeepSeek (Beijing region)

deepseek-v3.2, deepseek-v3.2-exp, deepseek-r1, deepseek-r1-0528, deepseek-r1 distilled model

## Kimi (Beijing region)

kimi-k2-thinking

### **Q: How do I purchase tokens after my** [free quota](/help/en/model-studio/new-free-quota) **is used up?**

You can go to the [Expenses and Costs](https://usercenter2-intl.console.alibabacloud.com/billing/#/account/overview) center to top up your account. To call a model, ensure your account does not have an overdue payment.

> After you use up the free quota, model calls are automatically charged. The billing cycle is one hour. To view your billing details, go to **[Billing Details](https://usercenter2-intl.console.alibabacloud.com/finance/expense-report/expense-detail)**.

### **Q:** Can I upload images or documents to ask questions**?**

The models described in this topic support only text input. The Qwen3-VL and QVQ models support deep thinking for images.

### **Q: How do I view token** consumption **and call count?**

**One hour after** you call a model, go to the Monitoring ([Singapore](https://modelstudio.console.alibabacloud.com/?tab=dashboard#/model-telemetry) or [Beijing](https://bailian.console.alibabacloud.com/?tab=model#/model-telemetry)) page. Set the query conditions, such as the time range and workspace. Then, in the **Models** area, find the target model and click **Monitor** in the **Actions** column to view the model's call statistics. For more information, see the [Monitoring](/help/en/model-studio/model-telemetry/) document.

> Data is updated hourly. During peak periods, there may be an hour-level latency.

![image](https://help-static-aliyun-doc.aliyuncs.com/assets/img/en-US/8821934571/p992753.png)

## API reference

For more information about the input and output parameters for deep thinking models, see [Qwen](/help/en/model-studio/qwen-api-reference/).

## **Error codes**

If an error occurs, see [Error messages](/help/en/model-studio/error-code) for troubleshooting.

/\* Let the top and bottom spacing of the reference be smaller to avoid the content from being displayed too sparsely \*/ .unionContainer .markdown-body blockquote { margin: 4px 0; } .aliyun-docs-content table.qwen blockquote { border-left: none; /\* Add this line to remove the left border of the quoted text in the table \*/ padding-left: 5px; /\* Left padding \*/ margin: 4px 0; } .without-border { border: none !important; } .without-left-right-padding { padding-left: 0 !important; padding-right: 0 !important; } .unionContainer .markdown-body h2.without-border { border: none !important; } /\*Adjust the note to a code icon and do not display text\*/ .aliyun-docs-content div.note\[outputclass=skip-to-code\] .note-icon-wrapper strong { display: none; } .aliyun-docs-content div.note\[outputclass=skip-to-code\] .note-icon-wrapper { width: 26px; } .aliyun-docs-content div.note\[outputclass=skip-to-code\] .note-icon-wrapper .icon-note { background-size: 22px 22px; background-image: url(data:image/svg+xml;base64,PHN2ZyB2aWV3Qm94PSIwIDAgMTAyNCAxMDI0IiB2ZXJzaW9uPSIxLjEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIj48cGF0aCBkPSJNOTE3LjUwNCA4MzUuNTg0SDEwNi40OTZWMTg4LjQxNmg4MTAuNDk2bDAuNTEyIDY0Ny4xNjh6TTE4Ni44OCA3NTUuMmg2NTAuNzUydi00ODYuNEgxODYuODh2NDg2LjR6IiBmaWxsPSIjMTM2NmVjIiBwLWlkPSI1MTI2Ij48L3BhdGg+PHBhdGggZD0iTTM0My4wNCA2NDguNzA0bC01Ni4zMi01Ni4zMiA4OC4wNjQtODguMDY0TDI4Ni43MiA0MTUuNzQ0bDU2LjMyLTU2LjgzMiAxNDQuODk2IDE0NC44OTZMMzQzLjA0IDY0OC43MDR6IG0xNjMuODQtNjMuNDg4aDIzMC40djc5Ljg3Mkg1MDYuODh2LTc5Ljg3MnoiIGZpbGw9IiMxMzY2ZWMiIHAtaWQ9IjUxMjciPjwvcGF0aD48L3N2Zz4=); }