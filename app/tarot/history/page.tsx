"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { DrawnCard, TarotRole } from "@/types/tarot";

interface HistoryItem {
  id: string;
  role: string;
  topic: string | null;
  spreadType: string;
  cards: DrawnCard[];
  readingSummary: string;
  createdAt: string;
}

const ROLE_NAME_MAP: Record<TarotRole, string> = {
  yuejian: "月见",
  yousuo: "幽锁",
  qingwu: "青梧",
  huohu: "火琥",
};

const SPREAD_LABEL: Record<string, string> = {
  single: "单牌",
  three: "三牌阵",
  celtic: "凯尔特十字",
};

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return `${d.getMonth() + 1}月${d.getDate()}日`;
}

function formatCardsInfo(cards: DrawnCard[]): string {
  return cards
    .map((c) => `${c.card.name}${c.isReversed ? "（逆位）" : "（正位）"}`)
    .join("、");
}

export default function TarotHistoryPage() {
  const router = useRouter();
  const [list, setList] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/tarot/history")
      .then((res) => {
        if (!res.ok) throw new Error("请求失败");
        return res.json();
      })
      .then((data) => {
        setList(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  return (
    <div className="flex flex-col items-center px-4 py-8 min-h-screen max-w-2xl mx-auto">
      {/* 顶部导航 */}
      <div className="w-full flex items-center mb-8">
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.push("/tarot")}
          className="border-zhiji-gold/40 text-zhiji-gold hover:bg-zhiji-gold/10 cursor-pointer"
        >
          ← 返回问牌
        </Button>
        <h1 className="text-xl font-bold text-zhiji-gold ml-4">问牌记录</h1>
      </div>

      {/* 加载中 */}
      {loading && (
        <div className="flex items-center gap-2 text-zhiji-gold/60 mt-20">
          <span className="animate-pulse">✦</span>
          <span className="text-sm">加载中...</span>
        </div>
      )}

      {/* 错误 */}
      {error && (
        <div className="text-red-400 text-sm mt-20">{error}</div>
      )}

      {/* 空状态 */}
      {!loading && !error && list.length === 0 && (
        <div className="flex flex-col items-center mt-20 animate-fadeIn">
          <p className="text-gray-500 text-center mb-6">
            还没有问牌记录，去抽一张牌吧
          </p>
          <Button
            onClick={() => router.push("/tarot")}
            className="bg-zhiji-gold hover:bg-zhiji-gold-light text-zhiji-dark font-bold rounded-full px-8 py-3 cursor-pointer"
          >
            ✦ 去抽牌
          </Button>
        </div>
      )}

      {/* 列表 */}
      {!loading && !error && list.length > 0 && (
        <div className="w-full space-y-3 animate-fadeIn">
          {list.map((item) => (
            <Link
              key={item.id}
              href={`/tarot/history/${item.id}`}
              className="block w-full p-4 rounded-lg border border-zhiji-gold/15 hover:border-zhiji-gold/40 bg-white/[0.03] hover:bg-white/[0.06] transition-all duration-200"
            >
              {/* 第一行：日期 + 角色 + 牌阵 */}
              <div className="flex items-center gap-2 mb-2">
                <span className="text-zhiji-gold text-sm font-medium">
                  {formatDate(item.createdAt)}
                </span>
                <span className="text-gray-600 text-xs">·</span>
                <span className="text-gray-400 text-sm">
                  {ROLE_NAME_MAP[item.role as TarotRole] || item.role}
                </span>
                <span className="text-gray-600 text-xs">·</span>
                <span className="text-gray-500 text-xs">
                  {SPREAD_LABEL[item.spreadType] || item.spreadType}
                </span>
              </div>

              {/* 第二行：主题 */}
              {item.topic && (
                <p className="text-gray-300 text-sm mb-1.5">
                  {item.topic}
                </p>
              )}

              {/* 第三行：牌面 */}
              <p className="text-zhiji-gold/70 text-xs mb-2">
                {formatCardsInfo(item.cards)}
              </p>

              {/* 第四行：解读摘要 */}
              <p className="text-gray-500 text-xs leading-relaxed line-clamp-2">
                {item.readingSummary.slice(0, 50)}
                {item.readingSummary.length > 50 ? "..." : ""}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
