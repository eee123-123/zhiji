import type { ConstitutionType } from "@/types/wellness";

export interface ConstitutionDetail {
  name: string;
  description: string;
  features: string[];
  carePoints: string[];
}

export const CONSTITUTION_INFO: Record<ConstitutionType, ConstitutionDetail> = {
  pinghe: {
    name: "平和质",
    description: "体态匀称，精力充沛，气血调和，是最理想的体质状态。",
    features: ["精力充沛", "睡眠良好", "性格开朗", "适应力强"],
    carePoints: ["维持当前良好状态", "四季适度调养", "饮食均衡不偏嗜"],
  },
  qixu: {
    name: "气虚质",
    description: "元气不足，容易疲倦乏力，气短懒言，易感风寒。",
    features: ["容易疲劳", "气短懒言", "易出汗", "抵抗力弱"],
    carePoints: ["补气养气", "避免过度劳累", "黄芪党参调养", "适度运动"],
  },
  yangxu: {
    name: "阳虚质",
    description: "阳气不足，畏寒怕冷，手足不温，喜热饮食。",
    features: ["畏寒怕冷", "手脚冰凉", "精神不振", "大便溏薄"],
    carePoints: ["温补阳气", "避免寒凉食物", "注意腰腹保暖", "艾灸温阳"],
  },
  yinxu: {
    name: "阴虚质",
    description: "阴液亏少，口燥咽干，手足心热，喜冷饮。",
    features: ["口干咽燥", "手足心热", "易失眠", "皮肤偏干"],
    carePoints: ["滋阴润燥", "少食辛辣", "早睡养阴", "百合银耳调养"],
  },
  tanshi: {
    name: "痰湿质",
    description: "痰湿凝聚，形体肥胖，腹部松软，易困倦。",
    features: ["体型偏胖", "腹部松软", "口黏痰多", "身重困倦"],
    carePoints: ["健脾化湿", "饮食清淡", "少食肥甘", "坚持运动"],
  },
  shire: {
    name: "湿热质",
    description: "湿热内蕴，面垢油光，口苦口干，身重困倦。",
    features: ["面部油腻", "口苦口臭", "易生痤疮", "大便黏滞"],
    carePoints: ["清热利湿", "饮食清淡", "少食辛辣油腻", "薏仁赤豆调养"],
  },
  xueyu: {
    name: "血瘀质",
    description: "血行不畅，肤色晦暗，容易出现瘀斑，口唇偏暗。",
    features: ["肤色晦暗", "易有瘀斑", "唇色偏暗", "健忘"],
    carePoints: ["活血化瘀", "适量运动", "保持心情舒畅", "山楂玫瑰调养"],
  },
  qiyu: {
    name: "气郁质",
    description: "气机郁滞，情志抑郁，忧虑脆弱，常感闷闷不乐。",
    features: ["情绪低落", "多愁善感", "胸胁胀满", "常叹气"],
    carePoints: ["疏肝理气", "多与人交往", "培养兴趣爱好", "玫瑰花茶调养"],
  },
  tebing: {
    name: "特禀质",
    description: "先天禀赋不足，生理缺陷，过敏反应明显。",
    features: ["易过敏", "鼻塞喷嚏", "皮肤易起疹", "体质敏感"],
    carePoints: ["避开过敏原", "增强体质", "饮食忌发物", "规律作息"],
  },
};
