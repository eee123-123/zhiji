"use client";

import { useMemo } from "react";

interface DreamReadingProps {
  text: string;
  loading: boolean;
  error?: string;
}

interface ParsedSection {
  key: string;
  icon: string;
  title: string;
  content: string;
}

function parseSections(text: string): ParsedSection[] {
  const sectionConfig: Record<string, { icon: string; title: string }> = {
    "传统寓意": { icon: "📜", title: "传统寓意" },
    "深层映射": { icon: "🔮", title: "深层映射" },
    "值得自问": { icon: "💭", title: "值得自问" },
  };

  const sections: ParsedSection[] = [];
  const regex = /---SECTION:(.*?)---\n?([\s\S]*?)(?=---SECTION:|---DREAM_ENTRY_ID:|$)/g;
  let match;

  while ((match = regex.exec(text)) !== null) {
    const key = match[1].trim();
    const content = match[2].trim();
    const config = sectionConfig[key];
    if (config && content) {
      sections.push({
        key,
        icon: config.icon,
        title: config.title,
        content,
      });
    }
  }

  return sections;
}

// 获取正在流式输出的当前 section 部分文本（尚未被完整解析的）
function getStreamingTail(text: string): { sectionKey: string; content: string } | null {
  // 找到最后一个 SECTION 标记
  const lastSectionRegex = /---SECTION:(.*?)---\n?([\s\S]*)$/;
  const match = text.match(lastSectionRegex);
  if (!match) return null;

  const key = match[1].trim();
  const content = match[2];

  // 如果内容后面没有新的 SECTION 标记，说明正在输出这个 section
  if (!content.includes("---SECTION:") && !content.includes("---DREAM_ENTRY_ID:")) {
    return { sectionKey: key, content: content.trimStart() };
  }
  return null;
}

export function DreamReading({ text, loading, error }: DreamReadingProps) {
  // 解析已完成的 sections
  const sections = useMemo(() => parseSections(text), [text]);

  // 获取当前正在流式输出的 section
  const streamingTail = useMemo(() => {
    if (!loading) return null;
    return getStreamingTail(text);
  }, [text, loading]);

  if (error) {
    return (
      <div className="rounded-xl border border-red-500/30 bg-red-500/5 p-6">
        <p className="text-red-400 text-center">{error}</p>
      </div>
    );
  }

  // 还未开始输出任何 section 内容
  if (!text && loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="text-2xl mb-4 animate-pulse">🌙</div>
        <p className="text-gray-400 text-sm">正在解读你的梦境...</p>
        <span className="inline-block w-2 h-5 bg-zhiji-gold/70 animate-pulse mt-3" />
      </div>
    );
  }

  // 如果文本还没有出现 SECTION 标记，显示原始文本（可能是预输出）
  const hasSections = text.includes("---SECTION:");
  if (!hasSections && text) {
    return (
      <div className="space-y-4">
        <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">
          {text}
          {loading && (
            <span className="inline-block w-2 h-5 bg-zhiji-gold/70 animate-pulse ml-1 align-middle" />
          )}
        </p>
      </div>
    );
  }

  const sectionConfig: Record<string, { icon: string; title: string }> = {
    "传统寓意": { icon: "📜", title: "传统寓意" },
    "深层映射": { icon: "🔮", title: "深层映射" },
    "值得自问": { icon: "💭", title: "值得自问" },
  };

  return (
    <div className="space-y-6">
      {sections.map((section, index) => {
        const isLast = index === sections.length - 1;
        const isStreaming =
          loading && isLast && !streamingTail;

        return (
          <div key={section.key}>
            <div className="rounded-xl border border-white/10 bg-white/[0.02] p-5">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-lg">{section.icon}</span>
                <h3 className="text-zhiji-gold font-semibold text-base">
                  {section.title}
                </h3>
              </div>
              <p className="text-gray-300 leading-relaxed whitespace-pre-wrap text-sm">
                {section.content}
                {isStreaming && (
                  <span className="inline-block w-2 h-5 bg-zhiji-gold/70 animate-pulse ml-1 align-middle" />
                )}
              </p>
            </div>
            {index < sections.length - 1 && (
              <div className="border-b border-white/5 my-2" />
            )}
          </div>
        );
      })}

      {/* 正在流式输出的 section（尚未完整） */}
      {streamingTail && sectionConfig[streamingTail.sectionKey] && (
        <div>
          <div className="rounded-xl border border-white/10 bg-white/[0.02] p-5">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-lg">
                {sectionConfig[streamingTail.sectionKey].icon}
              </span>
              <h3 className="text-zhiji-gold font-semibold text-base">
                {sectionConfig[streamingTail.sectionKey].title}
              </h3>
            </div>
            <p className="text-gray-300 leading-relaxed whitespace-pre-wrap text-sm">
              {streamingTail.content}
              <span className="inline-block w-2 h-5 bg-zhiji-gold/70 animate-pulse ml-1 align-middle" />
            </p>
          </div>
        </div>
      )}

      {/* 全部完成提示 */}
      {!loading && sections.length > 0 && (
        <div className="text-center pt-2">
          <span className="text-xs text-gray-500">✦ 解读完毕 ✦</span>
        </div>
      )}
    </div>
  );
}
