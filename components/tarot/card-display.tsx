"use client";

import { useState, useEffect, useRef } from "react";
import { CardFlip } from "./card-flip";
import { DrawnCard } from "@/types/tarot";

interface CardDisplayProps {
  drawnCard: DrawnCard | null;
  autoFlip?: boolean;
  autoFlipDelay?: number; // ms
  onFlipComplete?: () => void;
}

export function CardDisplay({
  drawnCard,
  autoFlip = true,
  autoFlipDelay = 800,
  onFlipComplete,
}: CardDisplayProps) {
  const [flipped, setFlipped] = useState(false);

  useEffect(() => {
    if (drawnCard && autoFlip) {
      const timer = setTimeout(() => {
        setFlipped(true);
      }, autoFlipDelay);
      return () => clearTimeout(timer);
    }
  }, [drawnCard, autoFlip, autoFlipDelay]);

  // 重置状态（当新牌到来时）— render-time 检测，避免 effect 中同步 setState
  const prevCardIdRef = useRef<number | undefined>(drawnCard?.card.id);
  if (drawnCard?.card.id !== prevCardIdRef.current) {
    prevCardIdRef.current = drawnCard?.card.id;
    setFlipped(false);
  }

  if (!drawnCard) {
    return (
      <div className="w-44 h-64 rounded-xl border-2 border-dashed border-zhiji-gold/30 flex items-center justify-center">
        <span className="text-zhiji-gold/40 text-sm">等待抽牌</span>
      </div>
    );
  }

  return (
    <CardFlip
      drawnCard={drawnCard}
      flipped={flipped}
      onFlipComplete={onFlipComplete}
      size="md"
    />
  );
}
