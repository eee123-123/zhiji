"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { CheckinCalendar } from "@/components/wellness/checkin-calendar";
import { CheckinType, CHECKIN_LABELS } from "@/types/wellness";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const TYPE_ICONS: Record<CheckinType, string> = {
  diet: "🍵",
  exercise: "🌅",
  sleep: "😴",
  custom: "✏️",
};

const PLACEHOLDER_MAP: Record<CheckinType, string> = {
  diet: "今天吃了什么养生食物？如绿豆百合粥...",
  exercise: "今天的作息如何？如午睡了20分钟...",
  sleep: "昨晚睡眠质量如何？",
  custom: "记录其他养护行为...",
};

interface CheckinRecord {
  id: string;
  date: string;
  type: string;
  content: string;
  feedback?: string;
}

export default function CheckinPage() {
  const [selectedType, setSelectedType] = useState<CheckinType>("diet");
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [lastCheckinId, setLastCheckinId] = useState<string | null>(null);
  const [checkins, setCheckins] = useState<CheckinRecord[]>([]);
  const [successMsg, setSuccessMsg] = useState("");

  // 加载打卡记录
  useEffect(() => {
    fetchCheckins();
  }, []);

  async function fetchCheckins() {
    try {
      const res = await fetch("/api/wellness/checkin");
      if (res.ok) {
        const data = await res.json();
        setCheckins(data);
      }
    } catch {
      // 静默处理
    }
  }

  async function handleSubmit() {
    if (!content.trim()) return;
    setSubmitting(true);

    try {
      const res = await fetch("/api/wellness/checkin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: selectedType, content: content.trim() }),
      });

      if (res.ok) {
        const data = await res.json();
        setLastCheckinId(data.id);
        setContent("");
        setShowFeedback(true);
        fetchCheckins();
      }
    } catch {
      // 静默处理
    } finally {
      setSubmitting(false);
    }
  }

  async function handleFeedback(feedback: "better" | "normal" | "none") {
    if (!lastCheckinId) return;

    try {
      await fetch("/api/wellness/checkin", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: lastCheckinId, feedback }),
      });
    } catch {
      // 静默处理
    }

    setShowFeedback(false);
    setLastCheckinId(null);
    setSuccessMsg("打卡成功 ✨");
    setTimeout(() => setSuccessMsg(""), 3000);
    fetchCheckins();
  }

  const types = Object.keys(CHECKIN_LABELS) as CheckinType[];

  return (
    <div className="min-h-screen p-6 pb-24 max-w-lg mx-auto">
      {/* 顶部导航 */}
      <div className="flex items-center gap-3 mb-8">
        <Link
          href="/wellness"
          className="text-gray-400 hover:text-gray-200 transition-colors"
        >
          ← 返回
        </Link>
        <h1 className="text-lg font-bold text-gray-200">养护打卡</h1>
      </div>

      {/* 成功提示 */}
      {successMsg && (
        <div className="mb-4 px-4 py-2.5 rounded-xl bg-zhiji-gold/10 border border-zhiji-gold/20 text-zhiji-gold text-sm text-center">
          {successMsg}
        </div>
      )}

      {/* 今日打卡区域 */}
      <div className="border border-white/10 rounded-2xl p-5 bg-gradient-to-b from-white/5 to-transparent mb-6">
        <p className="text-gray-300 text-sm mb-4">
          今天你执行了哪些养护建议？
        </p>

        {/* 打卡类型选择 */}
        <div className="grid grid-cols-4 gap-2 mb-4">
          {types.map((type) => (
            <button
              key={type}
              onClick={() => setSelectedType(type)}
              className={`flex flex-col items-center gap-1 p-3 rounded-xl border transition-all ${
                selectedType === type
                  ? "border-zhiji-gold bg-zhiji-gold/10 text-zhiji-gold"
                  : "border-white/10 text-gray-400 hover:border-white/20"
              }`}
            >
              <span className="text-lg">{TYPE_ICONS[type]}</span>
              <span className="text-xs">{CHECKIN_LABELS[type]}</span>
            </button>
          ))}
        </div>

        {/* 内容输入 */}
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={PLACEHOLDER_MAP[selectedType]}
          className="w-full h-24 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-gray-200 text-sm placeholder-gray-600 resize-none focus:outline-none focus:border-zhiji-gold/40 transition-colors"
        />

        {/* 提交按钮 */}
        <button
          onClick={handleSubmit}
          disabled={!content.trim() || submitting}
          className="w-full mt-3 py-2.5 rounded-xl bg-zhiji-gold/20 hover:bg-zhiji-gold/30 disabled:opacity-40 disabled:cursor-not-allowed text-zhiji-gold text-sm font-medium transition-colors"
        >
          {submitting ? "提交中..." : "✅ 打卡"}
        </button>
      </div>

      {/* 本周打卡记录 */}
      <CheckinCalendar checkins={checkins} />

      {/* 体感反馈弹窗 */}
      <Dialog open={showFeedback} onOpenChange={setShowFeedback}>
        <DialogContent showCloseButton={false}>
          <DialogHeader>
            <DialogTitle className="text-center text-gray-200">
              今天感觉如何？
            </DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-3 gap-3 py-4">
            <button
              onClick={() => handleFeedback("better")}
              className="flex flex-col items-center gap-2 p-4 rounded-xl border border-white/10 hover:border-zhiji-gold/40 hover:bg-zhiji-gold/5 transition-all"
            >
              <span className="text-2xl">😊</span>
              <span className="text-gray-300 text-xs">好转</span>
            </button>
            <button
              onClick={() => handleFeedback("normal")}
              className="flex flex-col items-center gap-2 p-4 rounded-xl border border-white/10 hover:border-white/30 hover:bg-white/5 transition-all"
            >
              <span className="text-2xl">😐</span>
              <span className="text-gray-300 text-xs">一般</span>
            </button>
            <button
              onClick={() => handleFeedback("none")}
              className="flex flex-col items-center gap-2 p-4 rounded-xl border border-white/10 hover:border-white/30 hover:bg-white/5 transition-all"
            >
              <span className="text-2xl">🤷</span>
              <span className="text-gray-300 text-xs">没感觉</span>
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
