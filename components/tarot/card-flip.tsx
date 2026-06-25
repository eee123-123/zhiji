"use client";

import { DrawnCard } from "@/types/tarot";

interface CardFlipProps {
  drawnCard: DrawnCard;
  flipped: boolean;
  onFlipComplete?: () => void;
  size?: "sm" | "md" | "lg";
}

export function CardFlip({
  drawnCard,
  flipped,
  onFlipComplete,
  size = "md",
}: CardFlipProps) {
  const sizeClasses = {
    sm: "w-32 h-48",
    md: "w-44 h-64",
    lg: "w-56 h-80",
  };

  return (
    <div className={`perspective-1000 ${sizeClasses[size]}`}>
      <div
        className={`relative w-full h-full transition-transform duration-[600ms] transform-style-3d ${
          flipped ? "rotate-y-180" : ""
        }`}
        onTransitionEnd={() => {
          if (flipped && onFlipComplete) onFlipComplete();
        }}
      >
        {/* 牌背面 */}
        <div className="absolute inset-0 backface-hidden rounded-xl overflow-hidden">
          <CardBack />
        </div>
        {/* 牌正面 */}
        <div className="absolute inset-0 backface-hidden rotate-y-180 rounded-xl overflow-hidden">
          <CardFront drawnCard={drawnCard} />
        </div>
      </div>
    </div>
  );
}

function CardBack() {
  return (
    <div className="w-full h-full bg-gradient-to-br from-zhiji-purple to-zhiji-dark border-2 border-zhiji-gold/60 rounded-xl flex items-center justify-center relative overflow-hidden">
      {/* 装饰背景纹理 */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-4 border border-zhiji-gold/40 rounded-lg" />
        <div className="absolute inset-8 border border-zhiji-gold/20 rounded-md" />
      </div>
      {/* 星空粒子点缀 */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-[15%] left-[20%] w-1 h-1 bg-zhiji-gold/30 rounded-full" />
        <div className="absolute top-[35%] right-[25%] w-0.5 h-0.5 bg-zhiji-gold/20 rounded-full" />
        <div className="absolute bottom-[25%] left-[30%] w-0.5 h-0.5 bg-zhiji-gold/25 rounded-full" />
        <div className="absolute top-[60%] right-[15%] w-1 h-1 bg-zhiji-gold/20 rounded-full" />
        <div className="absolute bottom-[40%] left-[15%] w-0.5 h-0.5 bg-zhiji-gold/30 rounded-full" />
      </div>
      {/* 中心星形图案 */}
      <div className="relative z-10 text-4xl text-zhiji-gold/80">✦</div>
      {/* 四角装饰 */}
      <div className="absolute top-3 left-3 text-zhiji-gold/40 text-xs">✧</div>
      <div className="absolute top-3 right-3 text-zhiji-gold/40 text-xs">✧</div>
      <div className="absolute bottom-3 left-3 text-zhiji-gold/40 text-xs">✧</div>
      <div className="absolute bottom-3 right-3 text-zhiji-gold/40 text-xs">✧</div>
    </div>
  );
}

function CardFront({ drawnCard }: { drawnCard: DrawnCard }) {
  const { card, isReversed } = drawnCard;

  return (
    <div className="w-full h-full bg-gradient-to-b from-zhiji-dark to-zhiji-purple/80 border-2 border-zhiji-gold/60 rounded-xl flex flex-col items-center justify-center p-4 relative">
      {/* 牌号 */}
      <div className="absolute top-3 left-3 text-zhiji-gold/60 text-sm font-mono">
        {card.arcana === "major" ? String(card.id).padStart(2, "0") : ""}
      </div>
      {/* 正逆位标记 */}
      <div
        className={`absolute top-3 right-3 text-xs px-2 py-0.5 rounded-full ${
          isReversed
            ? "bg-purple-900/60 text-purple-300"
            : "bg-zhiji-gold/20 text-zhiji-gold"
        }`}
      >
        {isReversed ? "逆位" : "正位"}
      </div>
      {/* 牌名 */}
      <div className={`text-center ${isReversed ? "rotate-180" : ""}`}>
        <div className="text-2xl font-bold text-zhiji-gold mb-2">
          {card.name}
        </div>
        <div className="text-sm text-gray-400">{card.nameEn}</div>
      </div>
      {/* 花色标记（小阿尔卡那） */}
      {card.suit && (
        <div className="absolute bottom-4 text-zhiji-gold/50 text-sm">
          {card.suit === "wands" && "🔥 权杖"}
          {card.suit === "cups" && "💧 圣杯"}
          {card.suit === "swords" && "💨 宝剑"}
          {card.suit === "pentacles" && "🌍 星币"}
        </div>
      )}
    </div>
  );
}
