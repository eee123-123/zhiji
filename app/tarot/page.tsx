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
        无需思考，翻一张牌，看看宇宙想对你说什么
      </p>

      {/* 角色选择 */}
      <div className="mb-10">
        <RoleSelector selectedRole={selectedRole} onSelect={setSelectedRole} />
      </div>

      {/* 一键抽牌大按钮 */}
      <Button
        onClick={handleQuickDraw}
        size="lg"
        className="bg-zhiji-gold hover:bg-zhiji-gold-light text-zhiji-dark font-bold text-lg px-10 py-6 rounded-full shadow-lg shadow-zhiji-gold/20 transition-all duration-300 hover:shadow-zhiji-gold/40 hover:scale-105 cursor-pointer"
      >
        ✦ 一键抽牌
      </Button>

      <p className="text-gray-500 text-sm mt-5">30秒获得今日灵感</p>

      {/* 完整流程入口 */}
      <Link
        href="/tarot/full"
        className="mt-20 px-6 py-3 rounded-lg border border-zhiji-gold/25 text-zhiji-gold/80 text-sm text-center hover:bg-zhiji-gold/10 hover:border-zhiji-gold/40 transition-all duration-200 block"
      >
        ✦ 完整问牌流程（选主题 → 描述困惑 → 选牌阵）
      </Link>

      {/* 历史记录入口 */}
      <Link
        href="/tarot/history"
        className="mt-4 px-6 py-2.5 rounded-lg border border-zhiji-gold/25 text-zhiji-gold/80 text-sm hover:bg-zhiji-gold/10 hover:border-zhiji-gold/40 transition-all duration-200"
      >
        📜 问牌记录
      </Link>
    </div>
  );
}
