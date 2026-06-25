// 九种体质类型
export type ConstitutionType =
  | "pinghe"   // 平和质
  | "qixu"    // 气虚质
  | "yangxu"  // 阳虚质
  | "yinxu"   // 阴虚质
  | "tanshi"  // 痰湿质
  | "shire"   // 湿热质
  | "xueyu"   // 血瘀质
  | "qiyu"    // 气郁质
  | "tebing"; // 特禀质

export const CONSTITUTION_LABELS: Record<ConstitutionType, string> = {
  pinghe: "平和质",
  qixu: "气虚质",
  yangxu: "阳虚质",
  yinxu: "阴虚质",
  tanshi: "痰湿质",
  shire: "湿热质",
  xueyu: "血瘀质",
  qiyu: "气郁质",
  tebing: "特禀质",
};

export interface WellnessCardContext {
  solarTerm: string;     // 当前节气
  season: string;        // 季节
  weather?: string;      // 天气状况
  temperature?: number;  // 气温
  constitution?: string; // 用户体质（可选）
}

export interface QiboDialogContext {
  userMessage: string;
  constitution?: string;
  solarTerm?: string;
  history?: { role: string; content: string }[];
}

export type CheckinType = "diet" | "exercise" | "sleep" | "custom";

export const CHECKIN_LABELS: Record<CheckinType, string> = {
  diet: "饮食",
  exercise: "起居",
  sleep: "睡眠",
  custom: "其他",
};
