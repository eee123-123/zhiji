import { NextRequest } from "next/server";
import { streamChat } from "@/lib/ai/stream";
import { db } from "@/lib/db";
import { getCurrentUserId } from "@/lib/auth";
import { getDreamInterpreterPrompt } from "@/prompts/dream/interpreter";
import { DreamPromptContext } from "@/types/dream";

export const maxDuration = 60;

interface AnalyzeRequest {
  content: string;
  tags: string[];
  emotion?: string;
  clarity?: string;
  isRecurring?: boolean;
}

function parseDreamSections(text: string) {
  const sections: Record<string, string> = {};
  const regex = /---SECTION:(.*?)---\n?([\s\S]*?)(?=---SECTION:|$)/g;
  let match;
  while ((match = regex.exec(text)) !== null) {
    sections[match[1].trim()] = match[2].trim();
  }
  return {
    traditional: sections["传统寓意"] || null,
    deeper: sections["深层映射"] || null,
    questions: sections["值得自问"] || null,
  };
}

export async function POST(req: NextRequest) {
  try {
    const body: AnalyzeRequest = await req.json();
    const { content, tags, emotion, clarity, isRecurring } = body;

    // 验证必要参数
    if ((!content || !content.trim()) && (!tags || !tags.length)) {
      return Response.json(
        { error: "请至少提供梦境描述或选择梦境元素标签" },
        { status: 400 }
      );
    }

    // 组装 Prompt 上下文
    const promptContext: DreamPromptContext = {
      content: content || "",
      tags: tags || [],
      emotion,
      clarity,
      isRecurring,
    };

    const systemPrompt = getDreamInterpreterPrompt(promptContext);

    // 调用 AI 获取流式响应
    const aiStream = await streamChat({
      systemPrompt,
      messages: [
        {
          role: "user",
          content: content
            ? `请为我解读这个梦境。`
            : `请根据这些梦境元素为我解读。`,
        },
      ],
      maxTokens: 1500,
    });

    // 使用 TransformStream 拦截流内容，收集完整文本
    let fullText = "";
    let entryId = "";
    const { readable, writable } = new TransformStream({
      transform(chunk, controller) {
        const text = new TextDecoder().decode(chunk);
        fullText += text;
        controller.enqueue(chunk);
      },
      async flush() {
        // 流结束后解析并写入数据库
        try {
          const userId = getCurrentUserId();
          const parsed = parseDreamSections(fullText);

          const entry = await db.dreamEntry.create({
            data: {
              userId,
              content: content || "",
              emotion: emotion || null,
              clarity: clarity || null,
              isRecurring: isRecurring || false,
              traditional: parsed.traditional,
              deeper: parsed.deeper,
              questions: parsed.questions,
              tags: {
                create: (tags || []).map((name: string) => ({ name })),
              },
            },
          });
          entryId = entry.id;
        } catch (err: unknown) {
          console.error("Failed to save dream entry:", err);
        }
      },
    });

    // 将 AI 流管道连接到 TransformStream
    aiStream.pipeTo(writable).catch((err: unknown) => {
      console.error("Stream pipe error:", err);
    });

    // 构建响应 headers
    const headers: Record<string, string> = {
      "Content-Type": "text/plain; charset=utf-8",
      "Transfer-Encoding": "chunked",
      "Cache-Control": "no-cache",
    };

    // 注意：entryId 在 flush 中异步生成，header 需要在 response 开始前设置
    // 因此改为在 response 结束后客户端轮询或使用 trailer
    // 这里先设置占位，实际通过流末尾特殊标记传递
    // 采用方案：在流末尾追加一个特殊标记行传递 entryId

    // 使用第二个 TransformStream 在流末尾追加 entry id
    const { readable: finalReadable, writable: finalWritable } =
      new TransformStream({
        transform(chunk, controller) {
          controller.enqueue(chunk);
        },
        flush(controller) {
          // 追加 entry id 标记到流末尾
          if (entryId) {
            const marker = `\n---DREAM_ENTRY_ID:${entryId}---`;
            controller.enqueue(new TextEncoder().encode(marker));
          }
        },
      });

    readable.pipeTo(finalWritable).catch((err: unknown) => {
      console.error("Final stream pipe error:", err);
    });

    return new Response(finalReadable, { headers });
  } catch (error: unknown) {
    console.error("Dream analyze API error:", error);

    if (error instanceof Error && error.name === "AbortError") {
      return Response.json(
        { error: "AI_TIMEOUT", message: "AI响应超时，请重试" },
        { status: 504 }
      );
    }

    return Response.json(
      { error: "AI_GENERATION_FAILED", message: "生成失败，请重试" },
      { status: 502 }
    );
  }
}
