export interface TarotCard {
  id: number;
  name: string; // 中文名
  nameEn: string; // 英文名
  arcana: "major" | "minor"; // 大/小阿尔卡那
  suit?: "wands" | "cups" | "swords" | "pentacles"; // 小阿尔卡那花色
  number?: number; // 牌号
}

export interface DrawnCard {
  card: TarotCard;
  isReversed: boolean; // 是否逆位
}

export type SpreadType = "single" | "three" | "celtic";

export type TarotRole = "yuejian" | "yousuo" | "qingwu" | "huohu";

export type TarotTopic = "love" | "career" | "decision" | "general";

export const TOPIC_LABELS: Record<TarotTopic, string> = {
  love: "感情关系",
  career: "事业发展",
  decision: "人生抉择",
  general: "今日指引",
};

export interface TarotSessionData {
  role: TarotRole;
  topic?: string;
  description?: string;
  spreadType: SpreadType;
  cards: DrawnCard[];
}
