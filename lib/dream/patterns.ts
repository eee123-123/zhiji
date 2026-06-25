import { db } from "@/lib/db";
import { getCurrentUserId } from "@/lib/auth";

export interface DreamPatternStats {
  totalEntries: number;
  isUnlocked: boolean; // >= 3 条时解锁
  topTags: { name: string; count: number }[];  // Top 5 高频意象
  emotionDistribution: { emotion: string; count: number; percentage: number }[];
  remainingToUnlock: number; // 还需要几条才能解锁
}

export async function getDreamPatternStats(): Promise<DreamPatternStats> {
  const userId = getCurrentUserId();

  // 1. 查询所有梦境记录数量
  const totalEntries = await db.dreamEntry.count({
    where: { userId },
  });

  if (totalEntries < 3) {
    return {
      totalEntries,
      isUnlocked: false,
      topTags: [],
      emotionDistribution: [],
      remainingToUnlock: 3 - totalEntries,
    };
  }

  // 2. 查询标签频次统计（Top 5）
  const allTags = await db.dreamTag.findMany({
    where: { entry: { userId } },
    select: { name: true },
  });

  const tagCounts = new Map<string, number>();
  allTags.forEach((tag) => {
    tagCounts.set(tag.name, (tagCounts.get(tag.name) || 0) + 1);
  });

  const topTags = Array.from(tagCounts.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  // 3. 情绪分布统计
  const entries = await db.dreamEntry.findMany({
    where: { userId, emotion: { not: null } },
    select: { emotion: true },
  });

  const emotionCounts = new Map<string, number>();
  entries.forEach((e) => {
    if (e.emotion) {
      emotionCounts.set(e.emotion, (emotionCounts.get(e.emotion) || 0) + 1);
    }
  });

  const totalWithEmotion = entries.length;
  const emotionDistribution = Array.from(emotionCounts.entries())
    .map(([emotion, count]) => ({
      emotion,
      count,
      percentage: totalWithEmotion > 0 ? Math.round((count / totalWithEmotion) * 100) : 0,
    }))
    .sort((a, b) => b.count - a.count);

  return {
    totalEntries,
    isUnlocked: true,
    topTags,
    emotionDistribution,
    remainingToUnlock: 0,
  };
}
