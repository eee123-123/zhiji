"use client";

import { PRESET_DREAM_TAGS } from "@/types/dream";

interface TagSelectorProps {
  selectedTags: string[];
  onToggle: (tag: string) => void;
}

export function TagSelector({ selectedTags, onToggle }: TagSelectorProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {PRESET_DREAM_TAGS.map((tag) => {
        const isSelected = selectedTags.includes(tag);
        return (
          <button
            key={tag}
            type="button"
            onClick={() => onToggle(tag)}
            className={`px-3 py-1.5 rounded-full text-sm border transition-all duration-200 ${
              isSelected
                ? "bg-zhiji-gold/20 border-zhiji-gold text-zhiji-gold"
                : "border-white/20 text-gray-400 hover:border-white/40 hover:text-gray-300"
            }`}
          >
            {tag}
          </button>
        );
      })}
    </div>
  );
}
