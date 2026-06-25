"use client";

import { useRouter } from "next/navigation";

export function QuickDrawButton({ className }: { className?: string }) {
  const router = useRouter();

  const handleClick = () => {
    const sessionId =
      Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
    router.push(`/tarot/session/${sessionId}?mode=quick`);
  };

  return (
    <button onClick={handleClick} className={className}>
      ✦ 一键抽牌
    </button>
  );
}
