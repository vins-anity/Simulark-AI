Models cannot accurately answer real-time questions, such as inquiries about stock prices or weather forecasts. The web search feature helps the model to answer questions using real-time data retrieved from the web.

## **Usage**

When you call a model, pass the `enable_search: true` parameter to enable web search. After this feature is enabled, the model determines whether the user's question requires a web search. If a web search is required, the model uses the search results to formulate an answer. Otherwise, it relies on its internal knowledge.

The following examples show the core code using the OpenAI compatible and DashScope Python SDK.

## OpenAI compatible - Responses API

Add the `web_search` tool to the `tools` parameter.

> The Responses API only supports qwen3-max, qwen3-max-2026-01-23, qwen3.5-plus, and qwen3.5-plus-2026-02-15

> For optimal results, enabling the `web_search`, `web_extractor`, and `code_interpreter` tools at the same time.

```
# Import dependencies and create a client...
response = client.responses.create(
    model="qwen3-max-2026-01-23",
    input="Hangzhou weather",
    tools=[
        {"type": "web_search"},
        {"type": "web_extractor"},
        {"type": "code_interpreter"}
    ],
    extra_body={"enable_thinking": True}
)
```

## OpenAI compatible - Chat Completions API

```
# Import dependencies and create a client...
completion = client.chat.completions.create(
    # Use a model that supports web search.
    model="qwen3-max",
    messages=[{"role": "user", "content": "What is the weather in Hangzhou tomorrow?"}],
    # Because enable_search is not a standard OpenAI parameter, you must pass it through extra_body when using the Python SDK. When using the Node.js SDK, pass it as a top-level parameter.
    extra_body={"enable_search": True}
)
```

## DashScope

```
# Import dependencies...
response = dashscope.Generation.call(
    # If the environment variable is not set, replace the following line with your Model Studio API key: api_key="sk-xxx",
    api_key=os.getenv("DASHSCOPE_API_KEY"),
    # Use a model that supports web search.
    model="qwen3-max",
    messages=[{"role": "user", "content": "What is the weather in Hangzhou tomorrow?"}],
    # Enable web search using the enable_search parameter.
    enable_search=True,
    result_format="message"
)
```

## **Supported models**

## **International**

-   **qwen-plus:** qwen3.5-plus, qwen3.5-plus-2026-02-15 and later snapshots.
    
-   **qwen3-max** and **qwen3-max-2026-01-23**:
    
    -   Non-thinking mode: Set the search policy to `agent`.
        
    -   Thinking mode: Set the search policy to `agent` or `agent_max`.
        
-   **qwen3-max-2025-09-23**: Set the search policy to `agent`.
    

## **Getting started**

Run the following code to quickly query stock information using the web search service.

#### **OpenAI compatible**

> The OpenAI compatible protocol does not support returning search sources in the response.

##### **Python**

```
import os
from openai import OpenAI

client = OpenAI(
    # If the environment variable is not set, replace the following line with your Model Studio API key: api_key="sk-xxx",
    api_key=os.getenv("DASHSCOPE_API_KEY"),
    base_url="https://dashscope-intl.aliyuncs.com/compatible-mode/v1",
)
completion = client.chat.completions.create(
    model="qwen3-max",
    messages=[
        {"role": "system", "content": "You are a helpful assistant."},
        {"role": "user", "content": "What is the stock price of Alibaba?"},
    ],
    extra_body={
        "enable_search": True,
        "search_options": {
            # Web search strategy. Only the agent strategy is supported.
            "search_strategy": "agent"
        }
    }
)
print(completion.choices[0].message.content)
```

###### **Sample response**

```
According to the latest market data, Alibaba's stock price in different markets is as follows:

*   **US Stock (BABA)**: The latest stock price is approximately **159.84 USD**.
*   **Hong Kong Stock (09988.HK)**: The latest stock price is approximately **158.00 HKD**.

Note that stock prices fluctuate in real time. The information above is for reference only. According to the latest market data, Alibaba's stock price in different markets is as follows:

*   **US Stock (BABA)**: The latest stock price is approximately **159.84 USD**.
*   **Hong Kong Stock (09988.HK)**: The latest stock price is approximately **158.00 HKD**.

Note that stock prices fluctuate in real time. The information above is for reference only.
```

