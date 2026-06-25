import { db } from "@/lib/db";
import { getCurrentUserId } from "@/lib/auth";
import { DrawnCard } from "@/types/tarot";

export interface NarrativeContext {
  hasResonance: boolean;
  resonanceText: string; // 注入到 Prompt 中的文本
  displayHint?: string; // 前端展示的轻提示
}

/**
 * 查询近7天内的问牌记录，检测是否有牌面呼应
 */
export async function checkNarrativeResonance(
  currentCards: DrawnCard[]
): Promise<NarrativeContext> {
  const userId = getCurrentUserId();

  // 无用户身份时直接返回无呼应
  if (!userId) {
    return { hasResonance: false, resonanceText: "" };
  }

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  // 查询7天内的历史记录
  const recentReadings = await db.tarotReading.findMany({
    where: {
      userId,
      createdAt: { gte: sevenDaysAgo },
    },
    orderBy: { createdAt: "desc" },
    take: 20, // 最多看最近20条
  });

  if (recentReadings.length === 0) {
    return { hasResonance: false, resonanceText: "" };
  }

  // 提取当前抽到的牌名
  const currentCardNames = currentCards.map((c) => c.card.name);

  // 检测呼应类型：
  // 1. 同牌呼应：近7天抽到过相同的牌
  // 2. 同主题呼应：近7天有相同主题的问牌

  const resonances: string[] = [];

  for (const reading of recentReadings) {
    try {
      const historyCards: DrawnCard[] = JSON.parse(reading.cards);
      const historyCardNames = historyCards.map((c) => c.card.name);

      // 检查是否有相同的牌
      const sameCards = currentCardNames.filter((name) =>
        historyCardNames.includes(name)
      );

      if (sameCards.length > 0) {
        const daysAgo = Math.ceil(
          (Date.now() - reading.createdAt.getTime()) / (1000 * 60 * 60 * 24)
        );
        const timeDesc =
          daysAgo === 0 ? "今天" : daysAgo === 1 ? "昨天" : `${daysAgo}天前`;
        resonances.push(
          `用户${timeDesc}也抽到了「${sameCards[0]}」（${reading.topic ? `当时问的是${reading.topic}` : "一键抽牌"}）`
        );
      }
    } catch {
      // cards 字段解析失败时跳过该条记录
      continue;
    }
  }

  if (resonances.length === 0) {
    return { hasResonance: false, resonanceText: "" };
  }

  // 构建注入 Prompt 的文本
  const resonanceText = `
## 连续性叙事提示（请自然融入解读中，不要生硬提及）
近期牌面呼应：
${resonances.slice(0, 3).join("\n")}
请在解读中自然地提及这种呼应，比如"有趣的是，这张牌最近频繁出现在你的牌面中，这或许意味着..."。语气要自然，不要像系统通知。
`;

  // 找到第一张呼应牌用于前端展示
  const firstResonanceCard = currentCardNames.find((name) =>
    resonances.some((r) => r.includes(`「${name}」`))
  );

  // 构建前端展示提示（诗意化风格）
  const displayHint = firstResonanceCard
    ? `「${firstResonanceCard}」近日反复出现在你的牌面中，宇宙似乎在低语着什么`
    : `你近期的牌面中有相似的讯息浮现，命运之线正在交织`;

  return {
    hasResonance: true,
    resonanceText,
    displayHint,
  };
}
