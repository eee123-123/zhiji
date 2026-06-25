"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/", label: "首页", icon: "✦" },
  { href: "/tarot", label: "问牌", icon: "🎴" },
  { href: "/wellness", label: "养元", icon: "🌿" },
  { href: "/dream", label: "解梦", icon: "🌙" },
  { href: "/profile", label: "觉察档案", icon: "🪞" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex fixed left-0 top-0 bottom-0 w-48 flex-col py-6 bg-zhiji-dark/95 border-r border-white/10 z-50">
      {/* Logo */}
      <div className="flex items-center px-5 mb-8">
        <span className="text-zhiji-gold font-bold text-lg">知</span>
        <span className="ml-2 text-zhiji-gold/70 text-sm font-medium">知己</span>
      </div>

      {/* Navigation */}
      <nav className="flex flex-col gap-2 flex-1 px-2">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center px-3 h-10 gap-3 rounded-lg transition-colors duration-200 ${
                isActive
                  ? "bg-zhiji-purple/80 text-zhiji-gold"
                  : "text-gray-400 hover:text-gray-200 hover:bg-white/5"
              }`}
            >
              <span className="text-lg flex-shrink-0">{item.icon}</span>
              <span
                className={`text-sm whitespace-nowrap ${
                  isActive ? "text-zhiji-gold" : "text-gray-400"
                }`}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
