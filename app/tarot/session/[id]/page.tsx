"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { CardDisplay } from "@/components/tarot/card-display";
import { CardSpread } from "@/components/tarot/card-spread";
import { StreamReading } from "@/components/tarot/stream-reading";
import { useStream } from "@/hooks/use-stream";
import { TAROT_CARDS } from "@/lib/tarot/cards";
import { TarotCard, DrawnCard } from "@/types/tarot";
import { Button } from "@/components/ui/button";

type SessionState = "choosing" | "revealing" | "reading" | "done";

/** 获取大阿尔卡那22张牌并随机打乱顺序 */
function shuffleMajorArcana(): TarotCard[] {
  const majorCards = TAROT_CARDS.filter((card) => card.arcana === "major");
  // Fisher-Yates 洗牌
  for (let i = majorCards.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [majorCards[i], majorCards[j]] = [majorCards[j], majorCards[i]];
  }
  return majorCards;
}

export default function TarotSessionPage() {
  const router = useRouter();

  const [state, setState] = useState<SessionState>("choosing");
  const [drawnCard, setDrawnCard] = useState<DrawnCard | null>(null);
  const { text, loading, error, startStream, cancel } = useStream();

  // 大阿尔卡那22张牌随机排列（用户只看到牌背）
  const candidates = useMemo(() => shuffleMajorArcana(), []);

  // 用户选牌
  const handleCardSelect = useCallback((index: number) => {
    const selectedCard = candidates[index];
    const drawn: DrawnCard = {
      card: selectedCard,
      isReversed: Math.random() < 0.5,
    };
    setDrawnCard(drawn);
    // 短暂延迟后进入翻牌状态，让选中动画先完成
    setTimeout(() => {
      setState("revealing");
    }, 600);
  }, [candidates]);

  // 翻牌完成后开始 AI 解读
  const handleFlipComplete = useCallback(() => {
    if (!drawnCard) return;
    setState("reading");
    startStream("/api/tarot/interpret", {
      cards: [drawnCard],
      role: "yuejian",
      spreadType: "single",
    });
  }, [drawnCard, startStream]);

  // 监听流式加载完成 → 标记为 done
  useEffect(() => {
    if (state === "reading" && !loading && text.length > 0) {
      setState("done");
    }
  }, [state, loading, text]);

  // 再来一次
  const handleRetry = useCallback(() => {
    cancel();
    setDrawnCard(null);
    setState("choosing");
    // 刷新页面以获取新的候选牌
    router.refresh();
  }, [cancel, router]);

  return (
    <div className="flex flex-col items-center px-4 py-8 min-h-screen">
      {/* 标题 */}
      <div className="mb-6 text-center">
        <h2 className="text-xl text-zhiji-gold mb-1">
          {state === "choosing" ? "选择你的牌" : "一键抽牌"}
        </h2>
        <p className="text-gray-500 text-sm">月见为你解读</p>
      </div>

      {/* 选牌状态 */}
      {state === "choosing" && (
        <div className="w-full max-w-md flex flex-col items-center animate-fadeIn">
          <p className="text-gray-400 text-sm mb-2 text-center">
            静下心来，选择一张你感觉被吸引的牌
          </p>
          <CardSpread
            cards={candidates}
            onSelect={handleCardSelect}
          />
        </div>
      )}

      {/* 翻牌动画 */}
      {(state === "revealing" || state === "reading" || state === "done") && drawnCard && (
        <div className="mb-8 animate-fadeIn">
          <CardDisplay
            drawnCard={drawnCard}
            autoFlip
            autoFlipDelay={800}
            onFlipComplete={handleFlipComplete}
          />
        </div>
      )}

      {/* 牌名展示 */}
      {drawnCard && state !== "choosing" && (
        <div className="mb-6 text-center animate-fadeIn">
          <p className="text-zhiji-gold font-medium text-lg">
            {drawnCard.card.name}
          </p>
          <p className="text-gray-500 text-sm">
            {drawnCard.card.nameEn} · {drawnCard.isReversed ? "逆位" : "正位"}
          </p>
        </div>
      )}

      {/* 解读区域 */}
      {(state === "reading" || state === "done") && (
        <div className="w-full max-w-lg animate-fadeIn">
          <StreamReading text={text} loading={loading} error={error} />
        </div>
      )}

      {/* 完成后的操作 */}
      {state === "done" && (
        <div className="flex gap-4 mt-8 animate-fadeIn">
          <Button
            variant="outline"
            onClick={handleRetry}
            className="border-zhiji-gold/40 text-zhiji-gold hover:bg-zhiji-gold/10 cursor-pointer"
          >
            再抽一次
          </Button>
          <Button
            variant="outline"
            onClick={() => router.push("/tarot")}
            className="border-gray-600 text-gray-400 hover:bg-white/5 cursor-pointer"
          >
            返回问牌
          </Button>
        </div>
      )}

      {/* 错误状态的重试按钮 */}
      {error && state !== "done" && (
        <div className="mt-4 text-center animate-fadeIn">
          <Button
            onClick={handleRetry}
            variant="outline"
            className="border-red-400/40 text-red-400 hover:bg-red-400/10 cursor-pointer"
          >
            重试
          </Button>
        </div>
      )}
    </div>
  );
}
