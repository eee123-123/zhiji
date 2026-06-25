import { NextRequest } from "next/server";
import { streamChat } from "@/lib/ai/stream";
import { db } from "@/lib/db";
import { getCurrentUserId } from "@/lib/auth";
import { getYuejianPrompt } from "@/prompts/tarot/yuejian";
import { formatDrawnCards } from "@/lib/tarot/draw";
import { DrawnCard, TarotRole, SpreadType } from "@/types/tarot";

export const maxDuration = 60; // Node.js Runtime

interface InterpretRequest {
  cards: DrawnCard[];
  role: TarotRole;
  spreadType: SpreadType;
  topic?: string;
  description?: string;
}

export async function POST(req: NextRequest) {
  try {
    const body: InterpretRequest = await req.json();
    const { cards, role, spreadType, topic, description } = body;

    // 验证必要参数
    if (!cards || !cards.length || !role || !spreadType) {
      return Response.json(
        { error: "Missing required fields: cards, role, spreadType" },
        { status: 400 }
      );
    }

    // 格式化牌面信息
    const formattedCards = formatDrawnCards(cards);

    // 根据角色选择 Prompt（Phase 1 只支持月见）
    let systemPrompt: string;
    switch (role) {
      case "yuejian":
      default:
        systemPrompt = getYuejianPrompt({
          spreadType,
          cards: formattedCards,
          topic,
          description,
        });
        break;
    }

    // 调用 AI 获取流式响应
    const aiStream = await streamChat({
      systemPrompt,
      messages: [
        {
          role: "user",
          content: topic
            ? `请为我解读这次抽牌。我的问题主题是：${topic}${description ? `。补充描述：${description}` : ""}`
            : "请为我解读这次抽牌。",
        },
      ],
    });

    // 使用 TransformStream 拦截流内容，收集完整文本
    let fullText = "";
    const { readable, writable } = new TransformStream({
      transform(chunk, controller) {
        // 解码文本并累积
        const text = new TextDecoder().decode(chunk);
        fullText += text;
        // 透传给客户端
        controller.enqueue(chunk);
      },
      flush() {
        // 流结束后异步写入数据库（不阻塞响应）
        const userId = getCurrentUserId();
        db.tarotReading
          .create({
            data: {
              userId,
              role,
              topic: topic || null,
              description: description || null,
              spreadType,
              cards: JSON.stringify(cards),
              reading: fullText,
            },
          })
          .catch((err: unknown) => {
            console.error("Failed to save tarot reading:", err);
          });
      },
    });

    // 将 AI 流管道连接到 TransformStream
    aiStream.pipeTo(writable).catch((err: unknown) => {
      console.error("Stream pipe error:", err);
    });

    // 返回可读流给客户端
    return new Response(readable, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Transfer-Encoding": "chunked",
        "Cache-Control": "no-cache",
      },
    });
  } catch (error: unknown) {
    console.error("Interpret API error:", error);

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
