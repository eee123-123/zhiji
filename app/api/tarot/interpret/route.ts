import { NextRequest } from "next/server";
import { streamChat } from "@/lib/ai/stream";
import { db } from "@/lib/db";
import { getCurrentUserId } from "@/lib/auth";
import { getYuejianPrompt } from "@/prompts/tarot/yuejian";
import { getYousuoPrompt } from "@/prompts/tarot/yousuo";
import { getQingwuPrompt } from "@/prompts/tarot/qingwu";
import { getHuohuPrompt } from "@/prompts/tarot/huohu";
import { formatDrawnCards, formatDrawnCardsWithPositions } from "@/lib/tarot/draw";
import { checkNarrativeResonance } from "@/lib/tarot/narrative";
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

    // 格式化牌面信息（celtic/three 使用带位置的格式）
    const formattedCards =
      spreadType === "celtic" || spreadType === "three"
        ? formatDrawnCardsWithPositions(cards, spreadType)
        : formatDrawnCards(cards);

    // 检测连续性叙事呼应（在 Prompt 组装前完成）
    const narrativeContext = await checkNarrativeResonance(cards);

    // 根据角色选择 Prompt
    let systemPrompt: string;
    switch (role) {
      case "yuejian":
        systemPrompt = getYuejianPrompt({
          spreadType,
          cards: formattedCards,
          topic,
          description,
        });
        break;
      case "yousuo":
        systemPrompt = getYousuoPrompt({
          spreadType,
          cards: formattedCards,
          topic,
          description,
        });
        break;
      case "qingwu":
        systemPrompt = getQingwuPrompt({
          spreadType,
          cards: formattedCards,
          topic,
          description,
        });
        break;
      case "huohu":
        systemPrompt = getHuohuPrompt({
          spreadType,
          cards: formattedCards,
          topic,
          description,
        });
        break;
      default:
        systemPrompt = getYuejianPrompt({
          spreadType,
          cards: formattedCards,
          topic,
          description,
        });
        break;
    }

    // 如果有叙事呼应，追加到 systemPrompt
    if (narrativeContext.hasResonance) {
      systemPrompt += "\n" + narrativeContext.resonanceText;
    }

    // 调用 AI 获取流式响应（凯尔特十字需要更大 token 限制）
    const maxTokens = spreadType === "celtic" ? 3500 : 1500;
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
      maxTokens,
    });

    // 使用 TransformStream 拦截流内容，收集完整文本
    let fullText = "";
    const narrativeRef = narrativeContext; // 闭包引用
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
              narrative: narrativeRef.hasResonance
                ? narrativeRef.resonanceText
                : null,
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

    // 构建响应 headers
    const headers: Record<string, string> = {
      "Content-Type": "text/plain; charset=utf-8",
      "Transfer-Encoding": "chunked",
      "Cache-Control": "no-cache",
    };
    if (narrativeContext.displayHint) {
      headers["X-Narrative-Hint"] = encodeURIComponent(
        narrativeContext.displayHint
      );
    }

    // 返回可读流给客户端
    return new Response(readable, { headers });
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
