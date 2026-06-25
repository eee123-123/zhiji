"use client";

interface CheckinRecord {
  date: string;
  type: string;
  feedback?: string;
}

interface CheckinCalendarProps {
  checkins: CheckinRecord[];
}

const TYPE_ICONS: Record<string, string> = {
  diet: "🍵",
  exercise: "🌅",
  sleep: "😴",
  custom: "✏️",
};

function getRecentDays(count: number): string[] {
  const days: string[] = [];
  for (let i = count - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push(d.toISOString().split("T")[0]);
  }
  return days;
}

function getWeekdayLabel(dateStr: string): string {
  const day = new Date(dateStr).getDay();
  return ["日", "一", "二", "三", "四", "五", "六"][day];
}

function getDayNumber(dateStr: string): string {
  return dateStr.split("-")[2];
}

function getStreak(checkins: CheckinRecord[]): number {
  const checkedDates = new Set(checkins.map((c) => c.date));
  let streak = 0;
  const today = new Date();

  for (let i = 0; i < 30; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split("T")[0];
    if (checkedDates.has(dateStr)) {
      streak++;
    } else {
      break;
    }
  }
  return streak;
}

export function CheckinCalendar({ checkins }: CheckinCalendarProps) {
  const days = getRecentDays(7);
  const today = new Date().toISOString().split("T")[0];
  const streak = getStreak(checkins);

  // 按日期分组
  const checkinsByDate = checkins.reduce(
    (acc, c) => {
      if (!acc[c.date]) acc[c.date] = [];
      acc[c.date].push(c);
      return acc;
    },
    {} as Record<string, CheckinRecord[]>
  );

  return (
    <div className="border border-white/10 rounded-xl p-4 bg-white/5">
      {/* 标题和连续天数 */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-gray-300 text-sm font-medium">本周打卡</span>
        {streak > 0 && (
          <span className="text-zhiji-gold text-xs">
            🔥 连续 {streak} 天
          </span>
        )}
      </div>

      {/* 日历格子 */}
      <div className="grid grid-cols-7 gap-2">
        {days.map((dateStr) => {
          const isToday = dateStr === today;
          const dayCheckins = checkinsByDate[dateStr] || [];
          const hasCheckin = dayCheckins.length > 0;

          return (
            <div
              key={dateStr}
              className={`flex flex-col items-center gap-1 p-2 rounded-lg border ${
                isToday
                  ? "border-zhiji-gold/60 bg-zhiji-gold/5"
                  : hasCheckin
                    ? "border-white/10 bg-zhiji-gold/10"
                    : "border-white/10"
              }`}
            >
              <span className="text-gray-500 text-[10px]">
                {getWeekdayLabel(dateStr)}
              </span>
              <span
                className={`text-xs font-medium ${
                  isToday ? "text-zhiji-gold" : "text-gray-300"
                }`}
              >
                {getDayNumber(dateStr)}
              </span>
              <div className="flex gap-0.5 min-h-[16px] items-center">
                {dayCheckins.length > 0 ? (
                  dayCheckins.map((c, i) => (
                    <span key={i} className="text-[10px]">
                      {TYPE_ICONS[c.type] || "✏️"}
                    </span>
                  ))
                ) : (
                  <span className="text-[10px] text-gray-600">·</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
