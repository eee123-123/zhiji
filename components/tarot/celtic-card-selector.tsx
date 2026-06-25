"use client";

import { useState, useMemo } from "react";
import { TarotCard, DrawnCard } from "@/types/tarot";

interface CelticCardSelectorProps {
  candidates: TarotCard[]; // 22张或全部78张
  onComplete: (cards: DrawnCard[]) => void;
}

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

const POSITION_HINTS = [
  "代表你的当前处境",
  "代表你面临的挑战与阻碍",
  "代表你内心深处的想法",
  "代表过去对现状的影响",
  "代表你意识层面的思考",
  "代表即将到来的变化",
  "代表你自身的态度与立场",
  "代表外部环境对你的影响",
  "代表你内心的希望与恐惧",
  "代表最终可能的结果",
];

export function CelticCardSelector({
  candidates,
  onComplete,
}: CelticCardSelectorProps) {
  const [selectedCards, setSelectedCards] = useState<
    { index: number; card: TarotCard; isReversed: boolean }[]
  >([]);

  const currentStep = selectedCards.length;
  const isComplete = currentStep >= 10;

  const handleSelect = (index: number) => {
    if (isComplete) return;
    // 已选过的牌不可再选
    if (selectedCards.some((s) => s.index === index)) return;

    const card = candidates[index];
    const isReversed = Math.random() < 0.5;

    const newSelected = [...selectedCards, { index, card, isReversed }];
    setSelectedCards(newSelected);

    // 选满10张自动完成
    if (newSelected.length === 10) {
      const drawnCards: DrawnCard[] = newSelected.map((s) => ({
        card: s.card,
        isReversed: s.isReversed,
      }));
      // 短暂延迟让用户看到最后一张被选中的效果
      setTimeout(() => onComplete(drawnCards), 600);
    }
  };

  // 获取牌的选中序号（1-based），未选中返回null
  const getSelectedOrder = (index: number): number | null => {
    const found = selectedCards.findIndex((s) => s.index === index);
    return found >= 0 ? found + 1 : null;
  };

  // 动态计算布局行结构
  const isCompact = candidates.length > 22;
  const rows = useMemo(() => {
    const total = candidates.length;
    if (total <= 22) return [6, 5, 6, 5];
    const r: number[] = [];
    let remaining = total;
    let isLong = true;
    while (remaining > 0) {
      const rowSize = isLong ? Math.min(10, remaining) : Math.min(9, remaining);
      r.push(rowSize);
      remaining -= rowSize;
      isLong = !isLong;
    }
    return r;
  }, [candidates.length]);
  let cardIndex = 0;

  return (
    <div className="flex flex-col items-center w-full">
      {/* 顶部提示 */}
      <div className="text-center mb-6">
        {!isComplete ? (
          <>
            <h2 className="text-lg font-bold text-zhiji-gold mb-1">
              选择第 {currentStep + 1} 张牌
            </h2>
            <p className="text-gray-400 text-sm">
              {POSITION_HINTS[currentStep]}
            </p>
            <p className="text-gray-500 text-xs mt-1">
              · {CELTIC_POSITIONS[currentStep]} ·
            </p>
          </>
        ) : (
          <div className="flex items-center gap-2 text-zhiji-gold">
            <span className="text-lg">✦</span>
            <span className="font-bold">十张牌已选定</span>
            <span className="text-lg">✦</span>
          </div>
        )}
      </div>

      {/* 进度指示 */}
      <div className="flex gap-1.5 mb-6">
        {Array.from({ length: 10 }).map((_, i) => (
          <div
            key={i}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              i < currentStep
                ? "bg-zhiji-gold scale-110"
                : i === currentStep
                ? "bg-zhiji-gold/50 animate-pulse"
                : "bg-gray-700"
            }`}
          />
        ))}
      </div>

      {/* 牌面网格 */}
      <div className="flex flex-col items-center gap-1.5 md:gap-2">
        {rows.map((count, rowIdx) => (
          <div key={rowIdx} className="flex justify-center gap-1 md:gap-1.5">
            {Array.from({ length: count }).map((_item, _colIdx) => {
              const idx = cardIndex++;
              const order = getSelectedOrder(idx);
              const isSelected = order !== null;

              return (
                <div
                  key={idx}
                  onClick={() => handleSelect(idx)}
                  className={`
                    relative select-none
                    transition-all duration-300
                    ${
                      isSelected
                        ? "scale-95 opacity-60"
                        : "cursor-pointer hover:-translate-y-1.5 hover:scale-110 hover:drop-shadow-[0_0_8px_rgba(212,168,75,0.3)] active:scale-95"
                    }
                    ${isComplete && !isSelected ? "opacity-20" : ""}
                  `}
                  style={{
                    transitionTimingFunction:
                      "cubic-bezier(0.34, 1.56, 0.64, 1)",
                  }}
                >
                  <CelticCardBack selected={isSelected} compact={isCompact} />
                  {/* 已选序号标记 */}
                  {order !== null && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="w-6 h-6 rounded-full bg-zhiji-gold text-zhiji-dark text-xs font-bold flex items-center justify-center shadow-lg">
                        {order}
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {/* 已选牌位提示 */}
      {currentStep > 0 && !isComplete && (
        <div className="mt-6 flex flex-wrap justify-center gap-2 max-w-sm">
          {selectedCards.map((s, i) => (
            <span
              key={i}
              className="text-xs text-gray-500 bg-white/5 px-2 py-0.5 rounded"
            >
              {i + 1}. {CELTIC_POSITIONS[i]}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

/** 凯尔特选牌用的牌背 */
function CelticCardBack({ selected = false, compact = false }: { selected?: boolean; compact?: boolean }) {
  const sizeClass = compact
    ? "w-[34px] h-[51px] md:w-[44px] md:h-[66px]"
    : "w-[52px] h-[78px] md:w-[60px] md:h-[90px]";
  return (
    <div
      className={`
        ${sizeClass}
        rounded-lg relative overflow-hidden
        ${
          selected
            ? "shadow-none"
            : "shadow-[0_4px_12px_rgba(0,0,0,0.4)]"
        }
      `}
    >
      {/* 渐变背景 */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#1a0f3c] via-[#2d1b69] to-[#0f0a2e] rounded-lg" />

      {/* 金色外边框 */}
      <div
        className={`absolute inset-0 rounded-lg border ${
          selected ? "border-zhiji-gold/60" : "border-[#d4a84b]/40"
        }`}
      />

      {/* 内层装饰边框 */}
      <div className={`absolute ${compact ? "inset-[2px]" : "inset-[3px] md:inset-[4px]"} rounded border border-[#d4a84b]/15`} />

      {/* 中心图案 */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="relative">
          <div className={`${compact ? "w-3.5 h-3.5 md:w-4 md:h-4" : "w-5 h-5 md:w-6 md:h-6"} rounded-full border border-[#d4a84b]/20`} />
          <div className={`absolute inset-0 flex items-center justify-center text-[#d4a84b]/50 ${compact ? "text-[10px] md:text-xs" : "text-sm md:text-base"}`}>
            ✦
          </div>
        </div>
      </div>

      {/* 四角装饰 */}
      {!compact && (
        <>
          <span className="absolute top-1 left-1 text-[#d4a84b]/25 text-[7px]">
            ✧
          </span>
          <span className="absolute top-1 right-1 text-[#d4a84b]/25 text-[7px]">
            ✧
          </span>
          <span className="absolute bottom-1 left-1 text-[#d4a84b]/25 text-[7px]">
            ✧
          </span>
          <span className="absolute bottom-1 right-1 text-[#d4a84b]/25 text-[7px]">
            ✧
          </span>
        </>
      )}

      {/* 光泽 */}
      <div className="absolute inset-0 bg-gradient-to-t from-transparent via-white/[0.02] to-white/[0.05] rounded-lg" />

      {/* 选中后变暗 */}
      {selected && (
        <div className="absolute inset-0 bg-black/30 rounded-lg" />
      )}
    </div>
  );
}
