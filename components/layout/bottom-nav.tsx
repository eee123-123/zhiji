"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/tarot", label: "问牌", icon: "🎴" },
  { href: "/wellness", label: "养元", icon: "🌿" },
  { href: "/dream", label: "解梦", icon: "🌙" },
  { href: "/profile", label: "我的", icon: "🪞" },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-zhiji-dark/95 backdrop-blur-sm border-t border-white/10">
      <div className="flex justify-around items-center h-16">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-1 px-3 py-2 text-xs transition-colors ${
                isActive ? "text-zhiji-gold" : "text-gray-400 hover:text-gray-200"
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
