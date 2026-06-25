import { TAROT_CARDS } from "./cards";
import { DrawnCard, SpreadType } from "@/types/tarot";

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

const THREE_CARD_POSITIONS = ["过去", "现在", "未来"];

/**
 * 凯尔特十字牌阵位置名称
 */
const CELTIC_POSITIONS = [
  "当前处境",
  "挑战阻碍",
  "潜意识",
  "过去影响",
  "意识层面",
  "近未来",
  "自身态度",
  "外部环境",
  "希望与恐惧",
  "最终结果",
];

/**
 * 带位置信息的格式化（三牌阵/凯尔特使用位置标签，其他类型使用默认格式）
 */
export function formatDrawnCardsWithPositions(cards: DrawnCard[], spreadType: SpreadType): string {
  if (spreadType === "celtic") {
    return cards
      .map((drawn, index) => {
        const position = drawn.isReversed ? "逆位" : "正位";
        return `位置${index + 1}（${CELTIC_POSITIONS[index]}）：「${drawn.card.name}」${position}`;
      })
      .join("\n");
  }
  if (spreadType === "three") {
    return cards
      .map((drawn, index) => {
        const position = drawn.isReversed ? "逆位" : "正位";
        return `${THREE_CARD_POSITIONS[index]}位：「${drawn.card.name}」${position}`;
      })
      .join("\n");
  }
  // 单牌/其他类型维持原有格式
  return formatDrawnCards(cards);
}
