"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/", label: "首页", icon: "✦" },
  { href: "/tarot", label: "问牌", icon: "🎴" },
  { href: "/wellness", label: "养元", icon: "🌿" },
  { href: "/dream", label: "解梦", icon: "🌙" },
  { href: "/profile", label: "我的", icon: "🪞" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex fixed left-0 top-0 bottom-0 w-16 flex-col items-center py-6 bg-zhiji-dark/95 border-r border-white/10 z-50">
      <div className="text-zhiji-gold font-bold text-lg mb-8">知</div>
      <nav className="flex flex-col gap-4 flex-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              title={item.label}
              className={`w-10 h-10 flex items-center justify-center rounded-lg transition-all ${
                isActive
                  ? "bg-zhiji-purple text-zhiji-gold"
                  : "text-gray-400 hover:text-gray-200 hover:bg-white/5"
              }`}
            >
              <span className="text-lg">{item.icon}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
