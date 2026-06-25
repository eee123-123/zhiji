"use client";

import { useState, useRef, useEffect, useCallback } from "react";

export function useStream() {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const startStream = useCallback(async (url: string, body: object) => {
    // 取消上一次未完成的请求
    abortRef.current?.abort();
    abortRef.current = new AbortController();

    setLoading(true);
    setText("");
    setError(null);

    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        signal: abortRef.current.signal,
      });

      if (!res.ok) {
        throw new Error(`请求失败: ${res.status}`);
      }

      const reader = res.body!.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        setText((prev) => prev + decoder.decode(value, { stream: true }));
      }
    } catch (err: unknown) {
      if (err instanceof Error && err.name === "AbortError") return; // 用户主动取消，静默处理
      const message =
        err instanceof Error ? err.message : "生成失败，请重试";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  const cancel = useCallback(() => {
    abortRef.current?.abort();
    setLoading(false);
  }, []);

  // 组件卸载时自动取消进行中的请求
  useEffect(() => {
    return () => {
      abortRef.current?.abort();
    };
  }, []);

  return { text, loading, error, startStream, cancel };
}
