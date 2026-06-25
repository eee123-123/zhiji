"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const WELCOME_MESSAGE: Message = {
  role: "assistant",
  content: "你好，我是岐伯先生。有什么养生方面的问题，尽管问我。",
};

const PRESET_QUESTIONS = [
  "最近总是失眠怎么办？",
  "夏天适合喝什么茶？",
  "肩颈酸痛有什么穴位推荐？",
];

export default function QiboChatPage() {
  const [messages, setMessages] = useState<Message[]>([WELCOME_MESSAGE]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [showPresets, setShowPresets] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  // 自动滚动到底部
  const scrollToBottom = useCallback(() => {
    setTimeout(() => {
      scrollRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 50);
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // 发送消息
  const sendMessage = useCallback(
    async (text: string) => {
      if (!text.trim() || isStreaming) return;

      const userMessage: Message = { role: "user", content: text.trim() };
      setMessages((prev) => [...prev, userMessage]);
      setInput("");
      setShowPresets(false);
      setIsStreaming(true);

      // 添加空的 assistant 消息占位
      const assistantMessage: Message = { role: "assistant", content: "" };
      setMessages((prev) => [...prev, assistantMessage]);

      // 构建历史（不含欢迎语和当前空消息，最多保留最近10轮）
      const history = messages
        .filter((m) => m !== WELCOME_MESSAGE)
        .slice(-20) // 10轮 = 20条消息
        .map((m) => ({ role: m.role, content: m.content }));

      abortRef.current = new AbortController();

      try {
        const res = await fetch("/api/wellness/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: text.trim(), history }),
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
          const chunk = decoder.decode(value, { stream: true });
          setMessages((prev) => {
            const updated = [...prev];
            const last = updated[updated.length - 1];
            updated[updated.length - 1] = {
              ...last,
              content: last.content + chunk,
            };
            return updated;
          });
        }
      } catch (err: unknown) {
        if (err instanceof Error && err.name === "AbortError") return;
        setMessages((prev) => {
          const updated = [...prev];
          updated[updated.length - 1] = {
            role: "assistant",
            content: "抱歉，我暂时无法回应，请稍后再试。",
          };
          return updated;
        });
      } finally {
        setIsStreaming(false);
      }
    },
    [isStreaming, messages]
  );

  // 键盘事件：回车发送，shift+回车换行
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  // 组件卸载取消请求
  useEffect(() => {
    return () => {
      abortRef.current?.abort();
    };
  }, []);

  return (
    <div className="flex flex-col h-screen max-w-lg mx-auto">
      {/* 顶部栏 */}
      <header className="flex items-center px-4 py-3 border-b border-white/10 bg-zhiji-dark/80 backdrop-blur-sm sticky top-0 z-10">
        <Link
          href="/wellness"
          className="text-gray-400 hover:text-gray-200 transition-colors mr-3"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </Link>
        <h1 className="text-base font-medium text-gray-100">岐伯先生</h1>
      </header>

      {/* 对话区域 */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[80%] px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
                msg.role === "user"
                  ? "bg-zhiji-gold/20 text-gray-100 rounded-2xl rounded-tr-sm"
                  : "bg-white/5 border border-white/10 text-gray-200 rounded-2xl rounded-tl-sm"
              }`}
            >
              {msg.content}
              {/* 流式输出打字机光标 */}
              {msg.role === "assistant" &&
                index === messages.length - 1 &&
                isStreaming && (
                  <span className="inline-block w-0.5 h-4 bg-zhiji-gold ml-0.5 animate-pulse align-middle" />
                )}
            </div>
          </div>
        ))}
        <div ref={scrollRef} />
      </div>

      {/* 预设快捷问题 */}
      {showPresets && (
        <div className="px-4 pb-2 flex flex-wrap gap-2">
          {PRESET_QUESTIONS.map((q) => (
            <button
              key={q}
              onClick={() => sendMessage(q)}
              className="px-3 py-1.5 text-xs text-zhiji-gold border border-zhiji-gold/30 rounded-full hover:bg-zhiji-gold/10 transition-colors"
            >
              {q}
            </button>
          ))}
        </div>
      )}

      {/* 输入区域 */}
      <div className="border-t border-white/10 bg-zhiji-dark px-4 py-3 sticky bottom-0">
        <div className="flex items-end gap-2">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="向岐伯先生请教..."
            rows={1}
            className="flex-1 resize-none bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:border-zhiji-gold/50 transition-colors"
            disabled={isStreaming}
          />
          <button
            onClick={() => sendMessage(input)}
            disabled={isStreaming || !input.trim()}
            className="p-2.5 rounded-xl bg-zhiji-gold/20 text-zhiji-gold hover:bg-zhiji-gold/30 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
