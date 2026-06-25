/**
 * 24节气计算模块
 * 基于查表法（2024-2027年精确日期）+ 通用天文公式兜底
 */

export interface SolarTermInfo {
  name: string;        // 节气名称（如"小暑"）
  dayIndex: number;    // 当前节气第几天（1-15）
  season: string;      // 季节：spring/summer/autumn/winter
  description: string; // 节气养生要点描述
}

// 24节气名称（按顺序：从立春开始）
const SOLAR_TERM_NAMES = [
  "立春", "雨水", "惊蛰", "春分", "清明", "谷雨",
  "立夏", "小满", "芒种", "夏至", "小暑", "大暑",
  "立秋", "处暑", "白露", "秋分", "寒露", "霜降",
  "立冬", "小雪", "大雪", "冬至", "小寒", "大寒",
] as const;

// 节气对应季节
const SOLAR_TERM_SEASONS: Record<string, string> = {
  "立春": "spring", "雨水": "spring", "惊蛰": "spring",
  "春分": "spring", "清明": "spring", "谷雨": "spring",
  "立夏": "summer", "小满": "summer", "芒种": "summer",
  "夏至": "summer", "小暑": "summer", "大暑": "summer",
  "立秋": "autumn", "处暑": "autumn", "白露": "autumn",
  "秋分": "autumn", "寒露": "autumn", "霜降": "autumn",
  "立冬": "winter", "小雪": "winter", "大雪": "winter",
  "冬至": "winter", "小寒": "winter", "大寒": "winter",
};

// 节气养生要点
const SOLAR_TERM_DESCRIPTIONS: Record<string, string> = {
  "立春": "春气始发，宜养肝护阳，早睡早起以应春生",
  "雨水": "春雨润物，宜健脾祛湿，少食生冷护中焦",
  "惊蛰": "阳气渐升，宜疏肝理气，饮食清淡防春燥",
  "春分": "阴阳平衡，宜调和气血，勿过寒过热以养中",
  "清明": "天清地明，宜舒畅情志，踏青养神顺春阳",
  "谷雨": "雨生百谷，宜祛湿养脾，食当季鲜蔬助运化",
  "立夏": "夏气初至，宜养心安神，午间小憩护心阳",
  "小满": "湿热渐生，宜清热利湿，饮食宜淡不宜腻",
  "芒种": "暑湿交蒸，宜生津止渴，适当出汗排浊气",
  "夏至": "阳极阴生，宜静养勿躁，清淡饮食避暑邪",
  "小暑": "暑气渐盛，宜清热利湿，心静自然凉",
  "大暑": "暑气最盛，宜防暑降温，冬病夏治正当时",
  "立秋": "秋气始收，宜润肺养阴，早卧早起敛阳气",
  "处暑": "暑气渐消，宜滋阴润燥，调整作息迎秋凉",
  "白露": "秋凉渐起，宜润肺防燥，添衣保暖护卫气",
  "秋分": "阴阳相半，宜平补气血，起居顺时养收藏",
  "寒露": "寒气渐生，宜滋阴润肺，少食辛辣防秋燥",
  "霜降": "霜降水冷，宜补脾养胃，进补前先调脾胃",
  "立冬": "冬气始藏，宜温补肾阳，早卧晚起避寒邪",
  "小雪": "寒气渐重，宜温阳散寒，适度进补蓄精气",
  "大雪": "天寒地冻，宜补肾固精，食温热以御严寒",
  "冬至": "阴极阳生，宜静养蓄能，一阳初动护元气",
  "小寒": "严寒将至，宜温肾助阳，食补药补两相宜",
  "大寒": "寒极将春，宜御寒养藏，调神养志待春来",
};

/**
 * 节气日期表（精确到天）
 * 格式：每年按 24 节气顺序排列 [month, day]
 * 注意：小寒、大寒属于上一年的节气周期但日历上在下一年1月
 */
const SOLAR_TERM_DATES: Record<number, [number, number][]> = {
  2024: [
    [2, 4], [2, 19], [3, 5], [3, 20], [4, 4], [4, 19],
    [5, 5], [5, 20], [6, 5], [6, 21], [7, 6], [7, 22],
    [8, 7], [8, 22], [9, 7], [9, 22], [10, 8], [10, 23],
    [11, 7], [11, 22], [12, 6], [12, 21], [1, 6], [1, 20],
  ],
  2025: [
    [2, 3], [2, 18], [3, 5], [3, 20], [4, 4], [4, 20],
    [5, 5], [5, 21], [6, 5], [6, 21], [7, 7], [7, 22],
    [8, 7], [8, 22], [9, 7], [9, 23], [10, 8], [10, 23],
    [11, 7], [11, 22], [12, 7], [12, 21], [1, 5], [1, 20],
  ],
  2026: [
    [2, 4], [2, 19], [3, 6], [3, 21], [4, 5], [4, 20],
    [5, 5], [5, 21], [6, 5], [6, 21], [7, 7], [7, 23],
    [8, 7], [8, 23], [9, 7], [9, 23], [10, 8], [10, 23],
    [11, 7], [11, 22], [12, 7], [12, 22], [1, 5], [1, 20],
  ],
  2027: [
    [2, 4], [2, 19], [3, 6], [3, 21], [4, 5], [4, 20],
    [5, 6], [5, 21], [6, 6], [6, 21], [7, 7], [7, 23],
    [8, 7], [8, 23], [9, 8], [9, 23], [10, 8], [10, 24],
    [11, 7], [11, 22], [12, 7], [12, 22], [1, 5], [1, 20],
  ],
};

