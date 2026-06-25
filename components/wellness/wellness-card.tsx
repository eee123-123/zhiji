"use client";

import { useMemo } from "react";

interface WellnessCardProps {
  text: string;
  loading: boolean;
}

interface Section {
  title: string;
  icon: string;
  content: string;
}

const SECTION_ICONS: Record<string, string> = {
  "饮食建议": "🍵",
  "起居作息": "🌅",
  "穴位推荐": "💆",
  "特别提醒": "📝",
};

function parseSections(text: string): Section[] {
  const sections: Section[] = [];
  const regex = /---SECTION:(.+?)---\s*/g;
  const parts = text.split(regex);

  // parts[0] is before the first SECTION marker (usually empty)
  // parts[1] = title, parts[2] = content, parts[3] = title, parts[4] = content...
  for (let i = 1; i < parts.length; i += 2) {
    const title = parts[i]?.trim();
    const content = parts[i + 1]?.trim();
    if (title && content) {
      sections.push({
        title,
        icon: SECTION_ICONS[title] || "📌",
        content,
      });
    }
  }

  return sections;
}

export function WellnessCard({
  text,
  loading,
}: WellnessCardProps) {
  const sections = useMemo(() => parseSections(text), [text]);
  const hasStructuredContent = sections.length > 0;

  return (
    <div className="border border-white/10 bg-gradient-to-b from-white/5 to-transparent rounded-2xl p-6">
      {/* 内容区域 */}
      {loading && !text && (
        <div className="flex items-center gap-2 text-gray-400">
          <span className="inline-block w-2 h-2 bg-zhiji-gold/60 rounded-full animate-pulse" />
          <span className="inline-block w-2 h-2 bg-zhiji-gold/40 rounded-full animate-pulse delay-150" />
          <span className="inline-block w-2 h-2 bg-zhiji-gold/20 rounded-full animate-pulse delay-300" />
          <span className="ml-2 text-sm">正在生成今日养生建议…</span>
        </div>
      )}

      {hasStructuredContent ? (
        <div className="space-y-4">
          {sections.map((section, index) => (
            <div key={index}>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-lg">{section.icon}</span>
                <span className="text-zhiji-gold/80 font-medium text-sm">
                  {section.title}
                </span>
              </div>
              <p className="text-gray-300 text-sm leading-relaxed pl-7">
                {section.content}
              </p>
            </div>
          ))}
        </div>
      ) : (
        text && (
          <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">
            {text}
          </p>
        )
      )}

      {/* 流式加载中的光标效果 */}
      {loading && text && (
        <span className="inline-block w-0.5 h-4 bg-zhiji-gold/60 animate-pulse ml-0.5 align-middle" />
      )}

      {/* 底部打卡按钮 */}
      {!loading && text && (
        <div className="mt-6 pt-4 border-t border-white/5">
          <button
            onClick={() => {
              window.location.href = "/wellness/checkin";
            }}
            className="w-full py-2.5 rounded-xl bg-zhiji-gold/10 hover:bg-zhiji-gold/20 text-zhiji-gold text-sm font-medium transition-colors"
          >
            ✅ 今日执行
          </button>
        </div>
      )}
    </div>
  );
}
