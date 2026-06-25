"use client";

import { SpreadType } from "@/types/tarot";

interface SpreadSelectorProps {
  selectedSpread: SpreadType | null;
  onSelect: (spread: SpreadType) => void;
}

interface SpreadOption {
  id: SpreadType;
  name: string;
  description: string;
  cardCount: number;
  badge?: string;
}

const SPREAD_OPTIONS: SpreadOption[] = [
  {
    id: "single",
    name: "单牌",
    description: "一张牌，简洁指引",
    cardCount: 1,
  },
  {
    id: "three",
    name: "三牌阵",
    description: "过去-现在-未来，时间线分析",
    cardCount: 3,
  },
  {
    id: "celtic",
    name: "凯尔特十字",
    description: "十张牌，全方位深度解析",
    cardCount: 10,
    badge: "高级",
  },
];

export function SpreadSelector({
  selectedSpread,
  onSelect,
}: SpreadSelectorProps) {
  return (
    <div className="w-full max-w-md">
      <p className="text-gray-400 text-sm text-center mb-4">
        选择一种牌阵，让牌面为你铺开线索
      </p>
      <div className="flex flex-col gap-3">
        {SPREAD_OPTIONS.map((spread) => {
          const isSelected = selectedSpread === spread.id;
          return (
            <button
              key={spread.id}
              onClick={() => onSelect(spread.id)}
              className={`
                relative p-4 rounded-xl border text-left transition-all duration-300 cursor-pointer
                ${
                  isSelected
                    ? "border-zhiji-gold/60 bg-zhiji-gold/10 shadow-lg shadow-zhiji-gold/10"
                    : "border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/8"
                }
              `}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p
                    className={`font-bold text-base mb-1 ${
                      isSelected ? "text-zhiji-gold" : "text-gray-200"
                    }`}
                  >
                    {spread.name}
                    {spread.badge && (
                      <span className="ml-2 text-[10px] bg-zhiji-gold/20 text-zhiji-gold px-1.5 py-0.5 rounded">
                        {spread.badge}
                      </span>
                    )}
                  </p>
                  <p className="text-xs text-gray-400">{spread.description}</p>
                </div>
                <span className="text-gray-500 text-sm">
                  {spread.cardCount} 张牌
                </span>
              </div>
              {isSelected && (
                <div className="absolute top-3 right-3 w-2 h-2 rounded-full bg-zhiji-gold/30 border border-zhiji-gold/60" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
