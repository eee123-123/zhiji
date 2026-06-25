"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { DreamReading } from "@/components/dream/dream-reading";
import { PostInteraction } from "@/components/dream/post-interaction";
import { EMOTION_LABELS, CLARITY_LABELS, DreamEmotion, DreamClarity } from "@/types/dream";

interface DreamData {
  content: string;
  tags: string[];
  emotion: string | null;
  clarity: string | null;
  isRecurring: boolean;
}

interface HistoryEntry {
  id: string;
  content: string;
  tags: string[];
  emotion: string | null;
  clarity: string | null;
  isRecurring: boolean;
  traditional: string | null;
  deeper: string | null;
  questions: string | null;
  feedback: string | null;
  relatedNote: string | null;
  createdAt: string;
}

export default function DreamAnalysisPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [dreamData, setDreamData] = useState<DreamData | null>(null);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(id !== "new");
  const [error, setError] = useState<string | undefined>(undefined);
  const [entryId, setEntryId] = useState<string | null>(null);
  const [showOriginal, setShowOriginal] = useState(false);
  const historyMode = id !== "new" && !error;
  const [historyEntry, setHistoryEntry] = useState<HistoryEntry | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const startedRef = useRef(false);

  // 从流式文本中提取 entry id 并清理文本
  const extractEntryId = useCallback((rawText: string) => {
    const marker = /\n?---DREAM_ENTRY_ID:(.*?)---$/;
    const match = rawText.match(marker);
    if (match) {
      setEntryId(match[1]);
      return rawText.replace(marker, "");
    }
    return rawText;
  }, []);

  // 发起流式请求
  const startAnalysis = useCallback(async (data: DreamData) => {
    abortRef.current?.abort();
    abortRef.current = new AbortController();

    setLoading(true);
    setText("");
    setError(undefined);

    try {
      const res = await fetch("/api/dream/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        signal: abortRef.current.signal,
      });

      if (!res.ok) {
        throw new Error(`请求失败: ${res.status}`);
      }

      const reader = res.body!.getReader();
      const decoder = new TextDecoder();
      let accumulated = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        accumulated += decoder.decode(value, { stream: true });
        // 实时更新文本（不含 entry id marker）
        const cleaned = accumulated.replace(/\n?---DREAM_ENTRY_ID:.*?---$/, "");
        setText(cleaned);
      }

      // 最终提取 entry id
      const finalText = extractEntryId(accumulated);
      setText(finalText);
    } catch (err: unknown) {
      if (err instanceof Error && err.name === "AbortError") return;
      const message = err instanceof Error ? err.message : "生成失败，请重试";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [extractEntryId]);

  // 初始化：从 sessionStorage 读取数据并发起请求
  const initNewDream = useCallback(() => {
    const stored = sessionStorage.getItem("dream-pending");
    if (!stored) {
      setError("未找到梦境数据，请重新记录");
      return;
    }

    try {
      const data: DreamData = JSON.parse(stored);
      setDreamData(data);
      // 清除 sessionStorage 避免重复解读
      sessionStorage.removeItem("dream-pending");
      startAnalysis(data);
    } catch {
      setError("数据解析失败，请重新记录");
    }
  }, [startAnalysis]);

  useEffect(() => {
    if (id !== "new" || startedRef.current) return;
    startedRef.current = true;
    initNewDream();
  }, [id, initNewDream]);

  // 处理已有记录的查看（非 "new" 模式）
  const loadHistoryEntry = useCallback((entryId: string) => {
    fetch(`/api/dream/entries?id=${entryId}`)
      .then((res) => {
        if (!res.ok) throw new Error("记录不存在");
        return res.json();
      })
      .then((data: HistoryEntry) => {
        setHistoryEntry(data);
        setEntryId(data.id);
        setDreamData({
          content: data.content,
          tags: data.tags,
          emotion: data.emotion,
          clarity: data.clarity,
          isRecurring: data.isRecurring,
        });
        // 将已存储的解读组装为 DreamReading 可以解析的格式
        const parts: string[] = [];
        if (data.traditional) parts.push(`---SECTION:传统寓意---\n${data.traditional}`);
        if (data.deeper) parts.push(`---SECTION:深层映射---\n${data.deeper}`);
        if (data.questions) parts.push(`---SECTION:值得自问---\n${data.questions}`);
        setText(parts.join("\n"));
      })
      .catch((err: Error) => {
        setError(err.message || "获取记录失败");
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (id === "new") return;
    loadHistoryEntry(id);
  }, [id, loadHistoryEntry]);

  // 组件卸载时取消请求
  useEffect(() => {
    return () => {
      abortRef.current?.abort();
    };
  }, []);

  return (
    <div className="flex flex-col px-4 py-8 min-h-screen max-w-lg mx-auto">
      {/* 顶部返回 */}
      <button
        onClick={() => router.back()}
        className="self-start text-gray-400 hover:text-white transition-colors mb-6 text-sm flex items-center gap-1"
      >
        <span>←</span>
        <span>返回</span>
      </button>

      {/* 页面标题 */}
      <h1 className="text-xl font-bold text-zhiji-gold mb-6 text-center">
        🌙 梦境解读
      </h1>

      {/* 梦境原文折叠区 */}
      {dreamData && (
        <div className="mb-6">
          <button
            onClick={() => setShowOriginal(!showOriginal)}
            className="w-full flex items-center justify-between px-4 py-3 rounded-xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.04] transition-colors"
          >
            <span className="text-sm text-gray-400">梦境原文</span>
            <span className="text-gray-500 text-xs">
              {showOriginal ? "收起 ▲" : "展开 ▼"}
            </span>
          </button>

          {showOriginal && (
            <div className="mt-2 px-4 py-3 rounded-xl border border-white/5 bg-white/[0.01] space-y-2">
              {dreamData.content && (
                <p className="text-gray-300 text-sm leading-relaxed">
                  {dreamData.content}
                </p>
              )}
              {dreamData.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {dreamData.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-0.5 text-xs rounded-full bg-zhiji-gold/10 text-zhiji-gold/80 border border-zhiji-gold/20"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
              <div className="flex flex-wrap gap-3 text-xs text-gray-500">
                {dreamData.emotion && (
                  <span>
                    情绪：{EMOTION_LABELS[dreamData.emotion as DreamEmotion] || dreamData.emotion}
                  </span>
                )}
                {dreamData.clarity && (
                  <span>
                    清晰度：{CLARITY_LABELS[dreamData.clarity as DreamClarity] || dreamData.clarity}
                  </span>
                )}
                {dreamData.isRecurring && <span>反复出现</span>}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 解读区域 */}
      <div className="flex-1 mb-8">
        <DreamReading text={text} loading={loading} error={error} />
      </div>

      {/* 解后互动区 */}
      {!loading && text && !error && (
        <div className="mb-8">
          {/* 历史模式下如果已有 feedback 则不显示 */}
          {!(historyMode && historyEntry?.feedback) && (
            <PostInteraction entryId={entryId} />
          )}
          {historyMode && historyEntry?.feedback && (
            <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4 text-center">
              <p className="text-xs text-gray-500">已反馈：{historyEntry.feedback === "inspired" ? "✨ 有启发" : historyEntry.feedback === "partial" ? "🤔 部分有" : "😶 没太感觉"}</p>
              {historyEntry.relatedNote && (
                <p className="text-xs text-gray-400 mt-2">关联笔记：{historyEntry.relatedNote}</p>
              )}
            </div>
          )}
        </div>
      )}

      {/* 底部按钮 */}
      {!loading && (
        <div className="flex gap-3">
          <Link
            href="/dream"
            className="flex-1 py-3 text-center rounded-full border border-zhiji-gold/30 text-zhiji-gold text-sm hover:bg-zhiji-gold/10 transition-colors"
          >
            记录新梦境
          </Link>
          <Link
            href="/dream/journal"
            className="flex-1 py-3 text-center rounded-full border border-white/10 text-gray-400 text-sm hover:border-white/20 hover:text-gray-300 transition-colors"
          >
            梦境日志
          </Link>
        </div>
      )}
    </div>
  );
}
