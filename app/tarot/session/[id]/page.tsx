"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { CardDisplay } from "@/components/tarot/card-display";
import { StreamReading } from "@/components/tarot/stream-reading";
import { useStream } from "@/hooks/use-stream";
import { drawCards } from "@/lib/tarot/draw";
import { DrawnCard } from "@/types/tarot";
import { Button } from "@/components/ui/button";

type SessionState = "idle" | "drawing" | "reading" | "done";

export default function TarotSessionPage() {
  const router = useRouter();
  const [state, setState] = useState<SessionState>("idle");
  const [drawnCard, setDrawnCard] = useState<DrawnCard | null>(null);
  const { text, loading, error, startStream, cancel } = useStream();

  // 开始抽牌
  const handleDraw = useCallback(() => {
    const cards = drawCards(1);
    setDrawnCard(cards[0]);
    setState("drawing");
  }, []);

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
    setState("idle");
  }, [cancel]);

  return (
    <div className="flex flex-col items-center px-4 py-8 min-h-screen">
      {/* 标题 */}
      <div className="mb-8 text-center">
        <h2 className="text-xl text-zhiji-gold mb-1">一键抽牌</h2>
        <p className="text-gray-500 text-sm">月见为你解读</p>
      </div>

      {/* 牌面区域 */}
      <div className="mb-8">
        {state === "idle" ? (
          <div className="flex flex-col items-center gap-6">
            <div className="w-44 h-64 rounded-xl border-2 border-dashed border-zhiji-gold/30 flex items-center justify-center">
              <span className="text-zhiji-gold/40 text-2xl">✦</span>
            </div>
            <Button
              onClick={handleDraw}
              className="bg-zhiji-gold hover:bg-zhiji-gold-light text-zhiji-dark font-bold px-8 py-3 rounded-full cursor-pointer"
            >
              翻开命运之牌
            </Button>
          </div>
        ) : (
          <CardDisplay
            drawnCard={drawnCard}
            autoFlip
            autoFlipDelay={800}
            onFlipComplete={handleFlipComplete}
          />
        )}
      </div>

      {/* 牌名展示 */}
      {drawnCard && state !== "idle" && (
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
            onClick={handleDraw}
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
