/**
 * 天气数据服务
 * 本地开发阶段：基于节气/季节返回合理的 mock 数据
 * 上线后：通过环境变量切换到和风天气 API
 */

import { getCurrentSolarTerm } from "../solar-terms";

export interface WeatherData {
  temperature: number;   // 气温（摄氏度）
  humidity: number;      // 湿度（百分比）
  condition: string;     // 天气状况：sunny/cloudy/rainy/snowy/hot/cold
  description: string;   // 中文描述
}

// 季节对应的温度范围和湿度范围
const SEASON_WEATHER: Record<string, {
  tempRange: [number, number];
  humidityRange: [number, number];
  conditions: { condition: string; description: string; weight: number }[];
}> = {
  spring: {
    tempRange: [12, 25],
    humidityRange: [45, 70],
    conditions: [
      { condition: "sunny", description: "春日晴暖", weight: 3 },
      { condition: "cloudy", description: "春云淡淡", weight: 4 },
      { condition: "rainy", description: "春雨绵绵", weight: 3 },
    ],
  },
  summer: {
    tempRange: [28, 36],
    humidityRange: [60, 85],
    conditions: [
      { condition: "hot", description: "暑气蒸腾", weight: 4 },
      { condition: "sunny", description: "骄阳似火", weight: 3 },
      { condition: "rainy", description: "雷雨阵阵", weight: 2 },
      { condition: "cloudy", description: "闷热多云", weight: 1 },
    ],
  },
  autumn: {
    tempRange: [10, 24],
    humidityRange: [35, 60],
    conditions: [
      { condition: "sunny", description: "秋高气爽", weight: 4 },
      { condition: "cloudy", description: "秋云舒卷", weight: 3 },
      { condition: "rainy", description: "秋雨萧瑟", weight: 2 },
      { condition: "cold", description: "秋凉渐起", weight: 1 },
    ],
  },
  winter: {
    tempRange: [-5, 8],
    humidityRange: [25, 50],
    conditions: [
      { condition: "cold", description: "寒气逼人", weight: 4 },
      { condition: "sunny", description: "冬日暖阳", weight: 2 },
      { condition: "cloudy", description: "阴冷沉沉", weight: 2 },
      { condition: "snowy", description: "瑞雪飘飘", weight: 2 },
    ],
  },
};

/**
 * 基于权重的随机选择
 */
function weightedRandom<T extends { weight: number }>(items: T[]): T {
  const totalWeight = items.reduce((sum, item) => sum + item.weight, 0);
  let random = Math.random() * totalWeight;

  for (const item of items) {
    random -= item.weight;
    if (random <= 0) return item;
  }

  return items[items.length - 1];
}

/**
 * 在范围内生成随机数（带小数点精度控制）
 */
function randomInRange(min: number, max: number, decimals = 0): number {
  const value = min + Math.random() * (max - min);
  const factor = Math.pow(10, decimals);
  return Math.round(value * factor) / factor;
}

/**
 * 生成基于节气的 Mock 天气数据
 */
function getMockWeatherData(): WeatherData {
  const solarTerm = getCurrentSolarTerm();
  const seasonConfig = SEASON_WEATHER[solarTerm.season];

  if (!seasonConfig) {
    // fallback
    return {
      temperature: 22,
      humidity: 55,
      condition: "sunny",
      description: "天气晴好",
    };
  }

  const [minTemp, maxTemp] = seasonConfig.tempRange;
  const [minHumidity, maxHumidity] = seasonConfig.humidityRange;

  // 根据节气在季节中的位置微调温度
  // 每个季节6个节气，节气序号越大温度越趋向极端
  const termNames = [
    "立春", "雨水", "惊蛰", "春分", "清明", "谷雨",
    "立夏", "小满", "芒种", "夏至", "小暑", "大暑",
    "立秋", "处暑", "白露", "秋分", "寒露", "霜降",
    "立冬", "小雪", "大雪", "冬至", "小寒", "大寒",
  ];
  const termIndex = termNames.indexOf(solarTerm.name);
  const seasonOffset = termIndex % 6; // 0-5，在季节中的位置
  const progressRatio = seasonOffset / 5; // 0-1

  // 温度随节气递进：春夏越来越热，秋冬越来越冷
  let temperature: number;
  if (solarTerm.season === "spring" || solarTerm.season === "summer") {
    temperature = randomInRange(
      minTemp + (maxTemp - minTemp) * progressRatio * 0.5,
      minTemp + (maxTemp - minTemp) * (0.5 + progressRatio * 0.5),
      1
    );
  } else {
    // 秋冬：越往后越冷
    temperature = randomInRange(
      maxTemp - (maxTemp - minTemp) * (0.5 + progressRatio * 0.5),
      maxTemp - (maxTemp - minTemp) * progressRatio * 0.5,
      1
    );
  }

  const humidity = randomInRange(minHumidity, maxHumidity);
  const weatherChoice = weightedRandom(seasonConfig.conditions);

  return {
    temperature: Math.round(temperature),
    humidity,
    condition: weatherChoice.condition,
    description: weatherChoice.description,
  };
}

/**
 * 获取天气数据
 * 本地开发阶段：基于节气季节返回合理的 mock 数据
 * 上线后：接入和风天气 API（通过 WEATHER_API_KEY 环境变量控制）
 */
export async function getWeatherData(city?: string): Promise<WeatherData> {
  const apiKey = process.env.WEATHER_API_KEY;

  // 如果配置了天气 API Key，使用真实 API
  if (apiKey && process.env.NODE_ENV === "production") {
    return await fetchRealWeatherData(apiKey, city);
  }

  // 本地开发/未配置 API Key 时使用 mock 数据
  return getMockWeatherData();
}

/**
 * 真实天气 API 调用（和风天气）
 * 预留接口，上线后启用
 */
async function fetchRealWeatherData(
  apiKey: string,
  city?: string
): Promise<WeatherData> {
  const location = city || "beijing";

  try {
    const response = await fetch(
      `https://devapi.qweather.com/v7/weather/now?location=${encodeURIComponent(location)}&key=${apiKey}`
    );

    if (!response.ok) {
      console.warn("天气 API 请求失败，降级为 mock 数据");
      return getMockWeatherData();
    }

    const data = await response.json();
    const now = data?.now;

    if (!now) {
      return getMockWeatherData();
    }

    return {
      temperature: parseInt(now.temp, 10),
      humidity: parseInt(now.humidity, 10),
      condition: mapWeatherCondition(now.text),
      description: now.text || "未知天气",
    };
  } catch (error) {
    console.warn("天气 API 调用异常，降级为 mock 数据:", error);
    return getMockWeatherData();
  }
}

/**
 * 将和风天气的天气描述映射为标准 condition
 */
function mapWeatherCondition(text: string): string {
  if (!text) return "sunny";

  if (text.includes("晴")) return "sunny";
  if (text.includes("云") || text.includes("阴")) return "cloudy";
  if (text.includes("雨")) return "rainy";
  if (text.includes("雪")) return "snowy";
  if (text.includes("热") || text.includes("暑")) return "hot";
  if (text.includes("冷") || text.includes("寒")) return "cold";

  return "cloudy";
}
