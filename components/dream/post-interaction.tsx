"use client";

import { useState } from "react";

interface PostInteractionProps {
  entryId: string | null; // 解读完成后才有 id
  onFeedbackSubmitted?: () => void;
}

type FeedbackType = "inspired" | "partial" | "none";

const FEEDBACK_OPTIONS: { type: FeedbackType; label: string; color: string }[] = [
  { type: "inspired", label: "✨ 有启发", color: "border-amber-400/60 text-amber-300 bg-amber-400/10" },
  { type: "partial", label: "🤔 部分有", color: "border-blue-400/60 text-blue-300 bg-blue-400/10" },
  { type: "none", label: "😶 没太感觉", color: "border-gray-400/60 text-gray-300 bg-gray-400/10" },
];

export function PostInteraction({ entryId, onFeedbackSubmitted }: PostInteractionProps) {
  const [selectedFeedback, setSelectedFeedback] = useState<FeedbackType | null>(null);
  const [relatedNote, setRelatedNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async () => {
    if (!entryId || !selectedFeedback) return;

    setSubmitting(true);
    try {
      const res = await fetch("/api/dream/entries", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: entryId,
          feedback: selectedFeedback,
          relatedNote: relatedNote.trim() || undefined,
        }),
      });

      if (res.ok) {
        setSubmitted(true);
        onFeedbackSubmitted?.();
      }
    } catch (err) {
      console.error("Feedback submit error:", err);
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="rounded-xl border border-white/10 bg-white/[0.02] p-6 text-center">
        <p className="text-zhiji-gold text-sm">感谢你的反馈 ✦</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.02] p-5 space-y-4">
      {/* 标题 */}
      <p className="text-gray-300 text-sm text-center">
        这个解析对你有启发吗？
      </p>

      {/* 反馈按钮 */}
      <div className="flex gap-2 justify-center">
        {FEEDBACK_OPTIONS.map((opt) => {
          const isSelected = selectedFeedback === opt.type;
          return (
            <button
              key={opt.type}
              type="button"
              onClick={() => setSelectedFeedback(opt.type)}
              className={`px-3 py-2 rounded-lg text-sm border transition-all duration-200 ${
                isSelected
                  ? opt.color
                  : "border-white/20 text-gray-400 hover:border-white/30"
              }`}
            >
              {opt.label}
            </button>
          );
        })}
      </div>

      {/* 选中后展开第二层 */}
      {selectedFeedback && (
        <div className="space-y-3 pt-2">
          <p className="text-gray-400 text-xs">
            你觉得这个梦可能跟什么现实事件有关？（可选）
          </p>
          <textarea
            value={relatedNote}
            onChange={(e) => setRelatedNote(e.target.value)}
            placeholder="比如最近的某件事、某个人、某种情绪..."
            className="w-full min-h-[80px] p-3 rounded-lg border border-white/10 bg-white/5 text-white placeholder-gray-500 text-sm resize-none focus:outline-none focus:border-zhiji-gold/50 transition-colors"
          />
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting || !entryId}
            className={`w-full py-2.5 rounded-full text-sm font-medium transition-all duration-200 ${
              submitting || !entryId
                ? "bg-white/5 text-gray-600 cursor-not-allowed"
                : "bg-zhiji-gold/20 border border-zhiji-gold/40 text-zhiji-gold hover:bg-zhiji-gold/30"
            }`}
          >
            {submitting ? "提交中..." : "提交"}
          </button>
        </div>
      )}
    </div>
  );
}