##### **Node.js**

```
import OpenAI from "openai";

const openai = new OpenAI({
    apiKey: process.env.DASHSCOPE_API_KEY,
    baseURL: "https://dashscope-intl.aliyuncs.com/compatible-mode/v1"
});

async function main() {
    const completion = await openai.chat.completions.create({
        model: "qwen3-max",
        messages: [
            { role: "user", content: "What is the stock price of Alibaba?" }
        ],
        enable_search: true,
        search_options: {
            // The web search policy. This can only be set to "agent".
            search_strategy: "agent"
        }
    });
    console.log(completion.choices[0].message.content);
}

main();
```

###### **Sample response**

```
According to the latest market data, Alibaba's stock price in different markets is as follows:

*   **US Stock (BABA)**: The latest stock price is approximately **159.84 USD**.
*   **Hong Kong Stock (09988.HK)**: The latest stock price is approximately **158.00 HKD**.

Note that stock prices fluctuate in real time. The information above is for reference only. According to the latest market data, Alibaba's stock price in different markets is as follows:

*   **US Stock (BABA)**: The latest stock price is approximately **159.84 USD**.
*   **Hong Kong Stock (09988.HK)**: The latest stock price is approximately **158.00 HKD**.

Note that stock prices fluctuate in real time. The information above is for reference only.
```

##### **curl**

```
curl -X POST https://dashscope-intl.aliyuncs.com/compatible-mode/v1/chat/completions \
-H "Authorization: Bearer $DASHSCOPE_API_KEY" \
-H "Content-Type: application/json" \
-d '{
    "model": "qwen3-max",
    "messages": [
        {
            "role": "user", 
            "content": "What is the stock price of Alibaba?"
        }
    ],
    "enable_search": true,
    "search_options": {
        "search_strategy": "agent"
    }
}'
```

#### **DashScope**

> Set `enable_source` to `true` to include search sources in the response data.

##### **Python**

```
import os
import dashscope
dashscope.base_http_api_url = "https://dashscope-intl.aliyuncs.com/api/v1"

response = dashscope.Generation.call(
    api_key=os.getenv("DASHSCOPE_API_KEY"),
    model="qwen3-max",
    messages=[{"role": "user", "content": "Alibaba stock price"}],
    enable_search=True,
    search_options={
        # Web search strategy. Currently, only the agent strategy is supported. It can call the web search tool and the LLM multiple times to perform multi-round information retrieval and content integration.
        "search_strategy": "agent",
        "enable_source": True # Specifies whether to return search sources.
    },
    result_format="message",
)
print("="*20 + "Search results" + "="*20)
for web in response.output.search_info["search_results"]:
    print(f"[{web['index']}]: [{web['title']}]({web['url']})")
print("="*20 + "Response content" + "="*20)
print(response.output.choices[0].message.content)
```

###### **Sample response**

```
====================Search results====================
[1]: [Alibaba (BABA) Stock Price_Quotes_Chart - East Money](https://wap.eastmoney.com/quote/stock/106.BABA.html)
[2]: [Alibaba (BABA)_US Stock Quotes_Today's Price and Chart - Sina Finance](https://gu.sina.cn/quotes/us/BABA)
[3]: [Alibaba (BABA) Stock Latest Price, Real-time Chart, Analysis and Prediction](https://cn.investing.com/equities/alibaba)
[4]: [Alibaba-SW (9988.HK) Stock Price, News, Quote & History - Yahoo Finance](https://hk.finance.yahoo.com/quote/9988.HK/)
[5]: [Alibaba (BABA) Stock Price_Quotes_Discussion - Xueqiu](https://xueqiu.com/S/BABA)
[6]: [Alibaba (BABA) Stock Price, Market Cap, Real-time Quotes, Chart, Financials - Moomoo](https://www.moomoo.com/hans/stock/BABA-US)
[7]: [Alibaba Group Holding Limited (BABA) Stock Price, News, Quote ...](https://finance.yahoo.com/quote/BABA/)
[8]: [Alibaba - Tencent Securities](https://gu.qq.com/usBABA.N)
[9]: [SW(09988) Stock Price, Market Cap, Real-time Quotes, Chart, Financials - Alibaba - Moomoo](https://www.moomoo.com/hans/stock/09988-HK)
====================Response content====================
According to the latest market data, Alibaba's stock price information is as follows:

*   **US Stock (BABA)**:
    *   Today's opening price: 160.98 USD
    *   Yesterday's closing price: 160.80 USD
    *   Today's high: 161.19 USD
    *   Today's low: 156.20 USD

*   **Hong Kong Stock (09988.HK)**:
    *   Latest quote is approximately: 158.00 - 158.10 HKD
    *   Today's opening price: 156.50 HKD
    *   Previous trading day's closing price: 162.00 HKD
    *   Today's trading range: 156.30 - 158.40 HKD
```

