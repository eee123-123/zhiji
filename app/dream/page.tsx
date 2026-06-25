"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { TagSelector } from "@/components/dream/tag-selector";
import { EmotionPicker } from "@/components/dream/emotion-picker";
import { SpeechRecorder } from "@/components/dream/speech-recorder";
import { DreamEmotion, DreamClarity, CLARITY_LABELS } from "@/types/dream";

export default function DreamPage() {
  const router = useRouter();

  const [content, setContent] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [emotion, setEmotion] = useState<DreamEmotion | null>(null);
  const [clarity, setClarity] = useState<DreamClarity | null>(null);
  const [isRecurring, setIsRecurring] = useState(false);

  const handleTagToggle = useCallback((tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  }, []);

  const handleTranscript = useCallback((text: string) => {
    setContent((prev) => prev + text);
  }, []);

  const canSubmit = content.trim().length > 0 || selectedTags.length > 0;

  const handleSubmit = () => {
    if (!canSubmit) return;

    const dreamData = {
      content: content.trim(),
      tags: selectedTags,
      emotion,
      clarity,
      isRecurring,
    };

    sessionStorage.setItem("dream-pending", JSON.stringify(dreamData));
    router.push("/dream/analysis/new");
  };

  return (
    <div className="flex flex-col px-4 py-10 min-h-screen max-w-lg mx-auto">
      {/* 诗意引导语 */}
      <h1 className="text-2xl font-bold text-zhiji-gold mb-2 text-center">
        🌙 解梦
      </h1>
      <p className="text-gray-400 text-center mb-10 leading-relaxed">
        今天的梦，想对你说什么？
      </p>

      {/* 文字描述区域 */}
      <div className="relative mb-4">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="闭上眼睛回想...你看到了什么？感受到什么？"
          className="w-full min-h-[140px] p-4 rounded-xl border border-white/10 bg-white/5 text-white placeholder-gray-500 resize-y focus:outline-none focus:border-zhiji-gold/50 transition-colors duration-200"
          rows={5}
        />
        <span className="absolute bottom-3 right-3 text-xs text-gray-500">
          {content.length} 字
        </span>
      </div>

      {/* 语音录入按钮 */}
      <div className="mb-8">
        <SpeechRecorder onTranscript={handleTranscript} />
      </div>

      {/* 标签快选区域 */}
      <div className="mb-8">
        <h3 className="text-sm text-gray-400 mb-3">选择梦中出现的元素</h3>
        <TagSelector selectedTags={selectedTags} onToggle={handleTagToggle} />
      </div>

      {/* 属性标记区域 */}
      <div className="space-y-6 mb-10">
        {/* 情绪选择 */}
        <div>
          <h3 className="text-sm text-gray-400 mb-3">梦境的感觉</h3>
          <EmotionPicker selected={emotion} onSelect={setEmotion} />
        </div>

        {/* 清晰程度 */}
        <div>
          <h3 className="text-sm text-gray-400 mb-3">清晰程度</h3>
          <div className="flex gap-2">
            {(Object.keys(CLARITY_LABELS) as DreamClarity[]).map((level) => {
              const isSelected = clarity === level;
              return (
                <button
                  key={level}
                  type="button"
                  onClick={() => setClarity(level)}
                  className={`px-4 py-2 rounded-lg text-sm border transition-all duration-200 ${
                    isSelected
                      ? "bg-zhiji-gold/20 border-zhiji-gold text-zhiji-gold"
                      : "border-white/10 text-gray-400 hover:border-white/30"
                  }`}
                >
                  {CLARITY_LABELS[level]}
                </button>
              );
            })}
          </div>
        </div>

        {/* 是否反复出现 */}
        <div className="flex items-center justify-between">
          <h3 className="text-sm text-gray-400">这个梦是否反复出现过？</h3>
          <button
            type="button"
            onClick={() => setIsRecurring(!isRecurring)}
            className={`relative w-12 h-6 rounded-full transition-colors duration-200 ${
              isRecurring ? "bg-zhiji-gold" : "bg-white/10"
            }`}
          >
            <span
              className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-200 ${
                isRecurring ? "translate-x-6" : "translate-x-0"
              }`}
            />
          </button>
        </div>
      </div>

      {/* 开始解梦按钮 */}
      <button
        type="button"
        onClick={handleSubmit}
        disabled={!canSubmit}
        className={`w-full py-4 rounded-full text-lg font-bold transition-all duration-300 ${
          canSubmit
            ? "bg-zhiji-gold text-zhiji-dark shadow-lg shadow-zhiji-gold/20 hover:shadow-zhiji-gold/40 hover:scale-[1.02] cursor-pointer"
            : "bg-white/5 text-gray-600 cursor-not-allowed"
        }`}
      >
        ✦ 开始解梦
      </button>

      {/* 底部入口 */}
      <Link
        href="/dream/journal"
        className="mt-8 text-center text-sm text-zhiji-gold/70 hover:text-zhiji-gold transition-colors"
      >
        📖 梦境日志
      </Link>
    </div>
  );
}
