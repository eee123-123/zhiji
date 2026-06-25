"use client";

import { useEffect } from "react";

/** 获取今日缓存 key */
function getTodayCacheKey(): string {
  const today = new Date().toISOString().slice(0, 10);
  return `wellness-card-${today}`;
}

/**
 * 后台预加载组件
 * 在首页加载后静默预请求养生卡片内容并缓存到 localStorage，
 * 使用户进入养元页面时无需等待 AI 生成。
 */
export function Prefetcher() {
  useEffect(() => {
    const cacheKey = getTodayCacheKey();

    // 已有今日缓存则跳过
    try {
      if (localStorage.getItem(cacheKey)) return;
    } catch {
      return;
    }

    // 后台静默发起预加载（不阻塞、不报错）
    const abortController = new AbortController();

    (async () => {
      try {
        const res = await fetch("/api/wellness/card", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prefetch: true }),
          signal: abortController.signal,
        });

        if (!res.ok || !res.body) return;

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let fullText = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          fullText += decoder.decode(value, { stream: true });
        }

        if (fullText) {
          try {
            localStorage.setItem(cacheKey, fullText);
          } catch {}
        }
      } catch {
        // 静默失败，不影响用户体验
      }
    })();

    return () => {
      abortController.abort();
    };
  }, []);

  return null;
}
