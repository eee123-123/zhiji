"use client";

import { useState } from "react";
import { TarotCard } from "@/types/tarot";

interface CardSpreadProps {
  cards: TarotCard[];
  onSelect: (index: number) => void;
  disabled?: boolean;
}

export function CardSpread({ onSelect, disabled }: CardSpreadProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const handleSelect = (index: number) => {
    if (disabled || selectedIndex !== null) return;
    setSelectedIndex(index);
    onSelect(index);
  };

  // 蜂巢错位布局：6-5-6-5，刚好22张
  const rows = [6, 5, 6, 5];
  let cardIndex = 0;

  return (
    <div className="flex flex-col items-center gap-2">
      {rows.map((count, rowIdx) => (
        <div
          key={rowIdx}
          className="flex justify-center gap-2"
        >
          {Array.from({ length: count }).map((_item, _colIdx) => {
            const idx = cardIndex++;
            const isSelected = selectedIndex === idx;
            const isOther = selectedIndex !== null && !isSelected;

            return (
              <div
                key={idx}
                onClick={() => handleSelect(idx)}
                className={`
                  cursor-pointer select-none
                  transition-all duration-300
                  ${isSelected ? "scale-115 -translate-y-2 z-10 drop-shadow-[0_0_12px_rgba(212,168,75,0.6)]" : ""}
                  ${isOther ? "opacity-25 scale-95" : ""}
                  ${!disabled && selectedIndex === null ? "hover:-translate-y-1.5 hover:scale-110 hover:drop-shadow-[0_0_8px_rgba(212,168,75,0.3)] active:scale-95" : ""}
                `}
                style={{
                  transitionTimingFunction: "cubic-bezier(0.34, 1.56, 0.64, 1)",
                }}
              >
                <CardBack glowing={isSelected} />
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}

/** 精致的牌背面 */
function CardBack({ glowing = false }: { glowing?: boolean }) {
  return (
    <div
      className={`
        w-[60px] h-[90px] md:w-[72px] md:h-[108px]
        rounded-lg relative overflow-hidden
        ${glowing ? "shadow-[0_0_24px_rgba(212,168,75,0.5)]" : "shadow-[0_4px_12px_rgba(0,0,0,0.4)]"}
      `}
    >
      {/* 渐变背景：深紫到深蓝 */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#1a0f3c] via-[#2d1b69] to-[#0f0a2e] rounded-lg" />

      {/* 金色外边框 */}
      <div className="absolute inset-0 rounded-lg border border-[#d4a84b]/40" />

      {/* 内层装饰边框 */}
      <div className="absolute inset-[4px] md:inset-[5px] rounded border border-[#d4a84b]/15" />

      {/* 中心几何图案 */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="relative">
          {/* 外圈 */}
          <div className="w-6 h-6 md:w-7 md:h-7 rounded-full border border-[#d4a84b]/20" />
          {/* 中心星 */}
          <div className="absolute inset-0 flex items-center justify-center text-[#d4a84b]/50 text-base md:text-lg">
            ✦
          </div>
        </div>
      </div>

      {/* 四角小点缀 */}
      <span className="absolute top-1.5 left-1.5 text-[#d4a84b]/25 text-[8px]">✧</span>
      <span className="absolute top-1.5 right-1.5 text-[#d4a84b]/25 text-[8px]">✧</span>
      <span className="absolute bottom-1.5 left-1.5 text-[#d4a84b]/25 text-[8px]">✧</span>
      <span className="absolute bottom-1.5 right-1.5 text-[#d4a84b]/25 text-[8px]">✧</span>

      {/* 微妙的内阴影光泽 */}
      <div className="absolute inset-0 bg-gradient-to-t from-transparent via-white/[0.02] to-white/[0.05] rounded-lg" />

      {/* 选中发光时的额外光效 */}
      {glowing && (
        <div className="absolute inset-0 bg-[#d4a84b]/10 rounded-lg animate-pulse" />
      )}
    </div>
  );
}
