export interface DreamPromptContext {
  content: string;      // 梦境描述
  tags: string[];       // 标签
  emotion?: string;     // 情绪
  clarity?: string;     // 清晰度
  isRecurring?: boolean; // 是否反复出现
}

export type DreamEmotion = "fear" | "anxiety" | "joy" | "sadness" | "confusion" | "calm" | "absurd";
export type DreamClarity = "clear" | "partial" | "vague";

export const EMOTION_LABELS: Record<DreamEmotion, string> = {
  fear: "恐惧",
  anxiety: "焦虑",
  joy: "喜悦",
  sadness: "悲伤",
  confusion: "困惑",
  calm: "平静",
  absurd: "荒诞",
};

export const CLARITY_LABELS: Record<DreamClarity, string> = {
  clear: "非常清晰",
  partial: "部分清晰",
  vague: "模糊片段",
};

// 预设梦境标签
export const PRESET_DREAM_TAGS = [
  "水", "飞行", "追赶", "考试", "陌生人", "迷路", "坠落",
  "动物", "家人", "前任", "房屋", "道路", "黑暗", "光芒",
  "镜子", "火", "花", "死亡", "婴儿", "海洋",
];
