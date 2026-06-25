import type { ConstitutionType } from "@/types/wellness";

export interface QuestionOption {
  label: string;
  score: Partial<Record<ConstitutionType, number>>;
}

export interface Question {
  id: number;
  text: string;
  options: QuestionOption[];
}

// 简化版体质问卷（10道题），覆盖九种体质常见表现
export const CONSTITUTION_QUESTIONS: Question[] = [
  {
    id: 1,
    text: "你是否经常感到疲倦乏力，不想说话？",
    options: [
      { label: "经常如此", score: { qixu: 3, yangxu: 1 } },
      { label: "偶尔会有", score: { qixu: 1 } },
      { label: "很少出现", score: { pinghe: 2 } },
    ],
  },
  {
    id: 2,
    text: "天气转凉时，你比别人更容易怕冷吗？",
    options: [
      { label: "是，明显怕冷", score: { yangxu: 3, qixu: 1 } },
      { label: "比一般人略怕冷", score: { yangxu: 1 } },
      { label: "不太怕冷", score: { pinghe: 1, yinxu: 1 } },
    ],
  },
  {
    id: 3,
    text: "你是否容易口干、手脚心发热？",
    options: [
      { label: "经常如此", score: { yinxu: 3 } },
      { label: "偶尔会有", score: { yinxu: 1 } },
      { label: "不会", score: { pinghe: 1, yangxu: 1 } },
    ],
  },
  {
    id: 4,
    text: "你的体型偏胖，且腹部松软吗？",
    options: [
      { label: "是，腹部明显", score: { tanshi: 3, qixu: 1 } },
      { label: "稍有些", score: { tanshi: 1 } },
      { label: "不是", score: { pinghe: 1 } },
    ],
  },
  {
    id: 5,
    text: "你的面部是否容易出油，或口中常有苦味？",
    options: [
      { label: "经常如此", score: { shire: 3 } },
      { label: "偶尔会有", score: { shire: 1, tanshi: 1 } },
      { label: "不会", score: { pinghe: 1 } },
    ],
  },
  {
    id: 6,
    text: "你的皮肤是否容易出现暗沉、色斑或瘀青？",
    options: [
      { label: "明显有", score: { xueyu: 3 } },
      { label: "偶尔有", score: { xueyu: 1 } },
      { label: "皮肤状态不错", score: { pinghe: 2 } },
    ],
  },
  {
    id: 7,
    text: "你是否经常叹气、情绪低落或容易焦虑？",
    options: [
      { label: "经常如此", score: { qiyu: 3 } },
      { label: "有时会", score: { qiyu: 1 } },
      { label: "心态平和", score: { pinghe: 2 } },
    ],
  },
  {
    id: 8,
    text: "你是否容易过敏（花粉、食物、药物等）？",
    options: [
      { label: "容易过敏", score: { tebing: 3 } },
      { label: "偶尔过敏", score: { tebing: 1 } },
      { label: "不太过敏", score: { pinghe: 1 } },
    ],
  },
  {
    id: 9,
    text: "你的睡眠质量如何？",
    options: [
      { label: "经常失眠或多梦", score: { yinxu: 2, qiyu: 1 } },
      { label: "偶尔睡不好", score: { qiyu: 1 } },
      { label: "睡眠质量好", score: { pinghe: 2 } },
    ],
  },
  {
    id: 10,
    text: "你的精力和适应能力如何？",
    options: [
      { label: "精力差，不耐受寒热", score: { qixu: 2, yangxu: 1 } },
      { label: "一般，偶尔觉得累", score: { qixu: 1 } },
      { label: "精力充沛，适应力强", score: { pinghe: 3 } },
    ],
  },
];

/**
 * 根据问卷答案计算体质类型
 * @param answers 选项索引数组（每题选了第几个选项，0-based）
 * @returns 主要体质类型和各维度得分
 */
export function calculateConstitution(answers: number[]): {
  type: ConstitutionType;
  scores: Record<string, number>;
} {
  const scores: Record<string, number> = {
    pinghe: 0,
    qixu: 0,
    yangxu: 0,
    yinxu: 0,
    tanshi: 0,
    shire: 0,
    xueyu: 0,
    qiyu: 0,
    tebing: 0,
  };

  // 累计各体质维度得分
  answers.forEach((optionIndex, questionIndex) => {
    const question = CONSTITUTION_QUESTIONS[questionIndex];
    if (!question) return;

    const option = question.options[optionIndex];
    if (!option) return;

    Object.entries(option.score).forEach(([key, value]) => {
      scores[key] = (scores[key] || 0) + value;
    });
  });

  // 找到得分最高的体质类型
  let maxType: ConstitutionType = "pinghe";
  let maxScore = 0;

  Object.entries(scores).forEach(([key, value]) => {
    if (value > maxScore) {
      maxScore = value;
      maxType = key as ConstitutionType;
    }
  });

  return { type: maxType, scores };
}
