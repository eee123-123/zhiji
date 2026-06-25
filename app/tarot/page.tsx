"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { RoleSelector } from "@/components/tarot/role-selector";
import { TarotRole } from "@/types/tarot";

export default function TarotPage() {
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState<TarotRole>("yuejian");

  const handleQuickDraw = () => {
    const sessionId =
      Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
    router.push(`/tarot/session/${sessionId}?mode=quick&role=${selectedRole}`);
  };

  return (
    <div className="flex flex-col items-center px-4 py-16 min-h-screen">
      {/* 标题区 */}
      <h1 className="text-3xl font-bold text-zhiji-gold mb-3">🎴 问牌</h1>
      <p className="text-gray-400 text-center mb-10 max-w-md leading-relaxed">
        带着你的问题来，让牌面映照出答案的方向
      </p>

      {/* 角色选择 */}
      <div className="mb-10">
        <RoleSelector selectedRole={selectedRole} onSelect={setSelectedRole} />
      </div>

      {/* 主 CTA：开始问牌（完整流程） */}
      <Button
        onClick={() => router.push(`/tarot/full?role=${selectedRole}`)}
        size="lg"
        className="bg-zhiji-gold hover:bg-zhiji-gold-light text-zhiji-dark font-bold text-lg px-10 py-6 rounded-full shadow-lg shadow-zhiji-gold/20 transition-all duration-300 hover:shadow-zhiji-gold/40 hover:scale-105 cursor-pointer"
      >
        ✦ 开始问牌
      </Button>
      <p className="text-gray-500 text-sm mt-4">
        选主题 → 描述困惑 → 选牌阵 → 解读
      </p>

      {/* 次要入口区 */}
      <div className="mt-20 flex flex-col items-center gap-3">
        <button
          onClick={handleQuickDraw}
          className="text-gray-400 text-sm hover:text-zhiji-gold/80 transition-colors duration-200 cursor-pointer"
        >
          ⚡ 不想多想？一键抽牌
        </button>
        <Link
          href="/tarot/history"
          className="text-gray-400 text-sm hover:text-zhiji-gold/80 transition-colors duration-200"
        >
          📜 问牌记录
        </Link>
      </div>
    </div>
  );
}
