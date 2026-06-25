import type { Metadata } from "next";
import { AppShell } from "@/components/layout/app-shell";
import { Prefetcher } from "@/components/layout/prefetcher";
import "./globals.css";

export const metadata: Metadata = {
  title: "知几 - 自我觉察空间",
  description: "塔罗指引 · 古籍养生 · 梦境解析",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body className="antialiased">
        <AppShell>{children}</AppShell>
        <Prefetcher />
      </body>
    </html>
  );
}
