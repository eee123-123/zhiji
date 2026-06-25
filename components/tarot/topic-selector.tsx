"use client";

import { TarotTopic } from "@/types/tarot";

interface TopicSelectorProps {
  selectedTopic: TarotTopic | null;
  onSelect: (topic: TarotTopic) => void;
}

interface TopicOption {
  id: TarotTopic;
  icon: string;
  name: string;
  description: string;
}

const TOPIC_OPTIONS: TopicOption[] = [
  {
    id: "love",
    icon: "💕",
    name: "感情关系",
    description: "探索关系中的困惑与方向",
  },
  {
    id: "career",
    icon: "🌟",
    name: "事业发展",
    description: "看清职业道路上的机遇与挑战",
  },
  {
    id: "decision",
    icon: "🔮",
    name: "人生抉择",
    description: "面对选择时的智慧指引",
  },
  {
    id: "general",
    icon: "✨",
    name: "今日指引",
    description: "不问具体，只看当下讯息",
  },
];

export function TopicSelector({ selectedTopic, onSelect }: TopicSelectorProps) {
  return (
    <div className="w-full max-w-md">
      <p className="text-gray-400 text-sm text-center mb-4">
        你想探寻哪个方向的讯息？
      </p>
      <div className="grid grid-cols-2 gap-3">
        {TOPIC_OPTIONS.map((topic) => {
          const isSelected = selectedTopic === topic.id;
          return (
            <button
              key={topic.id}
              onClick={() => onSelect(topic.id)}
              className={`
                relative p-4 rounded-xl border text-left transition-all duration-300 cursor-pointer
                ${
                  isSelected
                    ? "border-zhiji-gold/60 bg-zhiji-gold/10 scale-[1.03] shadow-lg shadow-zhiji-gold/10"
                    : "border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/8"
                }
              `}
            >
              <span className="text-2xl mb-2 block">{topic.icon}</span>
              <p
                className={`font-bold text-sm mb-1 ${
                  isSelected ? "text-zhiji-gold" : "text-gray-200"
                }`}
              >
                {topic.name}
              </p>
              <p className="text-xs text-gray-400 leading-relaxed">
                {topic.description}
              </p>
              {isSelected && (
                <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-zhiji-gold/30 border border-zhiji-gold/60" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
