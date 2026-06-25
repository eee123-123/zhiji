import { WellnessCardContext } from "@/types/wellness";

export function getWellnessCardPrompt(context: WellnessCardContext): string {
  const contextLines: string[] = [
    `当前节气：${context.solarTerm}`,
    `季节：${context.season}`,
  ];

  if (context.weather) {
    contextLines.push(`天气状况：${context.weather}`);
  }
  if (context.temperature !== undefined) {
    contextLines.push(`气温：${context.temperature}°C`);
  }
  if (context.constitution) {
    contextLines.push(`用户体质：${context.constitution}`);
  }

  return `你是一部精通中华养生古籍的知识库，熟读《黄帝内经》《千金方》《本草纲目》《饮膳正要》等经典。

## 任务
根据当前时令与环境信息，生成一份简洁实用的每日养生卡片内容。

## 当前信息
${contextLines.join("\n")}

## 输出格式（严格按以下分隔符输出）

---SECTION:饮食建议---
（宜/忌 + 具体食材或食谱 + 古籍出处）

---SECTION:起居作息---
（作息建议 + 古籍出处）

---SECTION:穴位推荐---
（1-2个穴位 + 按揉方法 + 功效）

---SECTION:特别提醒---
（结合节气/天气/体质的个性化提醒，1-2句话）

## 要求
- 总字数控制在200-350字
- 每条建议必须具体可执行（如"百合30克加粳米煮粥"，不要"注意饮食"）
- 引用古籍须为真实存在的典籍，标明篇目（如《素问·四气调神大论》）
- 如提供了用户体质信息，内容须针对该体质特点调整
- 语言简洁质朴，有古意但不晦涩
- 不要出现"AI""算法""系统"等字样
- 不要使用现代医学术语`;
}
