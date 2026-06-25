"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { EMOTION_LABELS, DreamEmotion } from "@/types/dream";
import PatternStats from "@/components/dream/pattern-stats";

interface JournalEntry {
  id: string;
  content: string;
  tags: string[];
  emotion: string | null;
  clarity: string | null;
  feedback: string | null;
  createdAt: string;
  traditional: string | null;
  deeper: string | null;
}

type FilterTab = "all" | "inspired";

// 情绪对应的 emoji
const EMOTION_EMOJI: Record<string, string> = {
  fear: "😨",
  anxiety: "😰",
  joy: "😊",
  sadness: "😢",
  confusion: "😵",
  calm: "😌",
  absurd: "🤪",
};

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const weekdays = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"];
  const weekday = weekdays[date.getDay()];
  return `${month}月${day}日 ${weekday}`;
}

export default function DreamJournalPage() {
  const router = useRouter();
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterTab>("all");

  useEffect(() => {
    const url =
      filter === "inspired"
        ? "/api/dream/entries?filter=inspired"
        : "/api/dream/entries";

    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        setEntries(Array.isArray(data) ? data : []);
      })
      .catch(() => {
        setEntries([]);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [filter]);

  return (
    <div className="flex flex-col px-4 py-8 min-h-screen max-w-lg mx-auto">
      {/* 返回按钮 */}
      <button
        onClick={() => router.push("/dream")}
        className="self-start text-gray-400 hover:text-white transition-colors mb-6 text-sm flex items-center gap-1"
      >
        <span>←</span>
        <span>返回</span>
      </button>

      {/* 标题 */}
      <h1 className="text-xl font-bold text-zhiji-gold mb-6 text-center">
        📖 梦境日志
      </h1>

      {/* 筛选 Tab */}
      <div className="flex gap-2 justify-center mb-6">

        <button
          onClick={() => { setLoading(true); setFilter("all"); }}
          className={`px-4 py-2 rounded-full text-sm transition-all duration-200 ${
            filter === "all"
              ? "bg-zhiji-gold/20 text-zhiji-gold border border-zhiji-gold/40"
              : "text-gray-400 border border-white/10 hover:border-white/20"
          }`}
        >
          全部
        </button>
        <button
          onClick={() => { setLoading(true); setFilter("inspired"); }}
          className={`px-4 py-2 rounded-full text-sm transition-all duration-200 ${
            filter === "inspired"
              ? "bg-amber-400/20 text-amber-300 border border-amber-400/40"
              : "text-gray-400 border border-white/10 hover:border-white/20"
          }`}
        >
          ✨ 有启发
        </button>
      </div>

      {/* 梦境模式识别 */}
      <PatternStats />

      {/* 加载状态 */}
      {loading && (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-gray-500 text-sm animate-pulse">加载中...</p>
        </div>
      )}

      {/* 空状态 */}
      {!loading && entries.length === 0 && (
        <div className="flex-1 flex flex-col items-center justify-center gap-4">
          <p className="text-gray-500 text-sm">
            还没有梦境记录，去记录今天的梦吧
          </p>
          <Link
            href="/dream"
            className="px-6 py-2.5 rounded-full bg-zhiji-gold/20 border border-zhiji-gold/40 text-zhiji-gold text-sm hover:bg-zhiji-gold/30 transition-colors"
          >
            ✦ 记录梦境
          </Link>
        </div>
      )}

      {/* 时间线列表 */}
      {!loading && entries.length > 0 && (
        <div className="space-y-0">
          {entries.map((entry) => (
            <Link
              key={entry.id}
              href={`/dream/analysis/${entry.id}`}
              className="block py-4 border-b border-white/10 hover:bg-white/[0.02] -mx-2 px-2 rounded-lg transition-colors"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  {/* 日期 + 情绪 */}
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-xs text-gray-500">
                      {formatDate(entry.createdAt)}
                    </span>
                    {entry.emotion && (
                      <span className="text-sm" title={EMOTION_LABELS[entry.emotion as DreamEmotion] || entry.emotion}>
                        {EMOTION_EMOJI[entry.emotion] || "💭"}
                      </span>
                    )}
                    {entry.feedback === "inspired" && (
                      <span className="text-xs">✨</span>
                    )}
                  </div>

                  {/* 内容摘要 */}
                  <p className="text-gray-300 text-sm leading-relaxed truncate">
                    {entry.content}{entry.content.length >= 50 ? "..." : ""}
                  </p>

                  {/* 标签 */}
                  {entry.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {entry.tags.slice(0, 5).map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-0.5 text-xs rounded-full bg-zhiji-gold/10 text-zhiji-gold/70 border border-zhiji-gold/20"
                        >
                          {tag}
                        </span>
                      ))}
                      {entry.tags.length > 5 && (
                        <span className="text-xs text-gray-500">
                          +{entry.tags.length - 5}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* 箭头 */}
                <span className="text-gray-600 text-sm mt-1">→</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