##### **Java**

```
import com.alibaba.dashscope.aigc.generation.Generation;
import com.alibaba.dashscope.aigc.generation.GenerationParam;
import com.alibaba.dashscope.aigc.generation.GenerationResult;
import com.alibaba.dashscope.aigc.generation.SearchOptions;
import com.alibaba.dashscope.common.Message;
import com.alibaba.dashscope.utils.Constants;
import com.alibaba.dashscope.common.Role;
import java.util.Arrays;

public class Main {
    static {Constants.baseHttpApiUrl="https://dashscope-intl.aliyuncs.com/api/v1";}
    public static void main(String[] args) {
        Generation gen = new Generation();
        Message userMsg = Message.builder()
                .role(Role.USER.getValue())
                .content("Alibaba's stock price")
                .build();

        SearchOptions searchOptions = SearchOptions.builder()
                // Web search strategy. Only the agent strategy is supported.
                .searchStrategy("agent")
                // Return search sources.
                .enableSource(true)
                .build();

        GenerationParam param = GenerationParam.builder()
                .apiKey(System.getenv("DASHSCOPE_API_KEY"))
                .model("qwen3-max")
                .messages(Arrays.asList(userMsg))
                .resultFormat(GenerationParam.ResultFormat.MESSAGE)
                .enableSearch(true)
                .searchOptions(searchOptions)
                .build();
        try {
            GenerationResult result = gen.call(param);
            System.out.println("=".repeat(20)+"Search results"+"=".repeat(20));
            System.out.println(result.getOutput().getSearchInfo().getSearchResults());
            System.out.println("=".repeat(20)+"Response content"+"=".repeat(20));
            System.out.println(result.getOutput().getChoices().get(0).getMessage().getContent());
        } catch (Exception e) {
            System.out.println("Error: " + e.getMessage());
        }
    }
}
```

###### **Sample response**

```
====================Search results====================
[SearchInfo.SearchResult(siteName=null, icon=null, index=1, title=Alibaba (BABA) Stock Price_Quotes_Chart - East Money, url=https://wap.eastmoney.com/quote/stock/106.BABA.html), SearchInfo.SearchResult(siteName=null, icon=null, index=2, title=Alibaba (BABA)_US Stock Quotes_Today's Price and Chart - Sina Finance, url=https://gu.sina.cn/quotes/us/BABA), SearchInfo.SearchResult(siteName=null, icon=null, index=3, title=Alibaba (BABA) Stock Latest Price, Real-time Chart, Analysis and Prediction, url=https://cn.investing.com/equities/alibaba), SearchInfo.SearchResult(siteName=null, icon=null, index=4, title=Alibaba (BABA) Stock Price_Quotes_Discussion - Xueqiu, url=https://xueqiu.com/S/BABA), SearchInfo.SearchResult(siteName=null, icon=null, index=5, title=Alibaba-SW (9988.HK) Stock Price, News, Quote & History - Yahoo Finance, url=https://hk.finance.yahoo.com/quote/9988.HK/), SearchInfo.SearchResult(siteName=null, icon=null, index=6, title=Alibaba (BABA) Stock Price, Market Cap, Real-time Quotes, Chart, Financials - Moomoo, url=https://www.moomoo.com/hans/stock/BABA-US), SearchInfo.SearchResult(siteName=null, icon=null, index=7, title=Alibaba Group Holding Limited (BABA) - Yahoo Finance, url=https://finance.yahoo.com/quote/BABA/), SearchInfo.SearchResult(siteName=null, icon=null, index=8, title=Alibaba - Tencent Securities, url=https://gu.qq.com/usBABA.N), SearchInfo.SearchResult(siteName=null, icon=null, index=9, title=SW(09988) Stock Price, Market Cap, Real-time Quotes, Chart, Financials - Alibaba - Moomoo, url=https://www.moomoo.com/hans/stock/09988-HK)]
====================Response content====================
According to the latest market data, Alibaba's stock price is as follows:

*   **US Stock (BABA)**: The latest stock price is approximately **159.84 USD**.
*   **Hong Kong Stock (09988.HK)**: The latest stock price is approximately **158.00 HKD**.

Note that stock prices fluctuate with market trading in real time. The information above is for reference only.
```

