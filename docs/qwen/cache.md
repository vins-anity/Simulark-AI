When you call a large language model, different inference requests can have overlapping input, such as in multi-turn conversations or when you ask multiple questions about the same document. The context cache feature saves the common prefix of these requests to reduce redundant computations. This improves response speed and lowers your costs without affecting the response quality.

To accommodate different scenarios, context cache provides two modes. You can choose a mode based on your requirements for convenience, certainty, and cost:

-   [Explicit cache](#825f201c5fy6o): This cache mode must be **manually enabled**. You can manually create a cache for specific content to guarantee a hit within a 5-minute period. Tokens used to create the cache are billed at 125% of the standard input token price. However, subsequent hits are billed at only 10% of the standard price.
    
-   [Implicit cache](#2317ea09cfxok): This automatic mode requires no extra configuration, cannot be disabled, and is suitable for general scenarios where convenience is a priority. The system **automatically detects** and caches the **common prefix** of the request content, but the **cache hit ratio is not guaranteed**. The cached portion is billed at 20% of the standard price for input tokens.
    

| **Item** | **Explicit cache** | **Implicit cache** |
| --- | --- | --- |
| Affects response quality | No impact | No impact |
| Hit probability | Guaranteed hit | Not guaranteed. The system determines the specific hit probability. |
| Tokens to create the cache | 125% of the standard input token price | 100% of the standard input token price |
| Cached input tokens | 10% of the standard input token price | 20% of the standard input token price |
| Minimum tokens for caching | 1,024 | 256 |
| Cache validity period | 5 minutes (resets on hit) | Not guaranteed. The system periodically purges cached data that has not been used for a long time. |

**Note**

Explicit cache and implicit cache are mutually exclusive. A single request can use only one mode.

## **Explicit cache**

Compared to implicit cache, explicit cache requires you to manually create a cache and incurs a corresponding overhead. However, it provides a higher cache hit ratio and lower access latency.

### **Usage**

You can add a `"cache_control": {"type": "ephemeral"}` marker to the messages. The system then attempts a cache hit by tracing back up to 20 `content` blocks from the position of each `cache_control` marker.

> A single request supports up to 4 cache markers.

-   **Cache miss**
    
    The system creates a new cache block using the content from the beginning of the messages array up to the `cache_control` marker. This cache block is valid for 5 minutes.
    
    > Cache creation occurs after the model responds. You can attempt to hit the cache after the creation request is complete.
    
    > The minimum content length for a cache block is 1,024 tokens.
    
-   **Cache hit**
    
    The longest matching prefix is selected as the hit, and the validity period of the corresponding cache block is reset to 5 minutes.
    

The following is an example:

1.  **Initiate the first request**: You can send a system message that contains text A with over 1,024 tokens and add a cache marker:
    
    ```
    [{"role": "system", "content": [{"type": "text", "text": A, "cache_control": {"type": "ephemeral"}}]}] 
    ```
    
    The system creates the first cache block, which is referred to as cache block A.
    
2.  **Initiate the second request:** You can send a request with the following structure:
    
    ```
    [
        {"role": "system", "content": A},
        <other messages>
        {"role": "user","content": [{"type": "text", "text": B, "cache_control": {"type": "ephemeral"}}]}
    ]
    ```
    
    -   If there are no more than 20 "other messages", cache block A is hit, and its validity period is reset to 5 minutes. At the same time, the system creates a new cache block based on the content of A, the other messages, and B.
        
    -   If there are more than 20 "other messages", cache block A is not hit. The system still creates a new cache block based on the full context (A + other messages + B).
        

### **Supported models**

[Qwen-Max](/help/en/model-studio/models#131ff25c87sj6): qwen3-max

[Qwen-Plus](/help/en/model-studio/models#bb1e0794618ty): qwen3.5-plus, qwen-plus

[Qwen-Flash](/help/en/model-studio/models#c299c2b53eyoh): qwen-flash

[Qwen-Coder](/help/en/model-studio/models#673bef6a2fxfg): qwen3-coder-plus, qwen3-coder-flash

> The models listed above support explicit cache in both the Mainland China and International regions.

> Snapshot and latest models are not currently supported.

[Qwen-VL](/help/en/model-studio/models#5540e6e52e1xx): qwen3-vl-plus

> qwen3-vl-plus supports explicit cache only in Mainland China.

[DeepSeek](/help/en/model-studio/deepseek-api): deepseek-v3.2

> deepseek-v3.2 supports explicit cache only in Mainland China.

### **Getting started**

The following examples show the creation and hit mechanism of cache blocks in the OpenAI compatible API and the DashScope protocol.

## OpenAI compatible

```
from openai import OpenAI
import os

client = OpenAI(
    # If you have not configured an environment variable, replace the following line with: api_key="sk-xxx"
    api_key=os.getenv("DASHSCOPE_API_KEY"),
    # If you use a model from the Beijing region, replace the base_url with: https://dashscope.aliyuncs.com/compatible-mode/v1
    base_url="https://dashscope-intl.aliyuncs.com/compatible-mode/v1",
)

# Simulated code repository content. The minimum prompt length for caching is 1,024 tokens.
long_text_content = "<Your Code Here>" * 400

# Function to make a request
def get_completion(user_input):
    messages = [
        {
            "role": "system",
            "content": [
                {
                    "type": "text",
                    "text": long_text_content,
                    # Place the cache_control marker here to create a cache block from the beginning of the messages array to the current content position.
                    "cache_control": {"type": "ephemeral"},
                }
            ],
        },
        # The question content is different each time
        {
            "role": "user",
            "content": user_input,
        },
    ]
    completion = client.chat.completions.create(
        # Select a model that supports explicit cache
        model="qwen3-coder-plus",
        messages=messages,
    )
    return completion

# First request
first_completion = get_completion("What is the content of this code?")
print(f"First request created cache tokens: {first_completion.usage.prompt_tokens_details.cache_creation_input_tokens}")
print(f"First request hit cache tokens: {first_completion.usage.prompt_tokens_details.cached_tokens}")
print("=" * 20)
# Second request, the code content is the same, only the question is changed
second_completion = get_completion("How can this code be optimized?")
print(f"Second request created cache tokens: {second_completion.usage.prompt_tokens_details.cache_creation_input_tokens}")
print(f"Second request hit cache tokens: {second_completion.usage.prompt_tokens_details.cached_tokens}")
```

## DashScope

Python

```
import os
from dashscope import Generation
# If you use a model from the Beijing region, replace the base_url with: https://dashscope.aliyuncs.com/api/v1
dashscope.base_http_api_url = "https://dashscope-intl.aliyuncs.com/api/v1"

# Simulated code repository content. The minimum prompt length for caching is 1,024 tokens.
long_text_content = "<Your Code Here>" * 400

# Function to make a request
def get_completion(user_input):
    messages = [
        {
            "role": "system",
            "content": [
                {
                    "type": "text",
                    "text": long_text_content,
                    # Place the cache_control marker here to create a cache block from the beginning of the messages array to the current content position.
                    "cache_control": {"type": "ephemeral"},
                }
            ],
        },
        # The question content is different each time
        {
            "role": "user",
            "content": user_input,
        },
    ]
    response = Generation.call(
        # If the environment variable is not configured, replace this line with your Model Studio API key: api_key = "sk-xxx",
        api_key=os.getenv("DASHSCOPE_API_KEY"), 
        model="qwen3-coder-plus",
        messages=messages,
        result_format="message"
    )
    return response

# First request
first_completion = get_completion("What is the content of this code?")
print(f"First request created cache tokens: {first_completion.usage.prompt_tokens_details['cache_creation_input_tokens']}")
print(f"First request hit cache tokens: {first_completion.usage.prompt_tokens_details['cached_tokens']}")
print("=" * 20)
# Second request, the code content is the same, only the question is changed
second_completion = get_completion("How can this code be optimized?")
print(f"Second request created cache tokens: {second_completion.usage.prompt_tokens_details['cache_creation_input_tokens']}")
print(f"Second request hit cache tokens: {second_completion.usage.prompt_tokens_details['cached_tokens']}")
```

Java

```
// The minimum Java SDK version is 2.21.6
import com.alibaba.dashscope.aigc.generation.Generation;
import com.alibaba.dashscope.aigc.generation.GenerationParam;
import com.alibaba.dashscope.aigc.generation.GenerationResult;
import com.alibaba.dashscope.common.Message;
import com.alibaba.dashscope.common.MessageContentText;
import com.alibaba.dashscope.common.Role;
import com.alibaba.dashscope.exception.ApiException;
import com.alibaba.dashscope.exception.InputRequiredException;
import com.alibaba.dashscope.exception.NoApiKeyException;

import java.util.Arrays;
import java.util.Collections;

public class Main {
    private static final String MODEL = "qwen3-coder-plus";
    // Simulate code repository content (repeat 400 times to ensure it exceeds 1,024 tokens)
    private static final String LONG_TEXT_CONTENT = generateLongText(400);
    private static String generateLongText(int repeatCount) {
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < repeatCount; i++) {
            sb.append("<Your Code Here>");
        }
        return sb.toString();
    }
    private static GenerationResult getCompletion(String userQuestion)
            throws NoApiKeyException, ApiException, InputRequiredException {
        // If you use a model in the Beijing region, replace the base_url with: https://dashscope.aliyuncs.com/api/v1
        Generation gen = new Generation("http", "https://dashscope-intl.aliyuncs.com/api/v1");

        // Build a system message with cache control
        MessageContentText systemContent = MessageContentText.builder()
                .type("text")
                .text(LONG_TEXT_CONTENT)
                .cacheControl(MessageContentText.CacheControl.builder()
                        .type("ephemeral") // Set the cache type
                        .build())
                .build();

        Message systemMsg = Message.builder()
                .role(Role.SYSTEM.getValue())
                .contents(Collections.singletonList(systemContent))
                .build();
        Message userMsg = Message.builder()
                .role(Role.USER.getValue())
                .content(userQuestion)
                .build();

        // Build request parameters
        GenerationParam param = GenerationParam.builder()
                .model(MODEL)
                .messages(Arrays.asList(systemMsg, userMsg))
                .resultFormat(GenerationParam.ResultFormat.MESSAGE)
                .build();
        return gen.call(param);
    }

    private static void printCacheInfo(GenerationResult result, String requestLabel) {
        System.out.printf("%s created cache tokens: %d%n", requestLabel, result.getUsage().getPromptTokensDetails().getCacheCreationInputTokens());
        System.out.printf("%s hit cache tokens: %d%n", requestLabel, result.getUsage().getPromptTokensDetails().getCachedTokens());
    }

    public static void main(String[] args) {
        try {
            // First request
            GenerationResult firstResult = getCompletion("What is the content of this code?");
            printCacheInfo(firstResult, "First request");
            System.out.println(new String(new char[20]).replace('\0', '='));            // Second request
            GenerationResult secondResult = getCompletion("How can this code be optimized?");
            printCacheInfo(secondResult, "Second request");
        } catch (NoApiKeyException | ApiException | InputRequiredException e) {
            System.err.println("API call failed: " + e.getMessage());
            e.printStackTrace();
        }
    }
}
```

The simulated code repository enables explicit cache by adding the `cache_control` marker. For subsequent requests that query this code repository, the system can reuse this cache block without recalculation. This results in faster responses and lower costs.

```
First request created cache tokens: 1605
First request hit cache tokens: 0
====================
Second request created cache tokens: 0
Second request hit cache tokens: 1605
```

### Use multiple cache markers for fine-grained control

In complex scenarios, a prompt often consists of multiple parts with different reuse frequencies. You can use multiple cache markers for fine-grained control.

For example, the prompt for an intelligent customer service agent typically includes:

-   **System persona:** Highly stable and rarely changes.
    
-   **External knowledge:** Semi-stable. This content is retrieved from a knowledge base or tool queries and might remain unchanged during a continuous conversation.
    
-   **Conversation history:** Grows dynamically.
    
-   **Current question:** Different each time.
    

If the entire prompt is cached as a single unit, any minor change, such as an update to the external knowledge, can cause a cache miss.

You can set up to four cache markers in a request to create separate cache blocks for different parts of the prompt. This improves the hit rate and allows for fine-grained control.

### **Billing**

Explicit cache affects only the billing method for input tokens. The rules are as follows:

-   **Cache creation**: Newly created cache content is billed at 125% of the standard input price. If the cache content of a new request includes an existing cache as a prefix, only the new part is billed. This is calculated as the number of new cache tokens minus the number of existing cache tokens.
    
    For example, if there is an existing cache A of 1,200 tokens, and a new request needs to cache 1,500 tokens of content AB, the first 1,200 tokens are billed as a cache hit (10% of the standard price), and the new 300 tokens are billed for cache creation (125% of the standard price).
    
    > You can view the number of tokens used for cache creation in the `cache_creation_input_tokens` parameter.
    
-   **Cache hit**: Billed at 10% of the standard input price.
    
    > You can view the number of cached tokens in the `cached_tokens` parameter.
    
-   **Other tokens**: Tokens that are not hit and for which a cache is not created are billed at the standard price.
    

### **Cacheable content**

Only the following message types in the `messages` array support adding cache markers:

-   System message
    
-   User message
    
    > When creating cache using `qwen3-vl-plus`, `cache_control` can be after multimodal content or text. Its position does not affect the caching of the entire user message.
    
-   Assistant message
    
-   Tool message (the result after tool execution)
    
    > If the request includes the `tools` parameter, adding a cache marker in `messages` also caches the tool description information.
    

Taking a system message as an example, you can change the `content` field to an array format and add the `cache_control` field:

```
{
  "role": "system",
  "content": [
    {
      "type": "text",
      "text": "<Specified Prompt>",
      "cache_control": {
        "type": "ephemeral"
      }
    }
  ]
}
```

This structure also applies to other message types in the `messages` array.

### **Limitations**

-   The minimum prompt length is **1,024** tokens.
    
-   The cache uses a backward prefix matching strategy. The system automatically checks the last 20 content blocks. A cache hit does not occur if the content to be matched is separated from the message that contains the `cache_control` marker by more than 20 content blocks.
    
-   Only setting `type` to `ephemeral` is supported. This provides a validity period of 5 minutes.
    
-   You can add up to 4 cache markers in a single request.
    
    > If the number of cache markers is greater than 4, only the last four take effect.
    

### **Usage examples**

**Different questions for long text**

```
from openai import OpenAI
import os

client = OpenAI(
    api_key=os.getenv("DASHSCOPE_API_KEY"),
    # If you use a model from the Beijing region, replace the base_url with: https://dashscope.aliyuncs.com/compatible-mode/v1
    base_url="https://dashscope-intl.aliyuncs.com/compatible-mode/v1",
)

# Simulated code repository content
long_text_content = "<Your Code Here>" * 400

# Function to make a request
def get_completion(user_input):
    messages = [
        {
            "role": "system",
            "content": [
                {
                    "type": "text",
                    "text": long_text_content,
                    # Place the cache_control marker here to create a cache from the beginning of the prompt to the end of this content (the simulated code repository content).
                    "cache_control": {"type": "ephemeral"},
                }
            ],
        },
        {
            "role": "user",
            "content": user_input,
        },
    ]
    completion = client.chat.completions.create(
        # Select a model that supports explicit cache
        model="qwen3-coder-plus",
        messages=messages,
    )
    return completion

# First request
first_completion = get_completion("What is the content of this code?")
created_cache_tokens = first_completion.usage.prompt_tokens_details.cache_creation_input_tokens
print(f"First request created cache tokens: {created_cache_tokens}")
hit_cached_tokens = first_completion.usage.prompt_tokens_details.cached_tokens
print(f"First request hit cache tokens: {hit_cached_tokens}")
print(f"First request tokens not hit or created in cache: {first_completion.usage.prompt_tokens-created_cache_tokens-hit_cached_tokens}")
print("=" * 20)
# Second request, the code content is the same, only the question is changed
second_completion = get_completion("What are some possible optimizations for this code?")
created_cache_tokens = second_completion.usage.prompt_tokens_details.cache_creation_input_tokens
print(f"Second request created cache tokens: {created_cache_tokens}")
hit_cached_tokens = second_completion.usage.prompt_tokens_details.cached_tokens
print(f"Second request hit cache tokens: {hit_cached_tokens}")
print(f"Second request tokens not hit or created in cache: {second_completion.usage.prompt_tokens-created_cache_tokens-hit_cached_tokens}")
```

This example caches the code repository content as a prefix. Subsequent requests ask different questions about this repository.

```
First request created cache tokens: 1605
First request hit cache tokens: 0
First request tokens not hit or created in cache: 13
====================
Second request created cache tokens: 0
Second request hit cache tokens: 1605
Second request tokens not hit or created in cache: 15
```

> To ensure model performance, the system appends a small number of internal tokens. These tokens are billed at the standard input price. For more information, see [FAQ](#b728b718d5dxf).

**Continuous multi-turn conversation**

In a typical multi-turn chat scenario, you can add a cache marker to the last content of the messages array in each request. Starting from the second turn, each request will hit and refresh the cache block that was created in the previous turn, and also create a new cache block.

```
from openai import OpenAI
import os
  
client = OpenAI(
    api_key=os.getenv("DASHSCOPE_API_KEY"),
    # If you use a model from the Beijing region, replace the base_url with: https://dashscope.aliyuncs.com/compatible-mode/v1
    base_url="https://dashscope-intl.aliyuncs.com/compatible-mode/v1",
)

system_prompt = "You are a witty person." * 400
messages = [{"role": "system", "content": system_prompt}]

def get_completion(messages):
    completion = client.chat.completions.create(
        model="qwen3-coder-plus",
        messages=messages,
    )
    return completion

while True:
    user_input = input("Please enter:")
    messages.append({"role": "user", "content": [{"type": "text", "text": user_input, "cache_control": {"type": "ephemeral"}}]})
    completion = get_completion(messages)
    print(f"[AI Response] {completion.choices[0].message.content}")
    messages.append(completion.choices[0].message)
    created_cache_tokens = completion.usage.prompt_tokens_details.cache_creation_input_tokens
    hit_cached_tokens = completion.usage.prompt_tokens_details.cached_tokens
    uncached_tokens = completion.usage.prompt_tokens - created_cache_tokens - hit_cached_tokens
    print(f"[Cache Info] Created cache tokens: {created_cache_tokens}")
    print(f"[Cache Info] Hit cache tokens: {hit_cached_tokens}")
    print(f"[Cache Info] Tokens not hit or created in cache: {uncached_tokens}")
```

You can run the code above and enter questions to communicate with the model. Each question will hit the cache block that was created in the previous turn.

## **Implicit cache**

### **Supported models**

## Global

In the [Global deployment mode](/help/en/model-studio/regions/#64cd6d6b13sui), the access region and data storage are located in the **US (Virginia) region**. Inference compute resources are dynamically scheduled worldwide.

-   **Text generation**
    
    -   [Qwen-Max](/help/en/model-studio/models#c2d5833ae4jmo): qwen3-max
        
    -   [Qwen-Plus](/help/en/model-studio/models#6ad3cd90f0c5r): qwen-plus
        
    -   [Qwen-Flash](/help/en/model-studio/models#59857de48eps5): qwen-flash
        
    -   [Qwen-Coder](/help/en/model-studio/models#4f6fa69743l4j): qwen3-coder-plus, qwen3-coder-flash
        
-   **Visual understanding**
    
    -   [Qwen-VL](/help/en/model-studio/models#3f1f1c8913fvo): qwen3-vl-plus, qwen3-vl-flash
        

## International

In the [International deployment mode](/help/en/model-studio/regions/#64cd6d6b13sui), the access region and data storage are located in the **Singapore region**. Inference compute resources are dynamically scheduled worldwide, excluding mainland China.

-   **Text generation**
    
    -   [Qwen-Max](/help/en/model-studio/models#c2d5833ae4jmo): qwen3-max, qwen3-max-preview, qwen-max
        
    -   [Qwen-Plus](/help/en/model-studio/models#6ad3cd90f0c5r): qwen-plus
        
    -   [Qwen-Flash](/help/en/model-studio/models#59857de48eps5): qwen-flash
        
    -   [Qwen-Turbo](/help/en/model-studio/models#ede6678dedqbz): qwen-turbo
        
    -   [Qwen-Coder](/help/en/model-studio/models#4f6fa69743l4j): qwen3-coder-plus, qwen3-coder-flash
        
-   **Visual understanding**
    
    -   [Qwen-VL](/help/en/model-studio/models#3f1f1c8913fvo): qwen3-vl-plus, qwen3-vl-flash, qwen-vl-max, qwen-vl-plus
        
-   **Domain specific**
    
    -   [Role-playing](/help/en/model-studio/models#083f31bde1lv3): qwen-plus-character-ja
        

## US

In the [US deployment mode](/help/en/model-studio/regions/#64cd6d6b13sui), the access region and data storage are located in the **US (Virginia) region**. Inference compute resources are limited to the United States.

-   **Text generation**
    
    -   [Qwen-Plus](/help/en/model-studio/models#6ad3cd90f0c5r): qwen-plus-us
        
    -   [Qwen-Flash](/help/en/model-studio/models#59857de48eps5): qwen-flash-us
        
-   **Visual understanding**
    
    -   [Qwen-VL](/help/en/model-studio/models#3f1f1c8913fvo): qwen3-vl-flash-us
        

## Mainland China

In the [Mainland China deployment mode](/help/en/model-studio/regions/#64cd6d6b13sui), the access region and data storage are located in the **Beijing region**. Inference compute resources are limited to Mainland China.

-   **Text generation**
    
    -   [Qwen-Max](/help/en/model-studio/models#bad650bae9si1): qwen3-max, qwen-max
        
    -   [Qwen-Plus](/help/en/model-studio/models#feac4060eeijd): qwen-plus
        
    -   [Qwen-Flash](/help/en/model-studio/models#3a0157da67pl0): qwen-flash
        
    -   [Qwen-Turbo](/help/en/model-studio/models#b12d085dbd8ib): qwen-turbo
        
    -   [Qwen-Coder](/help/en/model-studio/models#8c69e73d413ju): qwen3-coder-plus, qwen3-coder-flash
        
    -   [DeepSeek](/help/en/model-studio/models#861a0645aapcl): deepseek-v3.2, deepseek-v3.1, deepseek-v3, deepseek-r1
        
    -   [Kimi](/help/en/model-studio/models#842ebac43fuiq): kimi-k2-thinking, Moonshot-Kimi-K2-Instruct
        
    -   [GLM](/help/en/model-studio/models#db96fdc924eng): glm-5, glm-4.7, glm-4.6
        
-   **Visual understanding**
    
    -   [Qwen-VL](/help/en/model-studio/models#87b028bae08om): qwen3-vl-plus, qwen3-vl-flash, qwen-vl-max, qwen-vl-plus
        
-   **Domain specific**
    
    -   [Role-playing](/help/en/model-studio/models#083f31bde1lv3): qwen-plus-character
        

**Note**

Snapshots or the latest model is not currently supported.

### **How it works**

When you send a request to a model that supports implicit cache, this feature works automatically:

1.  **Search**: After the system receives a request, it uses **prefix matching** to determine if a common prefix of the content in the `messages` array exists in the cache.
    
2.  **Decision**:
    
    -   If a cache hit occurs, the system uses the cached result for generation.
        
    -   If a cache miss occurs, the system processes the request normally and stores the prefix of the current prompt in the cache for future requests.
        

> The system periodically purges cached data that has not been used for a long time. The cache hit ratio is not guaranteed to be 100%. A cache miss can occur even for identical request contexts. The system determines the actual hit probability.

**Note**

Content with fewer than 256 tokens is not cached.

### **Increase the cache hit ratio**

An implicit cache hit occurs when the system determines that different requests share a common **prefix**. To increase the hit probability, **place recurring content at the beginning of the prompt and variable content at the end.**

-   **Text models**: Assume the system has cached "ABCD". A request for "ABE" might hit the "AB" portion, but a request for "BCD" will not hit.
    
-   **Visual understanding models:**
    
    -   For multiple questions about the **same image or video**: Place the image or video before the text to increase the hit probability.
        
    -   For the same question about **different images or videos**: Place the text before the image or video to increase the hit probability.
        

### Billing

There is no extra charge to enable implicit cache mode.

When a request hits the cache, the matched input tokens are billed as `cached_tokens` at **20%** of the standard `input_token` price. Unmatched input tokens are billed at the standard `input_token` price. Output tokens are billed at the standard price.

Example: A request contains 10,000 input tokens, and 5,000 of them hit the cache. The costs are calculated as follows:

-   Unmatched tokens (5,000): Billed at 100% of the standard price.
    
-   Matched tokens (5,000): Billed at 20% of the standard price.
    

The total input cost is equivalent to 60% of the cost in a non-cached mode: (50% × 100%) + (50% × 20%) = 60%.

![image.png](https://help-static-aliyun-doc.aliyuncs.com/assets/img/en-US/4439916571/p893561.png)

You can retrieve the number of cached tokens from the `cached_tokens` attribute in the [response](#366ab5759d8ab).

> [OpenAI compatible batch](/help/en/model-studio/openai-compatible-batch-file-input/) methods are not eligible for cache discounts.

### **Cache hit examples**

## Text generation models

## OpenAI compatible

When you use an OpenAI compatible method and an implicit cache is triggered, you receive a response similar to the following. You can view the number of cached tokens in `usage.prompt_tokens_details.cached_tokens`. This value is part of `usage.prompt_tokens`.

```
{
    "choices": [
        {
            "message": {
                "role": "assistant",
                "content": "I am a large-scale language model developed by Alibaba Cloud. My name is Qwen."
            },
            "finish_reason": "stop",
            "index": 0,
            "logprobs": null
        }
    ],
    "object": "chat.completion",
    "usage": {
        "prompt_tokens": 3019,
        "completion_tokens": 104,
        "total_tokens": 3123,
        "prompt_tokens_details": {
            "cached_tokens": 2048
        }
    },
    "created": 1735120033,
    "system_fingerprint": null,
    "model": "qwen-plus",
    "id": "chatcmpl-6ada9ed2-7f33-9de2-8bb0-78bd4035025a"
}
```

## DashScope

When you use the DashScope Python SDK or an HTTP request and an implicit cache is triggered, you receive a response similar to the following. You can view the number of cached tokens in `usage.prompt_tokens_details.cached_tokens`. This value is part of `usage.input_tokens`.

```
{
    "status_code": 200,
    "request_id": "f3acaa33-e248-97bb-96d5-cbeed34699e1",
    "code": "",
    "message": "",
    "output": {
        "text": null,
        "finish_reason": null,
        "choices": [
            {
                "finish_reason": "stop",
                "message": {
                    "role": "assistant",
                    "content": "I am a large-scale language model from Alibaba Cloud. My name is Qwen. I can generate various types of text, such as articles, stories, and poems, and can adapt and expand based on different scenarios and needs. Additionally, I can answer various questions and provide help and solutions. If you have any questions or need assistance, feel free to let me know, and I will do my best to provide support. Please note that repeatedly sending the same content may not yield more detailed responses. It is recommended that you provide more specific information or vary your questions so I can better understand your needs."
                }
            }
        ]
    },
    "usage": {
        "input_tokens": 3019,
        "output_tokens": 101,
        "prompt_tokens_details": {
            "cached_tokens": 2048
        },
        "total_tokens": 3120
    }
}
```

## Visual understanding models

## OpenAI compatible

When you use an OpenAI compatible method and an implicit cache is triggered, you receive a response similar to the following. You can view the number of cached tokens in `usage.prompt_tokens_details.cached_tokens`. This value is part of `usage.prompt_tokens`.

```
{
  "id": "chatcmpl-3f3bf7d0-b168-9637-a245-dd0f946c700f",
  "choices": [
    {
      "finish_reason": "stop",
      "index": 0,
      "logprobs": null,
      "message": {
        "content": "This image shows a heartwarming scene of a woman and a dog interacting on a beach. The woman is wearing a plaid shirt and sitting on the sand, smiling as she interacts with the dog. The dog is a large, light-colored breed wearing a colorful collar, with its front paw raised as if to shake hands or give a high-five to the woman. The background is a vast ocean and sky, with sunlight shining from the right side of the frame, adding a warm and peaceful atmosphere to the entire scene.",
        "refusal": null,
        "role": "assistant",
        "audio": null,
        "function_call": null,
        "tool_calls": null
      }
    }
  ],
  "created": 1744956927,
  "model": "qwen-vl-max",
  "object": "chat.completion",
  "service_tier": null,
  "system_fingerprint": null,
  "usage": {
    "completion_tokens": 93,
    "prompt_tokens": 1316,
    "total_tokens": 1409,
    "completion_tokens_details": null,
    "prompt_tokens_details": {
      "audio_tokens": null,
      "cached_tokens": 1152
    }
  }
}
```

## DashScope

When you use the DashScope Python SDK or an HTTP request and an implicit cache is triggered, the number of cached tokens is included in the total input tokens (usage.input\_tokens). The specific field varies by region and model:

-   Beijing region:
    
    -   For `qwen-vl-max` and `qwen-vl-plus`, you can view the value in `usage.prompt_tokens_details.cached_tokens`.
        
    -   For `qwen3-vl-plus` and `qwen3-vl-flash`, you can view the value in `usage.cached_tokens`.
        
-   Singapore region: For all models, you can view the value in `usage.cached_tokens`.
    

> Models that currently use `usage.cached_tokens` will be upgraded to use `usage.prompt_tokens_details.cached_tokens` in the future.

```
{
  "status_code": 200,
  "request_id": "06a8f3bb-d871-9db4-857d-2c6eeac819bc",
  "code": "",
  "message": "",
  "output": {
    "text": null,
    "finish_reason": null,
    "choices": [
      {
        "finish_reason": "stop",
        "message": {
          "role": "assistant",
          "content": [
            {
              "text": "This image shows a heartwarming scene of a woman and a dog interacting on a beach. The woman is wearing a plaid shirt and sitting on the sand, smiling as she interacts with the dog. The dog is a large breed wearing a colorful collar, with its front paw raised as if to shake hands or give a high-five to the woman. The background is a vast ocean and sky, with sunlight shining from the right side of the frame, adding a warm and peaceful atmosphere to the entire scene."
            }
          ]
        }
      }
    ]
  },
  "usage": {
    "input_tokens": 1292,
    "output_tokens": 87,
    "input_tokens_details": {
      "text_tokens": 43,
      "image_tokens": 1249
    },
    "total_tokens": 1379,
    "output_tokens_details": {
      "text_tokens": 87
    },
    "image_tokens": 1249,
    "cached_tokens": 1152
  }
}
```

### **Scenarios**

If your requests have the same prefix, context cache can improve inference speed, reduce inference costs, and lower first-packet latency. The following are typical application scenarios:

1.  **Q&A based on long text**
    
    This is suitable for scenarios where you need to send multiple requests for a fixed long text, such as a novel, textbook, or legal document.
    
    **Message array for the first request**
    
    ```
    messages = [{"role": "system","content": "You are a language teacher who can help students with reading comprehension."},
              {"role": "user","content": "<Article Content> What feelings and thoughts does the author express in this text?"}]
    ```
    
    **An array of messages to use in subsequent requests**
    
    ```
    messages = [{"role": "system","content": "You are a language teacher who can help students with reading comprehension."},
              {"role": "user","content": "<Article Content> Please analyze the third paragraph of this text."}]
    ```
    
    Although the questions are different, they are all based on the same article. The identical system prompt and article content form a large, repetitive prefix, which results in a high cache hit probability.
    
2.  **Code auto-completion**
    
    In code auto-completion scenarios, the model completes the code based on the existing code in the context. As a user writes more code, the prefix of the code remains unchanged. The context cache can cache the existing code to improve the completion speed.
    
3.  **Multi-turn conversation**
    
    To implement a multi-turn conversation, you can add the conversation history from each turn to the messages array. Therefore, each new request contains the previous turns as a prefix, resulting in a high probability of a cache hit.
    
    **Message array for the first turn**
    
    ```
    messages=[{"role": "system","content": "You are a helpful assistant."},
              {"role": "user","content": "Who are you?"}]
    ```
    
    **Second-turn message array**
    
    ```
    messages=[{"role": "system","content": "You are a helpful assistant."},
              {"role": "user","content": "Who are you?"},
              {"role": "assistant","content": "I am Qwen, developed by Alibaba Cloud."},
              {"role": "user","content": "What can you do?"}]
    ```
    
    As the number of conversation turns increases, caching becomes more advantageous for inference speed and cost.
    
4.  **Role-playing or few-shot learning**
    
    In role-playing or few-shot learning scenarios, you typically need to include a large amount of information in the prompt to guide the model's output format. This results in a large, repetitive prefix between different requests.
    
    For example, to have the model act as a marketing expert, the system prompt contains a large amount of text. The following are message examples for two requests:
    
    ```
    system_prompt = """You are an experienced marketing expert. Please provide detailed marketing suggestions for different products in the following format:
    
    1. Target audience: xxx
    
    2. Key selling points: xxx
    
    3. Marketing channels: xxx
    ...
    12. Long-term development strategy: xxx
    
    Please ensure your suggestions are specific, actionable, and highly relevant to the product features."""
    
    # The user message for the first request asks about a smartwatch
    messages_1=[
      {"role": "system", "content": system_prompt},
      {"role": "user", "content": "Please provide marketing suggestions for a newly launched smartwatch."}
    ]
    
    # The user message for the second request asks about a laptop. Because the system_prompt is the same, there is a high probability of a cache hit.
    messages_2=[
      {"role": "system", "content": system_prompt},
      {"role": "user", "content": "Please provide marketing suggestions for a newly launched laptop."}
    ]
    ```
    
    With context cache, even if the user frequently changes the type of product they are asking about, such as from a smartwatch to a laptop, the system can respond quickly after the cache is triggered.
    
5.  **Video understanding**
    
    In video understanding scenarios, if you ask multiple questions about the same video, placing `video` before `text` increases the cache hit ratio. If you ask the same question about different videos, placing `text` before `video`. The following are message examples for two requests about the same video:
    
    ```
    # The user message for the first request asks about the content of this video
    messages1 = [
        {"role":"system","content":[{"text": "You are a helpful assistant."}]},
        {"role": "user",
            "content": [
                {"video": "https://help-static-aliyun-doc.aliyuncs.com/file-manage-files/zh-CN/20250328/eepdcq/phase_change_480p.mov"},
                {"text": "What is the content of this video?"}
            ]
        }
    ]
    
    # The user message for the second request asks about video timestamps. Because the question is based on the same video, placing the video before the text has a high probability of a cache hit.
    messages2 = [
        {"role":"system","content":[{"text": "You are a helpful assistant."}]},
        {"role": "user",
            "content": [
                {"video": "https://help-static-aliyun-doc.aliyuncs.com/file-manage-files/zh-CN/20250328/eepdcq/phase_change_480p.mov"},
                {"text": "Please describe the series of events in the video. Output the start time (start_time), end time (end_time), and event (event) in JSON format. Do not include the ```json``` code segment."}
            ]
        }
    ]
    ```
    

## **FAQ**

### **Q: How do I disable implicit cache?**

A: You cannot. Implicit cache is enabled for all applicable requests because it does not affect response quality. It reduces costs and improves response speed when a cache hit occurs.

### **Q: Why did a cache miss occur after I created an explicit cache?**

A: Possible reasons include the following:

-   The cache was not hit within 5 minutes. The system purges the cache block after its validity period expires.
    
-   A cache hit does not occur if the last `content` is separated from the existing cache block by more than 20 `content` blocks. We recommend that you create a new cache block.
    

### **Q: Does a hit on an explicit cache reset its validity period?**

A: Yes, it does. Each hit resets the validity period of the cache block to 5 minutes.

### **Q: Are explicit caches shared between different accounts?**

A: No, they are not. Both implicit and explicit cache data is isolated at the account level.

### **Q:** If the same account uses different models, are their explicit caches shared?

A: No, they are not. Cache data is isolated between models.

### **Q: Why is** `**usage**`**.**`**input_tokens**` **not equal to the sum of** `**cache_creation_input_tokens**` **and** `**cached_tokens**`**?**

A: To ensure model performance, the backend service appends a small number of tokens (usually fewer than 10) after the user-provided prompt. These tokens are placed after the `cache_control` marker, so they are not counted in the cache creation or read operations, but they are included in the total `input_tokens`.