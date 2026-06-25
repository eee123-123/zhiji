"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CONSTITUTION_QUESTIONS } from "@/lib/wellness/constitution";
import { CONSTITUTION_INFO } from "@/lib/wellness/constitution-info";
import type { ConstitutionType } from "@/types/wellness";

type Phase = "quiz" | "submitting" | "result";

export default function ConstitutionPage() {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [phase, setPhase] = useState<Phase>("quiz");
  const [result, setResult] = useState<{
    type: ConstitutionType;
    scores: Record<string, number>;
  } | null>(null);

  const totalQuestions = CONSTITUTION_QUESTIONS.length;
  const currentQuestion = CONSTITUTION_QUESTIONS[currentIndex];
  const selectedOption = answers[currentIndex] ?? -1;

  function handleSelect(optionIndex: number) {
    const newAnswers = [...answers];
    newAnswers[currentIndex] = optionIndex;
    setAnswers(newAnswers);
  }

  function handlePrev() {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  }

  function handleNext() {
    if (selectedOption === -1) return;
    if (currentIndex < totalQuestions - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  }

  async function handleSubmit() {
    if (selectedOption === -1) return;
    setPhase("submitting");

    try {
      const res = await fetch("/api/wellness/constitution", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers }),
      });

      if (!res.ok) throw new Error("提交失败");

      const { data } = await res.json();
      setResult({ type: data.type, scores: data.scores });
      setPhase("result");
    } catch {
      setPhase("quiz");
      alert("提交失败，请重试");
    }
  }

  const isLastQuestion = currentIndex === totalQuestions - 1;

  // 结果展示页面
  if (phase === "result" && result) {
    const info = CONSTITUTION_INFO[result.type];
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6">
        <div className="max-w-md w-full text-center space-y-6">
          <p className="text-white/60 text-sm">你的体质辨识结果</p>

          <h1 className="text-4xl font-bold text-zhiji-gold">
            {info.name}
          </h1>

          <p className="text-white/80 text-base leading-relaxed">
            {info.description}
          </p>

          <div className="space-y-3 text-left">
            <h3 className="text-white/60 text-sm">主要特征</h3>
            <div className="flex flex-wrap gap-2">
              {info.features.map((f) => (
                <span
                  key={f}
                  className="px-3 py-1 rounded-full text-sm border border-zhiji-gold/30 text-zhiji-gold/90 bg-zhiji-gold/5"
                >
                  {f}
                </span>
              ))}
            </div>
          </div>

          <div className="space-y-3 text-left">
            <h3 className="text-white/60 text-sm">调养要点</h3>
            <ul className="space-y-2">
              {info.carePoints.map((c) => (
                <li
                  key={c}
                  className="text-white/70 text-sm flex items-start gap-2"
                >
                  <span className="text-zhiji-gold mt-0.5">·</span>
                  {c}
                </li>
              ))}
            </ul>
          </div>

          <button
            onClick={() => router.push("/wellness")}
            className="w-full mt-6 py-3 rounded-xl bg-zhiji-gold/20 text-zhiji-gold font-medium border border-zhiji-gold/30 hover:bg-zhiji-gold/30 transition-colors"
          >
            了解你的个性化养生建议
          </button>
        </div>
      </div>
    );
  }

  // 提交中
  if (phase === "submitting") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 border-2 border-zhiji-gold border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-white/60">正在分析你的体质...</p>
        </div>
      </div>
    );
  }

  // 问卷页面
  return (
    <div className="min-h-screen flex flex-col p-6">
      {/* 顶部：标题 + 进度条 */}
      <div className="space-y-4 mb-8">
        <h1 className="text-xl font-bold text-white text-center">
          了解你的体质
        </h1>
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-white/50">
            <span>第 {currentIndex + 1} 题</span>
            <span>{currentIndex + 1} / {totalQuestions}</span>
          </div>
          <div className="w-full h-2 rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-zhiji-gold transition-all duration-300"
              style={{
                width: `${((currentIndex + 1) / totalQuestions) * 100}%`,
              }}
            />
          </div>
        </div>
      </div>

      {/* 中间：题目和选项 */}
      <div className="flex-1 flex flex-col justify-center max-w-md mx-auto w-full">
        <h2 className="text-lg text-white text-center mb-8 leading-relaxed">
          {currentQuestion.text}
        </h2>

        <div className="space-y-3">
          {currentQuestion.options.map((option, idx) => (
            <button
              key={idx}
              onClick={() => handleSelect(idx)}
              className={`w-full py-4 px-5 rounded-xl border text-left transition-all duration-200 ${
                selectedOption === idx
                  ? "border-zhiji-gold bg-zhiji-gold/10 text-white"
                  : "border-white/20 text-white/80 hover:border-zhiji-gold/40"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* 底部：导航按钮 */}
      <div className="flex gap-3 mt-8 max-w-md mx-auto w-full">
        <button
          onClick={handlePrev}
          disabled={currentIndex === 0}
          className="flex-1 py-3 rounded-xl border border-white/20 text-white/60 disabled:opacity-30 disabled:cursor-not-allowed hover:border-white/40 transition-colors"
        >
          上一题
        </button>

        {isLastQuestion ? (
          <button
            onClick={handleSubmit}
            disabled={selectedOption === -1}
            className="flex-1 py-3 rounded-xl bg-zhiji-gold text-black font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:bg-zhiji-gold/90 transition-colors"
          >
            提交
          </button>
        ) : (
          <button
            onClick={handleNext}
            disabled={selectedOption === -1}
            className="flex-1 py-3 rounded-xl bg-zhiji-gold/20 text-zhiji-gold font-medium border border-zhiji-gold/30 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-zhiji-gold/30 transition-colors"
          >
            下一题
          </button>
        )}
      </div>
    </div>
  );
}
