import { getCurrentSolarTerm } from "@/lib/solar-terms";
import { getWeatherData } from "@/lib/wellness/weather";
import { getWellnessCardPrompt } from "@/prompts/wellness/card";
import { streamChat } from "@/lib/ai/stream";
import { db } from "@/lib/db";
import { getCurrentUserId } from "@/lib/auth";
import { WellnessCardContext } from "@/types/wellness";

export const maxDuration = 60;

export async function POST() {
  try {
    // 1. 获取节气信息
    const solarTerm = getCurrentSolarTerm();

    // 2. 获取天气数据
    const weather = await getWeatherData();

    // 3. 获取用户体质（可选）
    const userId = getCurrentUserId();
    let constitution = null;
    if (userId) {
      constitution = await db.constitution.findUnique({ where: { userId } });
    }

    // 4. 组装 Prompt context
    const context: WellnessCardContext = {
      solarTerm: solarTerm.name,
      season: solarTerm.season,
      weather: weather.description,
      temperature: weather.temperature,
      constitution: constitution?.type ?? undefined,
    };

    // 5. 调用 AI 生成卡片内容（流式返回）
    const prompt = getWellnessCardPrompt(context);
    const stream = await streamChat({
      systemPrompt: prompt,
      messages: [{ role: "user", content: "请生成今日养生卡片" }],
      maxTokens: 800,
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Transfer-Encoding": "chunked",
        "Cache-Control": "no-cache",
      },
    });
  } catch (error) {
    console.error("养生卡片生成失败:", error);
    return new Response("生成失败，请稍后重试", { status: 500 });
  }
}
