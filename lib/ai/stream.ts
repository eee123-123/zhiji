import { createAIClient } from "./client";
import { StreamChatParams } from "./types";

/**
 * 流式调用 AI 对话
 * 支持 qwen3 系列模型的“思考”模式（reasoning_content + content）
 */
export async function streamChat(
  params: StreamChatParams
): Promise<ReadableStream> {
  const model = params.model || "qwen3.6-flash";
  const messages = [
    { role: "system" as const, content: params.systemPrompt },
    ...params.messages,
  ];
  const maxTokens = params.maxTokens || 1500;

  // 连接超时 60s（覆盖模型“思考”阶段的等待）
  const CONNECT_TIMEOUT = 60_000;

  let response;
  try {
    const ac = new AbortController();
    const timer = setTimeout(() => ac.abort(), CONNECT_TIMEOUT);
    const client = createAIClient();
    response = await client.chat.completions.create(
      { model, stream: true, messages, max_tokens: maxTokens },
      { signal: ac.signal }
    );
    clearTimeout(timer);
  } catch (error: unknown) {
    // 重试1次，使用独立的 AbortController
    await new Promise((resolve) => setTimeout(resolve, 1000));
    const ac2 = new AbortController();
    const timer2 = setTimeout(() => ac2.abort(), CONNECT_TIMEOUT);
    const client = createAIClient();
    response = await client.chat.completions.create(
      { model, stream: true, messages, max_tokens: maxTokens },
      { signal: ac2.signal }
    );
    clearTimeout(timer2);
  }

  return new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of response) {
          // qwen3 系列模型在“思考”阶段仅产生 reasoning_content，
          // content 在思考结束后才开始输出
          const delta = chunk.choices[0]?.delta as
            | { content?: string | null; reasoning_content?: string | null }
            | undefined;
          const text = delta?.content || "";
          if (text) {
            controller.enqueue(new TextEncoder().encode(text));
          }
        }
        controller.close();
      } catch (error) {
        controller.error(error);
      }
    },
  });
}