##### **curl**

```
curl -X POST https://dashscope-intl.aliyuncs.com/api/v1/services/aigc/text-generation/generation \
-H "Authorization: Bearer $DASHSCOPE_API_KEY" \
-H "Content-Type: application/json" \
-d '{
    "model": "qwen3-max",
    "input":{
        "messages":[      
            {
                "role": "user",
                "content": "Alibaba's stock price"
            }
        ]
    },
    "parameters": {
        "enable_search": true,
        "search_options": {
            "search_strategy": "agent",
            "enable_source": true
        },
        "result_format": "message"
    }
}'
```

###### **Sample response**

```
{
  "output": {
    "choices": [
      {
        "finish_reason": "stop",
        "message": {
          "content": "According to the latest market data, Alibaba's stock price varies because it is listed on both the US and Hong Kong stock exchanges:\n\n*   **US Stock (BABA)**: The latest stock price is approximately **160.40 USD**.\n    *   Today's opening price: 160.98 USD\n    *   Today's trading range: 156.20 - 161.19 USD\n\n*   **Hong Kong Stock (09988.HK)**: The latest stock price is approximately **158.10 HKD**.\n    *   Today's opening price: 156.50 HKD\n    *   Today's trading range: 156.30 - 158.40 HKD\n\nPlease note that stock prices fluctuate with market trading in real time. The information above is for reference only.",
          "role": "assistant"
        }
      }
    ],
    "search_info": {
      "search_results": [
        {
          "index": 1,
          "title": "Alibaba (BABA) Stock Price_Quotes_Chart - East Money",
          "url": "https://wap.eastmoney.com/quote/stock/106.BABA.html"
        },
        {
          "index": 2,
          "title": "Alibaba (BABA)_US Stock Quotes_Today's Price and Chart - Sina Finance",
          "url": "https://gu.sina.cn/quotes/us/BABA"
        },
        {
          "index": 3,
          "title": "Alibaba-SW (9988.HK) Stock Price, News, Quote & History - Yahoo Finance",
          "url": "https://hk.finance.yahoo.com/quote/9988.HK/"
        },
        {
          "index": 4,
          "title": "Alibaba (BABA) Stock Latest Price, Real-time Chart, Analysis and Prediction",
          "url": "https://cn.investing.com/equities/alibaba"
        },
        {
          "index": 5,
          "title": "Alibaba (BABA) Stock Price_Quotes_Discussion - Xueqiu",
          "url": "https://xueqiu.com/S/BABA"
        },
        {
          "index": 6,
          "title": "Alibaba (BABA) Stock Price, Market Cap, Real-time Quotes, Chart, Financials - Moomoo",
          "url": "https://www.moomoo.com/hans/stock/BABA-US"
        },
        {
          "index": 7,
          "title": "SW(09988) Stock Price, Market Cap, Real-time Quotes, Chart, Financials - Alibaba - Moomoo",
          "url": "https://www.moomoo.com/hans/stock/09988-HK"
        },
        {
          "index": 8,
          "title": "Alibaba Group Holding Limited (BABA) Stock Price, News, Quote & History",
          "url": "https://hk.finance.yahoo.com/quote/BABA/"
        },
        {
          "index": 9,
          "title": "Alibaba - Tencent Securities",
          "url": "https://gu.qq.com/usBABA.N"
        }
      ]
    }
  },
  "usage": {
    "input_tokens": 2004,
    "output_tokens": 203,
    "plugins": {
      "search": {
        "count": 1,
        "strategy": "agent"
      }
    },
    "prompt_tokens_details": {
      "cached_tokens": 0
    },
    "total_tokens": 2207
  },
  "request_id": "45c231d2-811e-4e04-a361-f2c1909f1dd9"
}
```

