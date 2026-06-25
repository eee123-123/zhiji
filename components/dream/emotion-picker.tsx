"use client";

import { DreamEmotion, EMOTION_LABELS } from "@/types/dream";

interface EmotionPickerProps {
  selected: DreamEmotion | null;
  onSelect: (emotion: DreamEmotion) => void;
}

const EMOTION_ICONS: Record<DreamEmotion, string> = {
  fear: "😨",
  anxiety: "😰",
  joy: "😊",
  sadness: "😢",
  confusion: "😵‍💫",
  calm: "😌",
  absurd: "🤪",
};

export function EmotionPicker({ selected, onSelect }: EmotionPickerProps) {
  const emotions = Object.keys(EMOTION_LABELS) as DreamEmotion[];

  return (
    <div className="flex flex-wrap gap-3">
      {emotions.map((emotion) => {
        const isSelected = selected === emotion;
        return (
          <button
            key={emotion}
            type="button"
            onClick={() => onSelect(emotion)}
            className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg border transition-all duration-200 ${
              isSelected
                ? "bg-zhiji-gold/20 border-zhiji-gold text-zhiji-gold scale-105"
                : "border-white/10 text-gray-400 hover:border-white/30 hover:text-gray-300"
            }`}
          >
            <span className="text-xl">{EMOTION_ICONS[emotion]}</span>
            <span className="text-xs">{EMOTION_LABELS[emotion]}</span>
          </button>
        );
      })}
    </div>
  );
}
