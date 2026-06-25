import { createAIClient } from "./client";
import { StreamChatParams } from "./types";

export async function streamChat(
  params: StreamChatParams
): Promise<ReadableStream> {
  const abortController = new AbortController();
  const timeout = setTimeout(() => abortController.abort(), 30_000);

  let response;
  try {
    const client = createAIClient();
    response = await client.chat.completions.create(
      {
        model: params.model || "qwen-plus",
        stream: true,
        messages: [
          { role: "system", content: params.systemPrompt },
          ...params.messages,
        ],
        max_tokens: params.maxTokens || 1500,
      },
      { signal: abortController.signal }
    );
  } catch (error: unknown) {
    if (error instanceof Error && error.name === "AbortError") {
      clearTimeout(timeout);
      throw error;
    }
    // 重试1次，指数退避1秒
    await new Promise((resolve) => setTimeout(resolve, 1000));
    const client = createAIClient();
    response = await client.chat.completions.create(
      {
        model: params.model || "qwen-plus",
        stream: true,
        messages: [
          { role: "system", content: params.systemPrompt },
          ...params.messages,
        ],
        max_tokens: params.maxTokens || 1500,
      },
      { signal: abortController.signal }
    );
  }

  return new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of response) {
          const text = chunk.choices[0]?.delta?.content || "";
          if (text) {
            controller.enqueue(new TextEncoder().encode(text));
          }
        }
        controller.close();
      } catch (error) {
        controller.error(error);
      } finally {
        clearTimeout(timeout);
      }
    },
  });
}
