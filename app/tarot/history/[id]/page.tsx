"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { DrawnCard, TarotRole } from "@/types/tarot";

interface ReadingDetail {
  id: string;
  role: string;
  topic: string | null;
  description: string | null;
  spreadType: string;
  cards: DrawnCard[];
  reading: string;
  narrative: string | null;
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

function formatFullDate(dateStr: string): string {
  const d = new Date(dateStr);
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日 ${d.getHours().toString().padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")}`;
}

function getSectionIcon(title: string): string {
  if (title.includes("牌面意象")) return "🎴";
  if (title.includes("解读")) return "✦";
  if (title.includes("行动建议")) return "💡";
  return "·";
}

interface Section {
  title: string | null;
  content: string;
}

function parseSections(text: string): Section[] {
  if (!text) return [];

  const sectionRegex = /---SECTION:(.+?)---/g;
  const parts = text.split(sectionRegex);

  const sections: Section[] = [];

  if (parts[0]?.trim()) {
    sections.push({ title: null, content: parts[0].trim() });
  }

  for (let i = 1; i < parts.length; i += 2) {
    const title = parts[i]?.trim() || null;
    const content = parts[i + 1]?.trim() || "";
    if (title || content) {
      sections.push({ title, content });
    }
  }

  if (sections.length === 0 && text.trim()) {
    sections.push({ title: null, content: text.trim() });
  }

  return sections;
}

export default function TarotHistoryDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [detail, setDetail] = useState<ReadingDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/tarot/history?id=${id}`)
      .then((res) => {
        if (!res.ok) throw new Error("记录不存在");
        return res.json();
      })
      .then((data) => {
        setDetail(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex items-center gap-2 text-zhiji-gold/60">
          <span className="animate-pulse">✦</span>
          <span className="text-sm">加载中...</span>
        </div>
      </div>
    );
  }

  if (error || !detail) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <p className="text-red-400 text-sm mb-4">{error || "记录不存在"}</p>
        <Button
          variant="outline"
          onClick={() => router.push("/tarot/history")}
          className="border-zhiji-gold/40 text-zhiji-gold hover:bg-zhiji-gold/10 cursor-pointer"
        >
          ← 返回列表
        </Button>
      </div>
    );
  }

  const sections = parseSections(detail.reading);

  return (
    <div className="flex flex-col px-4 py-8 min-h-screen max-w-2xl mx-auto">
      {/* 顶部导航 */}
      <div className="flex items-center mb-8">
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.push("/tarot/history")}
          className="border-zhiji-gold/40 text-zhiji-gold hover:bg-zhiji-gold/10 cursor-pointer"
        >
          ← 返回列表
        </Button>
      </div>

      {/* 基本信息 */}
      <div className="mb-6 animate-fadeIn">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-zhiji-gold font-medium">
            {ROLE_NAME_MAP[detail.role as TarotRole] || detail.role}
          </span>
          <span className="text-gray-600 text-sm">·</span>
          <span className="text-gray-400 text-sm">
            {SPREAD_LABEL[detail.spreadType] || detail.spreadType}
          </span>
        </div>
        <p className="text-gray-500 text-xs">
          {formatFullDate(detail.createdAt)}
        </p>
      </div>

      {/* 主题与描述 */}
      {(detail.topic || detail.description) && (
        <div className="mb-6 p-4 rounded-lg border border-zhiji-gold/15 bg-white/[0.03] animate-fadeIn">
          {detail.topic && (
            <p className="text-gray-200 text-sm mb-1">
              <span className="text-zhiji-gold/80 text-xs mr-2">主题</span>
              {detail.topic}
            </p>
          )}
          {detail.description && (
            <p className="text-gray-400 text-sm">
              <span className="text-zhiji-gold/80 text-xs mr-2">描述</span>
              {detail.description}
            </p>
          )}
        </div>
      )}

      {/* 牌面信息 */}
      <div className="mb-8 animate-fadeIn">
        <h3 className="text-zhiji-gold text-sm font-medium mb-3 flex items-center gap-2">
          <span>🎴</span>牌面
        </h3>
        <div className="flex flex-wrap gap-3">
          {detail.cards.map((c, i) => (
            <div
              key={i}
              className="px-4 py-3 rounded-lg border border-zhiji-gold/20 bg-zhiji-gold/[0.05] text-center"
            >
              <p className="text-gray-200 text-sm font-medium">
                {c.card.name}
              </p>
              <p className="text-gray-500 text-xs mt-0.5">
                {c.card.nameEn}
              </p>
              <p className={`text-xs mt-1 ${c.isReversed ? "text-red-400/80" : "text-zhiji-gold/70"}`}>
                {c.isReversed ? "逆位" : "正位"}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* 完整解读 */}
      <div className="space-y-6 animate-fadeIn">
        {sections.map((section, index) => (
          <div key={index}>
            {section.title && (
              <h3 className="text-zhiji-gold text-sm font-medium mb-2 flex items-center gap-2">
                <span>{getSectionIcon(section.title)}</span>
                {section.title}
              </h3>
            )}
            <div className="text-gray-200 leading-relaxed whitespace-pre-wrap text-sm">
              {section.content}
            </div>
          </div>
        ))}
      </div>

      {/* 底部操作 */}
      <div className="flex gap-4 mt-10 mb-8">
        <Button
          variant="outline"
          onClick={() => router.push("/tarot")}
          className="border-zhiji-gold/40 text-zhiji-gold hover:bg-zhiji-gold/10 cursor-pointer"
        >
          ✦ 再抽一次
        </Button>
        <Button
          variant="outline"
          onClick={() => router.push("/tarot/history")}
          className="border-gray-600 text-gray-400 hover:bg-white/5 cursor-pointer"
        >
          返回列表
        </Button>
      </div>
    </div>
  );
}