## **Web search with Responses API**

Add `web_search` to the `tools` array.

> This feature is only supported for qwen3-max and qwen3-max-2026-01-23 in thinking mode, qwen3.5-plus, and qwen3.5-plus-2026-02-15 in the international region.

> For optimal results, enabling the `web_search`, `web_extractor`, and `code_interpreter` tools at the same time.

Python

```
from openai import OpenAI
import os

client = OpenAI(
    # If the environment variable is not set, replace the following line with your Model Studio API key: api_key="sk-xxx",
    api_key=os.getenv("DASHSCOPE_API_KEY"),
    base_url="https://dashscope-intl.aliyuncs.com/api/v2/apps/protocols/compatible-mode/v1"
)

response = client.responses.create(
    model="qwen3-max-2026-01-23",
    input="Weather in Singapore",
    tools=[
        {"type": "web_search"},
        {"type": "web_extractor"},
        {"type": "code_interpreter"}
    ],
    extra_body={"enable_thinking": True}
)

print("="*20 + "Response Content" + "="*20)
print(response.output_text)

print("="*20 + "Tool Call Count" + "="*20)
usage = response.usage
if hasattr(usage, 'x_tools') and usage.x_tools:
    print(f"Web Search Count: {usage.x_tools.get('web_search', {}).get('count', 0)}")
# Uncomment the following lines to view the intermediate process output
# for r in response.output:
#     print(r.model_dump_json())
```

Node.js

```
import OpenAI from "openai";

const openai = new OpenAI({
    // If you have not configured the environment variable, replace the following line with your Model Studio API key: apiKey: "sk-xxx",
    apiKey: process.env.DASHSCOPE_API_KEY,
    baseURL: "https://dashscope-intl.aliyuncs.com/api/v2/apps/protocols/compatible-mode/v1"
});

async function main() {
    const response = await openai.responses.create({
        model: "qwen3-max-2026-01-23",
        input: "Singapore weather",
        tools: [
            { type: "web_search" },
            { type: "web_extractor" },
            { type: "code_interpreter" }
        ],
        enable_thinking: true
    });

    console.log("====================Response Content====================");
    console.log(response.output_text);
// Set the search volume policy
    console.log("====================Tool Calling Count====================");
// You can use search_strategy to set the search volume policy based on your requirements for cost, performance, and response speed.
        console.log(`Web search count: ${response.usage.x_tools.web_search?.count || 0}`);

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
    "input": "Singapore weather",
    "tools": [
        {"type": "web_search"},
        {"type": "web_extractor"},
        {"type": "code_interpreter"}
    ],
    "enable_thinking": true
}'
```

## **Billing**

Billing involves two aspects:

-   **Model cost**: The content of searched web pages is added to the prompt, which increases the number of input tokens for the model. This is billed at the standard price of the model, listed in [Model list](/help/en/model-studio/models).
    
-   **Search strategy cost**:
    
    -   **Agent strategy**:
        
        -   The fee for every 1,000 calls is 10.00 USD in the international region.
            
    -   **Agent\_max strategy (limited-time offer)**:
        
        Includes fees for web search and web extractor.
        
        -   Web search tool fee per 1,000 invocations:
            
            -   Mainland China: $0.57341.
                
            -   International: $10.00.
                
        -   Web extractor is free for a limited time.
            

## **Error messages**

If an error occurs during execution, see [Error messages](/help/en/model-studio/error-code) for troubleshooting information.

 span.aliyun-docs-icon { color: transparent !important; font-size: 0 !important; } span.aliyun-docs-icon:before { color: black; font-size: 16px; } span.aliyun-docs-icon.icon-size-20:before { font-size: 20px; } span.aliyun-docs-icon.icon-size-22:before { font-size: 22px; } span.aliyun-docs-icon.icon-size-24:before { font-size: 24px; } span.aliyun-docs-icon.icon-size-26:before { font-size: 26px; } span.aliyun-docs-icon.icon-size-28:before { font-size: 28px; }