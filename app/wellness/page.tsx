"use client";

import { useEffect, useState, useCallback } from "react";
import { WellnessCard } from "@/components/wellness/wellness-card";
import Link from "next/link";

interface SolarTermData {
  name: string;
  dayIndex: number;
  season: string;
  description: string;
}

/** 获取今日缓存 key */
function getTodayCacheKey(): string {
  const today = new Date().toISOString().slice(0, 10);
  return `wellness-card-${today}`;
}

export default function WellnessPage() {
  const [solarTerm, setSolarTerm] = useState<SolarTermData | null>(null);
  const [cardText, setCardText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 加载节气数据
  useEffect(() => {
    fetch("/api/wellness/solar-term")
      .then((res) => res.json())
      .then((data) => setSolarTerm(data))
      .catch(() => {});
  }, []);

  // 加载养生卡片（优先读缓存，无缓存才调 AI）
  const loadCard = useCallback(async (forceRefresh = false) => {
    const cacheKey = getTodayCacheKey();

    // 非强制刷新时，先读 localStorage 缓存
    if (!forceRefresh) {
      try {
        const cached = localStorage.getItem(cacheKey);
        if (cached) {
          setCardText(cached);
          return;
        }
      } catch {}
    }

    // 无缓存或强制刷新：调用 AI 接口
    setLoading(true);
    setCardText("");
    setError(null);

    const abortController = new AbortController();
    try {
      const res = await fetch("/api/wellness/card", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh: forceRefresh }),
        signal: abortController.signal,
      });

      if (!res.ok) {
        throw new Error(`请求失败: ${res.status}`);
      }

      const reader = res.body!.getReader();
      const decoder = new TextDecoder();
      let fullText = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        fullText += chunk;
        setCardText(fullText);
      }

      // 流式完成后存入 localStorage
      if (fullText) {
        try {
          localStorage.setItem(cacheKey, fullText);
        } catch {}
      }
    } catch (err: unknown) {
      if (err instanceof Error && err.name === "AbortError") return;
      const message = err instanceof Error ? err.message : "生成失败，请重试";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCard();
  }, [loadCard]);

  return (
    <div className="min-h-screen p-6 pb-24 max-w-lg mx-auto">
      {/* 标题区 */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-zhiji-gold">🌿 养元</h1>
        <p className="text-gray-400 text-sm mt-1">感知身体的信号</p>
      </div>

      {/* 节气信息区（唯一展示位置） */}
      {solarTerm && (
        <div className="mb-6 px-4 py-3 rounded-xl bg-white/5 border border-white/5">
          <div className="flex items-baseline gap-2">
            <span className="text-zhiji-gold font-bold text-lg">
              {solarTerm.name}
            </span>
            <span className="text-gray-500 text-xs">
              第{solarTerm.dayIndex}天
            </span>
          </div>
          <p className="text-gray-400 text-sm mt-1 leading-relaxed">
            {solarTerm.description}
          </p>
        </div>
      )}

      {/* 每日养生卡片区 */}
      <div className="mb-8">
        {error ? (
          <div className="border border-red-500/20 bg-red-500/5 rounded-2xl p-6 text-center">
            <p className="text-red-400 text-sm mb-3">{error}</p>
            <button
              onClick={() => loadCard(true)}
              className="text-zhiji-gold text-sm hover:underline"
            >
              重新生成
            </button>
          </div>
        ) : (
          <WellnessCard
            text={cardText}
            loading={loading}
          />
        )}
      </div>

      {/* 功能入口区 */}
      <div className="space-y-3">
        <Link
          href="/wellness/constitution"
          className="block px-4 py-3.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-colors"
        >
          <div className="flex items-center gap-3">
            <span className="text-xl">🧘</span>
            <div>
              <p className="text-gray-200 text-sm font-medium">
                了解你的体质
              </p>
              <p className="text-gray-500 text-xs mt-0.5">
                花1分钟了解你的体质，获得更个性化的建议
              </p>
            </div>
          </div>
        </Link>

        <Link
          href="/wellness/chat"
          className="block px-4 py-3.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-colors"
        >
          <div className="flex items-center gap-3">
            <span className="text-xl">💬</span>
            <div>
              <p className="text-gray-200 text-sm font-medium">
                问问岐伯先生
              </p>
              <p className="text-gray-500 text-xs mt-0.5">
                关于养生的任何疑问，都可以向岐伯请教
              </p>
            </div>
          </div>
        </Link>

        <Link
          href="/wellness/checkin"
          className="block px-4 py-3.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-colors"
        >
          <div className="flex items-center gap-3">
            <span className="text-xl">📋</span>
            <div>
              <p className="text-gray-200 text-sm font-medium">打卡记录</p>
              <p className="text-gray-500 text-xs mt-0.5">
                记录每日养生执行情况，观察身体变化
              </p>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
}
