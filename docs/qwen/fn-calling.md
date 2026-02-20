Large Language Models (LLMs) may perform poorly on time-sensitive tasks or mathematical calculations. Function Calling solves this by enabling LLMs to use external tools to answer questions they cannot solve on their own.

## **How it works**

Function Calling enables LLMs to reference external tools through multi-step interactions between your application and the model.

1.  **Make the first model call**
    
    Your application sends a request to the LLM. The request includes the user’s question and a list of tools the model can call.
    
2.  **Receive the model’s tool call instruction (tool name and input parameters)**
    
    If the model determines a tool is needed, it returns a JSON-formatted instruction. This instruction tells your application which function to run and what parameters to pass.
    
    > If no tool is needed, the model returns a natural-language response.
    
3.  **Run the tool in your application**
    
    After receiving the tool instruction, your application runs the tool and obtains its output.
    
4.  **Make the second model call**
    
    After obtaining the tool’s output, add it to the model’s context (messages), then call the model again.
    
5.  **Receive the final model response**
    
    The model combines the tool’s output and the user’s question to generate a natural-language response.
    

The workflow diagram is shown below:

![image](https://help-static-aliyun-doc.aliyuncs.com/assets/img/en-US/0041041771/CAEQUxiBgMCR3fao4RkiIDY0YmY0NWU2NzM0MzQ3NWU5OWY1ZWRjM2Y2MWI4NTMx4358988_20240409160230.951.svg)

## **Supported models**

## Qwen

-   **Text generation models**
    
    -   [Qwen-Max](/help/en/model-studio/models#qwen-max-intl-sp)
        
    -   [Qwen-Plus](/help/en/model-studio/models#1e0e75495dyvu)
        
    -   [Qwen-Flash](/help/en/model-studio/models#qwenflashintl)
        
    -   [Qwen-Turbo](/help/en/model-studio/models#5169965cbfeyp)
        
    -   [Qwen3.5](/help/en/model-studio/models#568c06efe4440)
        
    -   [Qwen3](/help/en/model-studio/models#c5414da58bjgj)
        
    -   [Qwen2.5](/help/en/model-studio/models#cae1159e00ixp)
        
-   **Multimodal models**
    
    -   [Qwen-VL](/help/en/model-studio/models#11b9e47081cwz) (qwen3-vl-plus and qwen3-vl-flash only)
        
    -   [Qwen-Omni](/help/en/model-studio/models#92d9861245f73) (qwen3-omni-flash only)
        
    -   [Qwen3-VL](/help/en/model-studio/models#5587bad74fn1g)
        

## DeepSeek

-   deepseek-v3.2
    
-   deepseek-v3.2-exp (non-thinking mode)
    
-   deepseek-v3.1 (non-thinking mode)
    
-   deepseek-r1
    
-   deepseek-r1-0528
    
-   deepseek-v3
    

## GLM

-   glm-5
    
-   glm-4.7
    
-   glm-4.6
    

## Kimi

-   kimi-k2.5
    
-   kimi-k2-thinking
    
-   Moonshot-Kimi-K2-Instruct
    

## **QuickStart**

You need an [API key and API host](/help/en/model-studio/get-api-key). You also need to [set the API key as an environment variable](/help/en/model-studio/configure-api-key-through-environment-variables) (this step will be deprecated and integrated into the API key configuration). If you use the OpenAI SDK or DashScope SDK, you must [install the SDK](/help/en/model-studio/install-sdk#210ee28162bs7).

This section shows how to use Function Calling with a weather lookup scenario.

## OpenAI compatible

Python

```
from openai import OpenAI
from datetime import datetime
import json
import os
import random

client = OpenAI(
    # If you use a model from the Beijing region, use the Beijing-region API key. Get link: https://bailian.console.alibabacloud.com/?tab=model#/api-key
    # If you have not set the environment variable, replace the line below with your Model Studio API key: api_key="sk-xxx",
    api_key=os.getenv("DASHSCOPE_API_KEY"),
    # If you use a model from the Beijing region, replace base_url with: https://dashscope.aliyuncs.com/compatible-mode/v1
    base_url="https://dashscope-intl.aliyuncs.com/compatible-mode/v1",  
)
# Simulate user question
USER_QUESTION = "What's the weather in Singapore?"
# Define tool list
tools = [
    {
        "type": "function",
        "function": {
            "name": "get_current_weather",
            "description": "Useful when you want to check the weather for a specific city.",
            "parameters": {
                "type": "object",
                "properties": {
                    "location": {
                        "type": "string",
                        "description": "City or county, such as Singapore or New York.",
                    }
                },
                "required": ["location"],
            },
        },
    },
]


# Simulate weather lookup tool
def get_current_weather(arguments):
    weather_conditions = ["sunny", "cloudy", "rainy"]
    random_weather = random.choice(weather_conditions)
    location = arguments["location"]
    return f"{location} is {random_weather} today."


# Wrap model response function
def get_response(messages):
    completion = client.chat.completions.create(
        model="qwen-plus",
        messages=messages,
        tools=tools,
    )
    return completion


messages = [{"role": "user", "content": USER_QUESTION}]
response = get_response(messages)
assistant_output = response.choices[0].message
if assistant_output.content is None:
    assistant_output.content = ""
messages.append(assistant_output)
# If no tool is needed, output content directly
if assistant_output.tool_calls is None:
    print(f"No weather tool call needed. Direct reply: {assistant_output.content}")
else:
    # Enter tool calling loop
    while assistant_output.tool_calls is not None:
        tool_call = assistant_output.tool_calls[0]
        tool_call_id = tool_call.id
        func_name = tool_call.function.name
        arguments = json.loads(tool_call.function.arguments)
        print(f"Calling tool [{func_name}], parameters: {arguments}")
        # Execute tool
        tool_result = get_current_weather(arguments)
        # Build tool response message
        tool_message = {
            "role": "tool",
            "tool_call_id": tool_call_id,
            "content": tool_result,  # Keep original tool output
        }
        print(f"Tool returned: {tool_message['content']}")
        messages.append(tool_message)
        # Call model again to get summarized natural-language reply
        response = get_response(messages)
        assistant_output = response.choices[0].message
        if assistant_output.content is None:
            assistant_output.content = ""
        messages.append(assistant_output)
    print(f"Final assistant reply: {assistant_output.content}")
```

Node.js

```
import OpenAI from 'openai';  
  
// Initialize the client  
const openai = new OpenAI({  
  apiKey: process.env.DASHSCOPE_API_KEY,  
  // If you use a model from the Beijing region, replace baseURL with: https://dashscope.aliyuncs.com/compatible-mode/v1  
  baseURL: "https://dashscope-intl.aliyuncs.com/compatible-mode/v1",  
});  
  
// Define tool list  
const tools = [  
  {  
    type: "function",  
    function: {  
      name: "get_current_weather",  
      description: "Useful when you want to check the weather for a specific city.",  
      parameters: {  
        type: "object",  
        properties: {  
          location: {  
            type: "string",  
            description: "City or county, such as Singapore or New York.",  
          },  
        },  
        required: ["location"],  
      },  
    },  
  },  
];  
  
// Simulate weather lookup tool  
const getCurrentWeather = (args) => {  
  const weatherConditions = ["sunny", "cloudy", "rainy"];  
  const randomWeather = weatherConditions[Math.floor(Math.random() * weatherConditions.length)];  
  const location = args.location;  
  return `${location} is ${randomWeather} today.`;  
};  
  
// Wrap model response function  
const getResponse = async (messages) => {  
  const response = await openai.chat.completions.create({  
    model: "qwen-plus",  
    messages: messages,  
    tools: tools,  
  });  
  return response;  
};  

const main = async () => {  
  const input = "What's the weather in Singapore?";

  let messages = [  
    {  
      role: "user",  
      content: input,  
    }  
  ];  
  let response = await getResponse(messages);  
  let assistantOutput = response.choices[0].message;  
  // Ensure content is not null  
  if (!assistantOutput.content) assistantOutput.content = "";  
  messages.push(assistantOutput);  
  // Determine whether to call a tool  
  if (!assistantOutput.tool_calls) {  
    console.log(`No weather tool call needed. Direct reply: ${assistantOutput.content}`);  
  } else {  
    // Enter tool calling loop  
    while (assistantOutput.tool_calls) {  
      const toolCall = assistantOutput.tool_calls[0];  
      const toolCallId = toolCall.id;  
      const funcName = toolCall.function.name;  
      const funcArgs = JSON.parse(toolCall.function.arguments);  
      console.log(`Calling tool [${funcName}], parameters:`, funcArgs);  
      // Execute tool  
      const toolResult = getCurrentWeather(funcArgs);  
      // Build tool response message  
      const toolMessage = {  
        role: "tool",  
        tool_call_id: toolCallId,  
        content: toolResult,  
      };  
      console.log(`Tool returned: ${toolMessage.content}`);  
      messages.push(toolMessage);  
      // Call model again to get natural-language summary  
      response = await getResponse(messages);  
      assistantOutput = response.choices[0].message;  
      if (!assistantOutput.content) assistantOutput.content = "";  
      messages.push(assistantOutput);  
    }  
    console.log(`Final assistant reply: ${assistantOutput.content}`);  
  }  
};  
  
// Start program  
main().catch(console.error);
```

## DashScope

Python

```
import os
from dashscope import Generation
import dashscope
import json
import random
# If you use a model from the Beijing region, replace base_http_api_url with: https://dashscope.aliyuncs.com/api/v1
dashscope.base_http_api_url = 'https://dashscope-intl.aliyuncs.com/api/v1'

# 1. Define tool list
tools = [
    {
        "type": "function",
        "function": {
            "name": "get_current_weather",
            "description": "Useful when you want to check the weather for a specific city.",
            "parameters": {
                "type": "object",
                "properties": {
                    "location": {
                        "type": "string",
                        "description": "City or county, such as Singapore or New York.",
                    }
                },
                "required": ["location"],
            },
        },
    }
]

# 2. Simulate weather lookup tool
def get_current_weather(arguments):
    weather_conditions = ["sunny", "cloudy", "rainy"]
    random_weather = random.choice(weather_conditions)
    location = arguments["location"]
    return f"{location} is {random_weather} today."

# 3. Wrap model response function
def get_response(messages):
    response = Generation.call(
        # If you have not set the environment variable, replace the line below with api_key="sk-xxx"
        api_key=os.getenv("DASHSCOPE_API_KEY"),
        model="qwen-plus",
        messages=messages,
        tools=tools,
        result_format="message",
    )
    return response

# 4. Initialize conversation history
messages = [
    {
        "role": "user",
        "content": "What's the weather in Singapore?"
    }
]

# 5. First model call
response = get_response(messages)
assistant_output = response.output.choices[0].message
messages.append(assistant_output)

# 6. Determine whether to call a tool
if "tool_calls" not in assistant_output or not assistant_output["tool_calls"]:
    print(f"No tool call needed. Direct reply: {assistant_output['content']}")
else:
    # 7. Enter tool calling loop
    # Loop condition: continue as long as the latest model reply contains a tool call request
    while "tool_calls" in assistant_output and assistant_output["tool_calls"]:
        tool_call = assistant_output["tool_calls"][0]
        # Parse tool call information
        func_name = tool_call["function"]["name"]
        arguments = json.loads(tool_call["function"]["arguments"])
        tool_call_id = tool_call.get("id")  # Get tool_call_id
        print(f"Calling tool [{func_name}], parameters: {arguments}")
        # Execute corresponding tool function
        tool_result = get_current_weather(arguments)
        # Build tool response message
        tool_message = {
            "role": "tool",
            "content": tool_result,
            "tool_call_id": tool_call_id
        }
        print(f"Tool returned: {tool_message['content']}")
        messages.append(tool_message)
        # Call model again to let it reply based on tool result
        response = get_response(messages)
        assistant_output = response.output.choices[0].message
        messages.append(assistant_output)
    # 8. Output final natural-language reply
    print(f"Final assistant reply: {assistant_output['content']}")
```

Java

```
import com.alibaba.dashscope.aigc.generation.Generation;
import com.alibaba.dashscope.aigc.generation.GenerationParam;
import com.alibaba.dashscope.aigc.generation.GenerationResult;
import com.alibaba.dashscope.common.Message;
import com.alibaba.dashscope.common.Role;
import com.alibaba.dashscope.protocol.Protocol;
import com.alibaba.dashscope.exception.InputRequiredException;
import com.alibaba.dashscope.exception.NoApiKeyException;
import com.alibaba.dashscope.tools.FunctionDefinition;
import com.alibaba.dashscope.tools.ToolCallBase;
import com.alibaba.dashscope.tools.ToolCallFunction;
import com.alibaba.dashscope.tools.ToolFunction;
import com.alibaba.dashscope.utils.JsonUtils;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Random;

public class Main {

    /**
     * Local implementation of the tool.
     * @param arguments JSON string containing tool parameters passed by the model.
     * @return String result of tool execution.
     */
    public static String getCurrentWeather(String arguments) {
        try {
            // Parameters provided by the model are in JSON format and must be parsed manually.
            ObjectMapper objectMapper = new ObjectMapper();
            JsonNode argsNode = objectMapper.readTree(arguments);
            String location = argsNode.get("location").asText();

            // Use random results to simulate real API calls or business logic.
            List<String> weatherConditions = Arrays.asList("sunny", "cloudy", "rainy");
            String randomWeather = weatherConditions.get(new Random().nextInt(weatherConditions.size()));

            return location + " is " + randomWeather + " today.";
        } catch (Exception e) {
            // Exception handling to ensure robustness.
            return "Unable to parse location parameter.";
        }
    }

    public static void main(String[] args) {
        try {
            // Register our tool with the model.
            String weatherParamsSchema =
                    "{\"type\":\"object\",\"properties\":{\"location\":{\"type\":\"string\",\"description\":\"City or county, such as Singapore or New York.\"}},\"required\":[\"location\"]}";

            FunctionDefinition weatherFunction = FunctionDefinition.builder()
                    .name("get_current_weather") // Unique identifier for the tool, must match local implementation.
                    .description("Useful when you want to check the weather for a specific city.") // Clear description helps the model decide when to use the tool.
                    .parameters(JsonUtils.parseString(weatherParamsSchema).getAsJsonObject())
                    .build();
            // If you use a model from the Beijing region, replace url with: https://dashscope.aliyuncs.com/api/v1        
            Generation gen = new Generation(Protocol.HTTP.getValue(), "https://dashscope-intl.aliyuncs.com/api/v1");
            String userInput = "What's the weather in Singapore?";

            List<Message> messages = new ArrayList<>();
            messages.add(Message.builder().role(Role.USER.getValue()).content(userInput).build());

            // First model call. Send the user request and our defined tool list to the model.
            GenerationParam param = GenerationParam.builder()
                    .model("qwen-plus") // Specify the model to call.
                    .apiKey(System.getenv("DASHSCOPE_API_KEY")) // Get API key from environment variable.
                    .messages(messages) // Pass current conversation history.
                    .tools(Arrays.asList(ToolFunction.builder().function(weatherFunction).build())) // Pass available tools.
                    .resultFormat(GenerationParam.ResultFormat.MESSAGE)
                    .build();

            GenerationResult result = gen.call(param);
            Message assistantOutput = result.getOutput().getChoices().get(0).getMessage();
            messages.add(assistantOutput); // Add the model's first reply to conversation history.

            // Check the model's reply to determine whether it requests a tool call.
            if (assistantOutput.getToolCalls() == null || assistantOutput.getToolCalls().isEmpty()) {
                // Case A: Model replies directly without calling a tool.
                System.out.println("No weather tool call needed. Direct reply: " + assistantOutput.getContent());
            } else {
                // Case B: Model decides to call a tool.
                // Use a while loop to handle multiple tool calls in sequence.
                while (assistantOutput.getToolCalls() != null && !assistantOutput.getToolCalls().isEmpty()) {
                    ToolCallBase toolCall = assistantOutput.getToolCalls().get(0);

                    // Parse tool call details (function name and parameters) from the model's reply.
                    ToolCallFunction functionCall = (ToolCallFunction) toolCall;
                    String funcName = functionCall.getFunction().getName();
                    String arguments = functionCall.getFunction().getArguments();
                    System.out.println("Calling tool [" + funcName + "], parameters: " + arguments);

                    // Execute corresponding Java method locally based on tool name.
                    String toolResult = getCurrentWeather(arguments);

                    // Build a message with role "tool" containing the tool's execution result.
                    Message toolMessage = Message.builder()
                            .role("tool")
                            .toolCallId(toolCall.getId())
                            .content(toolResult)
                            .build();
                    System.out.println("Tool returned: " + toolMessage.getContent());
                    messages.add(toolMessage); // Add tool result to conversation history.

                    // Call model again.
                    param.setMessages(messages);
                    result = gen.call(param);
                    assistantOutput = result.getOutput().getChoices().get(0).getMessage();
                    messages.add(assistantOutput);
                }

                // Print final reply generated by the model after summarizing.
                System.out.println("Final assistant reply: " + assistantOutput.getContent());
            }

        } catch (NoApiKeyException | InputRequiredException e) {
            System.err.println("Error: " + e.getMessage());
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
```

Running the code produces the following output:

```
Calling tool [get_current_weather], parameters: {'location': 'Singapore'}
Tool returned: Singapore is cloudy today.
Final assistant reply: Today's weather in Singapore is cloudy.
```

## **How to use**

Function Calling supports two ways to provide tool information:

-   Method 1: Pass tool information via the tools parameter (recommended)
    
    See [How to use](#038e24005c1vt). Follow these steps: **Define tools** , **Create the messages array** , **Invoke Function Calling** , **Run tool functions** , and **Allow the LLM to summarize tool outputs** .
    
-   Method 2: Pass tool information via system message
    
    When you use the tools parameter, the server automatically selects and assembles the appropriate prompt template for the model. We recommend using the tools parameter. If you prefer not to use the tools parameter with Qwen models, see [Passing tool information via system message](#afa52dfc56tqq).
    

The rest of this section uses the OpenAI-compatible approach as an example. It shows how to use Function Calling in detail, passing tool information via the tools parameter.

Assume your business scenario handles two types of questions: weather lookups and time lookups.

### **1\. Define tools**

Tools connect LLMs to the outside world. Start by defining them.

#### **1.1. Create tool functions**

Create two tool functions: one for weather lookup and one for time lookup.

-   **Weather lookup tool**
    
    Accepts an `arguments` parameter. The `arguments` format is `{"location": "location to query"}`. The tool's output is a string in the format: `"{location} today is {weather}"`.
    
    > To simplify the demo, this weather lookup tool does not query real weather data. Instead, it randomly selects from sunny, cloudy, or rainy. In production, replace it with a real service, such as the [Amap Weather API](https://lbs.amap.com/api/webservice/guide/api/weatherinfo).
    
-   **Time lookup tool**
    
    This tool does not require any input parameters. It returns a string in this format: `“Current time: {retrieved time}.”`.
    
    > If you use Node.js, run npm install date-fns to install the `date-fns` package for time retrieval.
    

Python

```
## Step 1: Define tool functions

# Import the random module
import random
from datetime import datetime

# Simulate weather lookup tool. Example return: “Beijing is rainy today.”
def get_current_weather(arguments):
    # Define list of possible weather conditions
    weather_conditions = ["sunny", "cloudy", "rainy"]
    # Pick a random weather condition
    random_weather = random.choice(weather_conditions)
    # Extract location from JSON
    location = arguments["location"]
    # Return formatted weather info
    return f"{location} is {random_weather} today."

# Tool to get current time. Example return: “Current time: 2024-04-15 17:15:18.”
def get_current_time():
    # Get current date and time
    current_datetime = datetime.now()
    # Format current date and time
    formatted_time = current_datetime.strftime('%Y-%m-%d %H:%M:%S')
    # Return formatted current time
    return f"Current time: {formatted_time}."

# Test tool functions and print results. Remove these four lines before running later steps.
print("Testing tool output:")
print(get_current_weather({"location": "Shanghai"}))
print(get_current_time())
print("\n")
```

Node.js

```
// Step 1: Define tool functions

// Import time lookup tool
import { format } from 'date-fns';

function getCurrentWeather(args) {
    // Define list of possible weather conditions
    const weatherConditions = ["sunny", "cloudy", "rainy"];
    // Pick a random weather condition
    const randomWeather = weatherConditions[Math.floor(Math.random() * weatherConditions.length)];
    // Extract location from JSON
    const location = args.location;
    // Return formatted weather info
    return `${location} is ${randomWeather} today.`;
}

function getCurrentTime() {
    // Get current date and time
    const currentDatetime = new Date();
    // Format current date and time
    const formattedTime = format(currentDatetime, 'yyyy-MM-dd HH:mm:ss');
    // Return formatted current time
    return `Current time: ${formattedTime}.`;
}

// Test tool functions and print results. Remove these four lines before running later steps.
console.log("Testing tool output:")
console.log(getCurrentWeather({location:"Shanghai"}));
console.log(getCurrentTime());
console.log("\n")
```

Running the tools gives this output:

```
Testing tool output:
Shanghai is cloudy today.
Current time: 2025-01-08 20:21:45.
```

#### **1.2. Create the tools array**

Before humans choose a tool, they need complete knowledge about its purpose, when to use it, and its input parameters. LLMs require this same information to select the correct tool. Provide tool information in the following JSON format.

| - The `type` field is always `"function"`. - The `function` field is an object. - The `name` field is your custom tool function name. Use the same name as the function, such as `get_current_weather` or `get_current_time`. - The `description` field describes the tool function’s purpose. The LLM uses this to determine whether to use the tool. - The `parameters` field describes the tool function’s input parameters. Its type is an object. The LLM uses this to extract parameters. If the tool function does not require any input, omit the `parameters` field. - The `type` field is always `"object"`. - The `properties` field describes the parameter name, type, and description. It is an object. Keys are parameter names. Values are type and description. - The `required` field lists required parameters. Its type is an array. | For the weather lookup tool, the tool description looks like this: ``` { "type": "function", "function": { "name": "get_current_weather", "description": "Useful when you want to check the weather for a specific city.", "parameters": { "type": "object", "properties": { "location": { "type": "string", "description": "City or county, such as Beijing, Hangzhou, or Yuhang District." } }, "required": ["location"] } } } ``` |
| --- | --- |

Before invoking Function Calling, define the tools array in your code. Include each tool’s name, description, and parameter definition. Pass this array as a parameter when you invoke Function Calling.

Python

```
# Paste the following code after Step 1

## Step 2: Create the tools array

tools = [
    {
        "type": "function",
        "function": {
            "name": "get_current_time",
            "description": "Useful when you want to know the current time.",
            "parameters": {}
        }
    },
    {
        "type": "function",
        "function": {
            "name": "get_current_weather",
            "description": "Useful when you want to check the weather for a specific city.",
            "parameters": {
                "type": "object",
                "properties": {
                    "location": {
                        "type": "string",
                        "description": "City or county, such as Beijing, Hangzhou, or Yuhang District.",
                    }
                },
                "required": ["location"]
            }
        }
    }
]
tool_name = [tool["function"]["name"] for tool in tools]
print(f"Created {len(tools)} tools: {tool_name}\n")
```

Node.js

```
// Paste the following code after Step 1

// Step 2: Create the tools array

const tools = [
    {
      type: "function",
      function: {
        name: "get_current_time",
        description: "Useful when you want to know the current time.",
        parameters: {}
      }
    },
    {
      type: "function",
      function: {
        name: "get_current_weather",
        description: "Useful when you want to check the weather for a specific city.",
        parameters: {
          type: "object",
          properties: {
            location: {
              type: "string",
              description: "City or county, such as Beijing, Hangzhou, or Yuhang District.",
            }
          },
          required: ["location"]
        }
      }
    }
  ];
  
const toolNames = tools.map(tool => tool.function.name);
console.log(`Created ${tools.length} tools: ${toolNames.join(', ')}\n`);
```

### **2\. Create the messages array**

Function Calling passes instructions and context to the LLM using the messages array. Before invoking Function Calling, the messages array must include a system message and a user message.

#### **System message**

Even though the tools’ purposes and usage were already described in the [Create the tools array](#b7c8a0e72a9d0) step, adding a clear instruction in the system message often enhances tool-call accuracy. For this scenario, set the system prompt to:

```
You are a helpful assistant. If the user asks about weather, call the 'get_current_weather' function.
If the user asks about time, call the 'get_current_time' function.
Answer in a friendly tone.
```

#### **User message**

The user message holds the user’s question. If the user asks “Shanghai weather”, the messages array looks like this:

Python

```
# Step 3: Create the messages array
# Paste the following code after Step 2
# User message example for text-generation models
messages = [
    {
        "role": "system",
        "content": """You are a helpful assistant. If the user asks about weather, call the 'get_current_weather' function;
     If the user asks about time, call the 'get_current_time' function.
     Answer in a friendly tone.""",
    },
    {
        "role": "user",
        "content": "Shanghai weather"
    }
]

# User message example for multimodal models
# messages=[
#  {
#         "role": "system",
#         "content": """You are a helpful assistant. If the user asks about weather, call the 'get_current_weather' function;
#      If the user asks about time, call the 'get_current_time' function.
#      Answer in a friendly tone.""",
#     },
#     {"role": "user",
#      "content": [{"type": "image_url","image_url": {"url": "https://img.alicdn.com/imgextra/i2/O1CN01FbTJon1ErXVGMRdsN_!!6000000000405-0-tps-1024-683.jpg"}},
#                  {"type": "text", "text": "Based on the location in the image, check the current weather there."}]},
# ]

print("messages array created\n") 
```

Node.js

```
// Step 3: Create the messages array
// Paste the following code after Step 2
const messages = [
    {
        role: "system",
        content: "You are a helpful assistant. If the user asks about weather, call the 'get_current_weather' function; If the user asks about time, call the 'get_current_time' function. Answer in a friendly tone.",
    },
    {
        role: "user",
        content: "Shanghai weather"
    }
];
// User message example for multimodal models,
// const messages: [{
//     role: "user",
//     content: [{type: "image_url", image_url: {"url": "https://help-static-aliyun-doc.aliyuncs.com/file-manage-files/zh-CN/20241022/emyrja/dog_and_girl.jpeg"}},
//               {type: "text", text: "What scene is depicted in the image?"}]
//   }];

console.log("messages array created\n");
```

> Because the available tools include weather and time lookups, you can also ask about the current time.

### **3\. Invoke Function Calling**

Pass the `tools` and `messages` arrays to the LLM to invoke Function Calling. The LLM determines whether to call a tool. If so, it returns the tool’s function name and parameters.

> See [Supported models](#c8feada2328us) for supported models.

Python

```
# Step 4: Invoke Function Calling
# Paste the following code after Step 3
from openai import OpenAI
import os

client = OpenAI(
    # If you use a model from the Beijing region, use the Beijing-region API key. Get link: https://bailian.console.alibabacloud.com/?tab=model#/api-key
    # If you have not set the environment variable, replace the line below with your Model Studio API key: api_key="sk-xxx",
    api_key=os.getenv("DASHSCOPE_API_KEY"),
    # If you use a model from the Beijing region, replace base_url with: https://dashscope.aliyuncs.com/compatible-mode/v1
    base_url="https://dashscope-intl.aliyuncs.com/compatible-mode/v1",
)

def function_calling():
    completion = client.chat.completions.create(
        # Use qwen-plus as an example. Replace with another model as needed. Model list: https://www.alibabacloud.com/help/zh/model-studio/getting-started/models
        model="qwen-plus",
        messages=messages,
        tools=tools
    )
    print("Returned object:")
    print(completion.choices[0].message.model_dump_json())
    print("\n")
    return completion

print("Invoking Function Calling...")
completion = function_calling()
```

Node.js

```
// Step 4: Invoke Function Calling
// Paste the following code after Step 3
import OpenAI from "openai";
const openai = new OpenAI(
    {
        // If you use a model from the Beijing region, use the Beijing-region API key. Get link: https://bailian.console.alibabacloud.com/?tab=model#/api-key
        // If you have not set the environment variable, replace the line below with your Model Studio API key: apiKey: "sk-xxx",
        apiKey: process.env.DASHSCOPE_API_KEY,
        // If you use a model from the Beijing region, replace baseURL with: https://dashscope.aliyuncs.com/compatible-mode/v1
        baseURL: "https://dashscope-intl.aliyuncs.com/compatible-mode/v1"
    }
);

async function functionCalling() {
    const completion = await openai.chat.completions.create({
        model: "qwen-plus",  // Use qwen-plus as an example. Replace with another model as needed. Model list: https://www.alibabacloud.com/help/zh/model-studio/getting-started/models
        messages: messages,
        tools: tools
    });
    console.log("Returned object:");
    console.log(JSON.stringify(completion.choices[0].message));
    console.log("\n");
    return completion;
}

const completion = await functionCalling();
```

Since the user asked about Shanghai’s weather, the LLM specifies the tool function name as `"get_current_weather"` and the input parameters as `"{\"location\": \"Shanghai\"}"`.

```
{
    "content": "",
    "refusal": null,
    "role": "assistant",
    "audio": null,
    "function_call": null,
    "tool_calls": [
        {
            "id": "call_6596dafa2a6a46f7a217da",
            "function": {
                "arguments": "{\"location\": \"Shanghai\"}",
                "name": "get_current_weather"
            },
            "type": "function",
            "index": 0
        }
    ]
}
```

Note that if the LLM determines no tool is needed, it replies directly through the `content` parameter. If you input “Hello”, the `tool_calls` parameter is empty, and the returned object looks like this:

```
{
    "content": "Hello! How can I help you? If you have questions about weather or time, I’m especially good at answering those.",
    "refusal": null,
    "role": "assistant",
    "audio": null,
    "function_call": null,
    "tool_calls": null
}
```

> If the `tool_calls` parameter is empty, your program can return the `content` value directly. Skip the next steps.

> To force the LLM to always select a specific tool after each Function Calling, see [Forced tool calling](#b0910669927j7).

### **4\. Run tool functions**

Running tool functions turns the LLM’s decision into action.

> Your application—not the LLM—runs tool functions.

Because the LLM only outputs strings, you must parse the tool function name and input parameters before running them.

-   Tool function
    
    Create a mapping (`function_mapper`) from tool function names to tool function objects. Map the returned tool function name string to its corresponding function object.
    
-   Input parameters
    
    Function Calling returns input parameters as a JSON string. Parse it into a JSON object to extract the parameters.
    

After parsing, pass the parameters to the tool function and run it to obtain the output.

Python

```
# Step 5: Run tool functions
# Paste the following code after Step 4
import json

print("Running tool functions...")
# Get function name and input parameters from the returned result
function_name = completion.choices[0].message.tool_calls[0].function.name
arguments_string = completion.choices[0].message.tool_calls[0].function.arguments

# Parse parameter string using the json module
arguments = json.loads(arguments_string)
# Create a function mapping table
function_mapper = {
    "get_current_weather": get_current_weather,
    "get_current_time": get_current_time
}
# Get the function object
function = function_mapper[function_name]
# If parameters are empty, call function directly
if arguments == {}:
    function_output = function()
# Otherwise, call function with parameters
else:
    function_output = function(arguments)
# Print tool output
print(f"Tool function output: {function_output}\n")
```

Node.js

```
// Step 5: Run tool functions
// Paste the following code after Step 4

console.log("Running tool functions...");
const function_name = completion.choices[0].message.tool_calls[0].function.name;
const arguments_string = completion.choices[0].message.tool_calls[0].function.arguments;

// Parse parameter string using the JSON module
const args = JSON.parse(arguments_string);

// Create a function mapping table
const functionMapper = {
    "get_current_weather": getCurrentWeather,
    "get_current_time": getCurrentTime
};

// Get the function object
const func = functionMapper[function_name];

// If parameters are empty, call function directly
let functionOutput;
if (Object.keys(args).length === 0) {
    functionOutput = func();
} else {
    // Otherwise, call function with parameters
    functionOutput = func(args);
}

// Print tool output
console.log(`Tool function output: ${functionOutput}\n`);
```

Running the code gives this output:

```
Shanghai is cloudy today.
```

**Note**

In real business scenarios, many tools perform actions (such as sending email or uploading files), not just data queries. These tools often return no string. To help the LLM understand tool status, add status descriptions, such as “Email sent” or “Operation failed” when designing such tools.

### **5\. Let the LLM summarize tool function outputs**

Tool function outputs follow a fixed format. Returning them directly to users may sound rigid or unnatural. To allow the LLM to combine user input and tool output into a natural-language reply, submit the tool output to the model’s context and call the model again.

1.  Add the assistant message
    
    After you initiate [Function Calling](#9f478b2e76wrk), retrieve the Assistant Message using `completion.choices[0].message`, and then add it to the messages array.
    
2.  Add the tool message
    
    Add the tool output to the messages array in this format: `{"role": "tool", "content": "tool output","tool_call_id": completion.choices[0].message.tool_calls[0].id}`.
    
    **Note**
    
    -   Ensure the tool output is a string.
        
    -   The `tool_call_id` is a **unique ID** assigned by the system for each tool call request. The model may request multiple tools at once. The `tool_call_id` ensures each tool’s output matches its intended call.
        
    

Python

```
# Step 6: Submit tool output to the LLM
# Paste the following code after Step 5

messages.append(completion.choices[0].message)
print("Assistant message added")
messages.append({"role": "tool", "content": function_output, "tool_call_id": completion.choices[0].message.tool_calls[0].id})
print("Tool message added\n")
```

Node.js

```
// Step 6: Submit tool output to the LLM
// Paste the following code after Step 5

messages.push(completion.choices[0].message);
console.log("Assistant message added")
messages.push({
    "role": "tool",
    "content": functionOutput,
    "tool_call_id": completion.choices[0].message.tool_calls[0].id
});
console.log("Tool message added\n");
```

The messages array now looks like this:

```
[
  System message -- Strategy guiding the model to call tools
  User message -- User’s question
  Assistant message -- Tool call information returned by the model
  Tool message -- Tool output (if using parallel tool calling, there may be multiple tool messages)
]
```

After updating the messages array, run the following code.

Python

```
# Step 7: Let the LLM summarize tool output
# Paste the following code after Step 6
print("Summarizing tool output...")
completion = function_calling()
```

Node.js

```
// Step 7: Let the LLM summarize tool output
// Paste the following code after Step 6

console.log("Summarizing tool output...");
const completion_1 = await functionCalling();
```

You can obtain the reply from the `content` field: “Today’s weather in Shanghai is cloudy. Feel free to ask more questions.”

```
{
    "content": "Today's weather in Shanghai is cloudy. Feel free to ask more questions.",
    "refusal": null,
    "role": "assistant",
    "audio": null,
    "function_call": null,
    "tool_calls": null
}
```

You have now completed a full Function Calling flow.

## **Advanced usage**

### **Specify tool calling behavior**

#### **Parallel tool calling**

A single-city weather lookup requires only one tool call. If the input requires multiple tool calls—such as “What’s the weather in Beijing and Shanghai?” or “What’s the weather in Hangzhou and what time is it?”—[invoking Function Calling](#9f478b2e76wrk) returns only one tool call. For example, with “What’s the weather in Beijing and Shanghai?”:

```
{
    "content": "",
    "refusal": null,
    "role": "assistant",
    "audio": null,
    "function_call": null,
    "tool_calls": [
        {
            "id": "call_61a2bbd82a8042289f1ff2",
            "function": {
                "arguments": "{\"location\": \"Beijing\"}",
                "name": "get_current_weather"
            },
            "type": "function",
            "index": 0
        }
    ]
}
```

The result only includes Beijing’s parameters. To fix this, set the `parallel_tool_calls` request parameter to `true` when [invoking Function Calling](#9f478b2e76wrk). The returned object then includes all necessary tool functions and parameters.

**Note**

Use parallel tool calling when tasks are independent. If tasks depend on each other (such as when tool A’s input relies on tool B’s output), see [QuickStart](#dd5a3dca390k9). Use a while loop to call tools serially—one at a time.

Python

```
def function_calling():
    completion = client.chat.completions.create(
        model="qwen-plus",  # Use qwen-plus as an example. Replace with another model as needed
        messages=messages,
        tools=tools,
        # New parameter
        parallel_tool_calls=True
    )
    print("Returned object:")
    print(completion.choices[0].message.model_dump_json())
    print("\n")
    return completion

print("Invoking Function Calling...")
completion = function_calling()
```

Node.js

```
async function functionCalling() {
    const completion = await openai.chat.completions.create({
        model: "qwen-plus",  // Use qwen-plus as an example. Replace with another model as needed
        messages: messages,
        tools: tools,
        parallel_tool_calls: true
    });
    console.log("Returned object:");
    console.log(JSON.stringify(completion.choices[0].message));
    console.log("\n");
    return completion;
}

const completion = await functionCalling();
```

The `tool_calls` array in the returned object includes Beijing and Shanghai’s parameters:

```
{
    "content": "",
    "role": "assistant",
    "tool_calls": [
        {
            "function": {
                "name": "get_current_weather",
                "arguments": "{\"location\": \"Beijing\"}"
            },
            "index": 0,
            "id": "call_c2d8a3a24c4d4929b26ae2",
            "type": "function"
        },
        {
            "function": {
                "name": "get_current_weather",
                "arguments": "{\"location\": \"Shanghai\"}"
            },
            "index": 1,
            "id": "call_dc7f2f678f1944da9194cd",
            "type": "function"
        }
    ]
}
```

#### **Forced tool calling**

Large Language Models (LLMs) generate content with uncertainty and may sometimes select an incorrect tool to call. If you want the LLM to apply a human-defined strategy for a specific question type—such as forcing the use of a specific tool or preventing tool use—you can modify the `tool_choice` parameter. The default value of the `tool_choice` parameter is `"auto"`, which means the LLM autonomously determines whether and how to call tools.

> Remove the `tool_choice` parameter when summarizing tool outputs. Otherwise, the API still returns tool call information.

-   **Force a specific tool**
    
    If you want Function Calling to always call a specific tool for certain questions, set `tool_choice` to `{"type": "function", "function": {"name": "the_function_to_call"}}`. The LLM skips tool selection and outputs only parameters.
    
    Assume your scenario only handles weather questions. Update the function\_calling code as follows:
    
    Python
    
    ```
    def function_calling():
        completion = client.chat.completions.create(
            model="qwen-plus",
            messages=messages,
            tools=tools,
            tool_choice={"type": "function", "function": {"name": "get_current_weather"}}
        )
        print(completion.model_dump_json())
    
    function_calling()
    ```
    
    Node.js
    
    ```
    async function functionCalling() {
        const response = await openai.chat.completions.create({
            model: "qwen-plus",
            messages: messages,
            tools: tools,
            tool_choice: {"type": "function", "function": {"name": "get_current_weather"}}
        });
        console.log("Returned object:");
        console.log(JSON.stringify(response.choices[0].message));
        console.log("\n");
        return response;
    }
    
    const response = await functionCalling();
    ```
    
    No matter what question you input, the returned tool function is always `get_current_weather`.
    
    > Before using this strategy, ensure the question relates to the selected tool. Otherwise, results may be unexpected.
    
-   **Block all tools**
    
    If you want Function Calling to never call a tool—regardless of the input—and always return a reply in the `content` field with an empty `tool_calls` parameter—set `tool_choice` to `"none"`, or omit the `tools` parameter. The `tool_calls` parameter is always empty.
    
    Assume all questions in your scenario require no tool. Update the function\_calling code as follows:
    
    Python
    
    ```
    def function_calling():
        completion = client.chat.completions.create(
            model="qwen-plus",
            messages=messages,
            tools=tools,
            tool_choice="none"
        )
        print(completion.model_dump_json())
    
    function_calling()
    ```
    
    Node.js
    
    ```
    async function functionCalling() {
        const completion = await openai.chat.completions.create({
            model: "qwen-plus",
            messages: messages,
            tools: tools,
            tool_choice: "none"
        });
        console.log("Returned object:");
        console.log(JSON.stringify(completion.choices[0].message));
        console.log("\n");
        return completion;
    }
    
    const completion = await functionCalling();
    ```
    

### **Multi-turn conversations**

A user might ask “What’s the weather in Beijing?” in round one and “What about Shanghai?” in round two. Without round-one context, the model cannot determine which tool to call. In multi-turn conversations, keep the messages array after each round. Then add the user message and [invoke Function Calling](#9f478b2e76wrk) and proceed with the subsequent steps. The messages structure looks like this:

```
[
  System message -- Strategy guiding the model to call tools
  User message -- User’s question
  Assistant message -- Tool call information returned by the model
  Tool message -- Tool output
  Assistant message -- Model’s summary of tool call information
  User message -- User’s second question
]
```

### **Streaming output**

To improve user experience and reduce wait time, use streaming output to obtain tool function names and parameters in real time. Specifically:

-   Tool call parameter information: returned in chunks as a data stream.
    
-   Tool function name: returned in the first chunk of the streaming response.
    

Python

```
from openai import OpenAI
import os

client = OpenAI(
    api_key=os.getenv("DASHSCOPE_API_KEY"),
    # If you use a model from the Beijing region, replace with: https://dashscope.aliyuncs.com/compatible-mode/v1
    base_url="https://dashscope-intl.aliyuncs.com/compatible-mode/v1",
)
tools = [
    {
        "type": "function",
        "function": {
            "name": "get_current_weather",
            "description": "Useful when you want to check the weather for a specific city.",
            "parameters": {
                "type": "object",
                "properties": {
                    "location": {
                        "type": "string",
                        "description": "City or county, such as Beijing, Hangzhou, or Yuhang District.",
                    }
                },
                "required": ["location"],
            },
        },
    },
]

stream = client.chat.completions.create(
    model="qwen-plus",
    messages=[{"role": "user", "content": "What's the weather in Hangzhou?"}],
    tools=tools,
    stream=True
)

for chunk in stream:
    delta = chunk.choices[0].delta
    print(delta.tool_calls)
```

Node.js

```
import { OpenAI } from "openai";

const openai = new OpenAI(
    {
        // If you use a model from the Beijing region, use the Beijing-region API key. Get link: https://bailian.console.alibabacloud.com/?tab=model#/api-key
        // If you have not set the environment variable, replace the line below with your Model Studio API key: apiKey: "sk-xxx",
        apiKey: process.env.DASHSCOPE_API_KEY,
        // If you use a model from the Beijing region, replace baseURL with: https://dashscope.aliyuncs.com/compatible-mode/v1
        baseURL: "https://dashscope.aliyuncs.com/compatible-mode/v1"
    }
);
const tools = [
    {
        "type": "function",
        "function": {
            "name": "getCurrentWeather",
            "description": "Useful when you want to check the weather for a specific city.",
            "parameters": {
                "type": "object",
                "properties": {
                    "location": {
                        "type": "string",
                        "description": "City or county, such as Beijing, Hangzhou, or Yuhang District."
                    }
                },
                "required": ["location"]
            }
        }
    }
];

const stream = await openai.chat.completions.create({
    model: "qwen-plus",
    messages: [{ role: "user", content: "What's the weather in Beijing?" }],
    tools: tools,
    stream: true,
});

for await (const chunk of stream) {
    const delta = chunk.choices[0].delta;
    console.log(delta.tool_calls);
}
```

Running the code gives this output:

```
[ChoiceDeltaToolCall(index=0, id='call_8f08d2b0fc0c4d8fab7123', function=ChoiceDeltaToolCallFunction(arguments='{"location":', name='get_current_weather'), type='function')]
[ChoiceDeltaToolCall(index=0, id='', function=ChoiceDeltaToolCallFunction(arguments=' "Hangzhou"}', name=None), type='function')]
None
```

Run the following code to join parameter information (`arguments`):

Python

```
tool_calls = {}
for response_chunk in stream:
    delta_tool_calls = response_chunk.choices[0].delta.tool_calls
    if delta_tool_calls:
        for tool_call_chunk in delta_tool_calls:
            call_index = tool_call_chunk.index
            tool_call_chunk.function.arguments = tool_call_chunk.function.arguments or ""
            if call_index not in tool_calls:
                tool_calls[call_index] = tool_call_chunk
            else:
                tool_calls[call_index].function.arguments += tool_call_chunk.function.arguments
print(tool_calls[0].model_dump_json())
```

Node.js

```
const toolCalls = {};
for await (const responseChunk of stream) {
  const deltaToolCalls = responseChunk.choices[0]?.delta?.tool_calls;
  if (deltaToolCalls) {
    for (const toolCallChunk of deltaToolCalls) {
      const index = toolCallChunk.index;
      toolCallChunk.function.arguments = toolCallChunk.function.arguments || "";
      if (!toolCalls[index]) {
        toolCalls[index] = { ...toolCallChunk };
        if (!toolCalls[index].function) {
            toolCalls[index].function = { name: '', arguments: '' };
        }
      } 
      else if (toolCallChunk.function?.arguments) {
        toolCalls[index].function.arguments += toolCallChunk.function.arguments;
      }
    }
  }
}
console.log(JSON.stringify(toolCalls[0]));
```

This gives the following output:

```
{"index":0,"id":"call_16c72bef988a4c6c8cc662","function":{"arguments":"{\"location\": \"Hangzhou\"}","name":"get_current_weather"},"type":"function"}
```

When using the LLM to summarize tool function outputs, the assistant message added must match the format below. Just replace the `tool_calls` element with the content above.

```
{
    "content": "",
    "refusal": None,
    "role": "assistant",
    "audio": None,
    "function_call": None,
    "tool_calls": [
        {
            "id": "call_xxx",
            "function": {
                "arguments": '{"location": "xx"}',
                "name": "get_current_weather",
            },
            "type": "function",
            "index": 0,
        }
    ],
}
```

### **Tool calling for Qwen3-Omni-Flash**

During the **tool information retrieval phase** , `Qwen3-Omni-Flash` differs from other models in two ways:

-   **Streaming output is required:** `Qwen3-Omni-Flash` supports streaming output only. Set `stream=True` when retrieving tool information.
    
-   **Output text only (recommended):** The model requires only text information to retrieve tool names and parameters. To avoid unnecessary audio output, set `modalities=["text"]`. When output includes both text and audio, skip audio data chunks during tool information retrieval.
    

> See [Omni-modal](/help/en/model-studio/qwen-omni) for details on Qwen3-Omni-Flash.

Python

```
from openai import OpenAI
import os

client = OpenAI(
    api_key=os.getenv("DASHSCOPE_API_KEY"),
    # If you use a model from the Beijing region, replace with: https://dashscope.aliyuncs.com/compatible-mode/v1
    base_url="https://dashscope-intl.aliyuncs.com/compatible-mode/v1",
)
tools = [
    {
        "type": "function",
        "function": {
            "name": "get_current_weather",
            "description": "Useful when you want to check the weather for a specific city.",
            "parameters": {
                "type": "object",
                "properties": {
                    "location": {
                        "type": "string",
                        "description": "City or county, such as Beijing, Hangzhou, or Yuhang District.",
                    }
                },
                "required": ["location"],
            },
        },
    },
]

completion = client.chat.completions.create(
    model="qwen3-omni-flash",
    messages=[{"role": "user", "content": "What's the weather in Hangzhou?"}],

    # Set output modalities. Valid values: ["text"], ["text","audio"]. Recommended: ["text"]
    modalities=["text"],

    # stream must be True, or an error occurs
    stream=True,
    tools=tools
)

for chunk in completion:
    # If output includes audio, change the condition below to: if chunk.choices and not hasattr(chunk.choices[0].delta, "audio"): 
    if chunk.choices:
        delta = chunk.choices[0].delta
        print(delta.tool_calls)
```

Node.js

```
import { OpenAI } from "openai";

const openai = new OpenAI(
    {
        // If you use a model from the Beijing region, use the Beijing-region API key. Get link: https://bailian.console.alibabacloud.com/?tab=model#/api-key
        // If you have not set the environment variable, replace the line below with your Model Studio API key: apiKey: "sk-xxx",
        apiKey: process.env.DASHSCOPE_API_KEY,
        // If you use a model from the Beijing region, replace baseURL with: https://dashscope.aliyuncs.com/compatible-mode/v1
        baseURL: "https://dashscope-intl.aliyuncs.com/compatible-mode/v1"
    }
);
const tools = [
    {
        "type": "function",
        "function": {
            "name": "getCurrentWeather",
            "description": "Useful when you want to check the weather for a specific city.",
            "parameters": {
                "type": "object",
                "properties": {
                    "location": {
                        "type": "string",
                        "description": "City or county, such as Beijing, Hangzhou, or Yuhang District."
                    }
                },
                "required": ["location"]
            }
        }
    }
];

const stream = await openai.chat.completions.create({
    model: "qwen3-omni-flash",
    messages: [
        {
            "role": "user",
            "content": "What's the weather in Hangzhou"
        }],
    stream: true,
    // Set output modalities. Valid values: ["text"], ["text","audio"]. Recommended: ["text"]
    modalities: ["text"],
    tools:tools
});


for await (const chunk of stream) {
    // If output includes audio, replace the condition statement with: if (chunk.choices?.length && chunk.choices[0].delta && !('audio' in chunk.choices[0].delta)) 
    if (chunk.choices?.length){
    const delta = chunk.choices[0].delta;
    console.log(delta.tool_calls);
}}
```

Running the code gives this output:

```
[ChoiceDeltaToolCall(index=0, id='call_391c8e5787bc4972a388aa', function=ChoiceDeltaToolCallFunction(arguments=None, name='get_current_weather'), type='function')]
[ChoiceDeltaToolCall(index=0, id='call_391c8e5787bc4972a388aa', function=ChoiceDeltaToolCallFunction(arguments=' {"location": "Hangzhou"}', name=None), type='function')]
None
```

See [Streaming output](#ee24b4ca07c53) for code to join parameter information (`arguments`).

### **Tool calling for deep thinking models**

Deep thinking models reason before outputting tool calls. This improves decision explainability and reliability.

1.  **Reasoning process**
    
    The model analyzes user intent, identifies necessary tools, validates parameter legality, and plans the calling strategy.
    
2.  **Tool calling**
    
    The model outputs one or more function calls in structured format.
    
    > Supports parallel tool calling.
    

The following shows a streaming example of tool calling for deep thinking models.

> See [Deep thinking](/help/en/model-studio/deep-thinking) for text-generation deep thinking models. See [Visual understanding](/help/en/model-studio/vision) and [Omni-modal](/help/en/model-studio/qwen-omni) for multimodal deep thinking models.

> `tool_choice` parameter only supports `"auto"` (default, model chooses tools) or `"none"` (force model not to choose tools).

## OpenAI compatible

## Python

### **Example code**

```
import os
from openai import OpenAI

# Initialize OpenAI client with Alibaba Cloud DashScope service
client = OpenAI(
    # If you have not set the environment variable, replace the line below with: api_key="sk-xxx",
    api_key=os.getenv("DASHSCOPE_API_KEY"),  # Read API key from environment variable
    base_url="https://dashscope-intl.aliyuncs.com/compatible-mode/v1",
)

# Define available tools
tools = [
    # Tool 1: Get current time
    {
        "type": "function",
        "function": {
            "name": "get_current_time",
            "description": "Useful when you want to know the current time.",
            "parameters": {}  # No parameters needed
        }
    },  
    # Tool 2: Get weather for a specific city
    {
        "type": "function",
        "function": {
            "name": "get_current_weather",
            "description": "Useful when you want to check the weather for a specific city.",
            "parameters": {  
                "type": "object",
                "properties": {
                    "location": {
                        "type": "string",
                        "description": "City or county, such as Beijing, Hangzhou, or Yuhang District."
                    }
                },
                "required": ["location"]  # Required parameter
            }
        }
    }
]

messages = [{"role": "user", "content": input("Enter your question: ")}]

# Multimodal model message example
# messages = [{
#     "role": "user",
#     "content": [
#              {"type": "image_url","image_url": {"url": "https://img.alicdn.com/imgextra/i4/O1CN014CJhzi20NOzo7atOC_!!6000000006837-2-tps-2048-1365.png"}},
#              {"type": "text", "text": "Based on the location in the image, what is the current weather?"}]
#     }]

completion = client.chat.completions.create(
    # Use qwen-plus as an example. Replace with another deep thinking model
    model="qwen-plus",
    messages=messages,
    extra_body={
        # Enable deep thinking. This parameter has no effect on qwen3-30b-a3b-thinking-2507, qwen3-235b-a22b-thinking-2507, or QwQ models.
        "enable_thinking": True
    },
    tools=tools,
    parallel_tool_calls=True,
    stream=True,
    # Uncomment to get token usage info
    # stream_options={
    #     "include_usage": True
    # }
)

reasoning_content = ""  # Full reasoning process
answer_content = ""     # Full reply
tool_info = []          # Store tool call info
is_answering = False   # Flag to track end of reasoning and start of reply
print("="*20+"Reasoning process"+"="*20)
for chunk in completion:
    if not chunk.choices:
        # Handle usage stats
        print("\n"+"="*20+"Usage"+"="*20)
        print(chunk.usage)
    else:
        delta = chunk.choices[0].delta
        # Process AI's reasoning process (chain-of-thought)
        if hasattr(delta, 'reasoning_content') and delta.reasoning_content is not None:
            reasoning_content += delta.reasoning_content
            print(delta.reasoning_content,end="",flush=True)  # Stream reasoning process
            
        # Process final reply content
        else:
            if not is_answering:  # Print title on first entry to reply phase
                is_answering = True
                print("\n"+"="*20+"Reply content"+"="*20)
            if delta.content is not None:
                answer_content += delta.content
                print(delta.content,end="",flush=True)  # Stream reply content
            
            # Process tool call info (supports parallel tool calls)
            if delta.tool_calls is not None:
                for tool_call in delta.tool_calls:
                    index = tool_call.index  # Tool call index for parallel calls
                    
                    # Dynamically expand tool info storage list
                    while len(tool_info) <= index:
                        tool_info.append({})
                    
                    # Collect tool call ID (for later function call)
                    if tool_call.id:
                        tool_info[index]['id'] = tool_info[index].get('id', '') + tool_call.id
                    
                    # Collect function name (to route to specific function later)
                    if tool_call.function and tool_call.function.name:
                        tool_info[index]['name'] = tool_info[index].get('name', '') + tool_call.function.name
                    
                    # Collect function arguments (JSON string format, needs parsing later)
                    if tool_call.function and tool_call.function.arguments:
                        tool_info[index]['arguments'] = tool_info[index].get('arguments', '') + tool_call.function.arguments
            
print(f"\n"+"="*19+"Tool call info"+"="*19)
if not tool_info:
    print("No tool calls")
else:
    print(tool_info)
```

### **Returned result**

Input “Weather in the four municipalities” returns this result:

```
====================Reasoning process====================
The user asked about the weather in the four municipalities. First, I need to identify which cities these are. According to China's administrative divisions, the municipalities are Beijing, Shanghai, Tianjin, and Chongqing. So the user wants the weather for these four cities.

Next, I check the available tools. There is a get_current_weather function with a location parameter of type string. Each city needs a separate query because the function only checks one location at a time. Therefore, I need to call this function once for each municipality.

Then, I consider how to generate correct tool calls. Each call should include the city name as the parameter. For example, the first call is for Beijing, the second for Shanghai, and so on. I must ensure the parameter name is location and the value is the correct city name.

Also, the user likely wants the weather for each city, so I need to make sure each function call is correct. Maybe I need to make four calls, one for each city. But according to tool usage rules, I might need to process them one at a time or generate multiple calls at once. Based on the example, I may call one function at a time, so I'll proceed step by step.

Finally, I confirm if there are other factors to consider, such as parameter correctness, city name accuracy, or error handling for cases like non-existent cities or unavailable APIs. But for now, the four municipalities are clear, so it should be fine.
====================Reply content====================

===================Tool call info===================
[{'id': 'call_767af2834c12488a8fe6e3', 'name': 'get_current_weather', 'arguments': '{"location": "Beijing"}'}, {'id': 'call_2cb05a349c89437a947ada', 'name': 'get_current_weather', 'arguments': '{"location": "Shanghai"}'}, {'id': 'call_988dd180b2ca4b0a864ea7', 'name': 'get_current_weather', 'arguments': '{"location": "Tianjin"}'}, {'id': 'call_4e98c57ea96a40dba26d12', 'name': 'get_current_weather', 'arguments': '{"location": "Chongqing"}'}]
```

## Node.js

### **Example code**

```
import OpenAI from "openai";
import readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';

const openai = new OpenAI({
    apiKey: process.env.DASHSCOPE_API_KEY,
    baseURL: "https://dashscope-intl.aliyuncs.com/compatible-mode/v1"
});

const tools = [
    {
        type: "function",
        function: {
            name: "get_current_time",
            description: "Useful when you want to know the current time.",
            parameters: {}
        }
    },
    {
        type: "function",
        function: {
            name: "get_current_weather",
            description: "Useful when you want to check the weather for a specific city.",
            parameters: {
                type: "object",
                properties: {
                    location: {
                        type: "string",
                        description: "City or county, such as Beijing, Hangzhou, or Yuhang District."
                    }
                },
                required: ["location"]
            }
        }
    }
];

async function main() {
    const rl = readline.createInterface({ input, output });
    const question = await rl.question("Enter your question: "); 
    rl.close();
    
    const messages = [{ role: "user", content: question }];
    // Multimodal model message example
    // const messages= [{
    //     role: "user",
    //     content: [{type: "image_url", image_url: {url: "https://img.alicdn.com/imgextra/i2/O1CN01FbTJon1ErXVGMRdsN_!!6000000000405-0-tps-1024-683.jpg"}},
    //               {type: "text", text: "What's the weather at the location in the image?"}]
    //   }];
    let reasoningContent = "";
    let answerContent = "";
    const toolInfo = [];
    let isAnswering = false;

    console.log("=".repeat(20) + "Reasoning process" + "=".repeat(20));
    
    try {
        const stream = await openai.chat.completions.create({
            // Use qwen-plus as an example. Replace with another deep thinking model
            model: "qwen-plus",
            messages,
            // Enable deep thinking. This parameter has no effect on qwen3-30b-a3b-thinking-2507, qwen3-235b-a22b-thinking-2507, or QwQ models.
            enable_thinking: true,
            tools,
            stream: true,
            parallel_tool_calls: true
        });

        for await (const chunk of stream) {
            if (!chunk.choices?.length) {
                console.log("\n" + "=".repeat(20) + "Usage" + "=".repeat(20));
                console.log(chunk.usage);
                continue;
            }

            const delta = chunk.choices[0]?.delta;
            if (!delta) continue;

            // Process reasoning process
            if (delta.reasoning_content) {
                reasoningContent += delta.reasoning_content;
                process.stdout.write(delta.reasoning_content);
            }
            // Process reply content
            else {
                if (!isAnswering) {
                    isAnswering = true;
                    console.log("\n" + "=".repeat(20) + "Reply content" + "=".repeat(20));
                }
                if (delta.content) {
                    answerContent += delta.content;
                    process.stdout.write(delta.content);
                }
                // Process tool calls
                if (delta.tool_calls) {
                    for (const toolCall of delta.tool_calls) {
                        const index = toolCall.index;
                        
                        // Ensure array length is sufficient
                        while (toolInfo.length <= index) {
                            toolInfo.push({});
                        }
                        
                        // Update tool ID
                        if (toolCall.id) {
                            toolInfo[index].id = (toolInfo[index].id || "") + toolCall.id;
                        }
                        
                        // Update function name
                        if (toolCall.function?.name) {
                            toolInfo[index].name = (toolInfo[index].name || "") + toolCall.function.name;
                        }
                        
                        // Update parameters
                        if (toolCall.function?.arguments) {
                            toolInfo[index].arguments = (toolInfo[index].arguments || "") + toolCall.function.arguments;
                        }
                    }
                }
            }
        }

        console.log("\n" + "=".repeat(19) + "Tool call info" + "=".repeat(19));
        console.log(toolInfo.length ? toolInfo : "No tool calls");

    } catch (error) {
        console.error("An error occurred:", error);
    }
}

main(); 
```

### **Returned result**

Input “Weather in the four municipalities” returns this result:

```
Enter your question: Weather in the four municipalities
====================Reasoning process====================
The user asked about the weather in the four municipalities. First, I need to identify which cities these are. Beijing, Shanghai, Tianjin, and Chongqing, right? Next, I need to call the weather lookup function for each city.

But the user’s question may require me to get the weather for all four cities. Each city needs a separate call to the get_current_weather function, with its city name as the parameter. I need to ensure the parameters are correct—for example, using full names like “Beijing”, “Shanghai”, “Tianjin”, and “Chongqing”.

Then, I need to generate four tool calls, one for each municipality. Check that each parameter is correct, then list them in order. That way, the user gets the weather for all four municipalities.
====================Reply content====================

===================Tool call info===================
[
  {
    id: 'call_21dc802e717f491298d1b2',
    name: 'get_current_weather',
    arguments: '{"location": "Beijing"}'
  },
  {
    id: 'call_2cd3be1d2f694c4eafd4e5',
    name: 'get_current_weather',
    arguments: '{"location": "Shanghai"}'
  },
  {
    id: 'call_48cf3f78e02940bd9085e4',
    name: 'get_current_weather',
    arguments: '{"location": "Tianjin"}'
  },
  {
    id: 'call_e230a2b4c64f4e658d223e',
    name: 'get_current_weather',
    arguments: '{"location": "Chongqing"}'
  }
]
```

## HTTP

### **Example code**

## curl

```
curl -X POST https://dashscope-intl.aliyuncs.com/compatible-mode/v1/chat/completions \
-H "Authorization: Bearer $DASHSCOPE_API_KEY" \
-H "Content-Type: application/json" \
-d '{
    "model": "qwen-plus",
    "messages": [
        {
            "role": "user", 
            "content": "How is the weather in Hangzhou?"
        }
    ],
    "tools": [
    {
        "type": "function",
        "function": {
            "name": "get_current_time",
            "description": "Useful when you want to know the current time.",
            "parameters": {}
        }
    },
    {
        "type": "function",
        "function": {
            "name": "get_current_weather",
            "description": "Useful when you want to check the weather for a specific city.",
            "parameters": {
                "type": "object",
                "properties": {
                    "location":{
                        "type": "string",
                        "description": "City or county, such as Beijing, Hangzhou, or Yuhang District."
                    }
                },
                "required": ["location"]
            }
        }
    }
  ],
  "enable_thinking": true,
  "stream": true
}'
```

## DashScope

## Python

### **Example code**

```
import dashscope
dashscope.base_http_api_url = "https://dashscope-intl.aliyuncs.com/api/v1/"
tools = [
    # Tool 1: Get current time
    {
        "type": "function",
        "function": {
            "name": "get_current_time",
            "description": "Useful when you want to know the current time.",
            "parameters": {}  # No input parameters needed, so parameters is an empty dictionary
        }
    },  
    # Tool 2: Get weather for a specific city
    {
        "type": "function",
        "function": {
            "name": "get_current_weather",
            "description": "Useful when you want to check the weather for a specific city.",
            "parameters": {  
                "type": "object",
                "properties": {
                    # Location is required for weather lookup, so set parameter to location
                    "location": {
                        "type": "string",
                        "description": "City or county, such as Beijing, Hangzhou, or Yuhang District."
                    }
                },
                "required": ["location"]
            }
        }
    }
]

# Define question
messages = [{"role": "user", "content": input("Enter your question: ")}]

# Multimodal model message example
# messages = [
# {
#     "role": "user",
#     "content": [
#     {"image": "https://img.alicdn.com/imgextra/i2/O1CN01FbTJon1ErXVGMRdsN_!!6000000000405-0-tps-1024-683.jpg"},
#     {"text": "What's the weather at the location in the image?"}]
# }]

# If you use a multimodal model, replace Generation with MultiModalConversation interface
completion = dashscope.Generation.call(
    # Use qwen-plus as an example. Replace with another deep thinking model
    model="qwen-plus", 
    messages=messages,
    enable_thinking=True,
    tools=tools,
    parallel_tool_calls=True,
    stream=True,
    incremental_output=True,
    result_format="message"
)

reasoning_content = ""
answer_content = ""
tool_info = []
is_answering = False
print("="*20+"Reasoning process"+"="*20)

for chunk in completion:
    if chunk.status_code == 200:
        msg = chunk.output.choices[0].message
        
        # Process reasoning process
        if 'reasoning_content' in msg and msg.reasoning_content:
            reasoning_content += msg.reasoning_content
            print(msg.reasoning_content, end="", flush=True)
        
        # Process reply content
        if 'content' in msg and msg.content:
            if not is_answering:
                is_answering = True
                print("\n"+"="*20+"Reply content"+"="*20)
            answer_content += msg.content
            print(msg.content, end="", flush=True)
        
        # Process tool calls
        if 'tool_calls' in msg and msg.tool_calls:
            for tool_call in msg.tool_calls:
                index = tool_call['index']
                
                while len(tool_info) <= index:
                    tool_info.append({'id': '', 'name': '', 'arguments': ''})  # Initialize all fields
                
                # Incrementally update tool ID
                if 'id' in tool_call:
                    tool_info[index]['id'] += tool_call.get('id', '')
                
                # Incrementally update function info
                if 'function' in tool_call:
                    func = tool_call['function']
                    # Incrementally update function name
                    if 'name' in func:
                        tool_info[index]['name'] += func.get('name', '')
                    # Incrementally update parameters
                    if 'arguments' in func:
                        tool_info[index]['arguments'] += func.get('arguments', '')

print(f"\n"+"="*19+"Tool call info"+"="*19)
if not tool_info:
    print("No tool calls")
else:
    print(tool_info)
```

### **Returned result**

Input “Weather in the four municipalities” returns this result:

```
Enter your question: Weather in the four municipalities
====================Reasoning process====================
The user asked about the weather in the four municipalities. First, I need to confirm which cities these are. Beijing, Shanghai, Tianjin, and Chongqing, right? Next, the user wants the weather for each city, so I need to call the weather lookup function.

However, the question does not specify exact city names, just the four municipalities. I need to clarify each municipality’s name and then query their weather. For example, Beijing, Shanghai, Tianjin, and Chongqing. I need to call the get_current_weather function for each city, passing the corresponding city name as the parameter. For instance, first call location is Beijing, second is Shanghai, third is Tianjin, fourth is Chongqing.

However, I should note that for municipalities like Chongqing, sometimes more specific districts are needed, but the user likely only needs municipal-level weather. So using the municipality name should be fine. Next, I need to generate four independent function calls, one for each municipality. That way, the user gets the weather for all four cities.

Finally, I ensure each call’s parameters are correct and nothing is missed. That way, the user’s question is fully answered.
===================Tool call info===================
[{'id': 'call_2f774ed97b0e4b24ab10ec', 'name': 'get_current_weather', 'arguments': '{"location": "Beijing"}'}, {'id': 'call_dc3b05b88baa48c58bc33a', 'name': 'get_current_weather', 'arguments': '{"location": "Shanghai"}}'}, {'id': 'call_249b2de2f73340cdb46cbc', 'name': 'get_current_weather', 'arguments': '{"location": "Tianjin"}'}, {'id': 'call_833333634fda49d1b39e87', 'name': 'get_current_weather', 'arguments': '{"location": "Chongqing"}}'}]
```

## Java

### **Example code**

```
// DashScope SDK version >= 2.19.4
import java.util.Arrays;

import com.alibaba.dashscope.exception.UploadFileException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import com.alibaba.dashscope.aigc.multimodalconversation.MultiModalConversation;
import com.alibaba.dashscope.aigc.multimodalconversation.MultiModalConversationParam;
import com.alibaba.dashscope.aigc.multimodalconversation.MultiModalConversationResult;
import com.alibaba.dashscope.common.MultiModalMessage;
import com.alibaba.dashscope.aigc.generation.Generation;
import com.alibaba.dashscope.aigc.generation.GenerationParam;
import com.alibaba.dashscope.aigc.generation.GenerationResult;
import com.alibaba.dashscope.common.Message;
import com.alibaba.dashscope.common.Role;
import com.alibaba.dashscope.exception.ApiException;
import com.alibaba.dashscope.exception.InputRequiredException;
import com.alibaba.dashscope.exception.NoApiKeyException;
import com.alibaba.dashscope.utils.Constants;
import com.alibaba.dashscope.utils.JsonUtils;
import com.alibaba.dashscope.tools.ToolFunction;
import com.alibaba.dashscope.tools.FunctionDefinition;
import io.reactivex.Flowable;
import com.fasterxml.jackson.databind.node.ObjectNode;
import java.lang.System;
import com.github.victools.jsonschema.generator.Option;
import com.github.victools.jsonschema.generator.OptionPreset;
import com.github.victools.jsonschema.generator.SchemaGenerator;
import com.github.victools.jsonschema.generator.SchemaGeneratorConfig;
import com.github.victools.jsonschema.generator.SchemaGeneratorConfigBuilder;
import com.github.victools.jsonschema.generator.SchemaVersion;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Collections;

public class Main {
    private static final Logger logger = LoggerFactory.getLogger(Main.class);
    private static ObjectNode jsonSchemaWeather;
    private static ObjectNode jsonSchemaTime;
    
    static {Constants.baseHttpApiUrl="https://dashscope-intl.aliyuncs.com/api/v1";}

    static class TimeTool {
        public String call() {
            LocalDateTime now = LocalDateTime.now();
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
            return "Current time: " + now.format(formatter) + ".";
        }
    }

    static class WeatherTool {
        private String location;

        public WeatherTool(String location) {
            this.location = location;
        }

        public String call() {
            return location + " is sunny today.";
        }
    }

    static {
        SchemaGeneratorConfigBuilder configBuilder = new SchemaGeneratorConfigBuilder(
                SchemaVersion.DRAFT_2020_12, OptionPreset.PLAIN_JSON);
        SchemaGeneratorConfig config = configBuilder
                .with(Option.EXTRA_OPEN_API_FORMAT_VALUES)
                .without(Option.FLATTENED_ENUMS_FROM_TOSTRING)
                .build();
        SchemaGenerator generator = new SchemaGenerator(config);
        jsonSchemaWeather = generator.generateSchema(WeatherTool.class);
        jsonSchemaTime = generator.generateSchema(TimeTool.class);
    }
    private static void handleGenerationResult(GenerationResult message) {
        System.out.println(JsonUtils.toJson(message));
    }
    
    // Create tool calling method for text-generation models
    public static void streamCallWithMessage(Generation gen, Message userMsg)
            throws NoApiKeyException, ApiException, InputRequiredException {
        GenerationParam param = buildGenerationParam(userMsg);
        Flowable<GenerationResult> result = gen.streamCall(param);
        result.blockingForEach(message -> handleGenerationResult(message));
    }
    // Build text-generation model parameters with tool calling support
    private static GenerationParam buildGenerationParam(Message userMsg) {
        FunctionDefinition fdWeather = buildFunctionDefinition(
                "get_current_weather", "Get weather for a specified location", jsonSchemaWeather);
        FunctionDefinition fdTime = buildFunctionDefinition(
                "get_current_time", "Get current time", jsonSchemaTime);

        return GenerationParam.builder()
                .apiKey(System.getenv("DASHSCOPE_API_KEY"))
                .model("qwen-plus")
                .enableThinking(true)
                .messages(Arrays.asList(userMsg))
                .resultFormat(GenerationParam.ResultFormat.MESSAGE)
                .incrementalOutput(true)
                .tools(Arrays.asList(
                        ToolFunction.builder().function(fdWeather).build(),
                        ToolFunction.builder().function(fdTime).build()))
                .build();
    }

    // Create tool calling method for multimodal models
    public static void streamCallWithMultiModalMessage(MultiModalConversation conv, MultiModalMessage userMsg)
            throws NoApiKeyException, ApiException, UploadFileException {
        MultiModalConversationParam param = buildMultiModalConversationParam(userMsg);
        Flowable<MultiModalConversationResult> result = conv.streamCall(param);
        result.blockingForEach(message -> System.out.println(JsonUtils.toJson(message)));
    }

    // Build multimodal model parameters with tool calling support
    private static MultiModalConversationParam buildMultiModalConversationParam(MultiModalMessage userMsg) {
        FunctionDefinition fdWeather = buildFunctionDefinition(
                "get_current_weather", "Get weather for a specified location", jsonSchemaWeather);
        FunctionDefinition fdTime = buildFunctionDefinition(
                "get_current_time", "Get current time", jsonSchemaTime);

        return MultiModalConversationParam.builder()
                .apiKey(System.getenv("DASHSCOPE_API_KEY"))
                .model("qwen3-vl-plus")  // Use multimodal model Qwen3-VL
                .enableThinking(true)
                .messages(Arrays.asList(userMsg))
                .tools(Arrays.asList(  // Configure tool list
                        ToolFunction.builder().function(fdWeather).build(),
                        ToolFunction.builder().function(fdTime).build()))
                .build();
    }

    private static FunctionDefinition buildFunctionDefinition(
            String name, String description, ObjectNode schema) {
        return FunctionDefinition.builder()
                .name(name)
                .description(description)
                .parameters(JsonUtils.parseString(schema.toString()).getAsJsonObject())
                .build();
    }

    public static void main(String[] args) {
        try {
            Generation gen = new Generation();
            Message userMsg = Message.builder()
                    .role(Role.USER.getValue())
                    .content("Tell me the weather in Hangzhou.")
                    .build();
            try {
                streamCallWithMessage(gen, userMsg);
            } catch (InputRequiredException e) {
                throw new RuntimeException(e);
            }
//             Uncomment the following lines to use multimodal models for tool calling
//            MultiModalConversation conv = new MultiModalConversation();
//            MultiModalMessage userMessage = MultiModalMessage.builder().role(Role.USER.getValue())
//                    .content(Arrays.asList(Collections.singletonMap("image", "https://img.alicdn.com/imgextra/i2/O1CN01FbTJon1ErXVGMRdsN_!!6000000000405-0-tps-1024-683.jpg"),
//                            Collections.singletonMap("text", "What's the weather at the location in the image?"))).build();
//            try {
//                streamCallWithMultiModalMessage(conv,userMessage);
//            } catch (UploadFileException e) {
//                throw new RuntimeException(e);
//            }
        } catch (ApiException | NoApiKeyException e) {
            logger.error("An exception occurred: {}", e.getMessage());
        }
        System.exit(0);
    }
}
```

### **Returned result**

```
{"requestId":"4edb81cd-4647-9d5d-88f9-a4f30bc6d8dd","usage":{"input_tokens":238,"output_tokens":6,"total_tokens":244},"output":{"choices":[{"finish_reason":"null","message":{"role":"assistant","content":"","reasoning_content":"Okay, the user wants"}}]}}
{"requestId":"4edb81cd-4647-9d5d-88f9-a4f30bc6d8dd","usage":{"input_tokens":238,"output_tokens":12,"total_tokens":250},"output":{"choices":[{"finish_reason":"null","message":{"role":"assistant","content":"","reasoning_content":"to tell me the weather in Hangzhou. I"}}]}}
{"requestId":"4edb81cd-4647-9d5d-88f9-a4f30bc6d8dd","usage":{"input_tokens":238,"output_tokens":16,"total_tokens":254},"output":{"choices":[{"finish_reason":"null","message":{"role":"assistant","content":"","reasoning_content":"need to determine whether there are"}}]}}
{"requestId":"4edb81cd-4647-9d5d-88f9-a4f30bc6d8dd","usage":{"input_tokens":238,"output_tokens":22,"total_tokens":260},"output":{"choices":[{"finish_reason":"null","message":{"role":"assistant","content":"","reasoning_content":"any relevant tools available. Looking at the provided"}}]}}
{"requestId":"4edb81cd-4647-9d5d-88f9-a4f30bc6d8dd","usage":{"input_tokens":238,"output_tokens":28,"total_tokens":266},"output":{"choices":[{"finish_reason":"null","message":{"role":"assistant","content":"","reasoning_content":"tools, I see a get_current"}}]}}
{"requestId":"4edb81cd-4647-9d5d-88f9-a4f30bc6d8dd","usage":{"input_tokens":238,"output_tokens":34,"total_tokens":272},"output":{"choices":[{"finish_reason":"null","message":{"role":"assistant","content":"","reasoning_content":"_weather function, with a location parameter."}}]}}
{"requestId":"4edb81cd-4647-9d5d-88f9-a4f30bc6d8dd","usage":{"input_tokens":238,"output_tokens":38,"total_tokens":276},"output":{"choices":[{"finish_reason":"null","message":{"role":"assistant","content":"","reasoning_content":"So I should call"}}]}}
{"requestId":"4edb81cd-4647-9d5d-88f9-a4f30bc6d8dd","usage":{"input_tokens":238,"output_tokens":43,"total_tokens":281},"output":{"choices":[{"finish_reason":"null","message":{"role":"assistant","content":"","reasoning_content":"this function, setting the parameter"}}]}}
{"requestId":"4edb81cd-4647-9d5d-88f9-a4f30bc6d8dd","usage":{"input_tokens":238,"output_tokens":48,"total_tokens":286},"output":{"choices":[{"finish_reason":"null","message":{"role":"assistant","content":"","reasoning_content":"to Hangzhou. No other tools are needed, because"}}]}}
{"requestId":"4edb81cd-4647-9d5d-88f9-a4f30bc6d8dd","usage":{"input_tokens":238,"output_tokens":52,"total_tokens":290},"output":{"choices":[{"finish_reason":"null","message":{"role":"assistant","content":"","reasoning_content":"the user only asked about"}}]}}
{"requestId":"4edb81cd-4647-9d5d-88f9-a4f30bc6d8dd","usage":{"input_tokens":238,"output_tokens":56,"total_tokens":294},"output":{"choices":[{"finish_reason":"null","message":{"role":"assistant","content":"","reasoning_content":"weather. Next, I'll construct"}}]}}
{"requestId":"4edb81cd-4647-9d5d-88f9-a4f30bc6d8dd","usage":{"input_tokens":238,"output_tokens":60,"total_tokens":298},"output":{"choices":[{"finish_reason":"null","message":{"role":"assistant","content":"","reasoning_content":"a tool_call, filling in the"}}]}}
{"requestId":"4edb81cd-4647-9d5d-88f9-a4f30bc6d8dd","usage":{"input_tokens":238,"output_tokens":64,"total_tokens":302},"output":{"choices":[{"finish_reason":"null","message":{"role":"assistant","content":"","reasoning_content":"name and parameters. Make sure the parameters are"}}]}}
{"requestId":"4edb81cd-4647-9d5d-88f9-a4f30bc6d8dd","usage":{"input_tokens":238,"output_tokens":68,"total_tokens":306},"output":{"choices":[{"finish_reason":"null","message":{"role":"assistant","content":"","reasoning_content":"a JSON object, with location as a"}}]}}
{"requestId":"4edb81cd-4647-9d5d-88f9-a4f30bc6d8dd","usage":{"input_tokens":238,"output_tokens":73,"total_tokens":311},"output":{"choices":[{"finish_reason":"null","message":{"role":"assistant","content":"","reasoning_content":"string. After checking for errors, I'll return."}}]}}
{"requestId":"4edb81cd-4647-9d5d-88f9-a4f30bc6d8dd","usage":{"input_tokens":238,"output_tokens":78,"total_tokens":316},"output":{"choices":[{"finish_reason":"null","message":{"role":"assistant","content":"","reasoning_content":""}},{"tool_calls":[{"type":"function","id":"call_ecc41296dccc47baa01567","function":{"name":"get_current_weather","arguments":"{\"location\": \"Hangzhou\"}}"}]}]}}
{"requestId":"4edb81cd-4647-9d5d-88f9-a4f30bc6d8dd","usage":{"input_tokens":238,"output_tokens":106,"total_tokens":344},"output":{"choices":[{"finish_reason":"tool_calls","message":{"role":"assistant","content":"","reasoning_content":"","tool_calls":[{"type":"function","id":"","function":{"arguments":"\"}"}}]}}]}}
```

## HTTP

### **Example code**

## curl

```
# ======= Important notice =======
# If you use a multimodal model, modify the message parameter and replace the URL with https://dashscope-intl.aliyuncs.com/api/v1/services/aigc/multimodal-generation/generation
# API keys vary by region. Get your API key: https://www.alibabacloud.com/help/zh/model-studio/get-api-key
# If you use a model from the Beijing region, replace the URL with: https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation
# === Delete this comment before running ===

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
                "content": "What's the weather in Hangzhou?"
            }
        ]
    },
    "parameters": {
        "enable_thinking": true,
        "incremental_output": true,
        "result_format": "message",
        "tools": [{
            "type": "function",
            "function": {
                "name": "get_current_time",
                "description": "Useful when you want to know the current time.",
                "parameters": {}
            }
        },{
            "type": "function",
            "function": {
                "name": "get_current_weather",
                "description": "Useful when you want to check the weather for a specific city.",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "location": {
                            "type": "string",
                            "description": "City or county, such as Beijing, Hangzhou, or Yuhang District."
                        }
                    },
                    "required": ["location"]
                }
            }
        }]
    }
}'
```

## **Going live**

### **Test tool call accuracy**

-   **Build an evaluation system** :
    
    Create a test dataset that mirrors real business scenarios. Define clear metrics, such as tool selection accuracy, parameter extraction accuracy, and end-to-end success rate.
    
-   **Optimize prompts**
    
    Based on issues found during testing—such as wrong tool selection or incorrect parameters—refine system prompts, tool descriptions, and parameter descriptions. This is the core tuning method.
    
-   **Upgrade models**
    
    When prompt engineering fails to improve performance, upgrading to a more capable model—such as `qwen3-max-preview`—is the most direct and effective way to boost metrics.
    

### **Dynamic control of tool count**

When your application integrates dozens or even hundreds of tools, providing the full tool library to the model causes problems:

-   **Performance drop** : It becomes much harder for the model to select the correct tool from a large set.
    
-   **Cost and latency** : Large tool descriptions consume many input tokens, increasing cost and slowing response time.
    

The solution is to **add a tool routing or retrieval layer before calling the model** . Based on the user’s query, quickly and precisely filter a small, relevant subset of tools from the full library, then provide that subset to the model.

**Common methods to implement tool routing:**

-   **Semantic search**
    
    Pre-embed all tool descriptions (`description`) into vectors using an embedding model, and store them in a vector database. When a user queries, convert the query to a vector and use vector similarity search to retrieve the top-K most relevant tools.
    
-   **Hybrid search**
    
    Combine semantic search’s “fuzzy match” ability with traditional keyword or metadata tag “exact match” ability. Add `tags` or `keywords` fields to tools. During search, perform both vector search and keyword filtering to significantly improve recall precision for high-frequency or specific scenarios.
    
-   **Lightweight LLM router**
    
    For more complex routing logic, use a smaller, faster, cheaper model—such as Qwen-Flash—as a “routing model.” Its job is to output a list of relevant tool names based on the user’s question.
    

**Practical advice**

-   **Keep candidate sets small** : Regardless of method, limit the number of tools passed to the main model to **no more than 20** . This balances model cognitive load, cost, latency, and accuracy.
    
-   **Layered filtering strategy** : Build a funnel-style routing strategy. For example, first use low-cost keyword or rule matching for initial filtering to remove clearly irrelevant tools, then run semantic search on the remaining tools to improve efficiency and quality.
    

### **Tool security principles**

When granting tool execution capability to an LLM, security must come first. Core principles are “least privilege” and “human confirmation.”

-   **Least privilege principle** : The tool set provided to the model must strictly follow the least privilege principle. By default, tools should be read-only (such as weather lookup or document search) and avoid granting any “write” permissions that change state or resources.
    
-   **Isolate dangerous tools** : Never give dangerous tools directly to the LLM. Examples include arbitrary code execution (`code interpreter`), file system operations (`fs.delete`), database deletion or updates (`db.drop_table`), or financial transfers (`payment.transfer`).
    
-   **Human involvement** : For all high-privilege or irreversible actions, add human review and confirmation. The model can generate an action request, but the final “execute” button must be clicked by a human user. For example, the model can draft an email, but sending requires user confirmation.
    

### **User experience optimization**

Function Calling involves many steps. A failure at any step degrades user experience.

#### **Processing Tool Failed to Run**

Tool execution failures are common. Use these strategies:

-   **Maximum retry count** : Set a reasonable upper limit (for example, three times) to avoid long waits or wasted system resources due to repeated failures.
    
-   **Provide fallback responses** : When retries are exhausted or an unsolvable error occurs, return a clear, friendly message to users. For example: “Sorry, I cannot retrieve that information right now. The service might be busy. Please try again later.”
    

#### **Handle processing delays**

High latency reduces user satisfaction. Improve it through frontend interaction and backend optimization.

-   **Set timeout values** : Assign independent, reasonable timeouts to each Function Calling step. On timeout, immediately stop and give feedback.
    
-   **Provide immediate feedback** : When starting Function Calling, show a prompt in the UI, such as “Looking up weather for you…” or “Searching for related information…”, to give users real-time progress updates.
    

## **Billing details**

In addition to tokens in the messages array, tool descriptions also count as input tokens and are billed as part of the prompt.

## **Pass tool information via system message**

We recommend reading the [How to use](#038e24005c1vt) section and passing tool information to the LLM via the tools parameter. To pass tool information via system message, use the prompt template shown in the following code for best results:

## OpenAI compatible

## Python

### **Example code**

```
import os
from openai import OpenAI
import json

client = OpenAI(
    # If you use a model from the Beijing region, use the Beijing-region API key. Get link: https://bailian.console.alibabacloud.com/?tab=model#/api-key
    # If you have not set the environment variable, replace the line below with your Model Studio API key: api_key="sk-xxx",
    api_key=os.getenv("DASHSCOPE_API_KEY"),
    # If you use a model from the Beijing region, replace base_url with: https://dashscope.aliyuncs.com/compatible-mode/v1
    base_url="https://dashscope-intl.aliyuncs.com/compatible-mode/v1",
)

# Custom system prompt. Modify as needed.
custom_prompt = "You are an intelligent assistant specialized in calling various tools to help users solve problems. You can select and correctly call appropriate tools based on user needs."

tools = [
    # Tool 1: Get current time
    {
        "type": "function",
        "function": {
            "name": "get_current_time",
            "description": "Useful when you want to know the current time.",
            "parameters": {}
        }
    },  
    # Tool 2: Get weather for a specific city
    {
        "type": "function",
        "function": {
            "name": "get_current_weather",
            "description": "Useful when you want to check the weather for a specific city.",
            "parameters": {  
                "type": "object",
                "properties": {
                    "location": {
                        "type": "string",
                        "description": "City or county, such as Beijing, Hangzhou, or Yuhang District."
                    }
                },
                "required": ["location"]
            }
        }
    }
]

# Iterate over tools list to build description for each tool
tools_descriptions = []
for tool in tools:
    tool_json = json.dumps(tool, ensure_ascii=False)
    tools_descriptions.append(tool_json)

# Join all tool descriptions into a single string
tools_content = "\n".join(tools_descriptions)

system_prompt = f"""{custom_prompt}

# Tools

You may call one or more functions to assist with the user query.

You are provided with function signatures within <tools></tools> XML tags:
<tools>
{tools_content}
</tools>

For each function call, return a json object with function name and arguments within <tool_call></tool_call> XML tags:
<tool_call>
{{"name": <function-name>, "arguments": <args-json-object>}}
</tool_call>"""

messages = [
    {"role": "system", "content": system_prompt},
    {"role": "user", "content": "What time is it?"}
]

completion = client.chat.completions.create(
    model="qwen-plus",
    messages=messages,
)
print(completion.model_dump_json())
```

## Node.js

### Example code

```
import OpenAI from "openai";

const client = new OpenAI({
    // If you use a model from the Beijing region, use the Beijing-region API key. Get link: https://bailian.console.alibabacloud.com/?tab=model#/api-key
    // If you have not set the environment variable, replace the line below with your Model Studio API key: apiKey: "sk-xxx",
    apiKey: process.env.DASHSCOPE_API_KEY,
    // If you use a model from the Beijing region, replace baseURL with: https://dashscope.aliyuncs.com/compatible-mode/v1
    baseURL: "https://dashscope-intl.aliyuncs.com/compatible-mode/v1",
});

// Custom system prompt
const customPrompt = "You are an intelligent assistant specialized in calling various tools to help users solve problems. You can select and correctly call appropriate tools based on user needs.";

const tools = [
    // Tool 1: Get current time
    {
        "type": "function",
        "function": {
            "name": "get_current_time",
            "description": "Useful when you want to know the current time.",
            "parameters": {}
        }
    },
    // Tool 2: Get weather for a specific city
    {
        "type": "function",
        "function": {
            "name": "get_current_weather",
            "description": "Useful when you want to check the weather for a specific city.",
            "parameters": {
                "type": "object",
                "properties": {
                    "location": {
                        "type": "string",
                        "description": "City or county, such as Beijing, Hangzhou, or Yuhang District."
                    }
                },
                "required": ["location"]
            }
        }
    }
];

// Iterate over tools list to build description for each tool
const toolsDescriptions = [];
for (const tool of tools) {
    const toolJson = JSON.stringify(tool, null, 2);
    toolsDescriptions.push(toolJson);
}

// Join all tool descriptions into a single string
const toolsContent = toolsDescriptions.join("\n");

const systemPrompt = `${customPrompt}

# Tools

You may call one or more functions to assist with the user query.

You are provided with function signatures within <tools></tools> XML tags:
<tools>
${toolsContent}
</tools>

For each function call, return a json object with function name and arguments within <tool_call></tool_call> XML tags:
<tool_call>
{"name": <function-name>, "arguments": <args-json-object>}
</tool_call>`;

const messages = [
    {"role": "system", "content": systemPrompt},
    {"role": "user", "content": "What time is it?"}
];

async function main() {
    try {
        const completion = await client.chat.completions.create({
            model: "qwen-plus",
            messages: messages,
        });
        
        console.log(JSON.stringify(completion, null, 2));
    } catch (error) {
        console.error("Error:", error);
    }
}

main(); 
```

## DashScope

## Python

### **Example code**

```
import os
from dashscope import Generation
import json
# If you use a model from the Beijing region, replace base_http_api_url with: https://dashscope.aliyuncs.com/api/v1
dashscope.base_http_api_url = 'https://dashscope-intl.aliyuncs.com/api/v1'

# Custom system prompt
custom_prompt = "You are an intelligent assistant specialized in calling various tools to help users solve problems. You can select and correctly call appropriate tools based on user needs."

tools = [
    # Tool 1: Get current time
    {
        "type": "function",
        "function": {
            "name": "get_current_time",
            "description": "Useful when you want to know the current time.",
            "parameters": {}
        }
    },  
    # Tool 2: Get weather for a specific city
    {
        "type": "function",
        "function": {
            "name": "get_current_weather",
            "description": "Useful when you want to check the weather for a specific city.",
            "parameters": {  
                "type": "object",
                "properties": {
                    "location": {
                        "type": "string",
                        "description": "City or county, such as Beijing, Hangzhou, or Yuhang District."
                    }
                },
                "required": ["location"]
            }
        }
    }
]

# Iterate over tools list to build description for each tool
tools_descriptions = []
for tool in tools:
    tool_json = json.dumps(tool, ensure_ascii=False)
    tools_descriptions.append(tool_json)

# Join all tool descriptions into a single string
tools_content = "\n".join(tools_descriptions)

system_prompt = f"""{custom_prompt}

# Tools

You may call one or more functions to assist with the user query.

You are provided with function signatures within <tools></tools> XML tags:
<tools>
{tools_content}
</tools>

For each function call, return a json object with function name and arguments within <tool_call></tool_call> XML tags:
<tool_call>
{{"name": <function-name>, "arguments": <args-json-object>}}
</tool_call>"""

messages = [
    {"role": "system", "content": system_prompt},
    {"role": "user", "content": "What time is it?"}
]

response = Generation.call(
    # If you use a model from the Beijing region, use the Beijing-region API key. Get link: https://bailian.console.alibabacloud.com/?tab=model#/api-key
    # If you have not set the environment variable, replace the line below with your Model Studio API key: api_key="sk-xxx",
    api_key=os.getenv("DASHSCOPE_API_KEY"),
    model="qwen-plus",
    messages=messages,
    result_format="message",  # Set output to message format
)

print(response)
```

## Java

### Example code

```
// Copyright (c) Alibaba, Inc. and its affiliates.
// Version >= 2.12.0

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import com.alibaba.dashscope.aigc.conversation.ConversationParam.ResultFormat;
import com.alibaba.dashscope.aigc.generation.Generation;
import com.alibaba.dashscope.aigc.generation.GenerationParam;
import com.alibaba.dashscope.aigc.generation.GenerationResult;
import com.alibaba.dashscope.common.Message;
import com.alibaba.dashscope.common.Role;
import com.alibaba.dashscope.exception.ApiException;
import com.alibaba.dashscope.exception.InputRequiredException;
import com.alibaba.dashscope.exception.NoApiKeyException;
import com.alibaba.dashscope.utils.JsonUtils;
import com.alibaba.dashscope.protocol.Protocol;

public class Main {
    public static void main(String[] args) {
        try {
            callToolWithCustomPrompt();
        } catch (ApiException | NoApiKeyException | InputRequiredException e) {
            System.out.println(String.format("Exception: %s", e.getMessage()));
        } catch (Exception e) {
            System.out.println(String.format("Exception: %s", e.getMessage()));
        }
        System.exit(0);
    }

    public static void callToolWithCustomPrompt()
            throws NoApiKeyException, ApiException, InputRequiredException {

        // Custom system prompt
        String customPrompt = "You are an intelligent assistant specialized in calling various tools to help users solve problems. You can select and correctly call appropriate tools based on user needs.";

        // Build tool descriptions
        String[] toolsDescriptions = {
                // Tool 1: Get current time
                "{\n" +
                        "    \"type\": \"function\",\n" +
                        "    \"function\": {\n" +
                        "        \"name\": \"get_current_time\",\n" +
                        "        \"description\": \"Useful when you want to know the current time.\",\n" +
                        "        \"parameters\": {}\n" +
                        "    }\n" +
                        "}",
                // Tool 2: Get weather for a specific city
                "{\n" +
                        "    \"type\": \"function\",\n" +
                        "    \"function\": {\n" +
                        "        \"name\": \"get_current_weather\",\n" +
                        "        \"description\": \"Useful when you want to check the weather for a specific city.\",\n" +
                        "        \"parameters\": {\n" +
                        "            \"type\": \"object\",\n" +
                        "            \"properties\": {\n" +
                        "                \"location\": {\n" +
                        "                    \"type\": \"string\",\n" +
                        "                    \"description\": \"City or county, such as Beijing, Hangzhou, or Yuhang District.\"\n" +
                        "                }\n" +
                        "            },\n" +
                        "            \"required\": [\"location\"]\n" +
                        "        }\n" +
                        "    }\n" +
                        "}"
        };

        // Join all tool descriptions into a single string
        String toolsContent = String.join("\n", toolsDescriptions);

        // Build system prompt
        String systemPrompt = String.format("%s\n\n" +
                        "# Tools\n\n" +
                        "You may call one or more functions to assist with the user query.\n\n" +
                        "You are provided with function signatures within <tools></tools> XML tags:\n" +
                        "<tools>\n%s\n</tools>\n\n" +
                        "For each function call, return a json object with function name and arguments within <tool_call></tool_call> XML tags:\n"
                        +
                        "<tool_call>\n" +
                        "{\"name\": <function-name>, \"arguments\": <args-json-object>}\n" +
                        "</tool_call>",
                customPrompt, toolsContent);

        // Build message list
        Message systemMsg = Message.builder()
                .role(Role.SYSTEM.getValue())
                .content(systemPrompt)
                .build();

        Message userMsg = Message.builder()
                .role(Role.USER.getValue())
                .content("What time is it?")
                .build();

        List<Message> messages = new ArrayList<>(Arrays.asList(systemMsg, userMsg));

        // Build request parameters
        GenerationParam param = GenerationParam.builder()
                .model("qwen-plus")
                // If you use a model from the Beijing region, use the Beijing-region API key. Get link: https://bailian.console.alibabacloud.com/?tab=model#/api-key
                // If you have not set the environment variable, replace the line below with: .apiKey("sk-xxx")
                .apiKey(System.getenv("DASHSCOPE_API_KEY"))
                .messages(messages)
                .resultFormat(ResultFormat.MESSAGE)
                .build();

        // Call generation interface. If you use a model from the Beijing region, replace url with: https://dashscope.aliyuncs.com/api/v1
        Generation gen = new Generation(Protocol.HTTP.getValue(), "https://dashscope-intl.aliyuncs.com/api/v1");
        GenerationResult result = gen.call(param);

        // Output result
        System.out.println(JsonUtils.toJson(result));
    }
}
```

> After running the code above, use an XML parser to extract tool call information—including function name and input parameters—from between the <tool\_call> and </tool\_call> tags.

## Error codes

If the model call fails and returns an error message, see [Error messages](/help/en/model-studio/error-code) for resolution.