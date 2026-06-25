import { NextRequest } from "next/server";
import { streamChat } from "@/lib/ai/stream";
import { db } from "@/lib/db";
import { getCurrentUserId } from "@/lib/auth";
import { getQiboPrompt } from "@/prompts/wellness/qibo";
import { getCurrentSolarTerm } from "@/lib/solar-terms";

export const maxDuration = 60;

interface ChatRequest {
  message: string;
  history?: { role: string; content: string }[];
}

export async function POST(req: NextRequest) {
  const { message, history = [] } = (await req.json()) as ChatRequest;

  if (!message?.trim()) {
    return Response.json({ error: "消息不能为空" }, { status: 400 });
  }

  // 获取用户体质
  const userId = getCurrentUserId();
  let constitutionType: string | undefined;
  if (userId) {
    const constitution = await db.constitution.findUnique({
      where: { userId },
    });
    constitutionType = constitution?.type;
  }

  // 获取当前节气
  const solarTerm = getCurrentSolarTerm();

  // 组装 Prompt
  const systemPrompt = getQiboPrompt({
    userMessage: message,
    constitution: constitutionType,
    solarTerm: solarTerm.name,
    history,
  });

  // 构建消息列表（含历史）
  const messages = [
    ...history.map((h) => ({
      role: h.role as "user" | "assistant",
      content: h.content,
    })),
    { role: "user" as const, content: message },
  ];

  // 流式输出
  const stream = await streamChat({
    systemPrompt,
    messages,
    maxTokens: 1000,
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Transfer-Encoding": "chunked",
      "Cache-Control": "no-cache",
    },
  });
}
