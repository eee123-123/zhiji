"use client";

import { useState, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { RoleSelector } from "@/components/tarot/role-selector";
import { TopicSelector } from "@/components/tarot/topic-selector";
import { SpreadSelector } from "@/components/tarot/spread-selector";
import { CardSpread } from "@/components/tarot/card-spread";
import { ThreeCardSpread } from "@/components/tarot/three-card-spread";
import { CelticCardSelector } from "@/components/tarot/celtic-card-selector";
import { CardDisplay } from "@/components/tarot/card-display";
import { StreamReading } from "@/components/tarot/stream-reading";
import { CelticReadingDisplay } from "@/components/tarot/celtic-reading-display";
import { useStream } from "@/hooks/use-stream";
import { TAROT_CARDS } from "@/lib/tarot/cards";
import {
  TarotRole,
  TarotTopic,
  SpreadType,
  DrawnCard,
  TOPIC_LABELS,
} from "@/types/tarot";

const STEP_LABELS_FULL = ["选择解读者", "选择主题", "描述困惑", "选择牌阵", "问牌"];
const STEP_LABELS_SKIP = ["选择主题", "描述困惑", "选择牌阵", "问牌"];

const DESCRIPTION_PLACEHOLDERS: Record<Exclude<TarotTopic, "general">, string> =
  {
    love: "比如：我和 TA 最近总是沟通不畅，不知道这段关系该何去何从...",
    career:
      "比如：我在犹豫要不要换工作，现在的环境让我看不到成长空间...",
    decision:
      "比如：面临两个选择，不知道走哪条路更适合自己...",
  };

export default function TarotFullPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { text, loading, error, startStream, narrativeHint } = useStream();

  // 检查 URL 是否携带了 role 参数（从问牌页跳转过来）
  const urlRole = searchParams.get("role") as TarotRole | null;
  const hasUrlRole = !!urlRole;
  const initialStep = hasUrlRole ? 1 : 0;

  // 多步骤状态
  const [step, setStep] = useState(initialStep);
  const [role, setRole] = useState<TarotRole>(urlRole || "yuejian");

  // 当前使用的步骤标签（跳过 Step 0 时不显示"选择解读者"）
  const STEP_LABELS = hasUrlRole ? STEP_LABELS_SKIP : STEP_LABELS_FULL;
  const [topic, setTopic] = useState<TarotTopic | null>(null);
  const [description, setDescription] = useState("");
  const [spreadType, setSpreadType] = useState<SpreadType | null>(null);

  // 选牌/翻牌/解读状态
  const [drawnCard, setDrawnCard] = useState<DrawnCard | null>(null);
  const [drawnCards, setDrawnCards] = useState<DrawnCard[]>([]);
  const [showReading, setShowReading] = useState(false);
  const [readingStarted, setReadingStarted] = useState(false);

  // 完整问牌使用全部78张牌
  const allCards = useMemo(() => TAROT_CARDS, []);

  // 步骤前进
  const nextStep = () => {
    if (step === 1 && topic === "general") {
      // 今日指引跳过描述步骤
      setStep(3);
    } else {
      setStep((s) => s + 1);
    }
  };

  // 步骤后退
  const prevStep = () => {
    if (step === 1 && hasUrlRole) {
      // 角色来自 URL，Step 0 被跳过，返回问牌首页
      router.push("/tarot");
      return;
    }
    if (step === 3 && topic === "general") {
      // 从牌阵选择返回时，跳回主题选择
      setStep(1);
    } else {
      setStep((s) => s - 1);
    }
  };

  // 选牌处理（完整问牌使用全部78张）
  const handleCardSelect = (index: number) => {
    const card = allCards[index];
    const isReversed = Math.random() < 0.5;
    const drawn: DrawnCard = { card, isReversed };
    setDrawnCard(drawn);
  };

  // 翻牌完成后进入等待状态，用户点击“开始解读”才调用 AI
  const handleFlipComplete = () => {
    // 仅标记翻牌完成，不自动解读
  };

  // 用户主动点击"开始解读"
  const handleStartReading = () => {
    if (readingStarted) return;
    if (drawnCard) {
      setReadingStarted(true);
      setShowReading(true);
      startStream("/api/tarot/interpret", {
        cards: [drawnCard],
        role,
        spreadType,
        topic: topic ? TOPIC_LABELS[topic] : undefined,
        description: description || undefined,
      });
    } else if (drawnCards.length > 0) {
      setReadingStarted(true);
      setShowReading(true);
      startStream("/api/tarot/interpret", {
        cards: drawnCards,
        role,
        spreadType,
        topic: topic ? TOPIC_LABELS[topic] : undefined,
        description: description || undefined,
      });
    }
  };

  // 三牌阵选完后等待用户确认
  const handleThreeCardComplete = (cards: DrawnCard[]) => {
    setDrawnCards(cards);
  };

  // 凯尔特十字选完10张牌后等待用户确认
  const handleCelticComplete = (cards: DrawnCard[]) => {
    setDrawnCards(cards);
  };

  // 重新开始
  const handleRestart = () => {
    setStep(initialStep);
    if (!hasUrlRole) setRole("yuejian");
    setTopic(null);
    setDescription("");
    setSpreadType(null);
    setDrawnCard(null);
    setDrawnCards([]);
    setShowReading(false);
    setReadingStarted(false);
  };

  // 计算有效步骤索引（用于进度显示）
  const baseTotalSteps = topic === "general" ? 4 : 5;
  const totalSteps = hasUrlRole ? baseTotalSteps - 1 : baseTotalSteps;
  const currentProgress = (() => {
    const offset = hasUrlRole ? 1 : 0;
    if (topic === "general") {
      if (step <= 1) return step - offset;
      if (step === 3) return 2 - offset;
      return 3 - offset;
    }
    return step - offset;
  })();

  return (
    <div className="flex flex-col items-center px-4 py-8 min-h-screen">
      {/* 步骤进度指示器 */}
      {step < 4 || (!drawnCard && !showReading) ? (
        <div className="flex items-center gap-2 mb-8">
          {Array.from({ length: totalSteps }).map((_, i) => (
            <div
              key={i}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                i <= currentProgress
                  ? "bg-zhiji-gold scale-110"
                  : "bg-gray-600"
              }`}
            />
          ))}
          <span className="ml-3 text-gray-500 text-xs">
            {hasUrlRole ? STEP_LABELS[step - 1] : STEP_LABELS[step]}
          </span>
        </div>
      ) : null}

      {/* Step 0: 选择角色 */}
      {step === 0 && (
        <div className="animate-fadeIn flex flex-col items-center">
          <h2 className="text-xl font-bold text-zhiji-gold mb-2">
            选择你的解读者
          </h2>
          <p className="text-gray-400 text-sm text-center mb-8 max-w-sm">
            每位解读者有不同的风格与视角，选择与你此刻心境契合的那位
          </p>
          <RoleSelector selectedRole={role} onSelect={setRole} />
          <button
            onClick={nextStep}
            className="mt-8 px-8 py-3 rounded-full bg-zhiji-gold text-zhiji-dark font-bold transition-all duration-300 hover:shadow-lg hover:shadow-zhiji-gold/30 hover:scale-105 cursor-pointer"
          >
            下一步
          </button>
        </div>
      )}

      {/* Step 1: 选择主题 */}
      {step === 1 && (
        <div className="animate-fadeIn flex flex-col items-center">
          <h2 className="text-xl font-bold text-zhiji-gold mb-2">
            你想问什么
          </h2>
          <p className="text-gray-400 text-sm text-center mb-8 max-w-sm">
            让宇宙知道你心之所向，才能给你最贴切的讯息
          </p>
          <TopicSelector
            selectedTopic={topic}
            onSelect={(t) => setTopic(t)}
          />
          <div className="flex gap-4 mt-8">
            <button
              onClick={prevStep}
              className="px-6 py-3 rounded-full border border-gray-600 text-gray-400 transition-all hover:border-gray-400 cursor-pointer"
            >
              上一步
            </button>
            <button
              onClick={nextStep}
              disabled={!topic}
              className="px-8 py-3 rounded-full bg-zhiji-gold text-zhiji-dark font-bold transition-all duration-300 hover:shadow-lg hover:shadow-zhiji-gold/30 hover:scale-105 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              下一步
            </button>
          </div>
        </div>
      )}

      {/* Step 2: 描述困惑 */}
      {step === 2 && topic && topic !== "general" && (
        <div className="animate-fadeIn flex flex-col items-center w-full max-w-md">
          <h2 className="text-xl font-bold text-zhiji-gold mb-2">
            说出你的困惑
          </h2>
          <p className="text-gray-400 text-sm text-center mb-6 max-w-sm leading-relaxed">
            静下心来，把你的困惑交给牌面……
            <br />
            <span className="text-gray-500">
              文字是线索，牌面会循着它给你回应
            </span>
          </p>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={DESCRIPTION_PLACEHOLDERS[topic]}
            rows={4}
            className="w-full rounded-xl border border-white/10 bg-white/5 text-gray-200 placeholder:text-gray-600 px-4 py-3 text-sm leading-relaxed focus:outline-none focus:border-zhiji-gold/40 focus:bg-white/8 transition-all resize-none"
          />
          <div className="flex gap-4 mt-8 items-center">
            <button
              onClick={prevStep}
              className="px-6 py-3 rounded-full border border-gray-600 text-gray-400 transition-all hover:border-gray-400 cursor-pointer"
            >
              上一步
            </button>
            <button
              onClick={nextStep}
              className="px-8 py-3 rounded-full bg-zhiji-gold text-zhiji-dark font-bold transition-all duration-300 hover:shadow-lg hover:shadow-zhiji-gold/30 hover:scale-105 cursor-pointer"
            >
              {description.trim() ? "下一步" : "不描述也行，直接看牌"}
            </button>
          </div>
        </div>
      )}

      {/* Step 3: 选择牌阵 */}
      {step === 3 && (
        <div className="animate-fadeIn flex flex-col items-center">
          <h2 className="text-xl font-bold text-zhiji-gold mb-2">
            选择牌阵
          </h2>
          <p className="text-gray-400 text-sm text-center mb-8 max-w-sm">
            不同的牌阵，揭示不同深度的答案
          </p>
          <SpreadSelector
            selectedSpread={spreadType}
            onSelect={(s) => setSpreadType(s)}
          />
          <div className="flex gap-4 mt-8">
            <button
              onClick={prevStep}
              className="px-6 py-3 rounded-full border border-gray-600 text-gray-400 transition-all hover:border-gray-400 cursor-pointer"
            >
              上一步
            </button>
            <button
              onClick={nextStep}
              disabled={!spreadType}
              className="px-8 py-3 rounded-full bg-zhiji-gold text-zhiji-dark font-bold transition-all duration-300 hover:shadow-lg hover:shadow-zhiji-gold/30 hover:scale-105 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              开始选牌
            </button>
          </div>
        </div>
      )}

      {/* Step 4: 选牌 → 翻牌 → 解读 */}
      {step === 4 && (
        <div className="animate-fadeIn flex flex-col items-center w-full">
          {/* 凯尔特十字牌阵 */}
          {spreadType === "celtic" ? (
            <>
              {!showReading && drawnCards.length === 0 && (
                <CelticCardSelector
                  candidates={allCards}
                  onComplete={handleCelticComplete}
                />
              )}

              {/* 凯尔特选完后：紧凑展示已选牌 + 解读按钮 */}
              {!showReading && drawnCards.length > 0 && (
                <div className="flex flex-col items-center py-6 animate-fadeIn">
                  <h3 className="text-zhiji-gold text-lg font-bold mb-4">✦ 十张牌已选定 ✦</h3>
                  <div className="flex flex-wrap justify-center gap-2 mb-6 max-w-md">
                    {drawnCards.map((drawn, i) => (
                      <span
                        key={i}
                        className="text-xs text-zhiji-gold/80 bg-zhiji-gold/10 border border-zhiji-gold/20 px-2.5 py-1 rounded-full"
                      >
                        {i + 1}. {drawn.card.name}{drawn.isReversed ? " ↓" : " ↑"}
                      </span>
                    ))}
                  </div>
                  <button
                    onClick={handleStartReading}
                    className="bg-zhiji-gold hover:bg-zhiji-gold-light text-zhiji-dark font-bold px-8 py-3 rounded-full shadow-lg shadow-zhiji-gold/20 cursor-pointer transition-all duration-200 hover:scale-105"
                  >
                    ✦ 开始解读（10张牌）
                  </button>
                </div>
              )}

              {showReading && (
                <div className="w-full max-w-lg px-2">
                  {/* 已选牌面概览 */}
                  <div className="flex flex-wrap justify-center gap-2 mb-6">
                    {drawnCards.map((drawn, i) => (
                      <span
                        key={i}
                        className="text-xs text-gray-400 bg-white/5 px-2 py-1 rounded"
                      >
                        {i + 1}. {drawn.card.name}
                        {drawn.isReversed ? "↓" : "↑"}
                      </span>
                    ))}
                  </div>

                  <CelticReadingDisplay
                    text={text}
                    loading={loading}
                    error={error ?? undefined}
                  />

                  {/* 完成后操作按钮 */}
                  {!loading && text && (
                    <div className="flex justify-center gap-4 mt-10">
                      <button
                        onClick={handleRestart}
                        className="px-6 py-3 rounded-full border border-zhiji-gold/40 text-zhiji-gold text-sm transition-all hover:bg-zhiji-gold/10 cursor-pointer"
                      >
                        再来一次
                      </button>
                      <button
                        onClick={() => router.push("/tarot")}
                        className="px-6 py-3 rounded-full border border-gray-600 text-gray-400 text-sm transition-all hover:border-gray-400 cursor-pointer"
                      >
                        返回问牌首页
                      </button>
                    </div>
                  )}
                </div>
              )}
            </>
          ) : spreadType === "three" ? (
            <>
              {/* 三牌阵流程 */}
              {!showReading && (
                <ThreeCardSpread
                  candidates={allCards}
                  onComplete={handleThreeCardComplete}
                />
              )}

              {/* 三牌阵选完后的开始解读按钮 */}
              {!showReading && drawnCards.length > 0 && (
                <div className="flex flex-col items-center py-6 animate-fadeIn">
                  <button
                    onClick={handleStartReading}
                    className="bg-zhiji-gold hover:bg-zhiji-gold-light text-zhiji-dark font-bold px-8 py-3 rounded-full shadow-lg shadow-zhiji-gold/20 cursor-pointer transition-all duration-200 hover:scale-105"
                  >
                    ✦ 开始解读（{drawnCards.length}张牌）
                  </button>
                </div>
              )}

              {/* 流式解读 */}
              {showReading && (
                <div className="w-full max-w-lg px-2">
                  {/* 三张牌信息 */}
                  <div className="flex justify-center gap-4 mb-6">
                    {drawnCards.map((drawn, i) => (
                      <div key={i} className="text-center">
                        <span className="text-zhiji-gold/70 text-xs block">
                          {["过去", "现在", "未来"][i]}
                        </span>
                        <span className="text-zhiji-gold text-sm">
                          {drawn.card.name}
                        </span>
                        <span className="text-gray-400 text-xs block">
                          {drawn.isReversed ? "逆位" : "正位"}
                        </span>
                      </div>
                    ))}
                  </div>

                  <StreamReading text={text} loading={loading} error={error} />

                  {/* 完成后操作按钮 */}
                  {!loading && text && (
                    <div className="flex justify-center gap-4 mt-10">
                      <button
                        onClick={handleRestart}
                        className="px-6 py-3 rounded-full border border-zhiji-gold/40 text-zhiji-gold text-sm transition-all hover:bg-zhiji-gold/10 cursor-pointer"
                      >
                        再来一次
                      </button>
                      <button
                        onClick={() => router.push("/tarot")}
                        className="px-6 py-3 rounded-full border border-gray-600 text-gray-400 text-sm transition-all hover:border-gray-400 cursor-pointer"
                      >
                        返回问牌首页
                      </button>
                    </div>
                  )}
                </div>
              )}
            </>
          ) : (
            <>
              {/* 单牌流程 */}
              {!drawnCard && (
                <div className="flex flex-col items-center">
                  <h2 className="text-lg font-bold text-zhiji-gold mb-2">
                    凭直觉，选一张牌
                  </h2>
                  <p className="text-gray-400 text-sm text-center mb-6 max-w-sm">
                    不要思考，让手指自然被吸引
                  </p>
                  <CardSpread
                    cards={allCards}
                    onSelect={handleCardSelect}
                  />
                </div>
              )}

              {/* 翻牌展示 */}
              {drawnCard && !showReading && (
                <div className="flex flex-col items-center py-8">
                  <CardDisplay
                    drawnCard={drawnCard}
                    autoFlip
                    autoFlipDelay={1000}
                    onFlipComplete={handleFlipComplete}
                  />
                  {/* 牌名 + 开始解读按钮 */}
                  <div className="mt-6 text-center">
                    <p className="text-zhiji-gold font-medium text-lg">{drawnCard.card.name}</p>
                    <p className="text-gray-500 text-sm mb-4">{drawnCard.card.nameEn} · {drawnCard.isReversed ? "逆位" : "正位"}</p>
                    <button
                      onClick={handleStartReading}
                      className="bg-zhiji-gold hover:bg-zhiji-gold-light text-zhiji-dark font-bold px-8 py-3 rounded-full shadow-lg shadow-zhiji-gold/20 cursor-pointer transition-all duration-200 hover:scale-105"
                    >
                      ✦ 开始解读
                    </button>
                  </div>
                </div>
              )}

              {/* 三牌阵/凯尔特完成后的开始解读按钮 */}
              {drawnCards.length > 0 && !showReading && (
                <div className="flex flex-col items-center py-6 animate-fadeIn">
                  <button
                    onClick={handleStartReading}
                    className="bg-zhiji-gold hover:bg-zhiji-gold-light text-zhiji-dark font-bold px-8 py-3 rounded-full shadow-lg shadow-zhiji-gold/20 cursor-pointer transition-all duration-200 hover:scale-105"
                  >
                    ✦ 开始解读（{drawnCards.length}张牌）
                  </button>
                </div>
              )}

              {/* 流式解读 */}
              {showReading && (
                <div className="w-full max-w-lg px-2">
                  {/* 显示选中的牌名 */}
                  <div className="text-center mb-6">
                    <span className="text-zhiji-gold text-sm">
                      {drawnCard!.card.name}
                      {drawnCard!.isReversed ? "（逆位）" : "（正位）"}
                    </span>
                  </div>

                  <StreamReading text={text} loading={loading} error={error} />

                  {/* 叙事呼应提示 */}
                  {narrativeHint && !loading && text && (
                    <div className="mt-4 px-4 py-3 rounded-lg border border-zhiji-gold/20 bg-zhiji-gold/5 text-sm text-zhiji-gold/80 text-center animate-fadeIn">
                      ✦ {narrativeHint}
                    </div>
                  )}

                  {/* 完成后操作按钮 */}
                  {!loading && text && (
                    <div className="flex justify-center gap-4 mt-10">
                      <button
                        onClick={handleRestart}
                        className="px-6 py-3 rounded-full border border-zhiji-gold/40 text-zhiji-gold text-sm transition-all hover:bg-zhiji-gold/10 cursor-pointer"
                      >
                        再来一次
                      </button>
                      <button
                        onClick={() => router.push("/tarot")}
                        className="px-6 py-3 rounded-full border border-gray-600 text-gray-400 text-sm transition-all hover:border-gray-400 cursor-pointer"
                      >
                        返回问牌首页
                      </button>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
