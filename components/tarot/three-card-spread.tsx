"use client";

import { useState, useMemo } from "react";
import { TarotCard, DrawnCard } from "@/types/tarot";
import { CardFlip } from "./card-flip";

const POSITION_LABELS = ["过去", "现在", "未来"];
const POSITION_HINTS = [
  "选择代表「过去」的牌",
  "选择代表「现在」的牌",
  "选择代表「未来」的牌",
];

interface ThreeCardSpreadProps {
  candidates: TarotCard[];
  onComplete: (cards: DrawnCard[]) => void;
}

export function ThreeCardSpread({ candidates, onComplete }: ThreeCardSpreadProps) {
  const [selectedCards, setSelectedCards] = useState<DrawnCard[]>([]);
  const [selectedIndices, setSelectedIndices] = useState<number[]>([]);
  const [completed, setCompleted] = useState(false);
  const [flippedStates, setFlippedStates] = useState<boolean[]>([false, false, false]);
  const [allFlipped, setAllFlipped] = useState(false);

  const currentStep = selectedCards.length;

  const handleSelect = (index: number) => {
    if (completed || selectedIndices.includes(index) || currentStep >= 3) return;

    const card = candidates[index];
    const isReversed = Math.random() < 0.5;
    const drawn: DrawnCard = { card, isReversed };

    const newCards = [...selectedCards, drawn];
    const newIndices = [...selectedIndices, index];
    setSelectedCards(newCards);
    setSelectedIndices(newIndices);

    if (newCards.length === 3) {
      setCompleted(true);
      // 依次翻牌动画
      setTimeout(() => {
        setFlippedStates([true, false, false]);
        setTimeout(() => {
          setFlippedStates([true, true, false]);
          setTimeout(() => {
            setFlippedStates([true, true, true]);
          }, 500);
        }, 500);
      }, 600);
    }
  };

  const handleLastFlipComplete = () => {
    setAllFlipped(true);
    onComplete(selectedCards);
  };

  // 动态计算布局行结构
  const isCompact = candidates.length > 22;
  const rows = useMemo(() => {
    const total = candidates.length;
    if (total <= 22) return [6, 5, 6, 5];
    // 78张用 10-9 交错
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

  // 选牌阶段
  if (!completed) {
    return (
      <div className="flex flex-col items-center">
        {/* 提示当前选第几张 */}
        <h2 className="text-lg font-bold text-zhiji-gold mb-2">
          {POSITION_HINTS[currentStep]}
        </h2>
        <p className="text-gray-400 text-sm text-center mb-4 max-w-sm">
          凭直觉，让手指自然被吸引（第 {currentStep + 1}/3 张）
        </p>

        {/* 已选牌标签预览 */}
        {selectedCards.length > 0 && (
          <div className="flex gap-3 mb-5">
            {selectedCards.map((drawn, i) => (
              <div key={i} className="flex flex-col items-center">
                <div className="w-10 h-14 rounded-md bg-zhiji-purple/60 border border-zhiji-gold/40 flex items-center justify-center">
                  <span className="text-zhiji-gold/80 text-xs">✦</span>
                </div>
                <span className="text-[10px] text-zhiji-gold/70 mt-1">
                  {POSITION_LABELS[i]}
                </span>
              </div>
            ))}
            {/* 当前待选占位 */}
            <div className="flex flex-col items-center">
              <div className="w-10 h-14 rounded-md border-2 border-dashed border-zhiji-gold/30 flex items-center justify-center animate-pulse">
                <span className="text-zhiji-gold/40 text-xs">?</span>
              </div>
              <span className="text-[10px] text-zhiji-gold/70 mt-1">
                {POSITION_LABELS[currentStep]}
              </span>
            </div>
          </div>
        )}

      {/* 网格牌阵 */}
        <div className="flex flex-col items-center gap-1.5 md:gap-2">
          {rows.map((count, rowIdx) => (
            <div key={rowIdx} className="flex justify-center gap-1 md:gap-1.5">
              {Array.from({ length: count }).map((_item, _colIdx) => {
                const idx = cardIndex++;
                const isSelected = selectedIndices.includes(idx);
                const selectedOrder = selectedIndices.indexOf(idx);

                return (
                  <div
                    key={idx}
                    onClick={() => handleSelect(idx)}
                    className={`
                      select-none transition-all duration-300
                      ${isSelected ? "scale-95 opacity-40 cursor-not-allowed" : "cursor-pointer hover:-translate-y-1.5 hover:scale-110 hover:drop-shadow-[0_0_8px_rgba(212,168,75,0.3)] active:scale-95"}
                    `}
                    style={{
                      transitionTimingFunction: "cubic-bezier(0.34, 1.56, 0.64, 1)",
                    }}
                  >
                    <div className="relative">
                      <SmallCardBack compact={isCompact} />
                      {isSelected && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-lg">
                          <span className="text-zhiji-gold text-[10px] font-bold">
                            {POSITION_LABELS[selectedOrder]}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    );
  }

  // 翻牌展示阶段
  return (
    <div className="flex flex-col items-center py-8">
      <h2 className="text-lg font-bold text-zhiji-gold mb-6">
        {allFlipped ? "时间之线已展开" : "揭示命运之牌..."}
      </h2>

      {/* 三张牌横向排列 */}
      <div className="flex items-center gap-4 md:gap-6">
        {selectedCards.map((drawn, i) => (
          <div key={i} className="flex flex-col items-center">
            <CardFlip
              drawnCard={drawn}
              flipped={flippedStates[i]}
              onFlipComplete={i === 2 ? handleLastFlipComplete : undefined}
              size="sm"
            />
            <span className="mt-3 text-xs text-zhiji-gold/70 font-medium">
              {POSITION_LABELS[i]}
            </span>
            {allFlipped && (
              <span className="mt-1 text-[10px] text-gray-400">
                {drawn.card.name}{drawn.isReversed ? "（逆位）" : "（正位）"}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

/** 蛇形/蜂巢布局用小牌背 */
function SmallCardBack({ compact = false }: { compact?: boolean }) {
  const sizeClass = compact
    ? "w-[38px] h-[57px] md:w-[48px] md:h-[72px]"
    : "w-[60px] h-[90px] md:w-[72px] md:h-[108px]";

  return (
    <div className={`${sizeClass} rounded-lg relative overflow-hidden shadow-[0_4px_12px_rgba(0,0,0,0.4)]`}>
      {/* 渐变背景 */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#1a0f3c] via-[#2d1b69] to-[#0f0a2e] rounded-lg" />
      {/* 金色外边框 */}
      <div className="absolute inset-0 rounded-lg border border-[#d4a84b]/40" />
      {/* 内层装饰边框 */}
      <div className={`absolute ${compact ? "inset-[3px]" : "inset-[4px] md:inset-[5px]"} rounded border border-[#d4a84b]/15`} />
      {/* 中心几何图案 */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="relative">
          <div className={`${compact ? "w-4 h-4 md:w-5 md:h-5" : "w-6 h-6 md:w-7 md:h-7"} rounded-full border border-[#d4a84b]/20`} />
          <div className={`absolute inset-0 flex items-center justify-center text-[#d4a84b]/50 ${compact ? "text-xs md:text-sm" : "text-base md:text-lg"}`}>
            ✦
          </div>
        </div>
      </div>
      {/* 四角装饰 */}
      {!compact && (
        <>
          <span className="absolute top-1.5 left-1.5 text-[#d4a84b]/25 text-[8px]">✧</span>
          <span className="absolute top-1.5 right-1.5 text-[#d4a84b]/25 text-[8px]">✧</span>
          <span className="absolute bottom-1.5 left-1.5 text-[#d4a84b]/25 text-[8px]">✧</span>
          <span className="absolute bottom-1.5 right-1.5 text-[#d4a84b]/25 text-[8px]">✧</span>
        </>
      )}
      {/* 微妙光泽 */}
      <div className="absolute inset-0 bg-gradient-to-t from-transparent via-white/[0.02] to-white/[0.05] rounded-lg" />
    </div>
  );
}
