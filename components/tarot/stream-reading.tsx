"use client";

interface StreamReadingProps {
  text: string;
  loading: boolean;
  error: string | null;
}

export function StreamReading({ text, loading, error }: StreamReadingProps) {
  const sections = parseSections(text);

  return (
    <div className="space-y-6">
      {sections.map((section, index) => (
        <div key={index} className="animate-fadeIn">
          {section.title && (
            <h3 className="text-zhiji-gold text-sm font-medium mb-2 flex items-center gap-2">
              <span>{getSectionIcon(section.title)}</span>
              {section.title}
            </h3>
          )}
          <div className="text-gray-200 leading-relaxed whitespace-pre-wrap">
            {section.content}
          </div>
        </div>
      ))}

      {/* 加载指示器 */}
      {loading && (
        <div className="flex items-center gap-2 text-zhiji-gold/60">
          <span className="animate-pulse">✦</span>
          <span className="text-sm">月见正在解读...</span>
        </div>
      )}

      {/* 错误提示 */}
      {error && (
        <div className="text-red-400 text-sm">{error}</div>
      )}
    </div>
  );
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

  // parts[0] 是第一个 SECTION 标记前的文本
  if (parts[0]?.trim()) {
    sections.push({ title: null, content: parts[0].trim() });
  }

  // 之后每两个元素为一组: [sectionName, sectionContent]
  for (let i = 1; i < parts.length; i += 2) {
    const title = parts[i]?.trim() || null;
    const content = parts[i + 1]?.trim() || "";
    if (title || content) {
      sections.push({ title, content });
    }
  }

  // 没有匹配到任何 section 标记，整体作为一个 section
  if (sections.length === 0 && text.trim()) {
    sections.push({ title: null, content: text.trim() });
  }

  return sections;
}

function getSectionIcon(title: string): string {
  if (title.includes("牌面意象")) return "🎴";
  if (title.includes("解读")) return "✦";
  if (title.includes("行动建议")) return "💡";
  return "·";
}