/**
 * 通用天文公式兜底计算（简化版寿星算法）
 * 当查表法无数据时使用
 */
function calculateSolarTermDate(year: number, termIndex: number): Date {
  // 简化公式：基于世纪数的节气近似计算
  // 21世纪公式: D = [Y*D + C] - L
  // D = 0.2422, Y = 年份后两位, C = 世纪常数, L = 闰年修正
  const century21C = [
    3.87, 18.73, 5.63, 20.646, 5.59, 20.888,
    5.52, 21.04, 5.678, 21.37, 7.108, 22.83,
    7.5, 23.13, 7.646, 23.042, 8.318, 23.438,
    7.438, 22.36, 7.18, 21.94, 5.4055, 20.12,
  ];

  const y = year % 100;
  const d = 0.2422;
  const c = century21C[termIndex];
  const l = Math.floor(y / 4);

  const day = Math.floor(y * d + c) - l;

  // 确定月份
  let month: number;
  if (termIndex < 2) month = 2;          // 立春、雨水在2月
  else if (termIndex < 4) month = 3;     // 惊蛰、春分在3月
  else if (termIndex < 6) month = 4;     // 清明、谷雨在4月
  else if (termIndex < 8) month = 5;     // 立夏、小满在5月
  else if (termIndex < 10) month = 6;    // 芒种、夏至在6月
  else if (termIndex < 12) month = 7;    // 小暑、大暑在7月
  else if (termIndex < 14) month = 8;    // 立秋、处暑在8月
  else if (termIndex < 16) month = 9;    // 白露、秋分在9月
  else if (termIndex < 18) month = 10;   // 寒露、霜降在10月
  else if (termIndex < 20) month = 11;   // 立冬、小雪在11月
  else if (termIndex < 22) month = 12;   // 大雪、冬至在12月
  else month = 1;                         // 小寒、大寒在1月

  // 小寒大寒实际在下一年1月
  const actualYear = termIndex >= 22 ? year + 1 : year;

  return new Date(actualYear, month - 1, day);
}

/**
 * 获取某一年所有节气的日期列表
 */
function getSolarTermDatesForYear(year: number): Date[] {
  const table = SOLAR_TERM_DATES[year];
  if (table) {
    return table.map(([month, day], index) => {
      // 小寒(22)、大寒(23)在次年1月
      const actualYear = index >= 22 ? year + 1 : year;
      return new Date(actualYear, month - 1, day);
    });
  }

  // 查表无数据时使用天文公式
  return Array.from({ length: 24 }, (_, i) => calculateSolarTermDate(year, i));
}

/**
 * 获取当前日期对应的节气信息
 * 基于查表法 + 天文公式兜底
 */
export function getCurrentSolarTerm(date?: Date): SolarTermInfo {
  const now = date ?? new Date();
  const year = now.getFullYear();
  const month = now.getMonth(); // 0-based
  const day = now.getDate();

  // 获取当年和前一年的节气日期（因为1月可能属于前一年周期的小寒大寒）
  const currentYearTerms = getSolarTermDatesForYear(year);
  const prevYearTerms = getSolarTermDatesForYear(year - 1);

  // 构建完整的节气时间线（前一年的小寒大寒 + 当年所有节气）
  interface TermEntry {
    date: Date;
    index: number;
  }

  const timeline: TermEntry[] = [];

  // 添加前一年的节气（主要需要冬至、小寒、大寒来覆盖年初）
  for (let i = 0; i < 24; i++) {
    timeline.push({ date: prevYearTerms[i], index: i });
  }

  // 添加当年的节气
  for (let i = 0; i < 24; i++) {
    timeline.push({ date: currentYearTerms[i], index: i });
  }

  // 按日期排序
  timeline.sort((a, b) => a.date.getTime() - b.date.getTime());

  // 找到当前日期所在的节气区间
  const nowTime = new Date(year, month, day).getTime();

  let currentTermIndex = 0;
  let currentTermDate = timeline[0].date;

  for (let i = 0; i < timeline.length - 1; i++) {
    const termStart = timeline[i].date.getTime();
    const termEnd = timeline[i + 1].date.getTime();

    if (nowTime >= termStart && nowTime < termEnd) {
      currentTermIndex = timeline[i].index;
      currentTermDate = timeline[i].date;
      break;
    }
  }

  // 计算是当前节气的第几天
  const diffMs = nowTime - currentTermDate.getTime();
  const dayIndex = Math.floor(diffMs / (24 * 60 * 60 * 1000)) + 1;

  const name = SOLAR_TERM_NAMES[currentTermIndex];

  return {
    name,
    dayIndex: Math.max(1, Math.min(dayIndex, 15)),
    season: SOLAR_TERM_SEASONS[name],
    description: SOLAR_TERM_DESCRIPTIONS[name],
  };
}

/**
 * 获取所有节气名称
 */
export function getAllSolarTermNames(): string[] {
  return [...SOLAR_TERM_NAMES];
}

/**
 * 获取指定节气的养生描述
 */
export function getSolarTermDescription(name: string): string | undefined {
  return SOLAR_TERM_DESCRIPTIONS[name];
}
