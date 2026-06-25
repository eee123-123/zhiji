import { TAROT_CARDS } from "./cards";
import { DrawnCard } from "@/types/tarot";

/**
 * 随机抽取指定数量的塔罗牌（不重复），每张50%概率正/逆位
 */
export function drawCards(count: number): DrawnCard[] {
  if (count > TAROT_CARDS.length) {
    throw new Error(`Cannot draw ${count} cards from a deck of ${TAROT_CARDS.length}`);
  }

  // Fisher-Yates 洗牌算法，取前 count 张
  const deck = [...TAROT_CARDS];
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }

  return deck.slice(0, count).map((card) => ({
    card,
    isReversed: Math.random() < 0.5,
  }));
}

/**
 * 格式化抽到的牌信息为文本描述（供 Prompt 使用）
 */
export function formatDrawnCards(cards: DrawnCard[]): string {
  return cards
    .map((drawn, index) => {
      const position = drawn.isReversed ? "逆位" : "正位";
      return `第${index + 1}张：「${drawn.card.name}」${position}`;
    })
    .join("\n");
}
