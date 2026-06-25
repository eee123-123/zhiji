"use client";

import { useState, useMemo } from "react";

interface CelticReadingDisplayProps {
  text: string; // 完整的流式文本
  loading: boolean;
  error?: string;
}

interface CardSection {
  cardNumber: number;
  positionName: string;
  content: string;
}

interface ParsedReading {
  overview: string;
  cards: CardSection[];
}

/**
 * 解析流式文本中的凯尔特十字标记
 * 标记格式：---SECTION:总览--- 和 ---CARD:N:位置名---
 * 需要容错：流式输出时标记可能不完整
 */
function parseReading(text: string): ParsedReading {
  const result: ParsedReading = { overview: "", cards: [] };
  if (!text) return result;

  // 分割所有段落标记
  const sectionRegex = /---SECTION:总览---/;
  const cardRegex = /---CARD:(\d+):([^-]+)---/g;

  // 提取总览
  const overviewMatch = text.match(sectionRegex);
  if (overviewMatch) {
    const overviewStart = overviewMatch.index! + overviewMatch[0].length;
    // 找到下一个标记的位置
    const nextMarkerMatch = text.slice(overviewStart).match(/---CARD:\d+:/);
    if (nextMarkerMatch) {
      result.overview = text
        .slice(overviewStart, overviewStart + nextMarkerMatch.index!)
        .trim();
    } else {
      // 还没有卡牌标记，总览就是剩下的所有内容
      result.overview = text.slice(overviewStart).trim();
    }
  }

  // 提取各卡牌解读
  const cardMatches = [...text.matchAll(cardRegex)];
  for (let i = 0; i < cardMatches.length; i++) {
    const match = cardMatches[i];
    const cardNumber = parseInt(match[1]);
    const positionName = match[2].trim();
    const contentStart = match.index! + match[0].length;

    let content: string;
    if (i < cardMatches.length - 1) {
      // 内容到下一个标记为止
      content = text.slice(contentStart, cardMatches[i + 1].index!).trim();
    } else {
      // 最后一个标记，内容到文本末尾
      content = text.slice(contentStart).trim();
    }

    result.cards.push({ cardNumber, positionName, content });
  }

  return result;
}

export function CelticReadingDisplay({
  text,
  loading,
  error,
}: CelticReadingDisplayProps) {
  const [expandedCards, setExpandedCards] = useState<Set<number>>(new Set());

  const parsed = useMemo(() => parseReading(text), [text]);

  const toggleCard = (cardNumber: number) => {
    setExpandedCards((prev) => {
      const next = new Set(prev);
      if (next.has(cardNumber)) {
        next.delete(cardNumber);
      } else {
        next.add(cardNumber);
      }
      return next;
    });
  };

  // 全部展开/收起
  const expandAll = () => {
    const allNumbers = parsed.cards.map((c) => c.cardNumber);
    setExpandedCards(new Set(allNumbers));
  };

  const collapseAll = () => {
    setExpandedCards(new Set());
  };

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-400 text-sm">{error}</p>
      </div>
    );
  }

  // 还没收到任何有效内容
  if (!text && loading) {
    return (
      <div className="flex flex-col items-center py-12">
        <div className="w-8 h-8 border-2 border-zhiji-gold/30 border-t-zhiji-gold rounded-full animate-spin mb-4" />
        <p className="text-gray-400 text-sm animate-pulse">
          正在解读十张牌的讯息……
        </p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-lg mx-auto">
      {/* 总览区域 */}
      {parsed.overview && (
        <div className="bg-white/5 rounded-xl p-5 mb-6 border border-white/10">
          <h3 className="text-zhiji-gold text-sm font-bold mb-3 flex items-center gap-2">
            <span>✦</span>
            <span>核心讯息</span>
            <span>✦</span>
          </h3>
          <p className="text-gray-200 text-sm leading-relaxed whitespace-pre-wrap">
            {parsed.overview}
          </p>
        </div>
      )}

      {/* 加载中但还未解析到卡牌 */}
      {loading && parsed.cards.length === 0 && parsed.overview && (
        <div className="flex items-center gap-2 text-gray-500 text-xs mb-4">
          <div className="w-3 h-3 border border-zhiji-gold/30 border-t-zhiji-gold rounded-full animate-spin" />
          <span>正在逐张解读中…</span>
        </div>
      )}

      {/* 卡牌解读折叠列表 */}
      {parsed.cards.length > 0 && (
        <div className="space-y-0">
          {/* 展开/收起控制 */}
          {parsed.cards.length > 1 && !loading && (
            <div className="flex justify-end gap-3 mb-3">
              <button
                onClick={expandAll}
                className="text-xs text-gray-500 hover:text-zhiji-gold transition-colors cursor-pointer"
              >
                全部展开
              </button>
              <button
                onClick={collapseAll}
                className="text-xs text-gray-500 hover:text-zhiji-gold transition-colors cursor-pointer"
              >
                全部收起
              </button>
            </div>
          )}

          {parsed.cards.map((card, idx) => {
            const isExpanded = expandedCards.has(card.cardNumber);
            const isLast = idx === parsed.cards.length - 1;
            const isReceiving = loading && isLast;

            return (
              <div
                key={card.cardNumber}
                className={`border-b border-white/10 ${
                  idx === 0 ? "border-t" : ""
                }`}
              >
                {/* 标题行 - 点击切换 */}
                <button
                  onClick={() => toggleCard(card.cardNumber)}
                  className="w-full flex items-center justify-between py-3.5 px-1 text-left transition-colors hover:bg-white/5 cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-zhiji-gold/20 text-zhiji-gold text-xs font-bold flex items-center justify-center flex-shrink-0">
                      {card.cardNumber}
                    </span>
                    <span className="text-gray-300 text-sm font-medium">
                      {card.positionName}
                    </span>
                    {isReceiving && (
                      <div className="w-2 h-2 rounded-full bg-zhiji-gold/50 animate-pulse" />
                    )}
                  </div>
                  <span
                    className={`text-gray-500 text-xs transition-transform duration-200 ${
                      isExpanded ? "rotate-180" : ""
                    }`}
                  >
                    ▾
                  </span>
                </button>

                {/* 展开内容 */}
                <div
                  className={`overflow-hidden transition-all duration-300 ease-in-out ${
                    isExpanded
                      ? "max-h-[600px] opacity-100"
                      : "max-h-0 opacity-0"
                  }`}
                >
                  <div className="px-1 pb-4 pl-10">
                    <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">
                      {card.content}
                      {isReceiving && (
                        <span className="inline-block w-1.5 h-4 bg-zhiji-gold/60 animate-pulse ml-0.5 align-middle" />
                      )}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 流式加载中的底部提示 */}
      {loading && parsed.cards.length > 0 && (
        <div className="flex items-center gap-2 text-gray-500 text-xs mt-4">
          <div className="w-3 h-3 border border-zhiji-gold/30 border-t-zhiji-gold rounded-full animate-spin" />
          <span>
            正在解读第 {parsed.cards.length + 1 > 10 ? 10 : parsed.cards.length + 1} 张牌…
          </span>
        </div>
      )}
    </div>
  );
}
