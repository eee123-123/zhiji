"use client";

import { useEffect, useState } from "react";
import { EMOTION_LABELS, DreamEmotion } from "@/types/dream";

interface DreamPatternStats {
  totalEntries: number;
  isUnlocked: boolean;
  topTags: { name: string; count: number }[];
  emotionDistribution: { emotion: string; count: number; percentage: number }[];
  remainingToUnlock: number;
}

// 情绪对应颜色
const EMOTION_COLORS: Record<string, string> = {
  fear: "bg-purple-500/70",
  anxiety: "bg-orange-400/70",
  joy: "bg-yellow-400/70",
  sadness: "bg-blue-400/70",
  confusion: "bg-indigo-400/70",
  calm: "bg-emerald-400/70",
  absurd: "bg-pink-400/70",
};

export default function PatternStats() {
  const [stats, setStats] = useState<DreamPatternStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/dream/patterns")
      .then((res) => res.json())
      .then((data) => {
        setStats(data);
      })
      .catch(() => {
        setStats(null);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="border border-white/10 bg-white/5 rounded-xl p-4 mb-6 animate-pulse">
        <div className="h-4 bg-white/10 rounded w-1/2 mx-auto" />
      </div>
    );
  }

  if (!stats) return null;

  // 未解锁状态
  if (!stats.isUnlocked) {
    const progress = stats.totalEntries;
    return (
      <div className="border border-white/10 bg-white/5 rounded-xl p-4 mb-6">
        <p className="text-center text-zhiji-gold/90 font-medium mb-2">
          🌙 你的梦境图谱正在生长中...
        </p>
        <p className="text-center text-gray-400 text-sm mb-4">
          再记录 <span className="text-zhiji-gold">{stats.remainingToUnlock}</span> 个梦境，就能看到
          <br />
          你的梦境意象和情绪分布
        </p>
        {/* 进度条 */}
        <div className="flex items-center justify-center gap-2">
          <div className="flex gap-1">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className={`w-3 h-3 rounded-full ${
                  i < progress ? "bg-zhiji-gold" : "bg-zhiji-gold/30"
                }`}
              />
            ))}
          </div>
          <span className="text-xs text-gray-500">{progress}/3</span>
        </div>
      </div>
    );
  }

  // 已解锁状态
  const maxTagCount = stats.topTags.length > 0 ? stats.topTags[0].count : 1;

  return (
    <div className="border border-white/10 bg-white/5 rounded-xl p-4 mb-6">
      {/* 标题 */}
      <p className="text-center text-zhiji-gold/90 font-medium mb-4">
        🌙 梦境图谱
        <span className="text-xs text-gray-500 ml-2">
          共 {stats.totalEntries} 个梦境
        </span>
      </p>

      {/* 高频意象 */}
      {stats.topTags.length > 0 && (
        <div className="mb-4">
          <p className="text-sm text-gray-300 mb-2">✦ 高频意象</p>
          <div className="space-y-1.5">
            {stats.topTags.map((tag) => (
              <div key={tag.name} className="flex items-center gap-2">
                <span className="text-xs text-gray-400 w-10 text-right shrink-0">
                  {tag.name}
                </span>
                <div className="flex-1 h-4 bg-white/5 rounded-sm overflow-hidden">
                  <div
                    className="h-full bg-zhiji-gold/60 rounded-sm transition-all duration-500"
                    style={{ width: `${(tag.count / maxTagCount) * 100}%` }}
                  />
                </div>
                <span className="text-xs text-gray-500 w-8 shrink-0">
                  {tag.count}次
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 情绪分布 */}
      {stats.emotionDistribution.length > 0 && (
        <div>
          <p className="text-sm text-gray-300 mb-2">✦ 情绪分布</p>
          <div className="space-y-1.5">
            {stats.emotionDistribution.map((item) => (
              <div key={item.emotion} className="flex items-center gap-2">
                <span className="text-xs text-gray-400 w-10 text-right shrink-0">
                  {EMOTION_LABELS[item.emotion as DreamEmotion] || item.emotion}
                </span>
                <div className="flex-1 h-4 bg-white/5 rounded-sm overflow-hidden">
                  <div
                    className={`h-full rounded-sm transition-all duration-500 ${
                      EMOTION_COLORS[item.emotion] || "bg-gray-400/60"
                    }`}
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
                <span className="text-xs text-gray-500 w-10 shrink-0">
                  {item.percentage}%
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
