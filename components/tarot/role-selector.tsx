"use client";

import { useState } from "react";
import Image from "next/image";
import { TarotRole } from "@/types/tarot";

interface RoleSelectorProps {
  selectedRole: TarotRole;
  onSelect: (role: TarotRole) => void;
}

interface RoleOption {
  id: TarotRole;
  name: string;
  description: string;
  tags: string[];
  scenario: string;
  colorClass: string;
  borderClass: string;
  bgClass: string;
  tagBgClass: string;
  tagTextClass: string;
  avatar: string;
  fallbackColor: string;
}

const ROLE_OPTIONS: RoleOption[] = [
  {
    id: "yuejian",
    name: "月见",
    description: "温暖如月光，为你照亮迷雾",
    tags: ["温柔共情", "治愈系", "不评判"],
    scenario: "想被温柔对待时，选她",
    colorClass: "text-zhiji-gold",
    borderClass: "border-zhiji-gold/60",
    bgClass: "bg-zhiji-gold/10",
    tagBgClass: "bg-zhiji-gold/15",
    tagTextClass: "text-zhiji-gold/90",
    avatar: "/roles/yuejian.png",
    fallbackColor: "bg-purple-600",
  },
  {
    id: "yousuo",
    name: "幽锁",
    description: "不废话，直指核心",
    tags: ["犀利直白", "一针见血", "冷幽默"],
    scenario: "想听真话时，选他",
    colorClass: "text-indigo-300",
    borderClass: "border-indigo-400/60",
    bgClass: "bg-indigo-500/10",
    tagBgClass: "bg-indigo-500/15",
    tagTextClass: "text-indigo-300/90",
    avatar: "/roles/yousuo.png",
    fallbackColor: "bg-indigo-600",
  },
  {
    id: "qingwu",
    name: "青梧",
    description: "引导你自己看见答案",
    tags: ["哲理深思", "善用比喻", "启发式"],
    scenario: "想深入思考时，选他",
    colorClass: "text-emerald-300",
    borderClass: "border-emerald-400/60",
    bgClass: "bg-emerald-500/10",
    tagBgClass: "bg-emerald-500/15",
    tagTextClass: "text-emerald-300/90",
    avatar: "/roles/qingwu.png",
    fallbackColor: "bg-emerald-600",
  },
  {
    id: "huohu",
    name: "火琥",
    description: "轻松讲深刻的事",
    tags: ["活泼俏皮", "接地气", "满满鼓励"],
    scenario: "想要轻松氛围时，选她",
    colorClass: "text-amber-300",
    borderClass: "border-amber-400/60",
    bgClass: "bg-amber-500/10",
    tagBgClass: "bg-amber-500/15",
    tagTextClass: "text-amber-300/90",
    avatar: "/roles/huohu.png",
    fallbackColor: "bg-amber-600",
  },
];

function RoleAvatar({ role }: { role: RoleOption }) {
  const [imgError, setImgError] = useState(false);

  if (imgError) {
    return (
      <div
        className={`w-16 h-16 rounded-full ${role.fallbackColor} flex items-center justify-center text-white font-bold text-lg shrink-0`}
      >
        {role.name[0]}
      </div>
    );
  }

  return (
    <div className="w-16 h-16 rounded-full overflow-hidden shrink-0 ring-2 ring-white/10">
      <Image
        src={role.avatar}
        alt={role.name}
        width={80}
        height={80}
        className="w-full h-full object-cover"
        onError={() => setImgError(true)}
      />
    </div>
  );
}

export function RoleSelector({ selectedRole, onSelect }: RoleSelectorProps) {
  return (
    <div className="w-full max-w-md">
      <p className="text-gray-400 text-sm text-center mb-3">选择解读者</p>
      <div className="grid grid-cols-2 gap-3">
        {ROLE_OPTIONS.map((role) => {
          const isSelected = selectedRole === role.id;
          return (
            <button
              key={role.id}
              onClick={() => onSelect(role.id)}
              className={`
                relative p-4 pb-3.5 rounded-xl border text-left transition-all duration-300 cursor-pointer flex flex-col items-center gap-2
                ${
                  isSelected
                    ? `${role.borderClass} ${role.bgClass} scale-[1.03] shadow-lg`
                    : "border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/8"
                }
              `}
            >
              {/* 角色头像 */}
              <RoleAvatar role={role} />

              {/* 角色名 */}
              <p
                className={`font-bold text-base ${
                  isSelected ? role.colorClass : "text-gray-200"
                }`}
              >
                {role.name}
              </p>

              {/* 一句话定位 */}
              <p className="text-xs text-gray-400 leading-relaxed text-center">
                {role.description}
              </p>

              {/* 风格标签 */}
              <div className="flex flex-wrap justify-center gap-1.5">
                {role.tags.map((tag) => (
                  <span
                    key={tag}
                    className={`text-[10px] px-2 py-0.5 rounded-full ${
                      isSelected
                        ? `${role.tagBgClass} ${role.tagTextClass}`
                        : "bg-white/8 text-gray-400"
                    }`}
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {/* 适合场景 */}
              <p className="text-[11px] text-gray-500 italic mt-auto">
                {role.scenario}
              </p>

              {isSelected && (
                <div
                  className={`absolute top-2 right-2 w-2 h-2 rounded-full ${role.bgClass} ${role.borderClass} border`}
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
